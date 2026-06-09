import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const planos = [
  ["PLANO-001", "Controle 10GB", "Controle", "10GB", 39.9],
  ["PLANO-002", "Controle 20GB", "Controle", "20GB", 59.9],
  ["PLANO-003", "Controle 30GB", "Controle", "30GB", 79.9],
  ["PLANO-004", "Pré-pago Básico", "Pré-pago", "5GB", 19.9],
  ["PLANO-005", "Pré-pago Turbo", "Pré-pago", "15GB", 29.9],
  ["PLANO-006", "Pós 50GB", "Pós-pago", "50GB", 99.9],
  ["PLANO-007", "Pós 100GB", "Pós-pago", "100GB", 149.9],
  ["PLANO-008", "Família 80GB", "Família", "80GB", 129.9],
  ["PLANO-009", "Família 150GB", "Família", "150GB", 199.9],
  ["PLANO-010", "Empresarial 200GB", "Empresarial", "200GB", 249.9]
] as const;

const usuariosPadrao = [
  { usuario: "guisantos", senha: "admin@123", perfil: "ADMIN" },
  { usuario: "usuario", senha: "user@123", perfil: "ATENDENTE" },
  { usuario: "victorDev", senha: "dev@123", perfil: "DEVELOPER" }
] as const;

async function main() {
  for (const user of usuariosPadrao) {
    const senhaHash = await bcrypt.hash(user.senha, 10);

    await prisma.usuario.upsert({
      where: { usuario: user.usuario },
      update: { senhaHash, perfil: user.perfil, ativo: true },
      create: {
        usuario: user.usuario,
        senhaHash,
        perfil: user.perfil,
        ativo: true
      }
    });
  }

  await prisma.usuario.updateMany({
    where: { usuario: { in: ["admin.escuro", "atendente.escuro"] } },
    data: { ativo: false }
  });

  for (const [id, nome, tipoPlano, franquiaInternet, valor] of planos) {
    await prisma.plano.upsert({
      where: { id },
      update: {
        nome,
        tipoPlano,
        franquiaInternet,
        valor,
        ativo: true
      },
      create: {
        id,
        nome,
        descricao: `${nome} - ${franquiaInternet}`,
        tipoPlano,
        franquiaInternet,
        valor,
        ativo: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed executado com sucesso.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
