import type { FastifyRequest } from "fastify";

export type AuthUser = {
  id: string;
  usuario: string;
  perfil: string;
};

export type AuthenticatedRequest = FastifyRequest & {
  user: AuthUser;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
