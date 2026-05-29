-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "nombre" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'comerciante',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comerciante" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fotoPerfil" TEXT,
    "whatsapp" TEXT NOT NULL,
    "tipoUbicacion" TEXT NOT NULL DEFAULT 'puesto_fijo',
    "ubicacion" TEXT,
    "dias" TEXT,
    "horario" TEXT,
    "slug" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comerciante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "dias" TEXT NOT NULL,
    "horario" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComercianteFeria" (
    "id" TEXT NOT NULL,
    "comercianteId" TEXT NOT NULL,
    "feriaId" TEXT NOT NULL,
    "puesto" TEXT,

    CONSTRAINT "ComercianteFeria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "comercianteId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "talle" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'usado',
    "stock" INTEGER NOT NULL DEFAULT 1,
    "fotos" TEXT NOT NULL DEFAULT '[]',
    "aceptaTrueque" BOOLEAN NOT NULL DEFAULT false,
    "buscaCambio" TEXT,
    "disponibleEnFeria" BOOLEAN NOT NULL DEFAULT true,
    "disponibleEnDomicilio" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL DEFAULT 'publicado',
    "demandaPerdida" INTEGER NOT NULL DEFAULT 0,
    "creadoPorId" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "monto" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombreContacto" TEXT,
    "telefonoContacto" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'whatsapp',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Comerciante_usuarioId_key" ON "Comerciante"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Comerciante_slug_key" ON "Comerciante"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ComercianteFeria_comercianteId_feriaId_key" ON "ComercianteFeria"("comercianteId", "feriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- AddForeignKey
ALTER TABLE "Comerciante" ADD CONSTRAINT "Comerciante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComercianteFeria" ADD CONSTRAINT "ComercianteFeria_comercianteId_fkey" FOREIGN KEY ("comercianteId") REFERENCES "Comerciante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComercianteFeria" ADD CONSTRAINT "ComercianteFeria_feriaId_fkey" FOREIGN KEY ("feriaId") REFERENCES "Feria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_comercianteId_fkey" FOREIGN KEY ("comercianteId") REFERENCES "Comerciante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
