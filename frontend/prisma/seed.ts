import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // With Clerk, we don't need to seed users
    // Users are created automatically when they sign up via Clerk

    console.log('Database seeded successfully!')
    console.log('Users will be created automatically via Clerk authentication.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
