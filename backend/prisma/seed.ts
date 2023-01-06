import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const alice = await prisma.user.upsert({
        where: { id: 123 },
        update: {},
        create: {
            id: 123,
            name: 'Alice',
        },
    })
    const bob = await prisma.user.upsert({
        where: { id: 321 },
        update: {},
        create: {
            id: 321,
            name: 'Bob',
        },
    })
    console.log({ alice, bob })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })