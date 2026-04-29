const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cambia estos valores por los de tu iglesia
const churchId = "cmnroec8m0021d0fwo2tgue6";
const name = "Centro Cristiano Río Grande";
const slug = "centro-cristiano-rio-grande";

async function main() {
  const church = await prisma.church.upsert({
    where: { id: churchId },
    update: { name, slug },
    create: {
      id: churchId,
      name,
      slug,
      timezone: "America/Argentina/Buenos_Aires",
      description: "Iglesia creada manualmente para upgrade",
    },
  });
  console.log("Iglesia creada o actualizada:", church);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("ERROR:", e);
    prisma.$disconnect();
    process.exit(1);
  });
