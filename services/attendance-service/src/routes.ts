/**
 * 📋 Attendance Routes
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const attendanceRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// GET /api/classes/:classId/attendance
attendanceRoutes.get('/:classId/attendance', async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.attendanceSession.findMany({
            where: { classId: req.params.classId },
            include: { records: true },
            orderBy: { date: 'desc' },
        })
        return res.json(sessions)
    } catch (error) {
        console.error('Get attendance error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes/:classId/attendance
attendanceRoutes.post('/:classId/attendance', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { title, durationMinutes } = req.body

        let code = generateCode()
        let exists = await prisma.attendanceSession.findUnique({ where: { code } })
        while (exists) {
            code = generateCode()
            exists = await prisma.attendanceSession.findUnique({ where: { code } })
        }

        const expiresAt = new Date(Date.now() + (durationMinutes || 15) * 60000)

        const session = await prisma.attendanceSession.create({
            data: { classId: req.params.classId, title, code, expiresAt },
        })

        return res.json(session)
    } catch (error) {
        console.error('Create attendance error:', error)
        return res.status(500).json({ error: 'Không thể tạo phiên điểm danh' })
    }
})

// DELETE /api/classes/:classId/attendance/:sessionId
attendanceRoutes.delete('/:classId/attendance/:sessionId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.attendanceSession.delete({ where: { id: req.params.sessionId } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Delete attendance error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// PATCH /api/classes/:classId/attendance/:sessionId
attendanceRoutes.patch('/:classId/attendance/:sessionId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { title } = req.body
        const updated = await prisma.attendanceSession.update({
            where: { id: req.params.sessionId },
            data: { title },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update attendance error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes/:classId/attendance/:sessionId/records
attendanceRoutes.post('/:classId/attendance/:sessionId/records', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { userId, status, isManual } = req.body

        const record = await prisma.attendanceRecord.upsert({
            where: { sessionId_userId: { sessionId: req.params.sessionId, userId } },
            update: { status, isManual: isManual || false },
            create: { sessionId: req.params.sessionId, userId, status, isManual: isManual || false },
        })

        return res.json(record)
    } catch (error) {
        console.error('Update record error:', error)
        return res.status(500).json({ error: 'Không thể cập nhật điểm danh' })
    }
})
