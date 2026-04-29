const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const churches = await prisma.church.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log("Iglesias registradas:");
  churches.forEach((c) =>
    console.log(`ID: ${c.id} | Nombre: ${c.name} | Slug: ${c.slug}`),
  );
}

main().finally(() => prisma.$disconnect());
