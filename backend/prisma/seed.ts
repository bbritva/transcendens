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
      status: "OFFLINE",
      score: 44
    },
  });
  const bob = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Bob",
      status: "OFFLINE",
      score: 22
    },
  });
  const tom = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Tom",
      status: "OFFLINE",
      score: 3
    },
  });
  const banned = await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: "banned",
      status: "OFFLINE",
      score: 17
    },
  });

  const tom2 = await prisma.user.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      name: "Tom2",
      status: "OFFLINE"
    },
  });

  const tom3
   = await prisma.user.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      name: "Tom3",
      status: "OFFLINE"
    },
  });

  const tom7 = await prisma.user.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      name: "Tom7",
      status: "OFFLINE"
    },
  });

  const tom8 = await prisma.user.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      name: "Tom8",
      status: "OFFLINE"
    },
  });

  const tom9 = await prisma.user.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      name: "Tom9",
      status: "OFFLINE"
    },
  });

  const tom10 = await prisma.user.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: "Tom10",
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
      ownerId: 2,
      admIds: [2,1],
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
