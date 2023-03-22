import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.game.deleteMany()
  await prisma.user.deleteMany()
  await prisma.message.deleteMany()
  await prisma.channel.deleteMany()
 
  const mainChannel = await prisma.channel.upsert({
    where: { name: "main" },
    update: {},
    create: {
      name: "main",
      ownerId: 0,
    },
    include: {
      guests: true,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
