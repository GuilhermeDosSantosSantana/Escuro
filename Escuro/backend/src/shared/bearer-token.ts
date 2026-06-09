import type { FastifyRequest } from "fastify";

export function extractBearerToken(authorization?: string) {
  const match = authorization?.match(/^\s*Bearer\s+(.+)\s*$/i);
  return match?.[1]?.trim();
}

export function extractBearerTokenFromRequest(request: FastifyRequest) {
  return extractBearerToken(request.headers.authorization);
}
