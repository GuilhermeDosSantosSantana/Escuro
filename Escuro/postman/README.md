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
4. No front-end, o ADMIN cria uma tarefa para o usuário que será testado.
5. Execute primeiro `Autenticação / Gerar Bearer Token` usando o mesmo login da tarefa. Exemplo: `usuario / user@123`.
6. Rode os demais requests com o header `Authorization: Bearer {{accessToken}}`.
7. Deixe a tela **Relatórios** aberta no front-end do ADMIN para acompanhar a atualização em tempo real.

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

## Observações

O environment usa `baseUrl=http://localhost:3333`. Se a API estiver em outra porta, ajuste a variável `baseUrl`.

Para o relatório sair de `pendente`, o token precisa pertencer ao mesmo usuário que recebeu a tarefa. Exemplo: se a tarefa foi criada para `usuario`, gere o Bearer Token com `usuario / user@123` no Postman e use esse token nas requests da tarefa.
