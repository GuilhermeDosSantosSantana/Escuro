import { HttpError } from "../http-error.js";
import { parseDate } from "../utils/date.js";

export const statusPermitidos = ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"] as const;
export const tiposDocumentoPermitidos = ["CPF", "CNPJ"] as const;

export type CriarContratoInput = {
  idCliente: string;
  msisdn: string;
  iccid: string;
  nome: string;
  idPlano: string;
  documento: string;
  tipoDocumento: "CPF" | "CNPJ";
  idContrato?: string;
  dataInclusao?: Date;
  dataEncerramento?: Date;
  status?: string;
};

const camposObrigatorios = ["idCliente", "msisdn", "iccid", "nome", "idPlano", "documento", "tipoDocumento"] as const;

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "O corpo da requisição deve ser um objeto JSON válido.");
  }

  return value as Record<string, unknown>;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function requireString(body: Record<string, unknown>, field: string) {
  const value = body[field];

  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `O campo ${field} é obrigatório.`);
  }

  return value.trim();
}

export function validateStatus(status: unknown) {
  if (status === undefined || status === null || status === "") {
    return undefined;
  }

  if (typeof status !== "string" || !statusPermitidos.includes(status as (typeof statusPermitidos)[number])) {
    throw new HttpError(422, "Status do contrato inválido.");
  }

  return status;
}

export function validateCreateContrato(bodyValue: unknown): CriarContratoInput {
  const body = asRecord(bodyValue);

  for (const field of camposObrigatorios) {
    requireString(body, field);
  }

  const tipoDocumento = requireString(body, "tipoDocumento").toUpperCase();
  if (!tiposDocumentoPermitidos.includes(tipoDocumento as (typeof tiposDocumentoPermitidos)[number])) {
    throw new HttpError(400, "O campo tipoDocumento aceita apenas CPF ou CNPJ.");
  }

  const documento = onlyDigits(requireString(body, "documento"));
  if (tipoDocumento === "CPF" && documento.length !== 11) {
    throw new HttpError(400, "CPF deve conter 11 dígitos.");
  }

  if (tipoDocumento === "CNPJ" && documento.length !== 14) {
    throw new HttpError(400, "CNPJ deve conter 14 dígitos.");
  }

  const msisdn = onlyDigits(requireString(body, "msisdn"));
  if (!/^\d{10,11}$/.test(msisdn)) {
    throw new HttpError(400, "MSISDN deve conter 10 ou 11 dígitos.");
  }

  const iccid = onlyDigits(requireString(body, "iccid"));
  if (!/^\d{19,20}$/.test(iccid)) {
    throw new HttpError(400, "ICCID deve conter 19 ou 20 dígitos.");
  }

  let dataInclusao: Date | undefined;
  let dataEncerramento: Date | undefined;

  try {
    dataInclusao = parseDate(body.dataInclusao, "dataInclusao");
    dataEncerramento = parseDate(body.dataEncerramento, "dataEncerramento");
  } catch (error) {
    throw new HttpError(400, error instanceof Error ? error.message : "Data inválida.");
  }

  if (dataEncerramento && dataInclusao && dataEncerramento < dataInclusao) {
    throw new HttpError(422, "dataEncerramento não pode ser menor que dataInclusao.");
  }

  const status = validateStatus(body.status);

  return {
    idCliente: requireString(body, "idCliente"),
    nome: requireString(body, "nome"),
    idPlano: requireString(body, "idPlano"),
    documento,
    tipoDocumento: tipoDocumento as "CPF" | "CNPJ",
    msisdn,
    iccid,
    idContrato: typeof body.idContrato === "string" && body.idContrato.trim() ? body.idContrato.trim() : undefined,
    dataInclusao,
    dataEncerramento,
    status
  };
}

export function validatePatchContrato(bodyValue: unknown) {
  const body = asRecord(bodyValue);
  const allowed = ["msisdn", "iccid", "idPlano", "status", "dataInclusao", "dataEncerramento"] as const;
  const data: Record<string, string | Date | null> = {};

  for (const key of Object.keys(body)) {
    if (!allowed.includes(key as (typeof allowed)[number])) {
      continue;
    }

    if (key === "status") {
      const status = validateStatus(body[key]);
      if (status) data.status = status;
    } else if (key === "msisdn") {
      const msisdn = typeof body[key] === "string" ? onlyDigits(body[key]) : "";
      if (!/^\d{10,11}$/.test(msisdn)) throw new HttpError(400, "MSISDN deve conter 10 ou 11 dígitos.");
      data.msisdn = msisdn;
    } else if (key === "iccid") {
      const iccid = typeof body[key] === "string" ? onlyDigits(body[key]) : "";
      if (!/^\d{19,20}$/.test(iccid)) throw new HttpError(400, "ICCID deve conter 19 ou 20 dígitos.");
      data.iccid = iccid;
    } else if (key === "idPlano") {
      data.idPlano = requireString(body, key);
    } else {
      try {
        const parsed = parseDate(body[key], key);
        data[key] = parsed ?? null;
      } catch (error) {
        throw new HttpError(400, error instanceof Error ? error.message : "Data inválida.");
      }
    }
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(422, "Informe ao menos um campo permitido para atualização.");
  }

  return data;
}
