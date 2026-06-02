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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

export const api = {
  token(payload: { usuario: string; senha: string; clientId: string; clientSecret: string }) {
    return request<{ accessToken: string; tokenType: string; expiresIn: number }>("/api/v1/auth/token", {
      method: "POST",
      body: JSON.stringify(payload)
    });
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
  }
};
