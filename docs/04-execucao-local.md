# Execução Local

## Domínios e portas planejadas

```txt
API:      http://localhost:3333
Swagger:  http://localhost:3333/docs
Frontend: http://localhost:3000
```

Opcionalmente, o script local também prevê:

```txt
API:      http://www.stigmaescuro.online:3333
Swagger:  http://www.stigmaescuro.online:3333/docs
Frontend: http://www.stigmaescuro.online:3000
```

Para usar o domínio local, será necessário adicionar no `hosts`:

```txt
127.0.0.1 www.stigmaescuro.online
```

## Back-end

```bash
cd backend
npm install
npm run db:init
npm run seed
npm run dev
```

## Chaves Basic para testes locais

Use estas chaves no Swagger ou Postman quando precisar simular respostas específicas:

```txt
Geração de token via Basic:
escuro-web:local-client-secret-example
Authorization: Basic <base64-local-client-credentials>

Mock de Forbidden 403:
NPER:mock
Authorization: Basic <base64-nper-mock>

Mock de Too Many Requests 429:
NQ:mock
Authorization: Basic <base64-nq-mock>
```

No fluxo principal das rotas protegidas, gere o token em `POST /api/v1/auth/token` e use `Authorization: Bearer <accessToken>`.

## Front-end

```bash
cd frontend
npm install
npm run dev
```

## Script auxiliar

Depois que `backend/package.json` e `frontend/package.json` existirem, será possível rodar:

```bat
scripts\iniciar_servidor.bat
```

O arquivo `scripts/iniciar_servidor_original.bat` foi preservado como material recebido.
