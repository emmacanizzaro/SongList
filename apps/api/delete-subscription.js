import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ID de la iglesia a limpiar
const churchId = 'cmnroec8m0021d0fwo2tgue6'

async function main() {
  const deleted = await prisma.subscription.deleteMany({ where: { churchId } })
  console.log(`Suscripciones eliminadas para churchId ${churchId}:`, deleted.count)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('ERROR:', e)
    prisma.$disconnect()
    process.exit(1)
  })
