# Fases do Projeto

## Fase 1 - Preparação e organização

Objetivo: deixar o projeto pronto para começar sem confusão.

Entregas:

- Criar a estrutura de pastas;
- guardar regra de negócio, logo, referência visual e scripts;
- definir o roteiro de execução;
- separar responsabilidades entre back-end, front-end, Postman e documentação;
- criar README principal.

Status: concluída.

## Fase 2 - Base do back-end

Objetivo: criar a API mínima rodando localmente.

Entregas:

- Configurar Node.js, TypeScript e Fastify;
- configurar Prisma;
- configurar SQLite;
- criar rota `GET /api/v1/health`;
- criar estrutura de módulos;
- criar seed inicial dos planos.

Critério de pronto:

- API inicia em `http://localhost:3333`;
- health check responde;
- banco SQLite é criado;
- planos seedados existem no banco.

Status: concluída.

## Fase 3 - Regras principais da API

Objetivo: implementar a lógica de negócio dos contratos.

Entregas:

- Autenticação com Bearer Token;
- cadastro de contrato;
- listagem e consulta de contratos;
- consulta de planos;
- PATCH, PUT e DELETE lógico;
- validação de MSISDN, ICCID, CPF/CNPJ, status e datas;
- bloqueio de MSISDN e ICCID duplicados em contratos ativos.

Critério de pronto:

- Contrato válido é criado;
- erros retornam mensagens padronizadas;
- contrato encerrado recebe `dataEncerramento`;
- rotas protegidas exigem token.

Status: concluída.

## Fase 4 - Swagger e documentação técnica

Objetivo: fazer o Swagger ser a principal fonte de análise da API.

Entregas:

- Swagger em `/docs`;
- schemas de request e response;
- exemplos de sucesso e erro;
- documentação do Bearer Token;
- status codes documentados;
- modelos de Cliente, Plano, Contrato, Usuário e Log.

Critério de pronto:

- Uma pessoa consegue entender e testar a API olhando apenas o Swagger.

Status: concluída.

## Fase 5 - Postman

Objetivo: criar os testes manuais para demonstrar a API.

Entregas:

- Collection `Escuro_API.postman_collection.json`;
- environment `Escuro_Local.postman_environment.json`;
- testes de autenticação;
- testes de planos;
- testes de contratos;
- cenários de erro, incluindo token inválido, plano inexistente, duplicidade e rate limit.

Critério de pronto:

- Collection roda com `baseUrl`, `accessToken`, `idPlano`, `idContrato`, `msisdn` e `iccid`.

Status: concluída.

## Fase 6 - Front-end do atendente

Objetivo: criar uma interface operacional bonita e simples.

Entregas:

- Login;
- dashboard;
- tela de novo contrato;
- lista de contratos;
- detalhes do contrato;
- tela de planos;
- layout escuro com vermelho como cor principal;
- uso da logo e referência visual.

Critério de pronto:

- O atendente consegue entrar, consultar planos, criar contrato e visualizar detalhes;
- o front-end não exibe payloads técnicos, cURL ou códigos HTTP como foco.

Status: concluída.

## Fase 7 - Integração e acabamento

Objetivo: deixar o projeto apresentável.

Entregas:

- Revisar README;
- testar execução via script local;
- validar Swagger;
- validar Postman;
- ajustar mensagens amigáveis do front-end;
- revisar identidade visual;
- limpar arquivos temporários.

Critério de pronto:

- Projeto roda localmente com poucos comandos;
- API, Swagger, Postman e front-end estão coerentes entre si;
- apresentação do projeto fica clara e profissional.
