-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'CAJERO');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASICO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateEnum
CREATE TYPE "TipoUso" AS ENUM ('AUTOMATICO', 'MANUAL');

-- CreateTable
CREATE TABLE "Negocio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'DOP',
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
    "plan" "Plan" NOT NULL DEFAULT 'BASICO',
    "configuracion" JSONB NOT NULL DEFAULT '{}',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "datosExtra" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "tipo" "TipoItem" NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "costo" DECIMAL(12,2),
    "controlaStock" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "datosExtra" JSONB,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "clienteId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(12,2) NOT NULL,
    "metodoPago" TEXT NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaDetalle" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "costoUnitario" DECIMAL(12,2),

    CONSTRAINT "VentaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "nota" TEXT,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformeIA" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFin" TIMESTAMP(3) NOT NULL,
    "metricas" JSONB NOT NULL,
    "metricasHash" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tokensEntrada" INTEGER NOT NULL,
    "tokensSalida" INTEGER NOT NULL,
    "tipo" "TipoUso" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformeIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsoIA" (
    "id" SERIAL NOT NULL,
    "negocioId" INTEGER NOT NULL,
    "tipo" "TipoUso" NOT NULL,
    "tokens" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_negocioId_idx" ON "Usuario"("negocioId");

-- CreateIndex
CREATE INDEX "Cliente_negocioId_idx" ON "Cliente"("negocioId");

-- CreateIndex
CREATE INDEX "Item_negocioId_idx" ON "Item"("negocioId");

-- CreateIndex
CREATE INDEX "Venta_negocioId_fecha_idx" ON "Venta"("negocioId", "fecha");

-- CreateIndex
CREATE INDEX "VentaDetalle_ventaId_idx" ON "VentaDetalle"("ventaId");

-- CreateIndex
CREATE INDEX "VentaDetalle_itemId_idx" ON "VentaDetalle"("itemId");

-- CreateIndex
CREATE INDEX "Gasto_negocioId_fecha_idx" ON "Gasto"("negocioId", "fecha");

-- CreateIndex
CREATE INDEX "InformeIA_negocioId_creadoEn_idx" ON "InformeIA"("negocioId", "creadoEn");

-- CreateIndex
CREATE INDEX "UsoIA_negocioId_creadoEn_idx" ON "UsoIA"("negocioId", "creadoEn");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformeIA" ADD CONSTRAINT "InformeIA_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoIA" ADD CONSTRAINT "UsoIA_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
