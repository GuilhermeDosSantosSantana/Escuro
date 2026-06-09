# Visão Geral do Projeto Escuro

## Nome

Escuro Telecom

## Propósito

Criar uma aplicação fictícia de telecomunicações para processo seletivo, com foco principal em API REST documentada via Swagger.

## Partes do projeto

- Back-end/API: regras de negócio, contratos, planos, clientes, autenticação e logs.
- Swagger: documentação principal para entender e consumir a API.
- Postman: testes manuais da API com cenários positivos e negativos.
- Front-end: painel interno simples para simular a rotina de um atendente.

## Fora do escopo inicial

- Pagamento real;
- dados de cartão;
- OAuth real;
- microsserviços;
- filas;
- deploy obrigatório em nuvem;
- front-end como ferramenta técnica de teste de API.

## Decisões iniciais

- Back-end: Node.js, TypeScript e Fastify.
- ORM: Prisma.
- Banco: SQLite.
- Documentação: Swagger/OpenAPI.
- Front-end: React ou Next.js.
- Testes manuais: Postman.

## Rotas principais planejadas

```txt
POST   /api/v1/auth/token
POST   /api/v1/auth/validate
GET    /api/v1/health
GET    /api/v1/planos
GET    /api/v1/planos/:idPlano
POST   /api/v1/contratos
GET    /api/v1/contratos
GET    /api/v1/contratos/:idContrato
PATCH  /api/v1/contratos/:idContrato
PUT    /api/v1/contratos/:idContrato
DELETE /api/v1/contratos/:idContrato
GET    /docs
```
