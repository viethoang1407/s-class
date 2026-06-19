/**
 * 📢 Announcement Routes
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const announcementRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// GET /api/classes/:classId/announcements
announcementRoutes.get('/:classId/announcements', async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { classId: req.params.classId },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(announcements)
    } catch (error) {
        console.error('Get announcements error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes/:classId/announcements
announcementRoutes.post('/:classId/announcements', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { ownerId: true },
        })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Không có quyền' })

        const { title, content, link, linkTitle } = req.body
        const announcement = await prisma.announcement.create({
            data: { classId: req.params.classId, authorId: user.id, title, content, link, linkTitle },
        })

        return res.json(announcement)
    } catch (error) {
        console.error('Create announcement error:', error)
        return res.status(500).json({ error: 'Không thể tạo thông báo' })
    }
})

// DELETE /api/classes/:classId/announcements?id=xxx
announcementRoutes.delete('/:classId/announcements', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const id = req.query.id as string
        if (!id) return res.status(400).json({ error: 'Thiếu id' })

        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { ownerId: true },
        })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Không có quyền' })

        await prisma.announcement.delete({ where: { id } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Delete announcement error:', error)
        return res.status(500).json({ error: 'Không thể xóa' })
    }
})
