export type MetodoApi = {
  codigo: string;
  metodo: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  endpoint: string;
  descricao: string;
  grupo: string;
};

export const metodosApi: MetodoApi[] = [
  {
    codigo: "HEALTH_GET",
    metodo: "GET",
    endpoint: "/api/v1/health",
    descricao: "Verificar Status da API",
    grupo: "Health"
  },
  {
    codigo: "AUTH_TOKEN_POST",
    metodo: "POST",
    endpoint: "/api/v1/auth/token",
    descricao: "Gerar Token",
    grupo: "Autenticação"
  },
  {
    codigo: "AUTH_VALIDATE_POST",
    metodo: "POST",
    endpoint: "/api/v1/auth/validate",
    descricao: "Validar Token",
    grupo: "Autenticação"
  },
  {
    codigo: "PLANOS_LIST_GET",
    metodo: "GET",
    endpoint: "/api/v1/planos",
    descricao: "Planos - Consulta dos planos disponíveis",
    grupo: "Planos"
  },
  {
    codigo: "PLANOS_BY_ID_GET",
    metodo: "GET",
    endpoint: "/api/v1/planos/:idPlano",
    descricao: "Planos - Consulta plano por ID",
    grupo: "Planos"
  },
  {
    codigo: "CONTRATOS_CREATE_POST",
    metodo: "POST",
    endpoint: "/api/v1/contratos",
    descricao: "Contratos - Criar novo contrato",
    grupo: "Contratos"
  },
  {
    codigo: "CONTRATOS_LIST_GET",
    metodo: "GET",
    endpoint: "/api/v1/contratos",
    descricao: "Contratos - Lista Contratos",
    grupo: "Contratos"
  },
  {
    codigo: "CONTRATOS_BY_ID_GET",
    metodo: "GET",
    endpoint: "/api/v1/contratos/:idContrato",
    descricao: "Contratos - Consulta Contrato por ID",
    grupo: "Contratos"
  },
  {
    codigo: "CONTRATOS_PATCH",
    metodo: "PATCH",
    endpoint: "/api/v1/contratos/:idContrato",
    descricao: "Contratos - Atualiza Contrato Parcialmente",
    grupo: "Contratos"
  },
  {
    codigo: "CONTRATOS_PUT",
    metodo: "PUT",
    endpoint: "/api/v1/contratos/:idContrato",
    descricao: "Contratos - Substitui dados principais do contrato",
    grupo: "Contratos"
  },
  {
    codigo: "CONTRATOS_DELETE",
    metodo: "DELETE",
    endpoint: "/api/v1/contratos/:idContrato",
    descricao: "Contratos - Encerra contrato",
    grupo: "Contratos"
  }
];

export function buscarMetodoApi(codigo: string) {
  return metodosApi.find((metodo) => metodo.codigo === codigo);
}
