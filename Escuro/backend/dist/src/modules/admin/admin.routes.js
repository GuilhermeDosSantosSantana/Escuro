import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware.js";
import { commonErrorResponses, errorResponses, loginCreateRequestSchema, loginResponseSchema, tarefaCreateRequestSchema, tarefaResponseSchema, relatorioTarefaResponseSchema, metodoApiResponseSchema, logAdminResponseSchema } from "../../docs/swagger.js";
import { metodosApi } from "./api-methods.js";
import { subscribeReportEvents } from "../../shared/realtime.js";
import { atualizarTarefa, atualizarUsuario, buscarTarefa, buscarUsuario, criarTarefa, criarUsuario, gerarRelatorioTarefa, listarLogs, listarRelatorios, listarTarefas, listarUsuarios, removerTarefa, removerUsuario, substituirItensTarefa } from "./admin.service.js";
const adminPreHandlers = [authMiddleware, adminMiddleware];
export async function adminRoutes(app) {
    app.get("/api/v1/admin/metodos", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Lista métodos testáveis da API",
            security: [{ bearerAuth: [] }],
            response: {
                200: { type: "array", items: metodoApiResponseSchema },
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async () => metodosApi);
    app.get("/api/v1/admin/usuarios", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Lista logins cadastrados",
            security: [{ bearerAuth: [] }],
            response: {
                200: { type: "array", items: loginResponseSchema },
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async () => listarUsuarios());
    app.post("/api/v1/admin/usuarios", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Cria login",
            security: [{ bearerAuth: [] }],
            body: loginCreateRequestSchema,
            response: {
                201: loginResponseSchema,
                400: errorResponses.validation,
                405: errorResponses.methodNotAllowed,
                409: errorResponses.conflict,
                415: errorResponses.unsupportedMediaType,
                ...commonErrorResponses
            }
        }
    }, async (request, reply) => {
        const result = await criarUsuario(request.body);
        return reply.status(201).send(result);
    });
    app.get("/api/v1/admin/usuarios/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Consulta login por ID",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            response: {
                200: loginResponseSchema,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return buscarUsuario(id);
    });
    app.patch("/api/v1/admin/usuarios/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Altera dados de login",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            body: {
                type: "object",
                properties: {
                    usuario: { type: "string" },
                    senha: { type: "string" },
                    perfil: { type: "string", enum: ["ADMIN", "ATENDENTE", "USUARIO", "DEVELOPER"] },
                    ativo: { type: "boolean" }
                },
                additionalProperties: false
            },
            response: {
                200: loginResponseSchema,
                400: errorResponses.validation,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                409: errorResponses.conflict,
                415: errorResponses.unsupportedMediaType,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return atualizarUsuario(id, request.body);
    });
    app.delete("/api/v1/admin/usuarios/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Exclui login logicamente",
            description: "Desativa o login para preservar logs e relatórios vinculados ao usuário.",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            response: {
                200: loginResponseSchema,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                409: errorResponses.conflict,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return removerUsuario(id, request.user?.id);
    });
    app.get("/api/v1/admin/tarefas", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Lista tarefas de teste",
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    usuarioId: { type: "string" },
                    ativo: { type: "string", enum: ["true", "false"] }
                }
            },
            response: {
                200: { type: "array", items: tarefaResponseSchema },
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => listarTarefas(request.query));
    app.post("/api/v1/admin/tarefas", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Cria tarefa de teste para usuário",
            security: [{ bearerAuth: [] }],
            body: tarefaCreateRequestSchema,
            response: {
                201: tarefaResponseSchema,
                400: errorResponses.validation,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                415: errorResponses.unsupportedMediaType,
                422: errorResponses.unprocessable,
                ...commonErrorResponses
            }
        }
    }, async (request, reply) => {
        const tarefa = await criarTarefa(request.body, request.user?.id);
        return reply.status(201).send(tarefa);
    });
    app.get("/api/v1/admin/tarefas/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Consulta tarefa por ID",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            response: {
                200: tarefaResponseSchema,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return buscarTarefa(id);
    });
    app.patch("/api/v1/admin/tarefas/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Altera tarefa de teste",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            body: {
                type: "object",
                properties: {
                    titulo: { type: "string" },
                    usuarioId: { type: "string" },
                    ordemObrigatoria: { type: "boolean" },
                    ativo: { type: "boolean" }
                },
                additionalProperties: false
            },
            response: {
                200: tarefaResponseSchema,
                400: errorResponses.validation,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                415: errorResponses.unsupportedMediaType,
                422: errorResponses.unprocessable,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return atualizarTarefa(id, request.body);
    });
    app.put("/api/v1/admin/tarefas/:id/itens", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Substitui métodos da tarefa",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            body: {
                type: "object",
                properties: { itens: tarefaCreateRequestSchema.properties.itens },
                required: ["itens"],
                additionalProperties: false
            },
            response: {
                200: tarefaResponseSchema,
                400: errorResponses.validation,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                415: errorResponses.unsupportedMediaType,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return substituirItensTarefa(id, request.body);
    });
    app.delete("/api/v1/admin/tarefas/:id", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Remove tarefa logicamente",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            response: {
                200: tarefaResponseSchema,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return removerTarefa(id);
    });
    app.get("/api/v1/admin/tarefas/:id/relatorio", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Gera relatório da tarefa",
            security: [{ bearerAuth: [] }],
            params: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"]
            },
            response: {
                200: relatorioTarefaResponseSchema,
                404: errorResponses.notFound,
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => {
        const { id } = request.params;
        return gerarRelatorioTarefa(id);
    });
    app.get("/api/v1/admin/relatorios", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Lista relatórios de tarefas",
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    tarefaId: { type: "string" },
                    usuarioId: { type: "string" }
                }
            },
            response: {
                200: { type: "array", items: relatorioTarefaResponseSchema },
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => listarRelatorios(request.query));
    app.get("/api/v1/admin/relatorios/stream", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Stream interno para atualização em tempo real dos relatórios",
            security: [{ bearerAuth: [] }]
        }
    }, async (request, reply) => {
        reply.hijack();
        reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        });
        const send = (event, data) => {
            reply.raw.write(`event: ${event}\n`);
            reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        send("connected", { timestamp: new Date().toISOString() });
        const unsubscribe = subscribeReportEvents((event) => {
            send("report-updated", event);
        });
        const keepAlive = setInterval(() => {
            send("keep-alive", { timestamp: new Date().toISOString() });
        }, 25000);
        request.raw.on("close", () => {
            clearInterval(keepAlive);
            unsubscribe();
        });
    });
    app.get("/api/v1/admin/logs", {
        preHandler: adminPreHandlers,
        schema: {
            hide: true,
            tags: ["Admin"],
            summary: "Lista logs utilizados nos relatórios",
            security: [{ bearerAuth: [] }],
            querystring: {
                type: "object",
                properties: {
                    usuarioId: { type: "string" },
                    metodo: { type: "string" }
                }
            },
            response: {
                200: { type: "array", items: logAdminResponseSchema },
                405: errorResponses.methodNotAllowed,
                ...commonErrorResponses
            }
        }
    }, async (request) => listarLogs(request.query));
}
