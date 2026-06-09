# Regras de Negócio — API Telecom Escuro

## 1. Objetivo do Projeto

Este projeto tem como objetivo criar uma API de telecomunicações para simular a **inclusão, consulta, atualização e encerramento de planos de celular**.

A API será utilizada em um **processo seletivo**, portanto o foco principal é entregar uma solução:

- Fácil de executar;
- Funcional;
- Bem documentada;
- Com regras de negócio claras;
- Com banco de dados relacional;
- Com autenticação via Bearer Token;
- Com documentação Swagger;
- Com testes de API feitos pelo Postman;
- Com um front-end simples simulando a rotina de um atendente.

O projeto não tem como objetivo ser uma aplicação de produção real, mas deve parecer bem estruturado, organizado e profissional.

---

## 2. Missão Principal do Projeto

A missão principal do projeto será demonstrar conhecimento em **análise, documentação e consumo de API REST**.

O principal ponto de avaliação será a API documentada no Swagger.

O Swagger será usado para:

- Entender os endpoints;
- Analisar os campos obrigatórios e opcionais;
- Visualizar exemplos de request e response;
- Entender os status codes;
- Consultar regras de autenticação;
- Apoiar a criação dos cenários de teste no Postman.

O front-end será apenas uma simulação de sistema interno usado por um atendente.

O front-end não terá telas de teste de API, payload de exemplo, códigos de resposta ou console técnico.

---

## 3. Nome Fictício do Sistema

O sistema será chamado de:

```txt
Escuro
```

A identidade visual será inspirada no universo de telecomunicações, usando tema escuro, vermelho como cor principal e uma logo fictícia.

> Observação: a marca, logo e identidade visual devem ser originais. A aplicação pode lembrar visualmente uma operadora de telefonia, mas não deve copiar nome, logo ou elementos oficiais de marcas reais.

---

## 4. Escopo Geral

O sistema terá quatro partes principais:

1. **Back-end/API**
   - Responsável pelas regras de negócio;
   - Cadastro e gerenciamento dos contratos;
   - Autenticação via Bearer Token;
   - Persistência no banco de dados;
   - Documentação Swagger.

2. **Swagger**
   - Principal fonte de documentação da API;
   - Usado para leitura e análise dos endpoints;
   - Deve deixar claro como consumir a API.

3. **Postman**
   - Usado para executar os testes da API;
   - Terá collection com cenários positivos e negativos;
   - Usará o Bearer Token para autenticação das chamadas.

4. **Front-end**
   - Simulará uma aplicação interna usada por um atendente;
   - Será usado para cadastrar e consultar informações;
   - Não será usado como ferramenta de teste da API;
   - Não deve exibir payloads técnicos, códigos HTTP ou exemplos de cURL.

---

## 5. Fora do Escopo

Não fazem parte do projeto inicial:

- Integração real com operadora;
- Integração real com pagamento;
- Dados de cartão;
- Gateway de pagamento;
- Envio real de SMS;
- Autenticação avançada com OAuth real;
- Microsserviços;
- Filas de mensageria;
- Deploy obrigatório em nuvem;
- Testes automatizados complexos;
- Front-end como ferramenta de teste de API;
- Tela de payload no front-end;
- Tela de códigos de resposta no front-end;
- Console técnico no front-end.

---

## 6. Dados Removidos do Escopo

A API não deve receber, salvar ou processar dados de cartão.

Os seguintes campos ficam removidos:

```txt
codigoSegurancaCartao
cvv
cvc
numeroCartao
validadeCartao
senhaCartao
```

A API trabalhará apenas com dados do cliente, linha, chip, plano e contrato.

---

## 7. Stack Recomendada

Para facilitar a execução local, a stack recomendada será:

```txt
Node.js
TypeScript
Fastify ou Express
SQLite
Prisma ORM
Swagger/OpenAPI
Postman
React ou Next.js para o front-end
```

### Escolha sugerida para o processo seletivo

```txt
Back-end: Node.js + TypeScript + Fastify
ORM: Prisma
Banco: SQLite
Documentação: Swagger/OpenAPI
Testes manuais de API: Postman
Front-end: React ou Next.js
```

### Motivo da escolha

- **Node.js**: simples de executar e comum em APIs modernas;
- **TypeScript**: melhora organização e reduz erros;
- **Fastify**: rápido, leve e bom para APIs;
- **SQLite**: não exige instalação de servidor de banco;
- **Prisma**: facilita modelagem, migrations e acesso ao banco;
- **Swagger**: permite leitura e entendimento dos endpoints;
- **Postman**: permite testar a API de forma profissional;
- **React/Next.js**: permite criar uma interface bonita e simples para simular o atendimento.

---

## 8. Banco de Dados

O banco principal será:

```txt
SQLite
```

O SQLite foi escolhido porque o projeto precisa ser fácil de executar localmente.

Comandos esperados:

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Opcionalmente, no futuro, o projeto poderá ser adaptado para:

```txt
Supabase/PostgreSQL
```

---

## 9. Entidades Principais

O sistema terá as seguintes entidades:

```txt
Cliente
Plano
Contrato
Usuário
Log de Requisição
```

A entidade mais importante será:

```txt
Contrato
```

O contrato representa a inclusão de um plano de celular para um cliente.

---

## 10. Rotas Principais da API

### Contratos

```http
POST   /api/v1/contratos
GET    /api/v1/contratos
GET    /api/v1/contratos/:idContrato
PATCH  /api/v1/contratos/:idContrato
PUT    /api/v1/contratos/:idContrato
DELETE /api/v1/contratos/:idContrato
```

### Planos

```http
GET    /api/v1/planos
GET    /api/v1/planos/:idPlano
```

### Autenticação

```http
POST   /api/v1/auth/token
POST   /api/v1/auth/validate
```

### Health Check

```http
GET    /api/v1/health
```

### Swagger

```http
GET    /docs
```

---

## 11. Planos Seedados para a Aba Planos

A aplicação terá uma massa inicial de planos cadastrados no banco para facilitar o uso do front-end, do Swagger e do Postman.

Esses planos serão criados no seed do banco.

| ID do Plano | Nome do Plano | Tipo | Franquia | Valor Mensal | Status |
|---|---|---|---|---:|---|
| `PLANO-001` | Controle 10GB | Controle | 10GB | 39.90 | Ativo |
| `PLANO-002` | Controle 20GB | Controle | 20GB | 59.90 | Ativo |
| `PLANO-003` | Controle 30GB | Controle | 30GB | 79.90 | Ativo |
| `PLANO-004` | Pré-pago Básico | Pré-pago | 5GB | 19.90 | Ativo |
| `PLANO-005` | Pré-pago Turbo | Pré-pago | 15GB | 29.90 | Ativo |
| `PLANO-006` | Pós 50GB | Pós-pago | 50GB | 99.90 | Ativo |
| `PLANO-007` | Pós 100GB | Pós-pago | 100GB | 149.90 | Ativo |
| `PLANO-008` | Família 80GB | Família | 80GB | 129.90 | Ativo |
| `PLANO-009` | Família 150GB | Família | 150GB | 199.90 | Ativo |
| `PLANO-010` | Empresarial 200GB | Empresarial | 200GB | 249.90 | Ativo |

### Regra dos Planos

- Apenas planos com status `ativo = true` podem ser usados na criação de contratos.
- Se o `idPlano` informado não existir, retornar `404 Not Found`.
- Se o `idPlano` existir, mas estiver inativo, retornar `422 Unprocessable Entity`.
- O front-end deve permitir que o atendente consulte a lista de planos disponíveis.
- O Swagger deve documentar claramente os campos retornados pela rota de planos.
- O Postman deve conter cenários de consulta de plano válido e plano inexistente.

---

## 12. Campos Obrigatórios para Criar Contrato

Para criar um contrato, os campos obrigatórios serão:

| Campo | Descrição | Obrigatório |
|---|---|---|
| `idCliente` | Identificador do cliente | Sim |
| `msisdn` | Número da linha telefônica | Sim |
| `iccid` | Identificação do chip/SIM Card | Sim |
| `nome` | Nome do cliente ou razão social | Sim |
| `idPlano` | Identificador do plano contratado | Sim |
| `documento` | CPF ou CNPJ do cliente | Sim |
| `tipoDocumento` | Tipo do documento, CPF ou CNPJ | Sim |

### Exemplo de payload

```json
{
  "idCliente": "CLI-001",
  "msisdn": "11999999999",
  "iccid": "89550000000000000001",
  "nome": "Guilherme dos Santos Santana",
  "idPlano": "PLANO-001",
  "documento": "12345678900",
  "tipoDocumento": "CPF"
}
```

---

## 13. Campos Opcionais

| Campo | Descrição | Regra |
|---|---|---|
| `idContrato` | Identificador do contrato | Se não enviado, será gerado automaticamente |
| `dataInclusao` | Data de inclusão do plano | Se não enviada, usar data atual |
| `dataEncerramento` | Data de encerramento do contrato | Opcional |
| `status` | Status do contrato | Se não enviado, iniciar como `ATIVO` |

---

## 14. Regras de Data

- Se `dataInclusao` não for enviada, a API deve preencher automaticamente com a data atual.
- Se `dataEncerramento` for enviada, a `dataInclusao` deve existir.
- `dataEncerramento` não pode ser menor que `dataInclusao`.
- Ao executar DELETE, a API deve preencher `dataEncerramento` automaticamente com a data atual.
- Contrato encerrado não pode voltar para `ATIVO` sem uma nova requisição específica de reativação, que ficará fora do escopo inicial.

---

## 15. Status do Contrato

O contrato poderá ter os seguintes status:

| Status | Descrição |
|---|---|
| `ATIVO` | Contrato criado e plano ativo |
| `SUSPENSO` | Contrato temporariamente suspenso |
| `ENCERRADO` | Contrato encerrado |
| `CANCELADO` | Contrato cancelado |

### Status padrão

Todo contrato criado com sucesso deve iniciar como:

```txt
ATIVO
```

---

## 16. Regras de Unicidade

### MSISDN

O campo `msisdn` não pode estar vinculado a mais de um contrato ativo.

Se já existir contrato ativo com o mesmo MSISDN, retornar:

```http
409 Conflict
```

### ICCID

O campo `iccid` não pode estar vinculado a mais de um contrato ativo.

Se já existir contrato ativo com o mesmo ICCID, retornar:

```http
409 Conflict
```

### ID do Contrato

O campo `idContrato` deve ser único.

Se o usuário não enviar esse campo, a API deve gerar automaticamente.

Exemplo:

```txt
CON-20260601-000001
```

---

## 17. Validações de Entrada

A API deve validar:

- Campos obrigatórios;
- Formato do MSISDN;
- Formato do ICCID;
- Tipo de documento aceitando apenas `CPF` ou `CNPJ`;
- Formato básico de CPF/CNPJ;
- Existência do plano informado;
- Se o plano está ativo;
- Datas válidas;
- Status permitido;
- Duplicidade de MSISDN em contrato ativo;
- Duplicidade de ICCID em contrato ativo;
- Duplicidade de `idContrato`.

---

## 18. Métodos HTTP

### POST

Cria um novo contrato.

```http
POST /api/v1/contratos
```

Resposta esperada:

```http
201 Created
```

---

### GET

Consulta contratos.

```http
GET /api/v1/contratos
GET /api/v1/contratos/:idContrato
```

Resposta esperada:

```http
200 OK
```

---

### PATCH

Atualiza parcialmente um contrato.

```http
PATCH /api/v1/contratos/:idContrato
```

Exemplo:

```json
{
  "status": "SUSPENSO"
}
```

Resposta esperada:

```http
200 OK
```

---

### PUT

Substitui os dados principais de um contrato.

```http
PUT /api/v1/contratos/:idContrato
```

O método PUT deve exigir o envio dos campos principais do contrato.

Resposta esperada:

```http
200 OK
```

---

### DELETE

Encerra um contrato de forma lógica.

```http
DELETE /api/v1/contratos/:idContrato
```

A API não deve apagar o registro fisicamente do banco.

O DELETE deve realizar:

```txt
status = ENCERRADO
dataEncerramento = data atual
```

Resposta esperada:

```http
204 No Content
```

---

## 19. Códigos de Retorno

### Sucesso

| Código | Uso |
|---|---|
| `200 OK` | Consulta ou atualização realizada com sucesso |
| `201 Created` | Contrato criado com sucesso |
| `203 Non-Authoritative Information` | Opcional, pouco usado neste projeto |
| `204 No Content` | Operação concluída sem corpo de resposta |

---

### Erros do Cliente

| Código | Uso |
|---|---|
| `400 Bad Request` | Requisição malformada ou JSON inválido |
| `401 Unauthorized` | Usuário não autenticado ou token ausente |
| `403 Forbidden` | Usuário autenticado, mas sem permissão |
| `404 Not Found` | Contrato, cliente ou plano não encontrado |
| `405 Method Not Allowed` | Método HTTP não permitido |
| `406 Not Acceptable` | Formato de resposta não aceito |
| `409 Conflict` | Conflito de dados, como MSISDN ou ICCID duplicado |
| `412 Precondition Failed` | Pré-condição da requisição falhou |
| `415 Unsupported Media Type` | Content-Type inválido |
| `422 Unprocessable Entity` | Dados com formato correto, mas inválidos para a regra de negócio |
| `429 Too Many Requests` | Muitas requisições em curto período de tempo |

---

### Erros do Servidor

| Código | Uso |
|---|---|
| `500 Internal Server Error` | Erro inesperado |
| `501 Not Implemented` | Funcionalidade ainda não implementada |
| `503 Service Unavailable` | Serviço temporariamente indisponível |
| `504 Gateway Timeout` | Timeout em serviço externo ou dependência |

---

## 20. Regra para 429 — Too Many Requests

A API deve possuir limite simples de requisições para demonstrar boas práticas.

Sugestão:

```txt
100 requisições por IP a cada 15 minutos
```

Se o limite for excedido, retornar:

```http
429 Too Many Requests
```

Exemplo de resposta:

```json
{
  "statusCode": 429,
  "message": "Muitas requisições realizadas. Tente novamente mais tarde.",
  "error": "Too Many Requests"
}
```

---

## 21. Autenticação com Bearer Token

A API terá autenticação simples usando Bearer Token.

### Endpoint para gerar token

```http
POST /api/v1/auth/token
```

### Exemplo de requisição

```json
{
  "usuario": "usuario",
  "senha": "user@123",
  "clientId": "escuro-web",
  "clientSecret": "escuro-secret"
}
```

### Exemplo de resposta

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Como usar nas requisições

Todas as rotas protegidas devem receber o header:

```http
Authorization: Bearer <accessToken>
```

### Regras do Token

- Token deve ter tempo de expiração;
- Token inválido deve retornar `401`;
- Token ausente deve retornar `401`;
- Token válido, mas sem permissão, deve retornar `403`;
- O Postman deve conseguir gerar e usar o token;
- O Swagger deve documentar o uso do Bearer Token;
- O front-end usará autenticação apenas como parte do fluxo de login, sem exibir ferramentas técnicas de API.

---

## 22. Front-end

O front-end será uma aplicação simples simulando uma ferramenta interna usada por um atendente.

O objetivo do front-end é demonstrar como um operador usaria o sistema em uma rotina real.

O front-end **não será usado como ferramenta de teste de API**.

Os testes de API serão feitos no Postman.

A documentação e análise da API serão feitas no Swagger.

### Nome da aplicação

```txt
Escuro
```

### Estilo visual

- Tema escuro;
- Cor principal vermelha;
- Visual moderno;
- Interface simples;
- Aparência de sistema interno de operadora;
- Logo fictícia e original;
- Layout parecido com painel administrativo;
- Não copiar identidade visual oficial de nenhuma empresa real.

---

## 23. Menu do Front-end

O front-end deve conter apenas menus operacionais.

### Menus sugeridos

```txt
Dashboard
Novo Contrato
Contratos
Clientes
Planos
```

### Menus removidos do front-end

Os menus abaixo não devem existir no front-end, pois remetem a teste ou documentação técnica da API:

```txt
Tokens
Testes API
Payload
Logs técnicos
Códigos de resposta
Exemplos de cURL
Console de requisições
```

> Observação: logs podem existir internamente no back-end, mas não precisam aparecer como tela principal no front-end.

---

## 24. Telas do Front-end

### Tela 1 — Login

Tela simples para entrada do atendente no sistema.

Campos sugeridos:

```txt
Usuário
Senha
```

Após login, o sistema deve direcionar para o Dashboard ou para a tela de Novo Contrato.

---

### Tela 2 — Dashboard

Tela inicial simples com visão operacional.

Informações sugeridas:

```txt
Contratos ativos
Contratos criados no dia
Contratos encerrados
Planos disponíveis
Últimos contratos criados
```

Essa tela não deve exibir payloads de API, cURL ou códigos HTTP.

---

### Tela 3 — Novo Contrato

Tela principal usada pelo atendente para incluir um plano de celular.

Campos:

```txt
ID do Cliente
Nome
Tipo de Documento
Documento
MSISDN
ICCID
ID do Plano
Data de Inclusão
Data de Encerramento
```

Regras da tela:

- Campos obrigatórios devem estar marcados;
- `idContrato` pode aparecer apenas depois da criação;
- `dataInclusao` pode vir preenchida com a data atual;
- O atendente deve conseguir enviar os dados para cadastro;
- A tela deve exibir mensagens amigáveis de sucesso ou erro;
- A tela não deve exibir status code técnico como foco principal.

Botões:

```txt
Validar Dados
Criar Contrato
Limpar
```

---

### Tela 4 — Consulta de Contratos

Tela para listar e consultar contratos criados.

Funcionalidades:

```txt
Buscar por ID do contrato
Buscar por MSISDN
Buscar por documento
Filtrar por status
Visualizar detalhes do contrato
```

---

### Tela 5 — Detalhes do Contrato

Tela para visualizar um contrato específico.

Informações exibidas:

```txt
ID do Contrato
ID do Cliente
Nome
Documento
MSISDN
ICCID
Plano
Status
Data de Inclusão
Data de Encerramento
```

Ações possíveis:

```txt
Suspender contrato
Atualizar dados
Encerrar contrato
```

---

### Tela 6 — Planos

Tela para listar os planos disponíveis.

Campos exibidos na tabela:

```txt
ID do Plano
Nome do Plano
Tipo
Franquia
Valor Mensal
Status
```

Exemplo de exibição:

| ID do Plano | Nome do Plano | Tipo | Franquia | Valor |
|---|---|---|---|---:|
| `PLANO-001` | Controle 10GB | Controle | 10GB | 39.90 |
| `PLANO-002` | Controle 20GB | Controle | 20GB | 59.90 |
| `PLANO-003` | Controle 30GB | Controle | 30GB | 79.90 |
| `PLANO-004` | Pré-pago Básico | Pré-pago | 5GB | 19.90 |
| `PLANO-005` | Pré-pago Turbo | Pré-pago | 15GB | 29.90 |
| `PLANO-006` | Pós 50GB | Pós-pago | 50GB | 99.90 |
| `PLANO-007` | Pós 100GB | Pós-pago | 100GB | 149.90 |
| `PLANO-008` | Família 80GB | Família | 80GB | 129.90 |
| `PLANO-009` | Família 150GB | Família | 150GB | 199.90 |
| `PLANO-010` | Empresarial 200GB | Empresarial | 200GB | 249.90 |

---

## 25. Swagger

O Swagger será a principal ferramenta de leitura e análise da API.

Rota sugerida:

```http
GET /docs
```

O Swagger deve conter:

- Lista de endpoints;
- Campos obrigatórios;
- Campos opcionais;
- Exemplos de request;
- Exemplos de response;
- Códigos de retorno;
- Autenticação Bearer Token;
- Modelos das entidades;
- Explicação dos principais erros;
- Rotas de contratos;
- Rotas de planos;
- Rotas de autenticação;
- Rota de health check.

O Swagger será usado para entender a API antes de testar no Postman.

Os testes práticos serão feitos no Postman.

---

## 26. Postman

O Postman será usado para testar a API.

A collection do Postman deve conter:

### Autenticação

```txt
Gerar Bearer Token
Validar Token
```

### Planos

```txt
Listar planos
Consultar plano existente
Consultar plano inexistente
```

### Contratos

```txt
Criar contrato com sucesso
Consultar contrato por ID
Listar contratos
Atualizar contrato com PATCH
Substituir contrato com PUT
Encerrar contrato com DELETE
```

### Cenários de erro

```txt
Criar contrato sem campo obrigatório
Criar contrato com plano inexistente
Criar contrato com plano inativo
Criar contrato com MSISDN duplicado
Criar contrato com ICCID duplicado
Consultar contrato inexistente
Enviar token inválido
Enviar requisição sem token
Estourar limite de requisições para validar 429
Enviar documento inválido
Enviar dataEncerramento menor que dataInclusao
```

### Variáveis de ambiente no Postman

```txt
baseUrl=http://localhost:3333
accessToken=
idContrato=
idPlano=PLANO-001
msisdn=
iccid=
```

### Uso do token no Postman

Após gerar o token, salvar o valor em uma variável:

```txt
accessToken
```

E usar nas demais chamadas:

```http
Authorization: Bearer {{accessToken}}
```

---

## 27. Estrutura Sugerida do Banco

### Tabela `usuarios`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Chave primária |
| `usuario` | string | Obrigatório e único |
| `senhaHash` | string | Obrigatório |
| `perfil` | string | Exemplo: `ATENDENTE` ou `ADMIN` |
| `ativo` | boolean | Padrão `true` |
| `createdAt` | datetime | Gerado automaticamente |
| `updatedAt` | datetime | Atualizado automaticamente |

---

### Tabela `clientes`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Chave primária |
| `nome` | string | Obrigatório |
| `documento` | string | Obrigatório |
| `tipoDocumento` | string | CPF ou CNPJ |
| `createdAt` | datetime | Gerado automaticamente |
| `updatedAt` | datetime | Atualizado automaticamente |

---

### Tabela `planos`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Chave primária |
| `nome` | string | Obrigatório |
| `descricao` | string | Opcional |
| `franquiaInternet` | string | Opcional |
| `tipoPlano` | string | Controle, Pré-pago, Pós-pago, Família ou Empresarial |
| `valor` | decimal | Opcional |
| `ativo` | boolean | Padrão `true` |
| `createdAt` | datetime | Gerado automaticamente |
| `updatedAt` | datetime | Atualizado automaticamente |

---

### Tabela `contratos`

| Campo | Tipo | Regra |
|---|---|---|
| `idContrato` | string | Chave primária |
| `idCliente` | string | Obrigatório |
| `idPlano` | string | Obrigatório |
| `msisdn` | string | Obrigatório |
| `iccid` | string | Obrigatório |
| `status` | string | Padrão `ATIVO` |
| `dataInclusao` | datetime | Padrão data atual |
| `dataEncerramento` | datetime | Opcional |
| `createdAt` | datetime | Gerado automaticamente |
| `updatedAt` | datetime | Atualizado automaticamente |

---

### Tabela `logsRequisicoes`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | string | Chave primária |
| `metodo` | string | GET, POST, PUT, PATCH ou DELETE |
| `endpoint` | string | Endpoint chamado |
| `statusCode` | number | Código de retorno |
| `usuarioId` | string | Opcional |
| `ip` | string | Opcional |
| `createdAt` | datetime | Gerado automaticamente |

---

## 28. Regras por Operação

### Criar Contrato

Para criar um contrato:

1. Validar token Bearer.
2. Validar campos obrigatórios.
3. Validar documento.
4. Validar se o plano existe.
5. Validar se o plano está ativo.
6. Verificar se o MSISDN já está ativo.
7. Verificar se o ICCID já está ativo.
8. Gerar `idContrato`, caso não seja enviado.
9. Gerar `dataInclusao`, caso não seja enviada.
10. Criar contrato com status `ATIVO`.
11. Registrar log da requisição.
12. Retornar `201 Created`.

---

### Consultar Contrato

Para consultar um contrato:

1. Validar token Bearer.
2. Buscar contrato por `idContrato`.
3. Se não existir, retornar `404 Not Found`.
4. Se existir, retornar `200 OK`.

---

### Listar Contratos

Para listar contratos:

1. Validar token Bearer.
2. Permitir filtros opcionais por status, documento ou MSISDN.
3. Retornar lista com paginação simples.
4. Retornar `200 OK`.

---

### Listar Planos

Para listar planos:

1. Validar token Bearer.
2. Buscar planos cadastrados.
3. Permitir filtro opcional por tipo ou status.
4. Retornar `200 OK`.

---

### Consultar Plano

Para consultar um plano:

1. Validar token Bearer.
2. Buscar plano por `idPlano`.
3. Se não existir, retornar `404 Not Found`.
4. Se existir, retornar `200 OK`.

---

### Atualizar Contrato com PATCH

Para atualizar parcialmente:

1. Validar token Bearer.
2. Buscar contrato.
3. Se não existir, retornar `404 Not Found`.
4. Validar apenas os campos enviados.
5. Impedir alteração de identificadores sensíveis, se necessário.
6. Atualizar contrato.
7. Retornar `200 OK`.

---

### Substituir Contrato com PUT

Para substituir um contrato:

1. Validar token Bearer.
2. Buscar contrato.
3. Se não existir, retornar `404 Not Found`.
4. Exigir envio dos campos principais.
5. Validar regras de negócio.
6. Atualizar os dados permitidos.
7. Retornar `200 OK`.

---

### Encerrar Contrato com DELETE

Para encerrar contrato:

1. Validar token Bearer.
2. Buscar contrato.
3. Se não existir, retornar `404 Not Found`.
4. Se já estiver encerrado, retornar `409 Conflict`.
5. Alterar status para `ENCERRADO`.
6. Preencher `dataEncerramento` com a data atual.
7. Registrar log.
8. Retornar `204 No Content`.

---

## 29. Padrão de Resposta de Sucesso

### Criação de contrato

```json
{
  "idContrato": "CON-20260601-000001",
  "status": "ATIVO",
  "message": "Contrato criado com sucesso."
}
```

### Consulta de contrato

```json
{
  "idContrato": "CON-20260601-000001",
  "idCliente": "CLI-001",
  "nome": "Guilherme dos Santos Santana",
  "documento": "12345678900",
  "tipoDocumento": "CPF",
  "msisdn": "11999999999",
  "iccid": "89550000000000000001",
  "idPlano": "PLANO-001",
  "status": "ATIVO",
  "dataInclusao": "2026-06-01T10:00:00.000Z",
  "dataEncerramento": null
}
```

### Consulta de plano

```json
{
  "id": "PLANO-001",
  "nome": "Controle 10GB",
  "tipoPlano": "Controle",
  "franquiaInternet": "10GB",
  "valor": 39.90,
  "ativo": true
}
```

---

## 30. Padrão de Resposta de Erro

Todas as respostas de erro devem seguir um padrão único.

### Exemplo 422

```json
{
  "statusCode": 422,
  "message": "O campo msisdn é obrigatório.",
  "error": "Unprocessable Entity"
}
```

### Exemplo 409

```json
{
  "statusCode": 409,
  "message": "Já existe um contrato ativo para o MSISDN informado.",
  "error": "Conflict"
}
```

### Exemplo 401

```json
{
  "statusCode": 401,
  "message": "Token ausente, inválido ou expirado.",
  "error": "Unauthorized"
}
```

### Exemplo 429

```json
{
  "statusCode": 429,
  "message": "Muitas requisições realizadas. Tente novamente mais tarde.",
  "error": "Too Many Requests"
}
```

---

## 31. Critérios de Aceite

A API será considerada funcional quando:

- Possuir Swagger em `/docs`;
- Swagger documentar todos os endpoints principais;
- Permitir gerar Bearer Token;
- Proteger rotas usando Bearer Token;
- Retornar `401` para token ausente ou inválido;
- Retornar `403` para usuário sem permissão;
- Listar planos seedados;
- Consultar plano por ID;
- Criar contrato com dados válidos;
- Impedir criação sem campos obrigatórios;
- Impedir criação com plano inexistente;
- Impedir criação com plano inativo;
- Impedir MSISDN duplicado em contrato ativo;
- Impedir ICCID duplicado em contrato ativo;
- Gerar `idContrato` automaticamente quando não enviado;
- Gerar `dataInclusao` automaticamente quando não enviada;
- Consultar contrato por ID;
- Listar contratos;
- Atualizar parcialmente com PATCH;
- Substituir dados com PUT;
- Encerrar contrato com DELETE lógico;
- Retornar os códigos HTTP corretamente;
- Possuir collection do Postman;
- Rodar localmente com poucos comandos;
- Possuir README com instruções de execução;
- Ter front-end simples simulando o uso por um atendente;
- Front-end não deve conter tela de teste de API.

---

## 32. Estrutura Sugerida de Pastas

### Back-end

```txt
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    modules/
      auth/
      contratos/
      planos/
      clientes/
      logs/
    middlewares/
      auth.middleware.ts
      rate-limit.middleware.ts
      error-handler.middleware.ts
    shared/
      validators/
      utils/
    server.ts
  package.json
  README.md
```

### Front-end

```txt
frontend/
  src/
    pages/
      login/
      dashboard/
      contratos/
      contratos/novo/
      clientes/
      planos/
    components/
      Sidebar.tsx
      Header.tsx
      Input.tsx
      Button.tsx
      StatusBadge.tsx
      PlanCard.tsx
    services/
      api.ts
      auth.service.ts
      contratos.service.ts
      planos.service.ts
    styles/
      globals.css
  package.json
  README.md
```

### Postman

```txt
postman/
  Escuro_API.postman_collection.json
  Escuro_Local.postman_environment.json
```

---

## 33. Execução Esperada

### Back-end

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

### Acessos esperados

```txt
API: http://localhost:3333
Swagger: http://localhost:3333/docs
Front-end: http://localhost:3000
```

---

## 34. Observação Final

A prioridade do projeto é clareza, organização e funcionamento.

O projeto deve demonstrar conhecimento em:

- Node.js;
- TypeScript;
- API REST;
- Métodos HTTP;
- Status codes;
- Banco relacional;
- Prisma;
- SQLite;
- Swagger;
- Postman;
- Bearer Token;
- Rate limit;
- Validação de dados;
- Tratamento de erros;
- Front-end consumindo API;
- Separação entre documentação, teste e interface operacional.

A análise principal da API será feita pelo Swagger.

Os testes da API serão feitos pelo Postman.

O front-end será apenas uma simulação de uso real por um atendente.
