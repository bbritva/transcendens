import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const alice = await prisma.user.upsert({
    where: { id: 123 },
    update: {},
    create: {
      id: 123,
      name: "Alice",
    },
  });
  const bob = await prisma.user.upsert({
    where: { id: 321 },
    update: {},
    create: {
      id: 321,
      name: "Bob",
    },
  });
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
  const users = await prisma.user.findMany({
    include: { channels: true },
  });
  console.log(mainChannel);
  users.forEach(async (user) => {
    await prisma.channel.update({
      where: { name: mainChannel.name },
      data: {
        guests: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        guests: true,
      },
    });
  });
  console.log(mainChannel);
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
