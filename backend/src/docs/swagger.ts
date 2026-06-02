import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export const errorResponseSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", example: 422 },
    message: { type: "string", example: "O campo msisdn é obrigatório." },
    error: { type: "string", example: "Unprocessable Entity" }
  },
  required: ["statusCode", "message", "error"]
} as const;

export const tokenRequestSchema = {
  type: "object",
  properties: {
    usuario: { type: "string", example: "atendente.escuro" },
    senha: { type: "string", example: "123456" },
    clientId: { type: "string", example: "escuro-web" },
    clientSecret: { type: "string", example: "escuro-secret" }
  },
  required: ["usuario", "senha", "clientId", "clientSecret"]
} as const;

export const tokenResponseSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
    tokenType: { type: "string", example: "Bearer" },
    expiresIn: { type: "number", example: 3600 }
  },
  required: ["accessToken", "tokenType", "expiresIn"]
} as const;

export const authValidateResponseSchema = {
  type: "object",
  properties: {
    valid: { type: "boolean", example: true },
    usuario: { type: "string", example: "atendente.escuro" },
    perfil: { type: "string", example: "ATENDENTE" }
  },
  required: ["valid"]
} as const;

export const planoResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "PLANO-001" },
    nome: { type: "string", example: "Controle 10GB" },
    descricao: { type: ["string", "null"], example: "Controle 10GB - 10GB" },
    tipoPlano: { type: "string", example: "Controle" },
    franquiaInternet: { type: ["string", "null"], example: "10GB" },
    valor: { type: ["number", "null"], example: 39.9 },
    ativo: { type: "boolean", example: true }
  },
  required: ["id", "nome", "tipoPlano", "ativo"]
} as const;

export const contratoCreateRequestSchema = {
  type: "object",
  properties: {
    idCliente: { type: "string", example: "CLI-001" },
    msisdn: { type: "string", example: "11999999999" },
    iccid: { type: "string", example: "89550000000000000001" },
    nome: { type: "string", example: "Guilherme dos Santos Santana" },
    idPlano: { type: "string", example: "PLANO-001" },
    documento: { type: "string", example: "12345678900" },
    tipoDocumento: { type: "string", enum: ["CPF", "CNPJ"], example: "CPF" },
    idContrato: { type: "string", example: "CON-20260601-000001" },
    dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
    dataEncerramento: { type: "string", format: "date-time", example: "2026-06-30T10:00:00.000Z" },
    status: { type: "string", enum: ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"], example: "ATIVO" }
  },
  required: ["idCliente", "msisdn", "iccid", "nome", "idPlano", "documento", "tipoDocumento"]
} as const;

export const contratoPatchRequestSchema = {
  type: "object",
  properties: {
    msisdn: { type: "string", example: "11999999999" },
    iccid: { type: "string", example: "89550000000000000001" },
    idPlano: { type: "string", example: "PLANO-002" },
    status: { type: "string", enum: ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"], example: "SUSPENSO" },
    dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
    dataEncerramento: { type: "string", format: "date-time", example: "2026-06-30T10:00:00.000Z" }
  },
  additionalProperties: false
} as const;

export const contratoResponseSchema = {
  type: "object",
  properties: {
    idContrato: { type: "string", example: "CON-20260601-000001" },
    idCliente: { type: "string", example: "CLI-001" },
    nome: { type: "string", example: "Guilherme dos Santos Santana" },
    documento: { type: "string", example: "12345678900" },
    tipoDocumento: { type: "string", example: "CPF" },
    msisdn: { type: "string", example: "11999999999" },
    iccid: { type: "string", example: "89550000000000000001" },
    idPlano: { type: "string", example: "PLANO-001" },
    plano: { type: "string", example: "Controle 10GB" },
    status: { type: "string", example: "ATIVO" },
    dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
    dataEncerramento: { type: ["string", "null"], format: "date-time", example: null }
  },
  required: ["idContrato", "idCliente", "msisdn", "iccid", "idPlano", "status", "dataInclusao", "dataEncerramento"]
} as const;

export const contratoCreatedResponseSchema = {
  type: "object",
  properties: {
    idContrato: { type: "string", example: "CON-20260601-000001" },
    status: { type: "string", example: "ATIVO" },
    message: { type: "string", example: "Contrato criado com sucesso." }
  },
  required: ["idContrato", "status", "message"]
} as const;

export const healthResponseSchema = {
  type: "object",
  properties: {
    status: { type: "string", example: "ok" },
    service: { type: "string", example: "Escuro Telecom API" },
    timestamp: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" }
  },
  required: ["status", "service", "timestamp"]
} as const;

export const commonErrorResponses = {
  401: { description: "Token ausente, inválido ou expirado.", ...errorResponseSchema },
  403: { description: "Usuário autenticado, mas sem permissão.", ...errorResponseSchema },
  429: { description: "Muitas requisições em curto período de tempo.", ...errorResponseSchema },
  500: { description: "Erro inesperado no servidor.", ...errorResponseSchema }
} as const;

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Escuro Telecom API",
        description: "API REST para inclusão, consulta, atualização e encerramento de planos de celular.",
        version: "1.0.0"
      },
      servers: [
        { url: "http://localhost:3333", description: "Ambiente local padrão" },
        { url: "http://localhost:3334", description: "Ambiente local alternativo" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      tags: [
        { name: "Health", description: "Status da API" },
        { name: "Autenticação", description: "Geração e validação de token" },
        { name: "Planos", description: "Consulta dos planos disponíveis" },
        { name: "Contratos", description: "Gerenciamento de contratos" }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true
    },
    staticCSP: true
  });
}
