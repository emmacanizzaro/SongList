const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Cambia este ID por el de tu iglesia
const churchId = "cmnroec8m00021d0fwo2tgue6"; // Centro Cristiano Río Grande

async function main() {
  const result = await prisma.subscription.upsert({
    where: { churchId },
    update: {
      plan: "PRO",
      status: "ACTIVE",
      cancelAtPeriodEnd: false,
    },
    create: {
      churchId,
      plan: "PRO",
      status: "ACTIVE",
      cancelAtPeriodEnd: false,
    },
  });
  console.log("¡Upgrade a PRO realizado! Estado actual:", result);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("ERROR:", e);
    prisma.$disconnect();
    process.exit(1);
  });
