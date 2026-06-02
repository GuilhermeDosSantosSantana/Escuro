import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../shared/http-error.js";

export function errorHandler(error: FastifyError | HttpError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      message: error.message,
      error: error.error
    });
  }

  const statusCode = error.statusCode ?? 500;

  return reply.status(statusCode).send({
    statusCode,
    message: statusCode === 500 ? "Erro inesperado no servidor." : error.message,
    error: statusCode === 500 ? "Internal Server Error" : error.name
  });
}
