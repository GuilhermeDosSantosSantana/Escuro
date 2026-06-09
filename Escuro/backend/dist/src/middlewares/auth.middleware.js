import jwt from "jsonwebtoken";
import { prisma } from "../shared/prisma.js";
import { config } from "../shared/config.js";
import { HttpError } from "../shared/http-error.js";
import { extractBearerTokenFromRequest } from "../shared/bearer-token.js";
export async function authMiddleware(request, _reply) {
    const token = extractBearerTokenFromRequest(request);
    if (!token) {
        throw new HttpError(401, "Token ausente, inválido ou expirado.");
    }
    try {
        const payload = jwt.verify(token, config.jwtSecret);
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
    }
    catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError(401, "Token ausente, inválido ou expirado.");
    }
}
export async function adminMiddleware(request, _reply) {
    if (request.user?.perfil !== "ADMIN") {
        throw new HttpError(403, "Apenas administradores podem acessar este recurso.");
    }
}
