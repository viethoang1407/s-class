/**
 * 📄 Document Routes
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const documentRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// GET /api/classes/:classId/documents
documentRoutes.get('/:classId/documents', async (req: Request, res: Response) => {
    try {
        const documents = await prisma.document.findMany({
            where: { classId: req.params.classId },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(documents)
    } catch (error) {
        console.error('Get documents error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes/:classId/documents
documentRoutes.post('/:classId/documents', async (req: Request, res: Response) => {
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

        const { title, description, fileName, fileUrl, fileType, fileSize } = req.body
        const document = await prisma.document.create({
            data: { classId: req.params.classId, uploaderId: user.id, title, description, fileName, fileUrl, fileType, fileSize },
        })

        return res.json(document)
    } catch (error) {
        console.error('Create document error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// DELETE /api/classes/:classId/documents?id=xxx
documentRoutes.delete('/:classId/documents', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const documentId = req.query.id as string
        if (!documentId) return res.status(400).json({ error: 'Thiếu ID' })

        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { ownerId: true },
        })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Không có quyền' })

        await prisma.document.delete({ where: { id: documentId } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Delete document error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
