import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { planosRoutes } from "./modules/planos/planos.routes.js";
import { contratosRoutes } from "./modules/contratos/contratos.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { registerHttpProtocolMiddleware } from "./middlewares/http-protocol.middleware.js";
import { registerRequestLogger } from "./middlewares/log.middleware.js";
import { registerSwagger, healthResponseSchema } from "./docs/swagger.js";
export async function buildApp() {
    const app = Fastify({
        logger: true,
        ajv: {
            customOptions: {
                strict: false
            }
        }
    });
    await app.register(cors, {
        origin: true
    });
    await app.register(rateLimit, {
        max: 2000,
        timeWindow: "15 minutes",
        allowList: (request) => /^\s*Bearer\s+/i.test(request.headers.authorization ?? ""),
        errorResponseBuilder() {
            return {
                statusCode: 429,
                message: "Muitas requisições realizadas. Aguarde ou use um Bearer Token válido para executar os testes da tarefa.",
                error: "TooManyRequestsError"
            };
        }
    });
    app.setErrorHandler(errorHandler);
    registerHttpProtocolMiddleware(app);
    registerRequestLogger(app);
    await registerSwagger(app);
    app.get("/api/v1/health", {
        schema: {
            tags: ["Health"],
            summary: "Verifica se a API está ativa",
            response: {
                200: healthResponseSchema
            }
        }
    }, async () => ({
        status: "ok",
        service: "Escuro Telecom API",
        timestamp: new Date().toISOString()
    }));
    await app.register(authRoutes);
    await app.register(planosRoutes);
    await app.register(contratosRoutes);
    await app.register(adminRoutes);
    return app;
}
