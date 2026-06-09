export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

export type Plano = {
  id: string;
  nome: string;
  tipoPlano: string;
  franquiaInternet: string | null;
  valor: number | null;
  ativo: boolean;
};

export type Contrato = {
  idContrato: string;
  idCliente: string;
  nome?: string;
  documento?: string;
  tipoDocumento?: string;
  msisdn: string;
  iccid: string;
  idPlano: string;
  plano?: string;
  status: "ATIVO" | "SUSPENSO" | "ENCERRADO" | "CANCELADO";
  dataInclusao: string;
  dataEncerramento: string | null;
};

export type UsuarioAdmin = {
  id: string;
  usuario: string;
  perfil: "ADMIN" | "ATENDENTE" | "USUARIO" | "DEVELOPER";
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MetodoApi = {
  codigo: string;
  metodo: string;
  endpoint: string;
  descricao: string;
  grupo: string;
};

export type TarefaItem = {
  id: string;
  tarefaId: string;
  codigoMetodo: string;
  metodo: string;
  endpoint: string;
  descricao: string;
  ordem: number;
  statusEsperado: number;
  createdAt: string;
};

export type Tarefa = {
  id: string;
  titulo: string;
  usuarioId: string;
  usuario: string;
  ordemObrigatoria: boolean;
  ativo: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  itens: TarefaItem[];
};

export type LogAdmin = {
  id: string;
  usuarioId: string | null;
  usuario?: string | null;
  metodo: string;
  endpoint: string;
  statusCode: number;
  ip: string | null;
  createdAt: string;
};

export type RelatorioTarefa = {
  tarefa: Tarefa;
  resumo: {
    total: number;
    acertos: number;
    erros: number;
    pendentes: number;
    tentativasInvalidas?: number;
    concluida: boolean;
    aprovada: boolean;
  };
  resultados: Array<{
    item: TarefaItem;
    status: "acertou" | "errou" | "pendente";
    statusEsperado: number;
    statusObtido: number | null;
    acertou: boolean;
    log: LogAdmin | null;
    motivo: string;
  }>;
  tentativasInvalidas?: Array<{
    id: string;
    ordemExecucao: number;
    status: "errou";
    statusObtido: number;
    metodo: string;
    endpoint: string;
    log: LogAdmin | null;
    itemEsperado: TarefaItem | null;
    motivo: string;
  }>;
  logsForaDaTarefa: LogAdmin[];
};

export type CriarContratoPayload = {
  idCliente: string;
  msisdn: string;
  iccid: string;
  nome: string;
  idPlano: string;
  documento: string;
  tipoDocumento: "CPF" | "CNPJ";
  idContrato?: string;
  dataInclusao?: string;
  dataEncerramento?: string;
  status?: string;
};

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string) {
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Não foi possível concluir a operação.");
  }

  return data as T;
}


export type RelatorioRealtimeEvent = {
  type: "request-log" | "task-updated";
  timestamp: string;
  usuarioId?: string | null;
  usuario?: string | null;
  metodo?: string;
  endpoint?: string;
  statusCode?: number;
  tarefaId?: string;
};

export function subscribeRelatoriosRealtime(
  token: string,
  onUpdate: (event: RelatorioRealtimeEvent) => void,
  onError?: (error: unknown) => void
) {
  const controller = new AbortController();
  const decoder = new TextDecoder();
  let buffer = "";

  const readStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/relatorios/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream"
        },
        signal: controller.signal
      });

      if (!response.ok || !response.body) {
        throw new ApiError(response.status, "Não foi possível abrir a atualização em tempo real.");
      }

      const reader = response.body.getReader();

      while (!controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          const eventLine = message.split("\n").find((line) => line.startsWith("event:"));
          const dataLine = message.split("\n").find((line) => line.startsWith("data:"));
          const eventName = eventLine?.replace("event:", "").trim();

          if (eventName !== "report-updated" || !dataLine) continue;

          const data = JSON.parse(dataLine.replace("data:", "").trim()) as RelatorioRealtimeEvent;
          onUpdate(data);
        }
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        onError?.(error);
      }
    }
  };

  void readStream();

  return () => controller.abort();
}

export const api = {
  token(payload: { usuario: string; senha: string; clientId: string; clientSecret: string }) {
    return request<{ accessToken: string; tokenType: string; expiresIn: number; usuario?: string; perfil?: string }>("/api/v1/auth/token", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  validate(token: string) {
    return request<{ valid: boolean; usuario?: string; perfil?: string }>("/api/v1/auth/validate", { method: "POST" }, token);
  },
  planos(token: string) {
    return request<Plano[]>("/api/v1/planos", {}, token);
  },
  contratos(token: string) {
    return request<Contrato[]>("/api/v1/contratos", {}, token);
  },
  criarContrato(token: string, payload: CriarContratoPayload) {
    return request<{ idContrato: string; status: string; message: string }>("/api/v1/contratos", {
      method: "POST",
      body: JSON.stringify(payload)
    }, token);
  },
  encerrarContrato(token: string, idContrato: string) {
    return request<void>(`/api/v1/contratos/${idContrato}`, { method: "DELETE" }, token);
  },
  usuarios(token: string) {
    return request<UsuarioAdmin[]>("/api/v1/admin/usuarios", {}, token);
  },
  criarUsuario(token: string, payload: { usuario: string; senha: string; perfil: string; ativo?: boolean }) {
    return request<UsuarioAdmin>("/api/v1/admin/usuarios", {
      method: "POST",
      body: JSON.stringify(payload)
    }, token);
  },
  atualizarUsuario(token: string, id: string, payload: { usuario?: string; senha?: string; perfil?: string; ativo?: boolean }) {
    return request<UsuarioAdmin>(`/api/v1/admin/usuarios/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }, token);
  },
  removerUsuario(token: string, id: string) {
    return request<UsuarioAdmin>(`/api/v1/admin/usuarios/${id}`, { method: "DELETE" }, token);
  },
  metodos(token: string) {
    return request<MetodoApi[]>("/api/v1/admin/metodos", {}, token);
  },
  tarefas(token: string) {
    return request<Tarefa[]>("/api/v1/admin/tarefas", {}, token);
  },
  criarTarefa(token: string, payload: { titulo: string; usuarioId: string; ordemObrigatoria: boolean; itens: Array<{ codigoMetodo: string; statusEsperado: number }> }) {
    return request<Tarefa>("/api/v1/admin/tarefas", {
      method: "POST",
      body: JSON.stringify(payload)
    }, token);
  },
  removerTarefa(token: string, id: string) {
    return request<Tarefa>(`/api/v1/admin/tarefas/${id}`, { method: "DELETE" }, token);
  },
  relatorios(token: string) {
    return request<RelatorioTarefa[]>("/api/v1/admin/relatorios", {}, token);
  }
};
