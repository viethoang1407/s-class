/**
 * API Gateway - Study Microservices
 * ==================================
 * Điểm vào duy nhất cho tất cả API requests.
 * 
 * Chức năng:
 * - Routing requests đến đúng microservice
 * - Xác thực JWT token từ Clerk
 * - CORS, Logging, Rate limiting
 * - Truyền user info qua headers đến services
 */

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createProxyRoutes } from './proxy'
import { authMiddleware } from './auth-middleware'

// Load .env từ root
dotenv.config({ path: '../.env' })

const app = express()
const PORT = process.env.GATEWAY_PORT || 4000

// ==================== MIDDLEWARE ====================

// CORS - cho phép frontend gọi API
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Logging
app.use(morgan('[:date[clf]] :method :url :status :response-time ms'))

// Parse JSON body
app.use(express.json({ limit: '10mb' }))

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'API Gateway',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})

// ==================== AUTH MIDDLEWARE ====================
// Tất cả routes /api/* phải qua xác thực (trừ health check)
app.use('/api', authMiddleware)

// ==================== PROXY ROUTES ====================
createProxyRoutes(app)

// ==================== ERROR HANDLING ====================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Gateway Error:', err.message)
    res.status(500).json({ error: 'Internal Gateway Error' })
})

// 404
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════')
    console.log(`🌐 API Gateway đang chạy tại: http://localhost:${PORT}`)
    console.log('═══════════════════════════════════════════')
    console.log('📡 Service Routes:')
    console.log(`   /api/users/*        → User Service     :${process.env.USER_SERVICE_PORT || 4001}`)
    console.log(`   /api/classes/*      → Class Service    :${process.env.CLASS_SERVICE_PORT || 4002}`)
    console.log(`   /api/quizzes/*      → Quiz Service     :${process.env.QUIZ_SERVICE_PORT || 4003}`)
    console.log(`   /api/attendance/*   → Attendance Svc   :${process.env.ATTENDANCE_SERVICE_PORT || 4004}`)
    console.log(`   /api/grades/*       → Grade Service    :${process.env.GRADE_SERVICE_PORT || 4005}`)
    console.log(`   /api/ai/*           → AI Service       :${process.env.AI_SERVICE_PORT || 4006}`)
    console.log('═══════════════════════════════════════════')
})
