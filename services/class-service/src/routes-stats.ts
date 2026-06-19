/**
 * 📈 Stats Routes - Thống kê lớp
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const statsRoutes = Router()

// GET /api/classes/:classId/stats
statsRoutes.get('/:classId/stats', async (req: Request, res: Response) => {
    try {
        const classData = await prisma.class.findUnique({
            where: { id: req.params.classId },
            include: { members: true },
        })

        if (!classData) return res.status(404).json({ error: 'Không tìm thấy lớp' })

        const totalStudents = classData.members.length

        return res.json({
            totalStudents,
            totalQuizzes: 0,
            averageScore: 0,
            attendanceRate: 0,
            topStudents: [],
            quizStats: [],
        })
    } catch (error) {
        console.error('Stats error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
