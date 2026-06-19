/**
 * 📝 Quiz Service - Entry Point
 * ===============================
 * Quản lý quiz, câu hỏi, bài nộp.
 * Port: 4003
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { quizRoutes } from './routes'

const app = express()
const PORT = process.env.QUIZ_SERVICE_PORT || 4003

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Quiz Service', timestamp: new Date().toISOString() })
})

app.use('/api/classes', quizRoutes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [Quiz Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`📝 Quiz Service đang chạy tại: http://localhost:${PORT}`)
})
