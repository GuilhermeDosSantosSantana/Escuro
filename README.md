# Escuro Telecom

Projeto de API REST e front-end interno fictício para simular a inclusão, consulta, atualização e encerramento de planos de celular.

## Objetivo

Construir uma solução simples de executar, bem documentada e organizada para demonstrar:

- API REST com Node.js, TypeScript, Fastify, Prisma e SQLite;
- autenticação com Bearer Token;
- documentação Swagger em `/docs`;
- testes manuais com Postman;
- front-end operacional para rotina de atendente.

## Estrutura inicial

```txt
backend/   API, regras de negócio, banco, Swagger e autenticação
frontend/  Interface interna do atendente
postman/   Collections e environments de teste
docs/      Regras, fases, referências visuais e decisões do projeto
scripts/   Arquivos auxiliares para rodar o projeto localmente
```

## Materiais de referência

- Regra de negócio: `docs/regras/REGRA_DE_NEGOCIO_API_TELECOM_ESCURO_V3.md`
- Referência visual: `docs/assets/referencias/front-referencia.png`
- Logo: `docs/assets/referencias/logo-escuro.png`
- Script original recebido: `scripts/iniciar_servidor_original.bat`
- Script local organizado: `scripts/iniciar_servidor.bat`
- Swagger local: `http://localhost:3333/docs`
- Postman collection: `postman/Escuro_API.postman_collection.json`
- Postman environment: `postman/Escuro_Local.postman_environment.json`

## Fases do projeto

O planejamento completo está em `docs/01-fases-do-projeto.md`.

Resumo:

1. Fase 1: organização, documentação e estrutura de pastas.
2. Fase 2: back-end base, Prisma, SQLite e seed de planos.
3. Fase 3: autenticação, validações e regras de contrato.
4. Fase 4: Swagger completo e tratamento de erros. Concluída.
5. Fase 5: Postman com cenários positivos e negativos. Concluída.
6. Fase 6: front-end do atendente. Concluída.
7. Fase 7: integração, ajustes finais e apresentação.

## Execução esperada no futuro

```bash
cd backend
npm install
npm run db:init
npm run seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Acessos planejados:

```txt
API:      http://localhost:3333
Swagger:  http://localhost:3333/docs
Frontend: http://localhost:3000
```

Credenciais de uso local:

```txt
Usuário: atendente.escuro
Senha: 123456
```

Chaves Basic mockadas para Swagger/testes locais:

```txt
Token Basic: escuro-web / escuro-secret
Header: Basic ZXNjdXJvLXdlYjplc2N1cm8tc2VjcmV0

NPER 403: NPER / mock
Header: Basic TlBFUjptb2Nr

NQ 429: NQ / mock
Header: Basic TlE6bW9jaw==
```

Se a porta `3333` estiver bloqueada no Windows, use temporariamente outra porta:

```powershell
$env:PORT="3334"; npm run dev
```
