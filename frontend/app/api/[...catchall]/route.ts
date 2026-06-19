import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000'

async function handleRequest(req: NextRequest, { params }: { params: { catchall: string[] } }) {
    try {
        const { getToken } = await auth()
        const token = await getToken()

        const path = params.catchall.join('/')
        const searchParams = req.nextUrl.searchParams.toString()
        const query = searchParams ? `?${searchParams}` : ''
        
        const targetUrl = `${GATEWAY_URL}/api/${path}${query}`

        const headers = new Headers()
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        
        const contentType = req.headers.get('content-type')
        if (contentType) {
            headers.set('Content-Type', contentType)
        }

        let bodyContent = undefined
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            bodyContent = await req.text()
        }

        const fetchOptions: RequestInit = {
            method: req.method,
            headers,
            ...(bodyContent ? { body: bodyContent } : {})
        }

        const response = await fetch(targetUrl, fetchOptions)

        const data = await response.text()
        
        let parsedData
        try {
            parsedData = data ? JSON.parse(data) : {}
        } catch {
            parsedData = data
        }

        return new NextResponse(
            typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData),
            {
                status: response.status,
                headers: {
                    'Content-Type': response.headers.get('content-type') || 'application/json',
                },
            }
        )

    } catch (error) {
        console.error('BFF Proxy Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
