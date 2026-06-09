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
- `logs`: registro simples de requisições;
- `admin`: gerenciamento de logins, tarefas e relatórios.

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
usuario admin: guisantos
usuario atendente: usuario
senha admin: admin@123
senha atendente: user@123
desenvolvedor: victorDev / dev@123
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


## Administração de logins e relatórios

As rotas abaixo exigem Bearer Token com perfil `ADMIN`:

- `GET /api/v1/admin/metodos`: retorna os métodos testáveis da API para montar uma tarefa.
- `GET /api/v1/admin/usuarios`: lista logins.
- `POST /api/v1/admin/usuarios`: cria login com `usuario`, `senha`, `perfil` e status.
- `PATCH /api/v1/admin/usuarios/:id`: altera nome, senha, perfil ou status do login.
- `DELETE /api/v1/admin/usuarios/:id`: exclui logicamente o login, mantendo logs e relatórios.
- `POST /api/v1/admin/tarefas`: cria uma tarefa para um usuário com métodos, status esperado e ordem obrigatória ou livre.
- `GET /api/v1/admin/relatorios`: gera relatórios comparando logs do usuário com os métodos/status esperados pelo administrador.

Exemplo de criação de tarefa:

```json
{
  "titulo": "Fluxo de consulta de contratos",
  "usuarioId": "ID_DO_USUARIO",
  "ordemObrigatoria": true,
  "itens": [
    { "codigoMetodo": "PLANOS_LIST_GET", "statusEsperado": 200 },
    { "codigoMetodo": "CONTRATOS_LIST_GET", "statusEsperado": 200 }
  ]
}
```

O relatório marca cada item como `acertou`, `errou` ou `pendente` com base no log de requisição do usuário, no método executado, na ordem configurada e no `statusCode` esperado pelo administrador.

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

O token é gerado em `POST /api/v1/auth/token`. As rotas internas de administração não são exibidas no Swagger.
