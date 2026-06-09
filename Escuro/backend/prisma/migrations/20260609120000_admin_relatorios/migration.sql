-- Administração de logins e relatórios de tarefas de teste.
CREATE TABLE IF NOT EXISTS "TarefaTeste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ordemObrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TarefaTeste_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TarefaTeste_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TarefaTesteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tarefaId" TEXT NOT NULL,
    "codigoMetodo" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "statusEsperado" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TarefaTesteItem_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "TarefaTeste" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TarefaTeste_usuarioId_idx" ON "TarefaTeste"("usuarioId");
CREATE INDEX IF NOT EXISTS "TarefaTeste_ativo_idx" ON "TarefaTeste"("ativo");
CREATE INDEX IF NOT EXISTS "TarefaTesteItem_tarefaId_idx" ON "TarefaTesteItem"("tarefaId");
CREATE INDEX IF NOT EXISTS "TarefaTesteItem_codigoMetodo_idx" ON "TarefaTesteItem"("codigoMetodo");
