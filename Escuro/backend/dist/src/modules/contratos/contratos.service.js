import { HttpError } from "../../shared/http-error.js";
import { prisma } from "../../shared/prisma.js";
import { validateCreateContrato, validatePatchContrato } from "../../shared/validators/contrato.validator.js";
import { formatDateId } from "../../shared/utils/date.js";
const includeContrato = {
    cliente: true,
    plano: true
};
export async function generateContratoId(date = new Date()) {
    const prefix = `CON-${formatDateId(date)}-`;
    const count = await prisma.contrato.count({
        where: {
            idContrato: {
                startsWith: prefix
            }
        }
    });
    return `${prefix}${String(count + 1).padStart(6, "0")}`;
}
async function assertPlanoAtivo(idPlano) {
    const plano = await prisma.plano.findUnique({ where: { id: idPlano } });
    if (!plano) {
        throw new HttpError(404, "Plano não encontrado.");
    }
    if (!plano.ativo) {
        throw new HttpError(422, "O plano informado está inativo.");
    }
    return plano;
}
async function assertContratoExiste(idContrato) {
    const contrato = await prisma.contrato.findUnique({
        where: { idContrato },
        include: includeContrato
    });
    if (!contrato) {
        throw new HttpError(404, "Contrato não encontrado.");
    }
    return contrato;
}
async function assertDuplicidadeAtiva(msisdn, iccid, ignoreIdContrato) {
    if (msisdn) {
        const contratoMsisdn = await prisma.contrato.findFirst({
            where: {
                msisdn,
                status: "ATIVO",
                idContrato: ignoreIdContrato ? { not: ignoreIdContrato } : undefined
            }
        });
        if (contratoMsisdn) {
            throw new HttpError(409, "Já existe um contrato ativo para o MSISDN informado.");
        }
    }
    if (iccid) {
        const contratoIccid = await prisma.contrato.findFirst({
            where: {
                iccid,
                status: "ATIVO",
                idContrato: ignoreIdContrato ? { not: ignoreIdContrato } : undefined
            }
        });
        if (contratoIccid) {
            throw new HttpError(409, "Já existe um contrato ativo para o ICCID informado.");
        }
    }
}
export async function criarContrato(body) {
    const input = validateCreateContrato(body);
    await assertPlanoAtivo(input.idPlano);
    await assertDuplicidadeAtiva(input.msisdn, input.iccid);
    const idContrato = input.idContrato ?? await generateContratoId(input.dataInclusao ?? new Date());
    const contratoExistente = await prisma.contrato.findUnique({ where: { idContrato } });
    if (contratoExistente) {
        throw new HttpError(409, "Já existe contrato com o ID informado.");
    }
    const dataInclusao = input.dataInclusao ?? new Date();
    validarDatas(dataInclusao, input.dataEncerramento);
    const contrato = await prisma.$transaction(async (tx) => {
        const cliente = await tx.cliente.findFirst({
            where: {
                OR: [
                    { id: input.idCliente },
                    { documento: input.documento, tipoDocumento: input.tipoDocumento }
                ]
            }
        });
        const clienteId = cliente?.id ?? input.idCliente;
        if (cliente) {
            await tx.cliente.update({
                where: { id: cliente.id },
                data: {
                    nome: input.nome,
                    documento: input.documento,
                    tipoDocumento: input.tipoDocumento
                }
            });
        }
        else {
            await tx.cliente.create({
                data: {
                    id: input.idCliente,
                    nome: input.nome,
                    documento: input.documento,
                    tipoDocumento: input.tipoDocumento
                }
            });
        }
        return tx.contrato.create({
            data: {
                idContrato,
                idCliente: clienteId,
                idPlano: input.idPlano,
                msisdn: input.msisdn,
                iccid: input.iccid,
                status: input.status ?? "ATIVO",
                dataInclusao,
                dataEncerramento: input.dataEncerramento
            },
            include: includeContrato
        });
    });
    return contrato;
}
export async function listarContratos(query) {
    const status = typeof query.status === "string" ? query.status : undefined;
    const msisdn = typeof query.msisdn === "string" ? query.msisdn.replace(/\D/g, "") : undefined;
    const documento = typeof query.documento === "string" ? query.documento.replace(/\D/g, "") : undefined;
    return prisma.contrato.findMany({
        where: {
            status,
            msisdn,
            cliente: documento ? { documento } : undefined
        },
        include: includeContrato,
        orderBy: { createdAt: "desc" }
    });
}
export async function buscarContrato(idContrato) {
    return assertContratoExiste(idContrato);
}
export async function atualizarContratoPatch(idContrato, body) {
    const contratoAtual = await assertContratoExiste(idContrato);
    const data = validatePatchContrato(body);
    if (typeof data.idPlano === "string") {
        await assertPlanoAtivo(data.idPlano);
    }
    if (typeof data.msisdn === "string" || typeof data.iccid === "string") {
        await assertDuplicidadeAtiva(typeof data.msisdn === "string" ? data.msisdn : undefined, typeof data.iccid === "string" ? data.iccid : undefined, idContrato);
    }
    const dataInclusao = data.dataInclusao instanceof Date ? data.dataInclusao : contratoAtual.dataInclusao;
    const dataEncerramento = data.dataEncerramento instanceof Date ? data.dataEncerramento : contratoAtual.dataEncerramento;
    validarDatas(dataInclusao, dataEncerramento);
    return prisma.contrato.update({
        where: { idContrato },
        data,
        include: includeContrato
    });
}
export async function substituirContrato(idContrato, body) {
    await assertContratoExiste(idContrato);
    const input = validateCreateContrato(body);
    await assertPlanoAtivo(input.idPlano);
    await assertDuplicidadeAtiva(input.msisdn, input.iccid, idContrato);
    const dataInclusao = input.dataInclusao ?? new Date();
    validarDatas(dataInclusao, input.dataEncerramento);
    const cliente = await prisma.cliente.findFirst({
        where: {
            OR: [
                { id: input.idCliente },
                { documento: input.documento, tipoDocumento: input.tipoDocumento }
            ]
        }
    });
    const clienteId = cliente?.id ?? input.idCliente;
    if (cliente) {
        await prisma.cliente.update({
            where: { id: cliente.id },
            data: {
                nome: input.nome,
                documento: input.documento,
                tipoDocumento: input.tipoDocumento
            }
        });
    }
    else {
        await prisma.cliente.create({
            data: {
                id: input.idCliente,
                nome: input.nome,
                documento: input.documento,
                tipoDocumento: input.tipoDocumento
            }
        });
    }
    return prisma.contrato.update({
        where: { idContrato },
        data: {
            idCliente: clienteId,
            idPlano: input.idPlano,
            msisdn: input.msisdn,
            iccid: input.iccid,
            status: input.status ?? "ATIVO",
            dataInclusao,
            dataEncerramento: input.dataEncerramento
        },
        include: includeContrato
    });
}
export async function encerrarContrato(idContrato) {
    const contrato = await assertContratoExiste(idContrato);
    if (contrato.status === "ENCERRADO") {
        throw new HttpError(409, "Contrato já está encerrado.");
    }
    return prisma.contrato.update({
        where: { idContrato },
        data: {
            status: "ENCERRADO",
            dataEncerramento: new Date()
        }
    });
}
function validarDatas(dataInclusao, dataEncerramento) {
    if (dataEncerramento && dataEncerramento < dataInclusao) {
        throw new HttpError(422, "dataEncerramento não pode ser menor que dataInclusao.");
    }
}
