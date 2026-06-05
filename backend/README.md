# Back-end Escuro

API responsável pelas regras de negócio, autenticação, contratos, planos, clientes, logs, banco SQLite e Swagger.

## Stack planejada

- Node.js;
- TypeScript;
- Fastify;
- Prisma;
- SQLite;
- Swagger/OpenAPI.

## Módulos

- `auth`: geração e validação de Bearer Token;
- `planos`: consulta dos planos seedados;
- `clientes`: dados básicos de cliente;
- `contratos`: criação, consulta, atualização e encerramento lógico;
- `logs`: registro simples de requisições.

## Próximo passo

## Execução local

```bash
npm install
npm run db:init
npm run seed
npm run dev
```

## Credenciais iniciais

```txt
usuario: atendente.escuro
senha: 123456
clientId: escuro-web
clientSecret: escuro-secret
```

## Basic Auth local para Swagger e testes

Além do Bearer Token, a API possui chaves Basic mockadas para simular cenários de homologação local:

```txt
Geração de token:
usuario: escuro-web
senha: escuro-secret
Authorization: Basic ZXNjdXJvLXdlYjplc2N1cm8tc2VjcmV0

Mock 403 Forbidden:
usuario: NPER
senha: mock
Authorization: Basic TlBFUjptb2Nr

Mock 429 Too Many Requests:
usuario: NQ
senha: mock
Authorization: Basic TlE6bW9jaw==
```

As chaves `NPER` e `NQ` são mocks locais para testes técnicos; elas não substituem o Bearer Token nas rotas protegidas do fluxo normal.

## Scripts úteis

- `npm run build`: compila TypeScript.
- `npm test`: roda os testes automatizados.
- `npm run db:init`: cria o SQLite local a partir da migration SQL.
- `npm run seed`: popula usuário e planos iniciais.

## Documentação Swagger

Com a API rodando, acesse:

```txt
http://localhost:3333/docs
```

No Swagger, use o botão de autorização com:

```txt
Bearer <accessToken>
```

O token é gerado em `POST /api/v1/auth/token`.
