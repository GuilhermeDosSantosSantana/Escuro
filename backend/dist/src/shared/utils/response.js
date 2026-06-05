export function planoResponse(plano) {
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
export function contratoResponse(contrato) {
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
