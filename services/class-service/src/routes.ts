/**
 * 📚 Class Routes - CRUD lớp học
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const classRoutes = Router()

// Helper: lấy user từ Clerk ID (từ gateway headers)
async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// Helper: generate class code
async function generateClassCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code: string
    let exists = true

    while (exists) {
        code = ''
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        const existingClass = await prisma.class.findUnique({ where: { code } })
        exists = !!existingClass
    }
    return code!
}

// GET /api/classes - Danh sách lớp
classRoutes.get('/', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const ownedClasses = await prisma.class.findMany({
            where: { ownerId: user.id },
            include: {
                _count: {
                    select: {
                        members: { where: { status: 'approved' } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const joinedClasses = await prisma.classMember.findMany({
            where: { userId: user.id },
            include: {
                class: {
                    include: {
                        owner: { select: { name: true } },
                        _count: {
                            select: { members: { where: { status: 'approved' } } },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        })

        return res.json({ ownedClasses, joinedClasses })
    } catch (error) {
        console.error('Error fetching classes:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes - Tạo lớp mới
classRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const { name, description } = req.body

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Tên lớp không hợp lệ' })
        }

        const code = await generateClassCode()

        const newClass = await prisma.class.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                code,
                ownerId: user.id,
            },
        })

        return res.json({ id: newClass.id, name: newClass.name, code: newClass.code })
    } catch (error) {
        console.error('Error creating class:', error)
        return res.status(500).json({ error: 'Không thể tạo lớp học' })
    }
})

// GET /api/classes/:classId - Chi tiết lớp
classRoutes.get('/:classId', async (req: Request, res: Response) => {
    try {
        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            include: {
                owner: { select: { id: true, name: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { members: true } },
            },
        })

        if (!classData) {
            return res.status(404).json({ error: 'Không tìm thấy lớp' })
        }

        return res.json(classData)
    } catch (error) {
        console.error('Get class error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// PATCH /api/classes/:classId - Cập nhật lớp
classRoutes.patch('/:classId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { ownerId: true },
        })

        if (!classData) return res.status(404).json({ error: 'Không tìm thấy lớp' })
        if (classData.ownerId !== user.id) return res.status(403).json({ error: 'Không có quyền' })

        const { name, description } = req.body
        const updated = await prisma.class.update({
            where: { id: req.params.classId },
            data: {
                name: name?.trim() || undefined,
                description: description?.trim() || null,
            },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update class error:', error)
        return res.status(500).json({ error: 'Không thể cập nhật lớp' })
    }
})

// DELETE /api/classes/:classId - Xóa lớp
classRoutes.delete('/:classId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            select: { ownerId: true, name: true },
        })

        if (!classData) return res.status(404).json({ error: 'Không tìm thấy lớp' })
        if (classData.ownerId !== user.id) return res.status(403).json({ error: 'Không có quyền' })

        await prisma.class.delete({ where: { id: req.params.classId } })

        return res.json({ success: true, message: `Đã xóa lớp "${classData.name}"` })
    } catch (error) {
        console.error('Delete class error:', error)
        return res.status(500).json({ error: 'Không thể xóa lớp' })
    }
})

// POST /api/classes/join - Tham gia lớp
classRoutes.post('/join', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const { code } = req.body

        if (!code || typeof code !== 'string' || code.length !== 6) {
            return res.status(400).json({ error: 'Mã lớp không hợp lệ' })
        }

        const cleanCode = code.toUpperCase()
        const classToJoin = await prisma.class.findUnique({ where: { code: cleanCode } })

        if (!classToJoin) return res.status(404).json({ error: 'Không tìm thấy lớp với mã này' })
        if (classToJoin.ownerId === user.id) return res.status(400).json({ error: 'Bạn là chủ lớp này' })

        const existingMembership = await prisma.classMember.findUnique({
            where: { classId_userId: { classId: classToJoin.id, userId: user.id } },
        })

        if (existingMembership) {
            if (existingMembership.status === 'pending') {
                return res.status(400).json({ error: 'Đang trong phòng chờ' })
            }
            return res.status(400).json({ error: 'Đã là thành viên' })
        }

        await prisma.classMember.create({
            data: { classId: classToJoin.id, userId: user.id, status: 'pending' },
        })

        return res.json({
            success: true,
            pending: true,
            classId: classToJoin.id,
            className: classToJoin.name,
            message: 'Yêu cầu đã được gửi!',
        })
    } catch (error) {
        console.error('Join class error:', error)
        return res.status(500).json({ error: 'Không thể tham gia lớp' })
    }
})

// DELETE /api/classes/:classId/leave - Rời lớp
classRoutes.delete('/:classId/leave', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const membership = await prisma.classMember.findFirst({
            where: { classId: req.params.classId, userId: user.id },
        })

        if (!membership) return res.status(404).json({ error: 'Không tìm thấy' })

        await prisma.classMember.delete({ where: { id: membership.id } })

        return res.json({ success: true })
    } catch (error) {
        console.error('Leave class error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
