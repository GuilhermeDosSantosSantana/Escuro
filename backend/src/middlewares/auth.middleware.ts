import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { prisma } from "../shared/prisma.js";
import { config } from "../shared/config.js";
import { HttpError } from "../shared/http-error.js";
import type { AuthUser } from "../shared/types.js";

type TokenPayload = AuthUser & {
  iat: number;
  exp: number;
};

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Token ausente, inválido ou expirado.");
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } });

    if (!usuario) {
      throw new HttpError(401, "Token ausente, inválido ou expirado.");
    }

    if (!usuario.ativo) {
      throw new HttpError(403, "Usuário autenticado, mas sem permissão.");
    }

    request.user = {
      id: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "Token ausente, inválido ou expirado.");
  }
}
