/**
 * Proxy Routes - Routing requests đến microservices
 * ===================================================
 * Mỗi route prefix được map đến một microservice cụ thể.
 * Gateway hoạt động như reverse proxy, forward requests đến service phù hợp.
 */

import { Express, Request, Response } from 'express'
import { createProxyMiddleware, Options, fixRequestBody } from 'http-proxy-middleware'

// Service URLs
const SERVICES = {
    user: process.env.USER_SERVICE_URL || 'http://localhost:4001',
    class: process.env.CLASS_SERVICE_URL || 'http://localhost:4002',
    quiz: process.env.QUIZ_SERVICE_URL || 'http://localhost:4003',
    attendance: process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:4004',
    grade: process.env.GRADE_SERVICE_URL || 'http://localhost:4005',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:4006',
}

// Helper: tạo proxy options chung
function proxyOptions(target: string): Options {
    return {
        target,
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
        on: {
            proxyReq: fixRequestBody,
            error: (err: Error, req: Request, res: Response) => {
                console.error(`❌ Proxy error → ${target}:`, err.message)
                if (!res.headersSent) {
                    (res as Response).status(503).json({
                        error: 'Service không khả dụng',
                        service: target,
                    })
                }
            },
        },
    }
}

export function createProxyRoutes(app: Express) {
    // =============================================
    // 👤 USER SERVICE - /api/users/*
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/users',
        ...proxyOptions(SERVICES.user),
    }))

    // Dashboard route → cần gọi Class Service (vì aggregate data)
    app.use(createProxyMiddleware({
        pathFilter: '/api/dashboard',
        ...proxyOptions(SERVICES.class),
    }))

    // =============================================
    // 📝 QUIZ SERVICE - /api/classes/:id/quizzes/*
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/classes/*/quizzes/**',
        ...proxyOptions(SERVICES.quiz),
    }))

    // =============================================
    // 📋 ATTENDANCE SERVICE - /api/classes/:id/attendance/*
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/classes/*/attendance/**',
        ...proxyOptions(SERVICES.attendance),
    }))

    // =============================================
    // 📊 GRADE SERVICE - /api/classes/:id/grades/*, subjects/*
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/classes/*/grades/**',
        ...proxyOptions(SERVICES.grade),
    }))

    app.use(createProxyMiddleware({
        pathFilter: '/api/classes/*/subjects/**',
        ...proxyOptions(SERVICES.grade),
    }))

    // =============================================
    // 📚 CLASS SERVICE - /api/classes/* (catch-all cho class)
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/classes/**',
        ...proxyOptions(SERVICES.class),
    }))

    // =============================================
    // 🤖 AI SERVICE - /api/ai/*, /api/chat/*
    // =============================================
    app.use(createProxyMiddleware({
        pathFilter: '/api/ai-chat/**',
        ...proxyOptions(SERVICES.ai),
    }))

    app.use(createProxyMiddleware({
        pathFilter: '/api/ai-generate-quiz/**',
        ...proxyOptions(SERVICES.ai),
    }))

    app.use(createProxyMiddleware({
        pathFilter: '/api/chat/**',
        ...proxyOptions(SERVICES.ai),
    }))

    console.log('✅ Proxy routes đã được cấu hình')
}
