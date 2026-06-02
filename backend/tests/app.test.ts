import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

process.env.DATABASE_URL = "file:./test.db";
process.env.JWT_SECRET = "escuro-test-secret";
process.env.CLIENT_ID = "escuro-web";
process.env.CLIENT_SECRET = "escuro-secret";

const dbPath = resolve(process.cwd(), "prisma", "test.db");

let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;
let prisma: typeof import("../src/shared/prisma.js").prisma;
let token: string;

const contratoPayload = {
  idCliente: "CLI-TESTE-001",
  nome: "João da Silva",
  tipoDocumento: "CPF",
  documento: "12345678909",
  msisdn: "11987654321",
  iccid: "89551234123412341234",
  idPlano: "PLANO-001"
};

async function seedBase() {
  const senhaHash = await bcrypt.hash("123456", 10);

  await prisma.usuario.create({
    data: {
      usuario: "atendente.escuro",
      senhaHash,
      perfil: "ATENDENTE",
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
        usuario: "atendente.escuro",
        senha: "123456",
        clientId: "escuro-web",
        clientSecret: "escuro-secret"
      }
    });

    expect(response.statusCode).toBe(200);
    token = response.json().accessToken;
    expect(token).toBeTruthy();
  });

  it("rejeita rota protegida sem token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/planos"
    });

    expect(response.statusCode).toBe(401);
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
