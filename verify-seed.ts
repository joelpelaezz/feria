import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });

  console.log("🏪 Ferias:", (await prisma.feria.count()));
  console.log("👥 Comerciantes:", (await prisma.comerciante.count()));
  console.log("📦 Productos:", (await prisma.producto.count()));
  console.log("📂 Categorías:", (await prisma.categoria.count()));
  console.log("👤 Usuarios:", (await prisma.usuario.count()));
  console.log("🔗 Relaciones Feria-Comerciante:", (await prisma.comercianteFeria.count()));

  const comerciantes = await prisma.comerciante.findMany({ include: { usuario: true, productos: true, ferias: { include: { feria: true } } } });
  for (const c of comerciantes) {
    console.log(`\n--- ${c.nombre} (${c.usuario.telefono}) ---`);
    console.log(`  WhatsApp: ${c.whatsapp}`);
    console.log(`  Ubicación: ${c.ubicacion}`);
    console.log(`  Ferias: ${c.ferias.map(f => f.feria.nombre).join(", ")}`);
    console.log(`  Productos (${c.productos.length}):`);
    for (const p of c.productos) {
      console.log(`    - ${p.titulo} $${p.precio} (${p.tipo}, stock: ${p.stock})${p.aceptaTrueque ? " 🔄": ""}`);
    }
  }

  await prisma.$disconnect();
}
main().catch(console.error);
