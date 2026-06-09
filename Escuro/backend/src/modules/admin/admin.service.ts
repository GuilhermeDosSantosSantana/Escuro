import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma.js";
import { HttpError } from "../../shared/http-error.js";
import { buscarMetodoApi } from "./api-methods.js";
import { publishReportEvent } from "../../shared/realtime.js";

type CriarUsuarioBody = {
  usuario?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
};

type AtualizarUsuarioBody = {
  usuario?: string;
  senha?: string;
  perfil?: string;
  ativo?: boolean;
};

type CriarTarefaBody = {
  titulo?: string;
  usuarioId?: string;
  ordemObrigatoria?: boolean;
  itens?: Array<{ codigoMetodo?: string; statusEsperado?: number }>;
};

type AtualizarTarefaBody = {
  titulo?: string;
  usuarioId?: string;
  ordemObrigatoria?: boolean;
  ativo?: boolean;
};

type TarefaRow = {
  id: string;
  titulo: string;
  usuarioId: string;
  usuario: string;
  ordemObrigatoria: boolean | number;
  ativo: boolean | number;
  createdById: string | null;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
};

type TarefaItemRow = {
  id: string;
  tarefaId: string;
  codigoMetodo: string;
  metodo: string;
  endpoint: string;
  descricao: string;
  ordem: number;
  statusEsperado: number;
  createdAt: Date | string | number;
};

type LogRow = {
  id: string;
  metodo: string;
  endpoint: string;
  statusCode: number;
  usuarioId: string | null;
  ip: string | null;
  createdAt: Date | string | number;
};

function toBoolean(value: boolean | number) {
  return value === true || value === 1;
}

function toIso(value: Date | string | number) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  return new Date(value).toISOString();
}

function publicUsuario(usuario: { id: string; usuario: string; perfil: string; ativo: boolean; createdAt: Date; updatedAt: Date }) {
  return {
    id: usuario.id,
    usuario: usuario.usuario,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString()
  };
}

function normalizePerfil(perfil?: string) {
  const normalized = (perfil ?? "USUARIO").trim().toUpperCase();
  const allowed = ["ADMIN", "ATENDENTE", "USUARIO", "DEVELOPER"];

  if (!allowed.includes(normalized)) {
    throw new HttpError(400, "Perfil inválido. Use ADMIN, ATENDENTE, USUARIO ou DEVELOPER.");
  }

  return normalized;
}

function validateUsuario(value?: string) {
  const usuario = value?.trim();
  if (!usuario || usuario.length < 3) {
    throw new HttpError(400, "O nome do login deve ter pelo menos 3 caracteres.");
  }
  return usuario;
}

function validateSenha(value?: string): string;
function validateSenha(value: string | undefined, required: false): string | undefined;
function validateSenha(value?: string, required = true) {
  if (!value && !required) return undefined;
  if (!value || value.length < 6) {
    throw new HttpError(400, "A senha deve ter pelo menos 6 caracteres.");
  }
  return value;
}

function publicarAtualizacaoTarefa(tarefaId: string) {
  publishReportEvent({
    type: "task-updated",
    timestamp: new Date().toISOString(),
    tarefaId
  });
}

async function assertUsuarioAtivo(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new HttpError(404, "Usuário não encontrado.");
  }
  if (!usuario.ativo) {
    throw new HttpError(422, "A tarefa só pode ser atribuída para usuário ativo.");
  }
  return usuario;
}

export async function listarUsuarios() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { createdAt: "desc" } });
  return usuarios.map(publicUsuario);
}

export async function buscarUsuario(id: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new HttpError(404, "Usuário não encontrado.");
  }
  return publicUsuario(usuario);
}

export async function criarUsuario(body: unknown) {
  const input = body as CriarUsuarioBody;
  const usuarioNome = validateUsuario(input?.usuario);
  const senha = validateSenha(input?.senha);
  const perfil = normalizePerfil(input?.perfil);
  const senhaHash = await bcrypt.hash(senha, 10);

  const existente = await prisma.usuario.findUnique({ where: { usuario: usuarioNome } });
  if (existente) {
    throw new HttpError(409, "Já existe login com este nome.");
  }

  const usuario = await prisma.usuario.create({
    data: {
      usuario: usuarioNome,
      senhaHash,
      perfil,
      ativo: input.ativo ?? true
    }
  });

  return publicUsuario(usuario);
}

export async function atualizarUsuario(id: string, body: unknown) {
  const input = body as AtualizarUsuarioBody;
  await buscarUsuario(id);

  const data: { usuario?: string; senhaHash?: string; perfil?: string; ativo?: boolean } = {};

  if (input.usuario !== undefined) {
    const usuarioNome = validateUsuario(input.usuario);
    const existente = await prisma.usuario.findUnique({ where: { usuario: usuarioNome } });
    if (existente && existente.id !== id) {
      throw new HttpError(409, "Já existe login com este nome.");
    }
    data.usuario = usuarioNome;
  }

  if (input.senha !== undefined && input.senha !== "") {
    const senha = validateSenha(input.senha);
    data.senhaHash = await bcrypt.hash(senha, 10);
  }

  if (input.perfil !== undefined) {
    data.perfil = normalizePerfil(input.perfil);
  }

  if (input.ativo !== undefined) {
    data.ativo = Boolean(input.ativo);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "Informe ao menos um campo para atualizar.");
  }

  const usuario = await prisma.usuario.update({ where: { id }, data });
  return publicUsuario(usuario);
}

export async function removerUsuario(id: string, adminId?: string) {
  if (adminId === id) {
    throw new HttpError(409, "O administrador não pode excluir o próprio login autenticado.");
  }

  await buscarUsuario(id);
  const usuario = await prisma.usuario.update({ where: { id }, data: { ativo: false } });
  return publicUsuario(usuario);
}

function mapTarefa(row: TarefaRow, itens: TarefaItemRow[] = []) {
  return {
    id: row.id,
    titulo: row.titulo,
    usuarioId: row.usuarioId,
    usuario: row.usuario,
    ordemObrigatoria: toBoolean(row.ordemObrigatoria),
    ativo: toBoolean(row.ativo),
    createdById: row.createdById,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    itens: itens.map(mapTarefaItem)
  };
}

function mapTarefaItem(row: TarefaItemRow) {
  return {
    id: row.id,
    tarefaId: row.tarefaId,
    codigoMetodo: row.codigoMetodo,
    metodo: row.metodo,
    endpoint: row.endpoint,
    descricao: row.descricao,
    ordem: row.ordem,
    statusEsperado: row.statusEsperado,
    createdAt: toIso(row.createdAt)
  };
}

function validateStatusEsperado(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 100 || value > 599) {
    throw new HttpError(400, "statusEsperado deve ser um número inteiro entre 100 e 599.");
  }
  return value;
}

function validateItens(itens: CriarTarefaBody["itens"]) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new HttpError(400, "Informe ao menos um método para a tarefa.");
  }

  return itens.map((item, index) => {
    if (!item.codigoMetodo) {
      throw new HttpError(400, "codigoMetodo é obrigatório em todos os itens.");
    }

    const metodoApi = buscarMetodoApi(item.codigoMetodo);
    if (!metodoApi) {
      throw new HttpError(404, `Método ${item.codigoMetodo} não encontrado no catálogo da API.`);
    }

    return {
      id: randomUUID(),
      codigoMetodo: metodoApi.codigo,
      metodo: metodoApi.metodo,
      endpoint: metodoApi.endpoint,
      descricao: metodoApi.descricao,
      ordem: index + 1,
      statusEsperado: validateStatusEsperado(item.statusEsperado)
    };
  });
}

const sqliteDateExpression = (column: string) => `
  CASE
    WHEN typeof(${column}) IN ('integer', 'real') THEN datetime(${column} / 1000, 'unixepoch')
    ELSE datetime(${column})
  END
`;

async function getTarefaRows(where = "", params: unknown[] = []) {
  return prisma.$queryRawUnsafe<TarefaRow[]>(`
    SELECT t.*, u.usuario as usuario
    FROM TarefaTeste t
    JOIN Usuario u ON u.id = t.usuarioId
    ${where}
    ORDER BY ${sqliteDateExpression("t.createdAt")} DESC
  `, ...params);
}

async function getItensTarefas(tarefaIds: string[]) {
  if (tarefaIds.length === 0) return [];

  const placeholders = tarefaIds.map(() => "?").join(", ");
  return prisma.$queryRawUnsafe<TarefaItemRow[]>(`
    SELECT * FROM TarefaTesteItem
    WHERE tarefaId IN (${placeholders})
    ORDER BY tarefaId, ordem ASC
  `, ...tarefaIds);
}

export async function listarTarefas(query: Record<string, unknown> = {}) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (typeof query.usuarioId === "string" && query.usuarioId) {
    where.push("t.usuarioId = ?");
    params.push(query.usuarioId);
  }

  if (typeof query.ativo === "string") {
    where.push("t.ativo = ?");
    params.push(query.ativo === "true" ? 1 : 0);
  } else {
    where.push("t.ativo = 1");
  }

  const rows = await getTarefaRows(where.length ? `WHERE ${where.join(" AND ")}` : "", params);
  const itens = await getItensTarefas(rows.map((row) => row.id));
  return rows.map((row) => mapTarefa(row, itens.filter((item) => item.tarefaId === row.id)));
}

export async function buscarTarefa(id: string) {
  const rows = await getTarefaRows("WHERE t.id = ?", [id]);
  if (!rows[0]) {
    throw new HttpError(404, "Tarefa não encontrada.");
  }
  const itens = await getItensTarefas([id]);
  return mapTarefa(rows[0], itens);
}

export async function criarTarefa(body: unknown, adminId?: string) {
  const input = body as CriarTarefaBody;
  const titulo = input?.titulo?.trim();
  if (!titulo) {
    throw new HttpError(400, "Título da tarefa é obrigatório.");
  }
  if (!input.usuarioId) {
    throw new HttpError(400, "usuarioId é obrigatório.");
  }

  await assertUsuarioAtivo(input.usuarioId);
  const itens = validateItens(input.itens);
  const id = randomUUID();
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO TarefaTeste (id, titulo, usuarioId, ordemObrigatoria, ativo, createdById, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      titulo,
      input.usuarioId,
      input.ordemObrigatoria ? 1 : 0,
      1,
      adminId ?? null,
      now,
      now
    );

    for (const item of itens) {
      await tx.$executeRawUnsafe(
        `INSERT INTO TarefaTesteItem (id, tarefaId, codigoMetodo, metodo, endpoint, descricao, ordem, statusEsperado, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.id,
        id,
        item.codigoMetodo,
        item.metodo,
        item.endpoint,
        item.descricao,
        item.ordem,
        item.statusEsperado,
        now
      );
    }
  });

  publicarAtualizacaoTarefa(id);
  return buscarTarefa(id);
}

export async function atualizarTarefa(id: string, body: unknown) {
  const input = body as AtualizarTarefaBody;
  await buscarTarefa(id);

  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.titulo !== undefined) {
    const titulo = input.titulo.trim();
    if (!titulo) throw new HttpError(400, "Título da tarefa é obrigatório.");
    updates.push("titulo = ?");
    params.push(titulo);
  }

  if (input.usuarioId !== undefined) {
    await assertUsuarioAtivo(input.usuarioId);
    updates.push("usuarioId = ?");
    params.push(input.usuarioId);
  }

  if (input.ordemObrigatoria !== undefined) {
    updates.push("ordemObrigatoria = ?");
    params.push(input.ordemObrigatoria ? 1 : 0);
  }

  if (input.ativo !== undefined) {
    updates.push("ativo = ?");
    params.push(input.ativo ? 1 : 0);
  }

  if (updates.length === 0) {
    throw new HttpError(400, "Informe ao menos um campo para atualizar.");
  }

  updates.push("updatedAt = ?");
  params.push(new Date().toISOString(), id);

  await prisma.$executeRawUnsafe(`UPDATE TarefaTeste SET ${updates.join(", ")} WHERE id = ?`, ...params);
  publicarAtualizacaoTarefa(id);
  return buscarTarefa(id);
}

export async function substituirItensTarefa(id: string, body: unknown) {
  await buscarTarefa(id);
  const input = body as { itens?: CriarTarefaBody["itens"] };
  const itens = validateItens(input.itens);
  const now = new Date().toISOString();

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("DELETE FROM TarefaTesteItem WHERE tarefaId = ?", id);
    for (const item of itens) {
      await tx.$executeRawUnsafe(
        `INSERT INTO TarefaTesteItem (id, tarefaId, codigoMetodo, metodo, endpoint, descricao, ordem, statusEsperado, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.id,
        id,
        item.codigoMetodo,
        item.metodo,
        item.endpoint,
        item.descricao,
        item.ordem,
        item.statusEsperado,
        now
      );
    }
    await tx.$executeRawUnsafe("UPDATE TarefaTeste SET updatedAt = ? WHERE id = ?", now, id);
  });

  publicarAtualizacaoTarefa(id);
  return buscarTarefa(id);
}

export async function removerTarefa(id: string) {
  await buscarTarefa(id);
  const updatedAt = new Date().toISOString();

  await prisma.$executeRawUnsafe(
    "UPDATE TarefaTeste SET ativo = 0, updatedAt = ? WHERE id = ?",
    updatedAt,
    id
  );

  publicarAtualizacaoTarefa(id);
  return buscarTarefa(id);
}

function normalizeEndpoint(endpoint: string) {
  const pathOnly = endpoint.split("?")[0]?.split("#")[0] || "/";
  const clean = pathOnly.replace(/\/+$/, "") || "/";
  try {
    return decodeURI(clean);
  } catch {
    return clean;
  }
}

function patternToRegExp(pattern: string) {
  const normalized = normalizeEndpoint(pattern);
  const withParams = normalized.replace(/:[^/]+/g, "__ESCURO_PARAM__");
  const escaped = withParams.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/__ESCURO_PARAM__/g, "[^/]+");
  return new RegExp(`^${escaped}\/?$`);
}

function logMatchesItem(item: TarefaItemRow, log: LogRow) {
  return log.metodo.toUpperCase() === item.metodo.toUpperCase() && patternToRegExp(item.endpoint).test(normalizeEndpoint(log.endpoint));
}

function findMatchingItemIndexes(log: LogRow, itens: TarefaItemRow[]) {
  return itens
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => logMatchesItem(item, log));
}

function mapLog(log?: LogRow) {
  if (!log) return null;
  return {
    id: log.id,
    metodo: log.metodo,
    endpoint: log.endpoint,
    statusCode: log.statusCode,
    ip: log.ip,
    createdAt: toIso(log.createdAt)
  };
}

type ResultadoTarefaItem = {
  item: ReturnType<typeof mapTarefaItem>;
  status: "acertou" | "errou" | "pendente";
  statusEsperado: number;
  statusObtido: number | null;
  acertou: boolean;
  log: ReturnType<typeof mapLog>;
  motivo: string;
};

type TentativaInvalida = {
  id: string;
  ordemExecucao: number;
  status: "errou";
  statusObtido: number;
  metodo: string;
  endpoint: string;
  log: ReturnType<typeof mapLog>;
  itemEsperado: ReturnType<typeof mapTarefaItem> | null;
  motivo: string;
};

function isSupportEndpoint(log: LogRow, itens: TarefaItemRow[]) {
  const endpoint = normalizeEndpoint(log.endpoint);
  const selected = itens.some((item) => logMatchesItem(item, log));

  if (selected) return false;

  return ["/api/v1/auth/token", "/api/v1/auth/validate"].includes(endpoint);
}

function buildPendingResult(item: TarefaItemRow): ResultadoTarefaItem {
  return {
    item: mapTarefaItem(item),
    status: "pendente",
    statusEsperado: item.statusEsperado,
    statusObtido: null,
    acertou: false,
    log: null,
    motivo: "Método ainda não executado pelo usuário."
  };
}

function buildItemResult(item: TarefaItemRow, log: LogRow): ResultadoTarefaItem {
  const acertou = log.statusCode === item.statusEsperado;
  return {
    item: mapTarefaItem(item),
    status: acertou ? "acertou" : "errou",
    statusEsperado: item.statusEsperado,
    statusObtido: log.statusCode,
    acertou,
    log: mapLog(log),
    motivo: acertou
      ? "Status code esperado foi retornado."
      : "Status code retornado diferente do esperado pelo administrador."
  };
}

function buildInvalidAttempt(log: LogRow, ordemExecucao: number, motivo: string, itemEsperado?: TarefaItemRow | null): TentativaInvalida {
  return {
    id: log.id,
    ordemExecucao,
    status: "errou",
    statusObtido: log.statusCode,
    metodo: log.metodo,
    endpoint: normalizeEndpoint(log.endpoint),
    log: mapLog(log),
    itemEsperado: itemEsperado ? mapTarefaItem(itemEsperado) : null,
    motivo
  };
}

async function getLogsDoUsuario(usuarioId: string, createdAt: Date | string | number) {
  const inicio = toIso(createdAt);

  return prisma.$queryRawUnsafe<LogRow[]>(`
    SELECT id, metodo, endpoint, statusCode, usuarioId, ip, createdAt
    FROM LogRequisicao
    WHERE usuarioId = ?
      AND ${sqliteDateExpression("createdAt")} >= datetime(?)
    ORDER BY ${sqliteDateExpression("createdAt")} ASC
  `, usuarioId, inicio);
}

function avaliarTarefaOrdenada(itens: TarefaItemRow[], logs: LogRow[]) {
  const resultados = itens.map(buildPendingResult);
  const tentativasInvalidas: TentativaInvalida[] = [];
  let cursor = 0;
  let ordemExecucao = 0;

  for (const log of logs) {
    if (isSupportEndpoint(log, itens)) continue;

    ordemExecucao += 1;
    const esperadoAtual = itens[cursor] ?? null;

    if (esperadoAtual && logMatchesItem(esperadoAtual, log)) {
      resultados[cursor] = buildItemResult(esperadoAtual, log);
      cursor += 1;
      continue;
    }

    const matches = findMatchingItemIndexes(log, itens);

    if (matches.length > 0) {
      const matched = matches[0];
      const motivo = matched.index < cursor
        ? "Método repetido após já ter sido executado na ordem proposta."
        : "Fora de ordem proposta: o usuário executou este método antes da posição definida pelo administrador.";

      tentativasInvalidas.push(buildInvalidAttempt(log, ordemExecucao, motivo, esperadoAtual));
      continue;
    }

    tentativasInvalidas.push(buildInvalidAttempt(
      log,
      ordemExecucao,
      "Método/endpoint não proposto para esta tarefa. A tentativa foi contabilizada como erro.",
      esperadoAtual
    ));
  }

  return { resultados, tentativasInvalidas };
}

function avaliarTarefaLivre(itens: TarefaItemRow[], logs: LogRow[]) {
  const resultados = itens.map(buildPendingResult);
  const tentativasInvalidas: TentativaInvalida[] = [];
  const itensExecutados = new Set<number>();
  let ordemExecucao = 0;

  for (const log of logs) {
    if (isSupportEndpoint(log, itens)) continue;

    ordemExecucao += 1;
    const matches = findMatchingItemIndexes(log, itens);

    if (matches.length === 0) {
      tentativasInvalidas.push(buildInvalidAttempt(
        log,
        ordemExecucao,
        "Método/endpoint não proposto para esta tarefa. A tentativa foi contabilizada como erro.",
        null
      ));
      continue;
    }

    const pendentes = matches.filter(({ index }) => !itensExecutados.has(index));

    if (pendentes.length === 0) {
      tentativasInvalidas.push(buildInvalidAttempt(
        log,
        ordemExecucao,
        "Método repetido ou tentativa extra não prevista para esta tarefa.",
        null
      ));
      continue;
    }

    const pendenteComMesmoStatus = pendentes.find(({ item }) => item.statusEsperado === log.statusCode);

    if (pendenteComMesmoStatus) {
      resultados[pendenteComMesmoStatus.index] = buildItemResult(pendenteComMesmoStatus.item, log);
      itensExecutados.add(pendenteComMesmoStatus.index);
      continue;
    }

    const statusJaValidado = matches.some(({ item, index }) => itensExecutados.has(index) && item.statusEsperado === log.statusCode);

    tentativasInvalidas.push(buildInvalidAttempt(
      log,
      ordemExecucao,
      statusJaValidado
        ? "Status code já havia sido validado para este método. A tentativa repetida foi contabilizada como erro."
        : "Status code retornado não corresponde a nenhum status esperado pendente para este método.",
      pendentes[0]?.item ?? null
    ));
  }

  return { resultados, tentativasInvalidas };
}

export async function gerarRelatorioTarefa(id: string) {
  const tarefa = await buscarTarefa(id);
  const rows = await getTarefaRows("WHERE t.id = ?", [id]);
  const tarefaRow = rows[0];
  const itens = await getItensTarefas([id]);
  const logs = await getLogsDoUsuario(tarefa.usuarioId, tarefaRow.createdAt);
  const avaliacao = tarefa.ordemObrigatoria
    ? avaliarTarefaOrdenada(itens, logs)
    : avaliarTarefaLivre(itens, logs);

  const acertos = avaliacao.resultados.filter((resultado) => resultado.status === "acertou").length;
  const errosItens = avaliacao.resultados.filter((resultado) => resultado.status === "errou").length;
  const errosTentativas = avaliacao.tentativasInvalidas.length;
  const erros = errosItens + errosTentativas;
  const pendentes = avaliacao.resultados.filter((resultado) => resultado.status === "pendente").length;
  const total = avaliacao.resultados.length + errosTentativas;

  return {
    tarefa,
    resumo: {
      total,
      acertos,
      erros,
      pendentes,
      tentativasInvalidas: errosTentativas,
      concluida: pendentes === 0,
      aprovada: avaliacao.resultados.length > 0 && acertos === avaliacao.resultados.length && errosTentativas === 0
    },
    resultados: avaliacao.resultados,
    tentativasInvalidas: avaliacao.tentativasInvalidas,
    logsForaDaTarefa: avaliacao.tentativasInvalidas.map((tentativa) => tentativa.log).filter(Boolean)
  };
}

export async function listarRelatorios(query: Record<string, unknown> = {}) {
  const where: string[] = ["t.ativo = 1"];
  const params: unknown[] = [];

  if (typeof query.tarefaId === "string" && query.tarefaId) {
    where.push("t.id = ?");
    params.push(query.tarefaId);
  }

  if (typeof query.usuarioId === "string" && query.usuarioId) {
    where.push("t.usuarioId = ?");
    params.push(query.usuarioId);
  }

  const rows = await getTarefaRows(`WHERE ${where.join(" AND ")}`, params);
  return Promise.all(rows.map((row) => gerarRelatorioTarefa(row.id)));
}

export async function listarLogs(query: Record<string, unknown> = {}) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (typeof query.usuarioId === "string" && query.usuarioId) {
    where.push("l.usuarioId = ?");
    params.push(query.usuarioId);
  }

  if (typeof query.metodo === "string" && query.metodo) {
    where.push("l.metodo = ?");
    params.push(query.metodo.toUpperCase());
  }

  const rows = await prisma.$queryRawUnsafe<Array<LogRow & { usuario: string | null }>>(`
    SELECT l.*, u.usuario as usuario
    FROM LogRequisicao l
    LEFT JOIN Usuario u ON u.id = l.usuarioId
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY ${sqliteDateExpression("l.createdAt")} DESC
    LIMIT 200
  `, ...params);

  return rows.map((row) => ({
    id: row.id,
    usuarioId: row.usuarioId,
    usuario: row.usuario,
    metodo: row.metodo,
    endpoint: row.endpoint,
    statusCode: row.statusCode,
    ip: row.ip,
    createdAt: toIso(row.createdAt)
  }));
}
