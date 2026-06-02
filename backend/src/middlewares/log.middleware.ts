import type { FastifyInstance } from "fastify";
import { prisma } from "../shared/prisma.js";

export function registerRequestLogger(app: FastifyInstance) {
  app.addHook("onResponse", async (request, reply) => {
    if (request.url === "/api/v1/health") {
      return;
    }

    await prisma.logRequisicao.create({
      data: {
        metodo: request.method,
        endpoint: request.url,
        statusCode: reply.statusCode,
        usuarioId: request.user?.id,
        ip: request.ip
      }
    }).catch(() => undefined);
  });
}
