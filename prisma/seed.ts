import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

if (!databaseUrl) {
  throw new Error("DATABASE_URL no está configurada para el seed.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FerIA database...");

  // ─── Categorías ───
  const categorias = [
    "Ropa Mujer",
    "Ropa Hombre",
    "Niños",
    "Zapatos",
    "Accesorios",
  ];
  for (const nombre of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log("✅ Categorías creadas");

  // ─── Admin ───
  const adminPin = await bcrypt.hash("123456", 10);
  const admin = await prisma.usuario.upsert({
    where: { telefono: "3880000000" },
    update: {},
    create: {
      telefono: "3880000000",
      pinHash: adminPin,
      nombre: "Admin FerIA",
      rol: "admin",
    },
  });
  console.log("✅ Admin creado (tel: 3880000000, PIN: 123456)");

  // ─── Ferias ───
  const feriaSur = await prisma.feria.create({
    data: {
      nombre: "Feria del Sur",
      direccion: "Av. Libertad esq. San Martín",
      dias: "Miércoles, Viernes",
      horario: "09:00 - 14:00",
    },
  });

  const feriaMunicipal = await prisma.feria.create({
    data: {
      nombre: "Feria Municipal Central",
      direccion: "Predio de las Aguas Danzantes",
      dias: "Sábados",
      horario: "08:00 - 13:00",
    },
  });

  const feriaNorte = await prisma.feria.create({
    data: {
      nombre: "Feria del Norte",
      direccion: "Barrio Alto Palpalá",
      dias: "Domingos",
      horario: "10:00 - 15:00",
    },
  });
  console.log("✅ Ferias creadas");

  // ─── Comerciantes de ejemplo ───
  const pin = await bcrypt.hash("123456", 10);

  const u1 = await prisma.usuario.create({
    data: {
      telefono: "3881111111",
      pinHash: pin,
      nombre: "Elena Rodriguez",
      rol: "comerciante",
    },
  });

  const c1 = await prisma.comerciante.create({
    data: {
      usuarioId: u1.id,
      nombre: "Elena Rodriguez",
      descripcion:
        '"Vendo ropa americana seleccionada desde 2020. Me especializo en prendas vintage y de alta calidad para toda la familia en Palpalá."',
      whatsapp: "3881111111",
      tipoUbicacion: "puesto_fijo",
      ubicacion: "Puesto 12 — Feria del Sur",
      dias: "Miércoles, Sábados",
      horario: "08:00 - 14:00",
      slug: "elena-rodriguez",
    },
  });

  await prisma.comercianteFeria.create({
    data: {
      comercianteId: c1.id,
      feriaId: feriaSur.id,
      puesto: "Puesto 12",
    },
  });

  await prisma.comercianteFeria.create({
    data: {
      comercianteId: c1.id,
      feriaId: feriaMunicipal.id,
      puesto: "Puesto 5",
    },
  });

  const u2 = await prisma.usuario.create({
    data: {
      telefono: "3882222222",
      pinHash: pin,
      nombre: "Don Jorge",
      rol: "comerciante",
    },
  });

  const c2 = await prisma.comerciante.create({
    data: {
      usuarioId: u2.id,
      nombre: "Don Jorge",
      descripcion:
        "Artesano en cuero. Hago cinturones, billeteras y carteras 100% artesanales.",
      whatsapp: "3882222222",
      tipoUbicacion: "puesto_fijo",
      ubicacion: "Local 4 — Feria Municipal",
      dias: "Sábados",
      horario: "08:00 - 13:00",
      slug: "don-jorge",
    },
  });

  await prisma.comercianteFeria.create({
    data: {
      comercianteId: c2.id,
      feriaId: feriaMunicipal.id,
      puesto: "Local 4",
    },
  });

  const u3 = await prisma.usuario.create({
    data: {
      telefono: "3883333333",
      pinHash: pin,
      nombre: "Creaciones Ana",
      rol: "comerciante",
    },
  });

  const c3 = await prisma.comerciante.create({
    data: {
      usuarioId: u3.id,
      nombre: "Creaciones Ana",
      descripcion:
        "Tejidos y ropa de niños hechos a mano con mucho amor.",
      whatsapp: "3883333333",
      tipoUbicacion: "ambulante",
      ubicacion: "Feria Central — Sábados",
      dias: "Sábados",
      horario: "09:00 - 14:00",
      slug: "creaciones-ana",
    },
  });

  await prisma.comercianteFeria.create({
    data: {
      comercianteId: c3.id,
      feriaId: feriaMunicipal.id,
    },
  });
  console.log("✅ Comerciantes de ejemplo creados");

  // ─── Productos de ejemplo ───
  const catMujer = await prisma.categoria.findUnique({
    where: { nombre: "Ropa Mujer" },
  });
  const catHombre = await prisma.categoria.findUnique({
    where: { nombre: "Ropa Hombre" },
  });
  const catNinos = await prisma.categoria.findUnique({
    where: { nombre: "Niños" },
  });
  const catZapatos = await prisma.categoria.findUnique({
    where: { nombre: "Zapatos" },
  });
  const catAcc = await prisma.categoria.findUnique({
    where: { nombre: "Accesorios" },
  });

  // Productos de Elena
  await prisma.producto.create({
    data: {
      comercianteId: c1.id,
      categoriaId: catMujer!.id,
      titulo: "Remera Vintage '90s",
      descripcion: "Remera negra original de los 90s, excelente estado. Estampado retro.",
      precio: 4500,
      talle: "L",
      tipo: "usado",
      stock: 1,
      aceptaTrueque: true,
      buscaCambio: "Busco jean talle 42 o remera talle XL",
      fotos: "[]",
    },
  });

  await prisma.producto.create({
    data: {
      comercianteId: c1.id,
      categoriaId: catMujer!.id,
      titulo: "Jean Levi's Original",
      descripcion: "Jean Levi's 501 original, comprado en lote americano. Talle 42.",
      precio: 12000,
      talle: "42",
      tipo: "nuevo",
      stock: 3,
      fotos: "[]",
    },
  });

  await prisma.producto.create({
    data: {
      comercianteId: c1.id,
      categoriaId: catMujer!.id,
      titulo: "Campera de Lana",
      descripcion: "Campera de lana tejida, muy abrigada. Color gris. Talle M.",
      precio: 18500,
      talle: "M",
      tipo: "usado",
      stock: 1,
      disponibleEnDomicilio: true,
      fotos: "[]",
    },
  });

  // Productos de Don Jorge
  await prisma.producto.create({
    data: {
      comercianteId: c2.id,
      categoriaId: catAcc!.id,
      titulo: "Cinturón de Cuero Artesanal",
      descripcion: "Cinturón de cuero vacuno 100% artesanal. Hebilla de bronce.",
      precio: 8500,
      talle: "Único (regulable)",
      tipo: "nuevo",
      stock: 5,
      disponibleEnDomicilio: true,
      fotos: "[]",
    },
  });

  await prisma.producto.create({
    data: {
      comercianteId: c2.id,
      categoriaId: catAcc!.id,
      titulo: "Billetera de Cuero",
      descripcion: "Billetera artesanal con 8 compartimientos. Cuero vacuno.",
      precio: 6500,
      tipo: "nuevo",
      stock: 4,
      disponibleEnDomicilio: true,
      fotos: "[]",
    },
  });

  // Productos de Ana
  await prisma.producto.create({
    data: {
      comercianteId: c3.id,
      categoriaId: catNinos!.id,
      titulo: "Conjunto Tejido Bebé",
      descripcion: "Conjunto de saco + pantalón tejido a mano. Talle 6-12 meses.",
      precio: 7500,
      talle: "6-12 meses",
      tipo: "nuevo",
      stock: 2,
      disponibleEnDomicilio: true,
      fotos: "[]",
    },
  });

  await prisma.producto.create({
    data: {
      comercianteId: c3.id,
      categoriaId: catNinos!.id,
      titulo: "Gorro de Lana con Pompón",
      descripcion: "Gorro tejido de lana, bien abrigado. Varios colores.",
      precio: 2500,
      talle: "Único",
      tipo: "nuevo",
      stock: 6,
      aceptaTrueque: true,
      buscaCambio: "Cambio por juguetes didácticos",
      disponibleEnDomicilio: true,
      fotos: "[]",
    },
  });
  console.log("✅ Productos de ejemplo creados");

  console.log("\n🎉 FerIA seed completado!");
  console.log("📱 Admin: 3880000000 / PIN: 123456");
  console.log("📱 Comerciantes: 3881111111, 3882222222, 3883333333 / PIN: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
