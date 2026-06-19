/**
 * 👥 Member Routes - Quản lý thành viên lớp
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const memberRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// PATCH /api/classes/:classId/members/:memberId - Cập nhật thành viên (đổi tên/duyệt)
memberRoutes.patch('/:classId/members/:memberId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { displayName, status } = req.body
        const updateData: any = {}
        if (displayName !== undefined) updateData.displayName = displayName?.trim() || null
        if (status !== undefined) updateData.status = status

        await prisma.classMember.update({
            where: { id: req.params.memberId },
            data: updateData,
        })

        return res.json({ success: true })
    } catch (error) {
        console.error('Update member error:', error)
        return res.status(500).json({ error: 'Không thể cập nhật' })
    }
})

// POST /api/classes/:classId/members/:memberId/approve - Duyệt thành viên
memberRoutes.post('/:classId/members/:memberId/approve', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.classMember.update({
            where: { id: req.params.memberId },
            data: { status: 'approved' },
        })

        return res.json({ success: true })
    } catch (error) {
        console.error('Approve member error:', error)
        return res.status(500).json({ error: 'Không thể duyệt' })
    }
})

// DELETE /api/classes/:classId/members/:memberId - Xóa thành viên
memberRoutes.delete('/:classId/members/:memberId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.classMember.delete({ where: { id: req.params.memberId } })

        return res.json({ success: true })
    } catch (error) {
        console.error('Delete member error:', error)
        return res.status(500).json({ error: 'Không thể xóa' })
    }
})
