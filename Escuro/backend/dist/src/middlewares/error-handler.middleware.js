import { getErrorName, HttpError } from "../shared/http-error.js";
function errorBody(statusCode, message, error, details) {
    return {
        statusCode,
        message,
        error,
        ...(details && details.length > 0 ? { details } : {})
    };
}
export function errorHandler(error, _request, reply) {
    if (error instanceof HttpError) {
        return reply.status(error.statusCode).send(errorBody(error.statusCode, error.message, error.error, error.details));
    }
    if ("validation" in error && error.validation) {
        return reply.status(400).send(errorBody(400, "A requisição contém campos inválidos ou obrigatórios ausentes.", getErrorName(400), error.validation.map((item) => ({
            field: item.instancePath || item.schemaPath,
            message: item.message
        }))));
    }
    const statusCode = error.statusCode ?? 500;
    const normalizedError = getErrorName(statusCode);
    return reply.status(statusCode).send(errorBody(statusCode, statusCode === 500 ? "Erro inesperado no servidor." : error.message, normalizedError));
}
