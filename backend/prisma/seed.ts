import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.game.deleteMany()
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
      score: 44,
      friendIds: [2, 4, 5, 7],
    },
  });
  const bob = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Bob",
      status: "OFFLINE",
      score: 22,
      friendIds: [2, 6, 5]
    },
  });
  const tom = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Tom",
      status: "OFFLINE",
      score: 3,
      friendIds: [2, 4, 5]
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
      status: "OFFLINE",
      image: "https://imageresizer.static9.net.au/TIEZnRR7cK4eRYkoO-Z2mbWolB0=/0x93:1812x1905/400x0/https%3A%2F%2Fprod.static9.net.au%2Ffs%2F42a3eb1e-2a8a-46c7-a342-fb2fa175671a"

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
      status: "OFFLINE",
      image: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/twilight-jacob-1626228957.png?crop=0.752xw:1.00xh;0.250xw,0&resize=480:*"

    },
  });

  
  const tphung = await prisma.user.upsert({
    where: { id: 73725 },
    update: {},
    create: {
      id: 73725,
      name: "tphung",
      status: "OFFLINE"
    },
  });

  const ddiakova = await prisma.user.upsert({
    where: { id: 74587 },
    update: {},
    create: {
      id: 74587,
      name: "ddiakova",
      status: "OFFLINE",
      image:"https://cdn.intra.42.fr/users/202255b82453593a913e7b6a0ee2f2d0/ddiakova.jpg",
      friendIds: [5, 73725, 9, 8, 7, 6],
      bannedIds: [2, 4, 73725, 7]
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

  await prisma.game.upsert({
    where: { id: 131 },
    update: {},
    create: {
      id: 131,
      winnerId: 74587,
      winnerScore: 11,
      loserId: 2,
      loserScore: 2
    },
  })

  await prisma.game.upsert({
    where: { id: 132 },
    update: {},
    create: {
      id: 132,
      winnerId: 74587,
      winnerScore: 11,
      loserId: 3,
      loserScore: 4
    },
  })

  await prisma.game.upsert({
    where: { id: 133 },
    update: {},
    create: {
      id: 133,
      winnerId: 3,
      winnerScore: 13,
      loserId: 74587,
      loserScore: 5
    },
  })

  await prisma.game.upsert({
    where: { id: 522 },
    update: {},
    create: {
      id: 522,
      winnerId: 2,
      winnerScore: 10,
      loserId: 1,
      loserScore: 5
    },
  })
  await prisma.game.upsert({
    where: { id: 1321 },
    update: {},
    create: {
      id: 1321,
      winnerId: 74587,
      winnerScore: 11,
      loserId: 3,
      loserScore: 4
    },
  })

  await prisma.game.upsert({
    where: { id: 1332 },
    update: {},
    create: {
      id: 1332,
      winnerId: 3,
      winnerScore: 13,
      loserId: 74587,
      loserScore: 5
    },
  })

  await prisma.game.upsert({
    where: { id: 5223 },
    update: {},
    create: {
      id: 5223,
      winnerId: 2,
      winnerScore: 10,
      loserId: 1,
      loserScore: 5
    },
  })

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
