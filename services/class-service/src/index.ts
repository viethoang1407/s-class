/**
 * 📚 Class Service - Entry Point
 * ================================
 * Quản lý lớp học, thành viên, thông báo, tài liệu.
 * Port: 4002
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { classRoutes } from './routes'
import { memberRoutes } from './routes-members'
import { announcementRoutes } from './routes-announcements'
import { documentRoutes } from './routes-documents'
import { dashboardRoutes } from './routes-dashboard'
import { statsRoutes } from './routes-stats'

const app = express()
const PORT = process.env.CLASS_SERVICE_PORT || 4002

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Class Service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/classes', classRoutes)
app.use('/api/classes', memberRoutes)
app.use('/api/classes', announcementRoutes)
app.use('/api/classes', documentRoutes)
app.use('/api/classes', statsRoutes)
app.use('/api/dashboard', dashboardRoutes)

// 404 handler
app.use((req, res) => {
    console.error(`❌ [Class Service] 404 - Not Found: ${req.method} ${req.originalUrl}`)
    res.status(404).json({ error: `Class Service 404: Cannot ${req.method} ${req.originalUrl}` })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [Class Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`📚 Class Service đang chạy tại: http://localhost:${PORT}`)
})
