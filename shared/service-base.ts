/**
 * Shared Service Base - Template cho tất cả microservices
 * ========================================================
 * Cung cấp cấu trúc Express server chuẩn cho mỗi service.
 */

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config({ path: '../../../.env' })

export function createServiceApp(serviceName: string) {
    const app = express()

    // Middleware
    app.use(cors())
    app.use(express.json({ limit: '10mb' }))

    // Health check
    app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'OK',
            service: serviceName,
            timestamp: new Date().toISOString(),
        })
    })

    // Error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(`❌ [${serviceName}] Error:`, err.message)
        res.status(500).json({ error: 'Internal Server Error' })
    })

    return app
}

// Helper: lấy user info từ gateway headers
export function getUserFromHeaders(req: Request) {
    const clerkId = req.headers['x-user-clerk-id'] as string
    const email = req.headers['x-user-email'] as string
    const name = req.headers['x-user-name'] as string

    if (!clerkId) {
        return null
    }

    return { clerkId, email, name }
}
