/**
 * 📊 Dashboard Routes
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const dashboardRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// GET /api/dashboard
dashboardRoutes.get('/', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const ownedClasses = await prisma.class.findMany({
            where: { ownerId: user.id },
            include: { members: true },
        })

        const totalClasses = ownedClasses.length
        const totalStudents = ownedClasses.reduce((sum, c) => sum + c.members.length, 0)

        return res.json({
            totalClasses,
            totalStudents,
            totalQuizzes: 0,
            averageAttendance: 0,
            topStudents: [],
            recentQuizzes: [],
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
