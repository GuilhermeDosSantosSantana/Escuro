import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../shared/config.js";
import { HttpError } from "../../shared/http-error.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  authValidateResponseSchema,
  commonErrorResponses,
  errorResponseSchema,
  tokenRequestSchema,
  tokenResponseSchema
} from "../../docs/swagger.js";

type TokenBody = {
  usuario?: string;
  senha?: string;
  clientId?: string;
  clientSecret?: string;
};

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/v1/auth/token", {
    schema: {
      tags: ["Autenticação"],
      summary: "Gera Bearer Token",
      description: "Gera um JWT para o atendente usar nas rotas protegidas.",
      body: tokenRequestSchema,
      response: {
        200: tokenResponseSchema,
        401: { description: "Credenciais inválidas.", ...errorResponseSchema },
        403: { description: "ClientId, clientSecret ou permissão inválida.", ...errorResponseSchema },
        422: { description: "Campos obrigatórios ausentes.", ...errorResponseSchema },
        429: commonErrorResponses[429],
        500: commonErrorResponses[500]
      }
    }
  }, async (request, reply) => {
    const body = request.body as TokenBody;

    if (!body?.usuario || !body.senha || !body.clientId || !body.clientSecret) {
      throw new HttpError(422, "Usuário, senha, clientId e clientSecret são obrigatórios.");
    }

    if (body.clientId !== config.clientId || body.clientSecret !== config.clientSecret) {
      throw new HttpError(403, "ClientId ou clientSecret inválido.");
    }

    const usuario = await prisma.usuario.findUnique({ where: { usuario: body.usuario } });

    if (!usuario) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    if (!usuario.ativo) {
      throw new HttpError(403, "Usuário autenticado, mas sem permissão.");
    }

    const senhaValida = await bcrypt.compare(body.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    const accessToken = jwt.sign(
      {
        id: usuario.id,
        usuario: usuario.usuario,
        perfil: usuario.perfil
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
    );

    return reply.status(200).send({
      accessToken,
      tokenType: "Bearer",
      expiresIn: 3600
    });
  });

  app.post("/api/v1/auth/validate", {
    preHandler: authMiddleware,
    schema: {
      tags: ["Autenticação"],
      summary: "Valida Bearer Token",
      security: [{ bearerAuth: [] }],
      response: {
        200: authValidateResponseSchema,
        ...commonErrorResponses
      }
    }
  }, async (request) => {
    return {
      valid: true,
      usuario: request.user?.usuario,
      perfil: request.user?.perfil
    };
  });
}
