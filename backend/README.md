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
