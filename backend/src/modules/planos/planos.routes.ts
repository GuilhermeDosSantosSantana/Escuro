import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { HttpError } from "../../shared/http-error.js";
import { prisma } from "../../shared/prisma.js";
import { planoResponse } from "../../shared/utils/response.js";
import { commonErrorResponses, errorResponses, planoResponseSchema } from "../../docs/swagger.js";

type PlanosQuery = {
  tipo?: string;
  ativo?: string;
};

export async function planosRoutes(app: FastifyInstance) {
  app.get("/api/v1/planos", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Planos"],
      summary: "Lista planos disponíveis",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          tipo: { type: "string", example: "Controle" },
          ativo: { type: "string", enum: ["true", "false"], example: "true" }
        }
      },
      response: {
        200: {
          type: "array",
          items: planoResponseSchema
        },
        405: errorResponses.methodNotAllowed,
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const query = request.query as PlanosQuery;
    const ativo = query.ativo === undefined ? undefined : query.ativo === "true";

    const planos = await prisma.plano.findMany({
      where: {
        tipoPlano: query.tipo,
        ativo
      },
      orderBy: { id: "asc" }
    });

    return planos.map(planoResponse);
  });

  app.get("/api/v1/planos/:idPlano", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Planos"],
      summary: "Consulta plano por ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          idPlano: { type: "string", example: "PLANO-001" }
        },
        required: ["idPlano"]
      },
      response: {
        200: planoResponseSchema,
        404: errorResponses.notFound,
        405: errorResponses.methodNotAllowed,
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    const { idPlano } = request.params as { idPlano: string };
    const plano = await prisma.plano.findUnique({ where: { id: idPlano } });

    if (!plano) {
      throw new HttpError(404, "Plano não encontrado.");
    }

    return planoResponse(plano);
  });
}
