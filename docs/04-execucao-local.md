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
