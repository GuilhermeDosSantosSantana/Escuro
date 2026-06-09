import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
export const errorResponseSchema = {
    type: "object",
    properties: {
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "O campo msisdn é obrigatório." },
        error: { type: "string", example: "ValidationError" },
        details: {
            type: "array",
            nullable: true,
            items: { type: "object", additionalProperties: true },
            example: [{ field: "msisdn", message: "O campo msisdn é obrigatório." }]
        }
    },
    required: ["statusCode", "message", "error"]
};
function errorExample(statusCode, error, message, details) {
    return {
        description: message,
        ...errorResponseSchema,
        example: {
            statusCode,
            message,
            error,
            ...(details ? { details } : {})
        }
    };
}
export const errorResponses = {
    validation: errorExample(400, "ValidationError", "A requisição contém campos inválidos ou obrigatórios ausentes."),
    unauthorized: errorExample(401, "UnauthorizedError", "Token ausente, inválido ou expirado."),
    forbidden: errorExample(403, "ForbiddenError", "Usuário autenticado, mas sem permissão."),
    notFound: errorExample(404, "NotFoundError", "Recurso não encontrado."),
    methodNotAllowed: errorExample(405, "MethodNotAllowedError", "Método não permitido para este recurso.", [{ allowedMethods: ["GET"] }]),
    notAcceptable: errorExample(406, "NotAcceptableError", "O recurso solicitado só retorna application/json."),
    conflict: errorExample(409, "ConflictError", "Já existe um contrato ativo para o MSISDN informado."),
    unsupportedMediaType: errorExample(415, "UnsupportedMediaTypeError", "O corpo da requisição deve usar Content-Type application/json."),
    unprocessable: errorExample(422, "UnprocessableEntityError", "Dados inválidos para a regra de negócio."),
    tooManyRequests: errorExample(429, "TooManyRequestsError", "Muitas requisições realizadas. Tente novamente mais tarde."),
    backendFault: errorExample(500, "BackendFault", "Erro inesperado no servidor.")
};
export const tokenRequestSchema = {
    type: "object",
    properties: {
        usuario: { type: "string", example: "usuario" },
        senha: { type: "string", example: "user@123" },
        clientId: { type: "string", example: "escuro-web" },
        clientSecret: { type: "string", example: "escuro-secret" }
    },
    required: ["usuario", "senha"]
};
export const tokenResponseSchema = {
    type: "object",
    properties: {
        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        tokenType: { type: "string", example: "Bearer" },
        expiresIn: { type: "number", example: 3600 },
        usuario: { type: "string", example: "usuario" },
        perfil: { type: "string", example: "ATENDENTE" }
    },
    required: ["accessToken", "tokenType", "expiresIn"]
};
export const authValidateResponseSchema = {
    type: "object",
    properties: {
        valid: { type: "boolean", example: true },
        usuario: { type: "string", example: "usuario" },
        perfil: { type: "string", example: "ATENDENTE" }
    },
    required: ["valid"]
};
export const planoResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string", example: "PLANO-001" },
        nome: { type: "string", example: "Controle 10GB" },
        descricao: { type: ["string", "null"], example: "Controle 10GB - 10GB" },
        tipoPlano: { type: "string", example: "Controle" },
        franquiaInternet: { type: ["string", "null"], example: "10GB" },
        valor: { type: ["number", "null"], example: 39.9 },
        ativo: { type: "boolean", example: true }
    },
    required: ["id", "nome", "tipoPlano", "ativo"]
};
export const contratoCreateRequestSchema = {
    type: "object",
    properties: {
        idCliente: { type: "string", example: "CLI-001" },
        msisdn: { type: "string", example: "11999999999" },
        iccid: { type: "string", example: "89550000000000000001" },
        nome: { type: "string", example: "Guilherme dos Santos Santana" },
        idPlano: { type: "string", example: "PLANO-001" },
        documento: { type: "string", example: "12345678900" },
        tipoDocumento: { type: "string", enum: ["CPF", "CNPJ"], example: "CPF" },
        idContrato: { type: "string", example: "CON-20260601-000001" },
        dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
        dataEncerramento: { type: "string", format: "date-time", example: "2026-06-30T10:00:00.000Z" },
        status: { type: "string", enum: ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"], example: "ATIVO" }
    },
    required: ["idCliente", "msisdn", "iccid", "nome", "idPlano", "documento", "tipoDocumento"]
};
export const contratoPatchRequestSchema = {
    type: "object",
    properties: {
        msisdn: { type: "string", example: "11999999999" },
        iccid: { type: "string", example: "89550000000000000001" },
        idPlano: { type: "string", example: "PLANO-002" },
        status: { type: "string", enum: ["ATIVO", "SUSPENSO", "ENCERRADO", "CANCELADO"], example: "SUSPENSO" },
        dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
        dataEncerramento: { type: "string", format: "date-time", example: "2026-06-30T10:00:00.000Z" }
    },
    additionalProperties: false
};
export const contratoResponseSchema = {
    type: "object",
    properties: {
        idContrato: { type: "string", example: "CON-20260601-000001" },
        idCliente: { type: "string", example: "CLI-001" },
        nome: { type: "string", example: "Guilherme dos Santos Santana" },
        documento: { type: "string", example: "12345678900" },
        tipoDocumento: { type: "string", example: "CPF" },
        msisdn: { type: "string", example: "11999999999" },
        iccid: { type: "string", example: "89550000000000000001" },
        idPlano: { type: "string", example: "PLANO-001" },
        plano: { type: "string", example: "Controle 10GB" },
        status: { type: "string", example: "ATIVO" },
        dataInclusao: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" },
        dataEncerramento: { type: ["string", "null"], format: "date-time", example: null }
    },
    required: ["idContrato", "idCliente", "msisdn", "iccid", "idPlano", "status", "dataInclusao", "dataEncerramento"]
};
export const contratoCreatedResponseSchema = {
    type: "object",
    properties: {
        idContrato: { type: "string", example: "CON-20260601-000001" },
        status: { type: "string", example: "ATIVO" },
        message: { type: "string", example: "Contrato criado com sucesso." }
    },
    required: ["idContrato", "status", "message"]
};
export const loginResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string", example: "clx0000000000000000000000" },
        usuario: { type: "string", example: "analista.teste" },
        perfil: { type: "string", enum: ["ADMIN", "ATENDENTE", "USUARIO", "DEVELOPER"], example: "USUARIO" },
        ativo: { type: "boolean", example: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    },
    required: ["id", "usuario", "perfil", "ativo", "createdAt", "updatedAt"]
};
export const loginCreateRequestSchema = {
    type: "object",
    properties: {
        usuario: { type: "string", example: "analista.teste" },
        senha: { type: "string", example: "user@123" },
        perfil: { type: "string", enum: ["ADMIN", "ATENDENTE", "USUARIO", "DEVELOPER"], example: "USUARIO" },
        ativo: { type: "boolean", example: true }
    },
    required: ["usuario", "senha"],
    additionalProperties: false
};
export const metodoApiResponseSchema = {
    type: "object",
    properties: {
        codigo: { type: "string", example: "CONTRATOS_LIST_GET" },
        metodo: { type: "string", example: "GET" },
        endpoint: { type: "string", example: "/api/v1/contratos" },
        descricao: { type: "string", example: "Contratos - Lista Contratos" },
        grupo: { type: "string", example: "Contratos" }
    },
    required: ["codigo", "metodo", "endpoint", "descricao", "grupo"]
};
export const tarefaItemResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        tarefaId: { type: "string" },
        codigoMetodo: { type: "string", example: "CONTRATOS_LIST_GET" },
        metodo: { type: "string", example: "GET" },
        endpoint: { type: "string", example: "/api/v1/contratos" },
        descricao: { type: "string", example: "Contratos - Lista Contratos" },
        ordem: { type: "number", example: 1 },
        statusEsperado: { type: "number", example: 200 },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["id", "tarefaId", "codigoMetodo", "metodo", "endpoint", "descricao", "ordem", "statusEsperado"]
};
export const tarefaCreateRequestSchema = {
    type: "object",
    properties: {
        titulo: { type: "string", example: "Fluxo de consulta de contratos" },
        usuarioId: { type: "string", example: "clx0000000000000000000000" },
        ordemObrigatoria: { type: "boolean", example: true },
        itens: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    codigoMetodo: { type: "string", example: "CONTRATOS_LIST_GET" },
                    statusEsperado: { type: "number", example: 200 }
                },
                required: ["codigoMetodo", "statusEsperado"],
                additionalProperties: false
            }
        }
    },
    required: ["titulo", "usuarioId", "itens"],
    additionalProperties: false
};
export const tarefaResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        titulo: { type: "string" },
        usuarioId: { type: "string" },
        usuario: { type: "string" },
        ordemObrigatoria: { type: "boolean" },
        ativo: { type: "boolean" },
        createdById: { type: ["string", "null"] },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        itens: { type: "array", items: tarefaItemResponseSchema }
    },
    required: ["id", "titulo", "usuarioId", "usuario", "ordemObrigatoria", "ativo", "itens"]
};
export const logAdminResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        usuarioId: { type: ["string", "null"] },
        usuario: { type: ["string", "null"] },
        metodo: { type: "string", example: "GET" },
        endpoint: { type: "string", example: "/api/v1/contratos" },
        statusCode: { type: "number", example: 200 },
        ip: { type: ["string", "null"] },
        createdAt: { type: "string", format: "date-time" }
    },
    required: ["id", "metodo", "endpoint", "statusCode", "createdAt"]
};
export const tentativaInvalidaResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        ordemExecucao: { type: "number", example: 2 },
        status: { type: "string", enum: ["errou"], example: "errou" },
        statusObtido: { type: "number", example: 404 },
        metodo: { type: "string", example: "GET" },
        endpoint: { type: "string", example: "/api/v1/rota-invalida" },
        log: { anyOf: [logAdminResponseSchema, { type: "null" }] },
        itemEsperado: { anyOf: [tarefaItemResponseSchema, { type: "null" }] },
        motivo: { type: "string", example: "Fora de ordem proposta." }
    },
    required: ["id", "ordemExecucao", "status", "statusObtido", "metodo", "endpoint", "log", "itemEsperado", "motivo"]
};
export const relatorioTarefaResponseSchema = {
    type: "object",
    properties: {
        tarefa: tarefaResponseSchema,
        resumo: {
            type: "object",
            properties: {
                total: { type: "number", example: 3 },
                acertos: { type: "number", example: 2 },
                erros: { type: "number", example: 1 },
                pendentes: { type: "number", example: 0 },
                tentativasInvalidas: { type: "number", example: 1 },
                concluida: { type: "boolean", example: true },
                aprovada: { type: "boolean", example: false }
            },
            required: ["total", "acertos", "erros", "pendentes", "concluida", "aprovada"]
        },
        resultados: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    item: tarefaItemResponseSchema,
                    status: { type: "string", enum: ["acertou", "errou", "pendente"], example: "acertou" },
                    statusEsperado: { type: "number", example: 200 },
                    statusObtido: { type: ["number", "null"], example: 200 },
                    acertou: { type: "boolean", example: true },
                    log: { anyOf: [logAdminResponseSchema, { type: "null" }] },
                    motivo: { type: "string" }
                },
                required: ["item", "status", "statusEsperado", "statusObtido", "acertou", "log", "motivo"]
            }
        },
        tentativasInvalidas: { type: "array", items: tentativaInvalidaResponseSchema },
        logsForaDaTarefa: { type: "array", items: logAdminResponseSchema }
    },
    required: ["tarefa", "resumo", "resultados", "tentativasInvalidas", "logsForaDaTarefa"]
};
export const healthResponseSchema = {
    type: "object",
    properties: {
        status: { type: "string", example: "ok" },
        service: { type: "string", example: "Escuro Telecom API" },
        timestamp: { type: "string", format: "date-time", example: "2026-06-01T10:00:00.000Z" }
    },
    required: ["status", "service", "timestamp"]
};
export const commonErrorResponses = {
    401: errorResponses.unauthorized,
    403: errorResponses.forbidden,
    406: errorResponses.notAcceptable,
    429: errorResponses.tooManyRequests,
    500: errorResponses.backendFault
};
export async function registerSwagger(app) {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Escuro Telecom API",
                description: "API REST para inclusão, consulta, atualização e encerramento de planos de celular.",
                version: "1.0.0"
            },
            servers: [
                { url: "http://localhost:3333", description: "Ambiente local padrão" },
                { url: "http://localhost:3334", description: "Ambiente local alternativo" }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    },
                    basicAuth: {
                        type: "http",
                        scheme: "basic",
                        description: "Uso local/mock: escuro-web:escuro-secret para gerar token; NPER para simular 403; NQ para simular 429."
                    }
                }
            },
            tags: [
                { name: "Health", description: "Status da API" },
                { name: "Autenticação", description: "Geração e validação de token" },
                { name: "Planos", description: "Consulta dos planos disponíveis" },
                { name: "Contratos", description: "Gerenciamento de contratos" }
            ]
        }
    });
    await app.register(swaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
            docExpansion: "list",
            deepLinking: true
        },
        staticCSP: true
    });
}
