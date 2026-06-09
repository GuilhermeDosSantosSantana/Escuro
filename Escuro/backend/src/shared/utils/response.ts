type PlanoShape = {
  id: string;
  nome: string;
  descricao: string | null;
  franquiaInternet: string | null;
  tipoPlano: string;
  valor: number | null;
  ativo: boolean;
};

type ContratoCompleto = {
  idContrato: string;
  idCliente: string;
  idPlano: string;
  msisdn: string;
  iccid: string;
  status: string;
  dataInclusao: Date;
  dataEncerramento: Date | null;
  cliente?: {
    nome: string;
    documento: string;
    tipoDocumento: string;
  };
  plano?: PlanoShape;
};

export function planoResponse(plano: PlanoShape) {
  return {
    id: plano.id,
    nome: plano.nome,
    descricao: plano.descricao,
    tipoPlano: plano.tipoPlano,
    franquiaInternet: plano.franquiaInternet,
    valor: plano.valor,
    ativo: plano.ativo
  };
}

export function contratoResponse(contrato: ContratoCompleto) {
  return {
    idContrato: contrato.idContrato,
    idCliente: contrato.idCliente,
    nome: contrato.cliente?.nome,
    documento: contrato.cliente?.documento,
    tipoDocumento: contrato.cliente?.tipoDocumento,
    msisdn: contrato.msisdn,
    iccid: contrato.iccid,
    idPlano: contrato.idPlano,
    plano: contrato.plano?.nome,
    status: contrato.status,
    dataInclusao: contrato.dataInclusao.toISOString(),
    dataEncerramento: contrato.dataEncerramento?.toISOString() ?? null
  };
}
