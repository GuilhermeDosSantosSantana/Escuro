import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "escuro-test-secret";
process.env.CLIENT_ID = "escuro-web";
process.env.CLIENT_SECRET = "escuro-secret";
const dbPath = resolve(process.cwd(), "prisma", "test.db");
let app;
let prisma;
let token;
let adminToken;
let usuarioCriadoId;
let tarefaCriadaId;
const contratoPayload = {
    idCliente: "CLI-TESTE-001",
    nome: "João da Silva",
    tipoDocumento: "CPF",
    documento: "12345678909",
    msisdn: "11987654321",
    iccid: "89551234123412341234",
    idPlano: "PLANO-001"
};
const basicAuth = (username, password = "") => `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
async function seedBase() {
    await prisma.usuario.create({
        data: {
            usuario: "guisantos",
            senhaHash: await bcrypt.hash("admin@123", 10),
            perfil: "ADMIN",
            ativo: true
        }
    });
    await prisma.usuario.create({
        data: {
            usuario: "usuario",
            senhaHash: await bcrypt.hash("user@123", 10),
            perfil: "ATENDENTE",
            ativo: true
        }
    });
    await prisma.usuario.create({
        data: {
            usuario: "victorDev",
            senhaHash: await bcrypt.hash("dev@123", 10),
            perfil: "DEVELOPER",
            ativo: true
        }
    });
    const planos = [
        { id: "PLANO-001", nome: "Controle 10GB", tipoPlano: "Controle", franquiaInternet: "10GB", valor: 39.9, ativo: true },
        { id: "PLANO-002", nome: "Controle 20GB", tipoPlano: "Controle", franquiaInternet: "20GB", valor: 59.9, ativo: true },
        { id: "PLANO-003", nome: "Controle 30GB", tipoPlano: "Controle", franquiaInternet: "30GB", valor: 79.9, ativo: true },
        { id: "PLANO-004", nome: "Pré-pago Básico", tipoPlano: "Pré-pago", franquiaInternet: "5GB", valor: 19.9, ativo: true },
        { id: "PLANO-005", nome: "Pré-pago Turbo", tipoPlano: "Pré-pago", franquiaInternet: "15GB", valor: 29.9, ativo: true },
        { id: "PLANO-006", nome: "Pós 50GB", tipoPlano: "Pós-pago", franquiaInternet: "50GB", valor: 99.9, ativo: true },
        { id: "PLANO-007", nome: "Pós 100GB", tipoPlano: "Pós-pago", franquiaInternet: "100GB", valor: 149.9, ativo: true },
        { id: "PLANO-008", nome: "Família 80GB", tipoPlano: "Família", franquiaInternet: "80GB", valor: 129.9, ativo: true },
        { id: "PLANO-009", nome: "Família 150GB", tipoPlano: "Família", franquiaInternet: "150GB", valor: 199.9, ativo: true },
        { id: "PLANO-010", nome: "Empresarial 200GB", tipoPlano: "Empresarial", franquiaInternet: "200GB", valor: 249.9, ativo: true }
    ];
    for (const plano of planos) {
        await prisma.plano.create({ data: plano });
    }
}
beforeAll(async () => {
    if (existsSync(dbPath)) {
        rmSync(dbPath);
    }
    await (await import("../src/shared/init-database.js")).initializeDatabase("file:./test.db");
    prisma = (await import("../src/shared/prisma.js")).prisma;
    await seedBase();
    app = await (await import("../src/app.js")).buildApp();
});
afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    if (existsSync(dbPath)) {
        rmSync(dbPath);
    }
});
describe("Escuro API", () => {
    it("responde health check", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/health"
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({ status: "ok" });
    });
    it("gera token com credenciais válidas", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/auth/token",
            payload: {
                usuario: "usuario",
                senha: "user@123",
                clientId: "escuro-web",
                clientSecret: "escuro-secret"
            }
        });
        expect(response.statusCode).toBe(200);
        token = response.json().accessToken;
        expect(token).toBeTruthy();
    });
    it("gera token usando Basic Auth para clientId e clientSecret", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/auth/token",
            headers: { authorization: basicAuth("escuro-web", "escuro-secret") },
            payload: {
                usuario: "usuario",
                senha: "user@123"
            }
        });
        expect(response.statusCode).toBe(200);
        expect(response.json().accessToken).toBeTruthy();
    });
    it("gera token de administrador", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/auth/token",
            payload: {
                usuario: "guisantos",
                senha: "admin@123",
                clientId: "escuro-web",
                clientSecret: "escuro-secret"
            }
        });
        expect(response.statusCode).toBe(200);
        expect(response.json().perfil).toBe("ADMIN");
        adminToken = response.json().accessToken;
    });
    it("bloqueia relatório para usuário não administrador", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/admin/metodos",
            headers: { authorization: `Bearer ${token}` }
        });
        expect(response.statusCode).toBe(403);
    });
    it("admin cria login para usuário", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/admin/usuarios",
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                usuario: "tester.escuro",
                senha: "123456",
                perfil: "USUARIO"
            }
        });
        expect(response.statusCode).toBe(201);
        expect(response.json().usuario).toBe("tester.escuro");
        usuarioCriadoId = response.json().id;
    });
    it("admin cria tarefa com ordem e relatório marca acerto", async () => {
        const tarefa = await app.inject({
            method: "POST",
            url: "/api/v1/admin/tarefas",
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                titulo: "Validar consulta de planos",
                usuarioId: usuarioCriadoId,
                ordemObrigatoria: true,
                itens: [{ codigoMetodo: "PLANOS_LIST_GET", statusEsperado: 200 }]
            }
        });
        expect(tarefa.statusCode).toBe(201);
        tarefaCriadaId = tarefa.json().id;
        const tokenUsuario = await app.inject({
            method: "POST",
            url: "/api/v1/auth/token",
            payload: {
                usuario: "tester.escuro",
                senha: "123456",
                clientId: "escuro-web",
                clientSecret: "escuro-secret"
            }
        });
        expect(tokenUsuario.statusCode).toBe(200);
        const chamada = await app.inject({
            method: "GET",
            url: "/api/v1/planos",
            headers: { authorization: `Bearer ${tokenUsuario.json().accessToken}` }
        });
        expect(chamada.statusCode).toBe(200);
        const relatorio = await app.inject({
            method: "GET",
            url: `/api/v1/admin/tarefas/${tarefaCriadaId}/relatorio`,
            headers: { authorization: `Bearer ${adminToken}` }
        });
        expect(relatorio.statusCode).toBe(200);
        expect(relatorio.json().resultados[0].status).toBe("acertou");
    });
    it("rejeita rota protegida sem token", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/planos"
        });
        expect(response.statusCode).toBe(401);
        expect(response.json().error).toBe("UnauthorizedError");
    });
    it("retorna 403 com mock Basic NPER", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/planos",
            headers: { authorization: basicAuth("NPER", "mock") }
        });
        expect(response.statusCode).toBe(403);
        expect(response.json().error).toBe("ForbiddenError");
    });
    it("retorna 429 com mock Basic NQ", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/planos",
            headers: { authorization: basicAuth("NQ", "mock") }
        });
        expect(response.statusCode).toBe(429);
        expect(response.json().error).toBe("TooManyRequestsError");
    });
    it("retorna 405 quando a rota existe mas o método é inválido", async () => {
        const response = await app.inject({
            method: "DELETE",
            url: "/api/v1/planos",
            headers: { authorization: `Bearer ${token}` }
        });
        expect(response.statusCode).toBe(405);
        expect(response.json().error).toBe("MethodNotAllowedError");
    });
    it("retorna 406 para Accept incompatível", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/planos",
            headers: {
                authorization: `Bearer ${token}`,
                accept: "text/plain"
            }
        });
        expect(response.statusCode).toBe(406);
        expect(response.json().error).toBe("NotAcceptableError");
    });
    it("retorna 415 para Content-Type incompatível", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: {
                authorization: `Bearer ${token}`,
                "content-type": "text/plain"
            },
            payload: "conteudo invalido"
        });
        expect(response.statusCode).toBe(415);
        expect(response.json().error).toBe("UnsupportedMediaTypeError");
    });
    it("lista planos seedados", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/api/v1/planos",
            headers: { authorization: `Bearer ${token}` }
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveLength(10);
    });
    it("consulta plano existente e retorna 404 para inexistente", async () => {
        const existente = await app.inject({
            method: "GET",
            url: "/api/v1/planos/PLANO-001",
            headers: { authorization: `Bearer ${token}` }
        });
        const inexistente = await app.inject({
            method: "GET",
            url: "/api/v1/planos/PLANO-999",
            headers: { authorization: `Bearer ${token}` }
        });
        expect(existente.statusCode).toBe(200);
        expect(existente.json().id).toBe("PLANO-001");
        expect(inexistente.statusCode).toBe(404);
    });
    it("cria contrato válido", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: contratoPayload
        });
        expect(response.statusCode).toBe(201);
        expect(response.json().idContrato).toMatch(/^CON-\d{8}-\d{6}$/);
        expect(response.json().status).toBe("ATIVO");
    });
    it("retorna 400 quando falta campo obrigatório do contrato", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-400",
                documento: "12345678913",
                msisdn: "11987654324",
                iccid: "89551234123412341237",
                nome: ""
            }
        });
        expect(response.statusCode).toBe(400);
        expect(response.json().error).toBe("ValidationError");
    });
    it("retorna 400 para documento inválido", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-DOC",
                documento: "123",
                msisdn: "11987654325",
                iccid: "89551234123412341238"
            }
        });
        expect(response.statusCode).toBe(400);
        expect(response.json().error).toBe("ValidationError");
    });
    it("retorna 422 para regra de negócio inválida", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-422",
                documento: "12345678914",
                msisdn: "11987654326",
                iccid: "89551234123412341239",
                dataInclusao: "2026-06-05T10:00:00.000Z",
                dataEncerramento: "2026-06-04T10:00:00.000Z"
            }
        });
        expect(response.statusCode).toBe(422);
        expect(response.json().error).toBe("UnprocessableEntityError");
    });
    it("bloqueia MSISDN duplicado em contrato ativo", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-002",
                documento: "12345678910",
                iccid: "89551234123412341235"
            }
        });
        expect(response.statusCode).toBe(409);
    });
    it("bloqueia ICCID duplicado em contrato ativo", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-003",
                documento: "12345678911",
                msisdn: "11987654322"
            }
        });
        expect(response.statusCode).toBe(409);
    });
    it("encerra contrato com DELETE lógico", async () => {
        const create = await app.inject({
            method: "POST",
            url: "/api/v1/contratos",
            headers: { authorization: `Bearer ${token}` },
            payload: {
                ...contratoPayload,
                idCliente: "CLI-TESTE-004",
                documento: "12345678912",
                msisdn: "11987654323",
                iccid: "89551234123412341236"
            }
        });
        const idContrato = create.json().idContrato;
        const encerramento = await app.inject({
            method: "DELETE",
            url: `/api/v1/contratos/${idContrato}`,
            headers: { authorization: `Bearer ${token}` }
        });
        const detalhe = await app.inject({
            method: "GET",
            url: `/api/v1/contratos/${idContrato}`,
            headers: { authorization: `Bearer ${token}` }
        });
        expect(encerramento.statusCode).toBe(204);
        expect(detalhe.json().status).toBe("ENCERRADO");
        expect(detalhe.json().dataEncerramento).toBeTruthy();
    });
});
