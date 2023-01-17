import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany()
  await prisma.message.deleteMany()
  await prisma.channel.deleteMany()
  const alice = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Alice",
      status: "OFFLINE"
    },
  });
  const bob = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Bob",
      status: "OFFLINE"
    },
  });
  const tom = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Tom",
      status: "OFFLINE"
    },
  });
  const banned = await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: "banned",
      status: "OFFLINE"
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
  const another = await prisma.channel.upsert({
    where: { name: "another" },
    update: {},
    create: {
      name: "another",
      ownerId: 0,
    },
    include: {
      guests: true,
    },
  });

  const users = await prisma.user.findMany({
    include: { channels: true },
  });
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
    await prisma.channel.update({
      where: { name: another.name },
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
  await prisma.channel.update({
    where: {
      name: "another",
    },
    data: {
      mutedIds: {
        push: 4,
      },
    },
  })
  console.log(await prisma.channel.findUnique({
    where : {
      name : "main"
    },
    include : {
      guests : true,
    }
  }));
  console.log(await prisma.channel.findUnique({
    where : {
      name : "another"
    },
    include : {
      guests : true,
    }
  }));
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
