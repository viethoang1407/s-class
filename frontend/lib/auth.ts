import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getCurrentUser() {
    const { userId } = await auth()

    if (!userId) {
        return null
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
        return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
        return null
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    })

    if (!dbUser) {
        // Try to find by email (for migration)
        dbUser = await prisma.user.findUnique({
            where: { email },
        })

        if (dbUser) {
            // Update existing user with clerkId
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { clerkId: userId },
            })
        } else {
            // Create new user
            dbUser = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0],
                },
            })
        }
    } else {
        // Sync name from Clerk if changed
        const clerkName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
        if (clerkName && clerkName !== dbUser.name) {
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { name: clerkName },
            })
        }
    }

    return {
        id: dbUser.id,
        clerkId: userId,
        email: dbUser.email,
        name: dbUser.name,
    }
}

export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    return user
}

// Generate unique 6-character class code
export async function generateClassCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let code: string
    let exists = true

    while (exists) {
        code = ''
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        const existingClass = await prisma.class.findUnique({
            where: { code },
        })
        exists = !!existingClass
    }

    return code!
}
