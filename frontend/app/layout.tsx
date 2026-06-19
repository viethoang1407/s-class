import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ClerkProvider } from '@clerk/nextjs'
import { viVN } from '@clerk/localizations'
import { AIChatbot } from '@/components/ai-chatbot'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
    title: 'S-Class - Hệ thống quản lý lớp học',
    description: 'Nền tảng giáo dục trực tuyến cho giáo viên và học sinh',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: false,
        statusBarStyle: 'default',
        title: 'S-Class App',
    },
}

export const viewport: Viewport = {
    themeColor: '#3b82f6',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider localization={viVN}>
            <html lang="vi">
                <body className={inter.className}>
                    {children}
                    <AIChatbot />
                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    )
}
