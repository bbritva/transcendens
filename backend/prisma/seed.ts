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
  console.log({ alice, bob });
  const mainChannel = await prisma.channel.upsert({
    where: { name: "main" },
    update: {},
    create: {
      name: "main",
      ownerId: 0,
    },
  });
  (await prisma.user.findMany({ select: { id: true } })).forEach(async (userId) => {
    if (!mainChannel.guestIds.includes(userId.id)) {
      const chan = await prisma.channel.update({
        where: { name: "main" },
        data: { guestIds: { push: userId.id } },
      });
    }
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
