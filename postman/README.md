# Postman

Esta pasta guardará os arquivos de teste manual da API.

## Arquivos

```txt
Escuro_API.postman_collection.json
Escuro_Local.postman_environment.json
```

## Variáveis planejadas

```txt
baseUrl=http://localhost:3333
accessToken=
idContrato=
idPlano=PLANO-001
msisdn=
iccid=
```

## Como usar

1. Importe `Escuro_API.postman_collection.json`.
2. Importe `Escuro_Local.postman_environment.json`.
3. Selecione o environment `Escuro Local`.
4. Execute primeiro `Autenticação / Gerar Bearer Token`.
5. Rode os demais requests.

## Cenários principais

- Gerar Bearer Token;
- validar token;
- listar planos;
- consultar plano existente;
- consultar plano inexistente;
- criar contrato com sucesso;
- consultar contrato;
- listar contratos;
- atualizar contrato com PATCH;
- substituir contrato com PUT;
- encerrar contrato com DELETE;
- validar erros de campos obrigatórios, duplicidade, documento inválido, plano inexistente e token inválido.

## Observação

O environment usa `baseUrl=http://localhost:3333`. Se a API estiver em outra porta, ajuste a variável `baseUrl`.
