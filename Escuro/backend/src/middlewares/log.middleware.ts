import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../shared/prisma.js";
import { config } from "../shared/config.js";
import { extractBearerTokenFromRequest } from "../shared/bearer-token.js";
import type { AuthUser } from "../shared/types.js";
import { publishReportEvent } from "../shared/realtime.js";

type TokenPayload = AuthUser & {
  iat?: number;
  exp?: number;
};

async function resolveUserFromBearer(request: FastifyRequest) {
  if (request.user) {
    return request.user;
  }

  const token = extractBearerTokenFromRequest(request);
  if (!token) {
    return undefined;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } });

    if (!usuario?.ativo) {
      return undefined;
    }

    request.user = {
      id: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil
    };

    return request.user;
  } catch {
    return undefined;
  }
}

export function registerRequestLogger(app: FastifyInstance) {
  app.addHook("onResponse", async (request, reply) => {
    const user = await resolveUserFromBearer(request);

    const createdAt = new Date().toISOString();
    const logId = randomUUID();

    await prisma.$executeRawUnsafe(
      `INSERT INTO LogRequisicao (id, metodo, endpoint, statusCode, usuarioId, ip, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      logId,
      request.method,
      request.url,
      reply.statusCode,
      user?.id ?? null,
      request.ip,
      createdAt
    ).then(() => {
      if (!request.url.startsWith("/api/v1/admin")) {
        publishReportEvent({
          type: "request-log",
          timestamp: createdAt,
          usuarioId: user?.id ?? null,
          usuario: user?.usuario ?? null,
          metodo: request.method,
          endpoint: request.url,
          statusCode: reply.statusCode
        });
      }
    }).catch(() => undefined);
  });
}
