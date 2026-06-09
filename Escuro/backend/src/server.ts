import { buildApp } from "./app.js";
import { config } from "./shared/config.js";
import { prisma } from "./shared/prisma.js";

const app = await buildApp();

try {
  await app.listen({
    port: config.port,
    host: "0.0.0.0"
  });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}

const close = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", close);
process.on("SIGTERM", close);
