# Estrutura de Pastas

## Raiz

```txt
Escuro/
  backend/
  frontend/
  postman/
  docs/
  scripts/
  README.md
```

## Back-end

```txt
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    modules/
      auth/
      clientes/
      contratos/
      logs/
      planos/
    middlewares/
      auth.middleware.ts
      rate-limit.middleware.ts
      error-handler.middleware.ts
    shared/
      validators/
      utils/
    server.ts
  tests/
  package.json
  README.md
```

## Front-end

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
      layout/
      ui/
    services/
      api.ts
      auth.service.ts
      contratos.service.ts
      planos.service.ts
    styles/
      globals.css
    assets/
      logo-escuro.png
  package.json
  README.md
```

## Documentação e testes

```txt
docs/
  assets/
    referencias/
      front-referencia.png
      logo-escuro.png
  regras/
    REGRA_DE_NEGOCIO_API_TELECOM_ESCURO_V3.md

postman/
  Escuro_API.postman_collection.json
  Escuro_Local.postman_environment.json

scripts/
  iniciar_servidor.bat
  iniciar_servidor_original.bat
```
