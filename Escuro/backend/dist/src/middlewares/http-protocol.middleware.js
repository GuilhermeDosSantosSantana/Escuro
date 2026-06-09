import { HttpError } from "../shared/http-error.js";
const apiRoutePatterns = [
    { pattern: /^\/api\/v1\/health\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/auth\/token\/?$/, methods: ["POST"] },
    { pattern: /^\/api\/v1\/auth\/validate\/?$/, methods: ["POST"] },
    { pattern: /^\/api\/v1\/planos\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/planos\/[^/]+\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/contratos\/?$/, methods: ["GET", "POST"] },
    { pattern: /^\/api\/v1\/contratos\/[^/]+\/?$/, methods: ["GET", "PATCH", "PUT", "DELETE"] },
    { pattern: /^\/api\/v1\/admin\/metodos\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/admin\/usuarios\/?$/, methods: ["GET", "POST"] },
    { pattern: /^\/api\/v1\/admin\/usuarios\/[^/]+\/?$/, methods: ["GET", "PATCH", "DELETE"] },
    { pattern: /^\/api\/v1\/admin\/tarefas\/?$/, methods: ["GET", "POST"] },
    { pattern: /^\/api\/v1\/admin\/tarefas\/[^/]+\/?$/, methods: ["GET", "PATCH", "DELETE"] },
    { pattern: /^\/api\/v1\/admin\/tarefas\/[^/]+\/itens\/?$/, methods: ["PUT"] },
    { pattern: /^\/api\/v1\/admin\/tarefas\/[^/]+\/relatorio\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/admin\/relatorios\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/admin\/relatorios\/stream\/?$/, methods: ["GET"] },
    { pattern: /^\/api\/v1\/admin\/logs\/?$/, methods: ["GET"] }
];
function acceptsJson(acceptHeader) {
    if (!acceptHeader)
        return true;
    return acceptHeader
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .some((value) => value.startsWith("application/json") || value.startsWith("application/*") || value.startsWith("*/*"));
}
function acceptsEventStream(acceptHeader) {
    if (!acceptHeader)
        return true;
    return acceptHeader
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .some((value) => value.startsWith("text/event-stream") || value.startsWith("*/*"));
}
function isJsonContentType(contentType) {
    if (!contentType)
        return true;
    return contentType.toLowerCase().split(";")[0].trim() === "application/json";
}
function decodeBasicAuthorization(authorization) {
    const match = authorization?.match(/^\s*Basic\s+(.+)\s*$/i);
    if (!match)
        return undefined;
    try {
        const raw = Buffer.from(match[1].trim(), "base64").toString("utf8");
        const separatorIndex = raw.indexOf(":");
        if (separatorIndex === -1) {
            return { username: raw, password: "" };
        }
        return {
            username: raw.slice(0, separatorIndex),
            password: raw.slice(separatorIndex + 1)
        };
    }
    catch {
        return undefined;
    }
}
export function readBasicAuthorization(authorization) {
    return decodeBasicAuthorization(authorization);
}
export function registerHttpProtocolMiddleware(app) {
    app.addHook("onRequest", async (request) => {
        if (!request.url.startsWith("/api/")) {
            return;
        }
        const basic = decodeBasicAuthorization(request.headers.authorization);
        if (basic?.username.toUpperCase() === "NPER") {
            throw new HttpError(403, "Acesso negado pelo mock Basic NPER.");
        }
        if (basic?.username.toUpperCase() === "NQ") {
            throw new HttpError(429, "Limite de requisições simulado pelo mock Basic NQ.");
        }
        const pathname = request.url.split("?")[0] ?? request.url;
        const isReportStream = /^\/api\/v1\/admin\/relatorios\/stream\/?$/.test(pathname);
        if (isReportStream) {
            if (!acceptsEventStream(request.headers.accept)) {
                throw new HttpError(406, "O stream de relatórios só retorna text/event-stream.");
            }
        }
        else if (!acceptsJson(request.headers.accept)) {
            throw new HttpError(406, "O recurso solicitado só retorna application/json.");
        }
        if (["POST", "PUT", "PATCH"].includes(request.method) && !isJsonContentType(request.headers["content-type"])) {
            throw new HttpError(415, "O corpo da requisição deve usar Content-Type application/json.");
        }
    });
    app.setNotFoundHandler((request, reply) => {
        const pathname = request.url.split("?")[0] ?? request.url;
        const route = apiRoutePatterns.find((item) => item.pattern.test(pathname));
        if (route && !route.methods.includes(request.method)) {
            return reply.status(405).send({
                statusCode: 405,
                message: `Método ${request.method} não permitido para este recurso.`,
                error: "MethodNotAllowedError",
                details: [{ allowedMethods: route.methods }]
            });
        }
        return reply.status(404).send({
            statusCode: 404,
            message: "Recurso não encontrado.",
            error: "NotFoundError"
        });
    });
}
