import { initializeDatabase } from "../src/shared/init-database.js";

initializeDatabase()
  .then(() => {
    console.log("Banco SQLite inicializado com sucesso.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
