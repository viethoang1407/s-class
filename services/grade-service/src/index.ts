/**
 * 📊 Grade Service - Entry Point
 * ================================
 * Port: 4005
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { gradeRoutes } from './routes'

const app = express()
const PORT = process.env.GRADE_SERVICE_PORT || 4005

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Grade Service', timestamp: new Date().toISOString() })
})

app.use('/api/classes', gradeRoutes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [Grade Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`📊 Grade Service đang chạy tại: http://localhost:${PORT}`)
})
