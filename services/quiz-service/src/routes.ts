/**
 * 📝 Quiz Routes - CRUD + Submit + Analytics
 */

import { Router, Request, Response } from 'express'
import { prisma } from './prisma'

export const quizRoutes = Router()

async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } })
}

// GET /api/classes/:classId/quizzes - Danh sách quiz
quizRoutes.get('/:classId/quizzes', async (req: Request, res: Response) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { classId: req.params.classId },
            include: { _count: { select: { questions: true, submissions: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return res.json(quizzes)
    } catch (error) {
        console.error('Error fetching quizzes:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// POST /api/classes/:classId/quizzes - Tạo quiz
quizRoutes.post('/:classId/quizzes', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        const { title, description, openAt, dueAt, durationMinutes, questions } = req.body

        if (!title || !openAt || !dueAt) return res.status(400).json({ error: 'Thiếu thông tin' })
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'Cần ít nhất 1 câu hỏi' })
        }

        const quiz = await prisma.quiz.create({
            data: {
                classId: req.params.classId,
                title, description,
                openAt: new Date(openAt),
                dueAt: new Date(dueAt),
                durationMinutes: durationMinutes || null,
                isPublished: false,
                questions: {
                    create: questions.map((q: any, index: number) => ({
                        content: q.content, options: q.options,
                        correctOption: q.correctOption, points: q.points || 1, orderIndex: index,
                    })),
                },
            },
        })

        return res.json({ id: quiz.id, title: quiz.title })
    } catch (error) {
        console.error('Error creating quiz:', error)
        return res.status(500).json({ error: 'Không thể tạo quiz' })
    }
})

// GET /api/classes/:classId/quizzes/:quizId - Chi tiết quiz (để làm bài)
quizRoutes.get('/:classId/quizzes/:quizId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        // Check access
        const membership = await prisma.classMember.findFirst({
            where: { classId: req.params.classId, userId: user.id },
        })
        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })

        if (!membership && classData?.ownerId !== user.id) {
            return res.status(403).json({ error: 'Không có quyền truy cập' })
        }

        // Check submitted
        const existingSubmission = await prisma.quizSubmission.findFirst({
            where: { quizId: req.params.quizId, userId: user.id },
        })

        if (existingSubmission) {
            return res.json({
                alreadySubmitted: true,
                submission: { score: existingSubmission.score, totalPoints: existingSubmission.totalPoints },
            })
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.quizId },
            include: {
                questions: {
                    select: { id: true, content: true, options: true, points: true, orderIndex: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        })

        if (!quiz) return res.status(404).json({ error: 'Quiz không tồn tại' })
        if (!quiz.isPublished) return res.status(400).json({ error: 'Quiz chưa được công bố' })

        const now = new Date()
        if (now < quiz.openAt) return res.status(400).json({ error: 'Quiz chưa mở' })
        if (now > quiz.dueAt) return res.status(400).json({ error: 'Quiz đã đóng' })

        return res.json({ quiz })
    } catch (error) {
        console.error('Error fetching quiz:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// DELETE /api/classes/:classId/quizzes/:quizId
quizRoutes.delete('/:classId/quizzes/:quizId', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.quiz.delete({ where: { id: req.params.quizId } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Error deleting quiz:', error)
        return res.status(500).json({ error: 'Không thể xóa quiz' })
    }
})

// POST /api/classes/:classId/quizzes/:quizId/publish
quizRoutes.post('/:classId/quizzes/:quizId/publish', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const classData = await prisma.class.findUnique({ where: { id: req.params.classId } })
        if (!classData || classData.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' })

        await prisma.quiz.update({ where: { id: req.params.quizId }, data: { isPublished: true } })
        return res.json({ success: true })
    } catch (error) {
        console.error('Error publishing quiz:', error)
        return res.status(500).json({ error: 'Không thể công bố quiz' })
    }
})

// POST /api/classes/:classId/quizzes/:quizId/submit
quizRoutes.post('/:classId/quizzes/:quizId/submit', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const { answers } = req.body

        const membership = await prisma.classMember.findFirst({
            where: { classId: req.params.classId, userId: user.id },
        })
        if (!membership) return res.status(403).json({ error: 'Không có quyền' })

        const existing = await prisma.quizSubmission.findFirst({
            where: { quizId: req.params.quizId, userId: user.id },
        })
        if (existing) return res.status(400).json({ error: 'Đã nộp bài rồi' })

        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.quizId },
            include: { questions: true },
        })
        if (!quiz) return res.status(404).json({ error: 'Quiz không tồn tại' })

        let score = 0, totalPoints = 0
        const correctAnswers: Record<string, string> = {}

        for (const q of quiz.questions) {
            totalPoints += q.points
            correctAnswers[q.id] = q.correctOption
            if (answers[q.id] === q.correctOption) score += q.points
        }

        await prisma.quizSubmission.create({
            data: { quizId: req.params.quizId, userId: user.id, score, totalPoints, answers },
        })

        return res.json({ score, totalPoints, correctAnswers })
    } catch (error) {
        console.error('Error submitting quiz:', error)
        return res.status(500).json({ error: 'Không thể nộp bài' })
    }
})

// GET /api/classes/:classId/quizzes/:quizId/review
quizRoutes.get('/:classId/quizzes/:quizId/review', async (req: Request, res: Response) => {
    try {
        const clerkId = req.headers['x-user-clerk-id'] as string
        if (!clerkId) return res.status(401).json({ error: 'Unauthorized' })

        const user = await getUserByClerkId(clerkId)
        if (!user) return res.status(401).json({ error: 'User not found' })

        const submission = await prisma.quizSubmission.findFirst({
            where: { quizId: req.params.quizId, userId: user.id },
            include: { quiz: { include: { questions: { orderBy: { orderIndex: 'asc' } } } } },
        })

        if (!submission) return res.status(404).json({ error: 'Không tìm thấy bài làm' })

        return res.json(submission)
    } catch (error) {
        console.error('Review error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// GET /api/classes/:classId/quizzes/:quizId/analytics
quizRoutes.get('/:classId/quizzes/:quizId/analytics', async (req: Request, res: Response) => {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.quizId },
            include: { questions: { orderBy: { orderIndex: 'asc' } }, submissions: true },
        })
        if (!quiz) return res.status(404).json({ error: 'Không tìm thấy quiz' })

        const submissions = quiz.submissions
        const totalSubmissions = submissions.length

        if (totalSubmissions === 0) {
            return res.json({ totalSubmissions: 0, averageScore: 0, passRate: 0, questionStats: [] })
        }

        const totalPercentage = submissions.reduce((sum, s) =>
            sum + (s.totalPoints > 0 ? (s.score / s.totalPoints) * 100 : 0), 0)
        const averageScore = Math.round(totalPercentage / totalSubmissions)
        const passCount = submissions.filter(s => s.totalPoints > 0 && (s.score / s.totalPoints) >= 0.5).length
        const passRate = Math.round((passCount / totalSubmissions) * 100)

        const questionStats = quiz.questions.map(q => {
            let correctCount = 0, totalAnswers = 0
            submissions.forEach(sub => {
                const answers = sub.answers as any[]
                const answer = answers.find((a: any) => a.questionId === q.id)
                if (answer) {
                    totalAnswers++
                    if (answer.selectedOption === q.correctOption) correctCount++
                }
            })
            return {
                questionId: q.id, content: q.content,
                correctRate: totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0,
                totalAnswers,
            }
        })

        return res.json({ totalSubmissions, averageScore, passRate, questionStats })
    } catch (error) {
        console.error('Analytics error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})

// GET /api/classes/:classId/quizzes/:quizId/leaderboard
quizRoutes.get('/:classId/quizzes/:quizId/leaderboard', async (req: Request, res: Response) => {
    try {
        const submissions = await prisma.quizSubmission.findMany({
            where: { quizId: req.params.quizId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }],
        })

        const leaderboard = submissions.map((sub, index) => ({
            rank: index + 1,
            userId: sub.user.id,
            userName: sub.user.name,
            score: sub.score,
            totalPoints: sub.totalPoints,
            percentage: sub.totalPoints > 0 ? Math.round((sub.score / sub.totalPoints) * 100) : 0,
            submittedAt: sub.submittedAt.toISOString(),
        }))

        return res.json(leaderboard)
    } catch (error) {
        console.error('Leaderboard error:', error)
        return res.status(500).json({ error: 'Lỗi server' })
    }
})
