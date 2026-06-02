import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { contratoResponse } from "../../shared/utils/response.js";
import {
  atualizarContratoPatch,
  buscarContrato,
  criarContrato,
  encerrarContrato,
  listarContratos,
  substituirContrato
} from "./contratos.service.js";
import {
  commonErrorResponses,
  contratoCreateRequestSchema,
  contratoCreatedResponseSchema,
  contratoPatchRequestSchema,
  contratoResponseSchema,
  errorResponseSchema
} from "../../docs/swagger.js";

export async function contratosRoutes(app: FastifyInstance) {
  app.post("/api/v1/contratos", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Cria novo contrato",
      security: [{ bearerAuth: [] }],
      body: contratoCreateRequestSchema,
      response: {
        201: contratoCreatedResponseSchema,
        404: { description: "Plano não encontrado.", ...errorResponseSchema },
        409: { description: "MSISDN, ICCID ou ID do contrato duplicado.", ...errorResponseSchema },
        422: { description: "Dados inválidos para a regra de negócio.", ...errorResponseSchema },
        ...commonErrorResponses
      }
    }
  }, async (request, reply) => {
    const contrato = await criarContrato(request.body);

    return reply.status(201).send({
      idContrato: contrato.idContrato,
      status: contrato.status,
      message: "Contrato criado com sucesso."
    });
  });

  app.get("/api/v1/contratos", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Lista contratos",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"], example: "ATIVO" },
          documento: { type: "string", example: "12345678900" },
          msisdn: { type: "string", example: "11999999999" }
        }
      },
      response: {
        200: {
          type: "array",
          items: contratoResponseSchema
        },
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const contratos = await listarContratos(request.query as Record<string, unknown>);
    return contratos.map(contratoResponse);
  });

  app.get("/api/v1/contratos/:idContrato", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Consulta contrato por ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          idContrato: { type: "string", example: "CON-20260601-000001" }
        },
        required: ["idContrato"]
      },
      response: {
        200: contratoResponseSchema,
        404: { description: "Contrato não encontrado.", ...errorResponseSchema },
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const { idContrato } = request.params as { idContrato: string };
    const contrato = await buscarContrato(idContrato);

    return contratoResponse(contrato);
  });

  app.patch("/api/v1/contratos/:idContrato", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Atualiza contrato parcialmente",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          idContrato: { type: "string", example: "CON-20260601-000001" }
        },
        required: ["idContrato"]
      },
      body: contratoPatchRequestSchema,
      response: {
        200: contratoResponseSchema,
        404: { description: "Contrato ou plano não encontrado.", ...errorResponseSchema },
        409: { description: "MSISDN ou ICCID duplicado.", ...errorResponseSchema },
        422: { description: "Dados inválidos para a regra de negócio.", ...errorResponseSchema },
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const { idContrato } = request.params as { idContrato: string };
    const contrato = await atualizarContratoPatch(idContrato, request.body);

    return contratoResponse(contrato);
  });

  app.put("/api/v1/contratos/:idContrato", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Substitui dados principais do contrato",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          idContrato: { type: "string", example: "CON-20260601-000001" }
        },
        required: ["idContrato"]
      },
      body: contratoCreateRequestSchema,
      response: {
        200: contratoResponseSchema,
        404: { description: "Contrato ou plano não encontrado.", ...errorResponseSchema },
        409: { description: "MSISDN ou ICCID duplicado.", ...errorResponseSchema },
        422: { description: "Dados inválidos para a regra de negócio.", ...errorResponseSchema },
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const { idContrato } = request.params as { idContrato: string };
    const contrato = await substituirContrato(idContrato, request.body);

    return contratoResponse(contrato);
  });

  app.delete("/api/v1/contratos/:idContrato", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Contratos"],
      summary: "Encerra contrato logicamente",
      description: "Não apaga o contrato. Define status como ENCERRADO e preenche dataEncerramento.",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          idContrato: { type: "string", example: "CON-20260601-000001" }
        },
        required: ["idContrato"]
      },
      response: {
        204: {
          type: "null",
          description: "Contrato encerrado sem corpo de resposta."
        },
        404: { description: "Contrato não encontrado.", ...errorResponseSchema },
        409: { description: "Contrato já está encerrado.", ...errorResponseSchema },
        ...commonErrorResponses
      }
    }
  }, async (request, reply) => {
    const { idContrato } = request.params as { idContrato: string };
    await encerrarContrato(idContrato);

    return reply.status(204).send();
  });
}
