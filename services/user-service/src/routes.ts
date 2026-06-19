/**
 * 👤 User Service - Routes
 * =========================
 * POST /api/users/sync  - Đồng bộ/tạo user từ Clerk
 * GET  /api/users/me     - Lấy thông tin user hiện tại
 * GET  /api/users/:id    - Lấy user theo ID
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const userRoutes = Router()

// POST /sync - Đồng bộ user từ Clerk (tạo mới nếu chưa có)
userRoutes.post('/sync', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        const email = req.body.email || (req.headers['x-user-email'] as string)
        const name = req.body.name || (req.headers['x-user-name'] as string) || ''

        if (!clerkId) {
            return res.status(401).json({ error: 'Chưa đăng nhập' })
        }

        // Tìm hoặc tạo user
        let user = await prisma.user.findUnique({ where: { clerkId } })

        if (!user) {
            // Thử tìm theo email (migration)
            user = await prisma.user.findUnique({ where: { email } })
            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { clerkId },
                })
            } else {
                user = await prisma.user.create({
                    data: { clerkId, email, name: name || email.split('@')[0] },
                })
            }
        } else {
            // Sync name nếu thay đổi
            if (name && name !== user.name) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { name },
                })
            }
        }

        return res.json({
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
        })
    } catch (error) {
        console.error('User sync error:', error)
        return res.status(500).json({ error: 'Không thể đồng bộ user' })
    }
})

// GET /me - Lấy thông tin user hiện tại
userRoutes.get('/me', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string

        if (!clerkId) {
            return res.status(401).json({ error: 'Chưa đăng nhập' })
        }

        const user = await prisma.user.findUnique({ where: { clerkId } })

        if (!user) {
            return res.status(404).json({ error: 'User chưa được đồng bộ' })
        }

        return res.json({
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
        })
    } catch (error) {
        console.error('Get user error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// GET /:id - Lấy user theo ID
userRoutes.get('/:id', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, name: true, email: true },
        })

        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy user' })
        }

        return res.json(user)
    } catch (error) {
        console.error('Get user by id error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
