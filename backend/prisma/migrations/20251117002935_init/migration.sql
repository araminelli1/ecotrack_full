-- CreateTable
CREATE TABLE "Campi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "uf" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cursos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "sigla" TEXT
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ra" TEXT,
    "cursoId" INTEGER,
    "campusId" INTEGER,
    "tipoUsuario" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuarios_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Cursos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Usuarios_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiposResiduos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "pontos" REAL NOT NULL,
    "cor" TEXT
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "avisos" TEXT,
    "pontosEsperados" REAL,
    "pontosRecebidos" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validadoPorId" INTEGER,
    "validadoEm" DATETIME,
    "avisosValidacao" TEXT,
    CONSTRAINT "Entrega_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entrega_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "Usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItensEntrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entregaId" INTEGER NOT NULL,
    "tipoResiduoId" INTEGER NOT NULL,
    "pesoEstimado" REAL,
    "pesoAtual" REAL,
    CONSTRAINT "ItensEntrega_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "Entrega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItensEntrega_tipoResiduoId_fkey" FOREIGN KEY ("tipoResiduoId") REFERENCES "TiposResiduos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recompensas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "pontosNecessarios" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HistoricoRecompensa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "recompensaId" INTEGER NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoRecompensa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoRecompensa_recompensaId_fkey" FOREIGN KEY ("recompensaId") REFERENCES "Recompensas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medalhas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT
);

-- CreateTable
CREATE TABLE "UsuarioMedalhas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "medalhaId" INTEGER NOT NULL,
    "recebidoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsuarioMedalhas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsuarioMedalhas_medalhaId_fkey" FOREIGN KEY ("medalhaId") REFERENCES "Medalhas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegraPontosResiduos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoResiduoId" INTEGER NOT NULL,
    "pontos" REAL NOT NULL,
    "validadeInicial" DATETIME,
    "validadeFinal" DATETIME,
    CONSTRAINT "RegraPontosResiduos_tipoResiduoId_fkey" FOREIGN KEY ("tipoResiduoId") REFERENCES "TiposResiduos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PontuacaoUsuario" (
    "usuarioId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontosAcumulados" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "PontuacaoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_ra_key" ON "Usuarios"("ra");
