const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.subscription.findMany();
  console.log(subs);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("ERROR:", e);
    prisma.$disconnect();
    process.exit(1);
  });
