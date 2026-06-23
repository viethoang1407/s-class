/**
 * 📊 Grade Routes - Điểm, môn học, thành phần điểm
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const gradeRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// ==================== SUBJECTS ====================

// POST /api/classes/:classId/subjects
gradeRoutes.post('/:classId/subjects', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { name } = req.body
        const subject = await prisma.subject.create({
            data: { classId: req.params.classId, name: name.trim() },
        })

        return res.json(subject)
    } catch (error) {
        console.error('Create subject error:', error)
        return res.status(500).json({ error: 'Không thể thêm môn học' })
    }
})

// PATCH /api/classes/:classId/subjects/:subjectId
gradeRoutes.patch('/:classId/subjects/:subjectId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { name } = req.body
        const updated = await prisma.subject.update({
            where: { id: req.params.subjectId },
            data: { name },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update subject error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// DELETE /api/classes/:classId/subjects/:subjectId
gradeRoutes.delete('/:classId/subjects/:subjectId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.subject.delete({ where: { id: req.params.subjectId } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Delete subject error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// ==================== GRADES ====================

// POST /api/classes/:classId/grades
gradeRoutes.post('/:classId/grades', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { studentId, subjectId, componentId, score } = req.body

        const numericScore = parseFloat(score)
        if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
            return res.status(400).json({ error: 'Điểm chỉ được từ 0 đến 10' })
        }

        const grade = await prisma.grade.upsert({
            where: {
                classId_subjectId_componentId_userId: {
                    classId: req.params.classId, subjectId, componentId, userId: studentId,
                },
            },
            update: { score: numericScore },
            create: { classId: req.params.classId, subjectId, componentId, userId: studentId, score: numericScore },
        })

        return res.json(grade)
    } catch (error) {
        console.error('Save grade error:', error)
        return res.status(500).json({ error: 'Không thể lưu điểm' })
    }
})

// ==================== GRADE COMPONENTS ====================

// POST /api/classes/:classId/subjects/:subjectId/components
gradeRoutes.post('/:classId/subjects/:subjectId/components', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { name, weight } = req.body

        // Get current grade components for the subject to perform validation
        const currentComponents = await prisma.gradeComponent.findMany({
            where: { subjectId: req.params.subjectId },
        })

        const hasWeightedComponents = currentComponents.some((c) => c.weight !== null && c.weight !== undefined && c.weight > 0)
        const hasDefaultComponents = currentComponents.some((c) => c.weight === null || c.weight === undefined)

        const newWeightVal = weight ? parseFloat(weight) : null

        if (hasWeightedComponents && (newWeightVal === null || newWeightVal <= 0)) {
            return res.status(400).json({ error: 'Môn học này đang tính theo trọng số. Vui lòng chọn trọng số (%) cho đầu điểm này.' })
        }

        if (hasDefaultComponents && newWeightVal !== null && newWeightVal > 0) {
            return res.status(400).json({ error: 'Môn học này đang dùng đầu điểm mặc định (trung bình cộng). Không thể thêm đầu điểm có trọng số %.' })
        }

        if (newWeightVal !== null && newWeightVal > 0) {
            const currentTotalWeight = currentComponents.reduce((acc, c) => acc + (c.weight || 0), 0)
            if (currentTotalWeight + newWeightVal > 100) {
                return res.status(400).json({ error: `Tổng trọng số các đầu điểm không được vượt quá 100% (Hiện tại: ${currentTotalWeight}%)` })
            }
        }
        const component = await prisma.gradeComponent.create({
            data: {
                classId: req.params.classId,
                subjectId: req.params.subjectId,
                name: name.trim(),
                weight: weight || null,
            },
        })

        return res.json(component)
    } catch (error) {
        console.error('Create component error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// DELETE /api/classes/:classId/subjects/:subjectId/components/:componentId
gradeRoutes.delete('/:classId/subjects/:subjectId/components/:componentId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.gradeComponent.delete({ where: { id: req.params.componentId } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Delete component error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
