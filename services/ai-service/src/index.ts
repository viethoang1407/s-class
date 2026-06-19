/**
 * 🤖 AI Service - Entry Point
 * ==============================
 * Service AI stateless - Chat + Quiz Generation
 * Port: 4006
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

import { aiRoutes } from './routes'

const app = express()
const PORT = process.env.AI_SERVICE_PORT || 4006

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'AI Service', timestamp: new Date().toISOString() })
})

app.use('/', aiRoutes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ [AI Service] Error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
    console.log(`🤖 AI Service đang chạy tại: http://localhost:${PORT}`)
})
