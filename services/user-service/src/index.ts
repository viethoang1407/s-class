/**
 * 👤 User Service - Entry Point
 * ==============================
 * Quản lý thông tin người dùng.
 * Port: 4001
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { userRoutes } from './routes'

const app = express()
const PORT = process.env.USER_SERVICE_PORT || 4001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'User Service', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/users', userRoutes)

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [User Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`👤 User Service đang chạy tại: http://localhost:${PORT}`)
})
