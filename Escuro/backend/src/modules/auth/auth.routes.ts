import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../shared/config.js";
import { gerarAccessToken } from "../../shared/auth.js";
import { HttpError } from "../../shared/http-error.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { readBasicAuthorization } from "../../middlewares/http-protocol.middleware.js";
import {
  authValidateResponseSchema,
  commonErrorResponses,
  errorResponses,
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
      description: "Gera um JWT para o login usar nas rotas protegidas. clientId/clientSecret podem ser enviados no body ou via Basic Auth escuro-web:escuro-secret.",
      security: [{ basicAuth: [] }],
      body: tokenRequestSchema,
      response: {
        200: tokenResponseSchema,
        400: errorResponses.validation,
        401: errorResponses.unauthorized,
        403: errorResponses.forbidden,
        405: errorResponses.methodNotAllowed,
        406: errorResponses.notAcceptable,
        415: errorResponses.unsupportedMediaType,
        429: commonErrorResponses[429],
        500: commonErrorResponses[500]
      }
    }
  }, async (request, reply) => {
    const body = request.body as TokenBody;

    if (!body?.usuario || !body.senha) {
      throw new HttpError(400, "Usuário e senha são obrigatórios.");
    }

    const basic = readBasicAuthorization(request.headers.authorization);
    const clientId = body.clientId ?? basic?.username;
    const clientSecret = body.clientSecret ?? basic?.password;

    if (!clientId || !clientSecret) {
      throw new HttpError(400, "clientId e clientSecret são obrigatórios no body ou via Basic Auth.");
    }

    if (clientId !== config.clientId || clientSecret !== config.clientSecret) {
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

    request.user = {
      id: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil
    };

    const accessToken = gerarAccessToken({
      id: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil
    });

    return reply.status(200).send({
      accessToken,
      tokenType: "Bearer",
      expiresIn: 3600,
      usuario: usuario.usuario,
      perfil: usuario.perfil
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
        405: errorResponses.methodNotAllowed,
        415: errorResponses.unsupportedMediaType,
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
