/**
 * Auth Middleware - Xác thực Clerk JWT Token
 * ============================================
 * Verify JWT token từ Clerk và truyền user info
 * đến các downstream services qua custom headers.
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import jwksRsa from 'jwks-rsa'

// JWKS client để lấy public key từ Clerk
const jwksClient = jwksRsa({
    jwksUri: `https://awake-mink-42.clerk.accounts.dev/.well-known/jwks.json`,
    cache: true,
    cacheMaxAge: 600000, // 10 phút
})

// Lấy signing key
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err)
            return
        }
        const signingKey = key?.getPublicKey()
        callback(null, signingKey)
    })
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Thiếu token xác thực' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = await new Promise<any>((resolve, reject) => {
            jwt.verify(token, getKey, {
                algorithms: ['RS256'],
            }, (err, decoded) => {
                if (err) reject(err)
                else resolve(decoded)
            })
        })

        // Truyền user info đến services qua headers
        req.headers['x-user-clerk-id'] = decoded.sub
        req.headers['x-user-email'] = decoded.email || ''
        req.headers['x-user-name'] = decoded.name || decoded.first_name || ''
        req.headers['x-authenticated'] = 'true'

        next()
    } catch (error: any) {
        console.error('❌ Auth error:', error.message)
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
    }
}
