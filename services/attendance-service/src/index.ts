/**
 * 📋 Attendance Service - Entry Point
 * =====================================
 * Quản lý điểm danh.
 * Port: 4004
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { attendanceRoutes } from './routes'

const app = express()
const PORT = process.env.ATTENDANCE_SERVICE_PORT || 4004

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Attendance Service', timestamp: new Date().toISOString() })
})

app.use('/api/classes', attendanceRoutes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [Attendance Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`📋 Attendance Service đang chạy tại: http://localhost:${PORT}`)
})
