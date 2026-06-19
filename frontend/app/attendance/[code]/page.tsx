import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface AttendancePageProps {
    params: { code: string }
}

export default async function AttendancePage({ params }: AttendancePageProps) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/sign-in')
    }

    const session = await prisma.attendanceSession.findUnique({
        where: { code: params.code.toUpperCase() },
        include: {
            class: {
                include: {
                    members: true,
                },
            },
        },
    })

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
                <Header />
                <main className="container mx-auto px-4 py-20 text-center">
                    <XCircle className="h-20 w-20 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Mã điểm danh không hợp lệ</h1>
                    <p className="text-slate-600">Vui lòng kiểm tra lại mã hoặc liên hệ giáo viên.</p>
                </main>
            </div>
        )
    }

    // Check if session expired
    if (new Date() > session.expiresAt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50">
                <Header />
                <main className="container mx-auto px-4 py-20 text-center">
                    <Clock className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
                    <h1 className="text-2xl font-bold mb-2">Phiên điểm danh đã hết hạn</h1>
                    <p className="text-slate-600">Vui lòng liên hệ giáo viên để được điểm danh thủ công.</p>
                </main>
            </div>
        )
    }

    // Check if user is member
    const isMember = session.class.members.some((m: any) => m.userId === user.id)
    const isOwner = session.class.ownerId === user.id

    if (!isMember && !isOwner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
                <Header />
                <main className="container mx-auto px-4 py-20 text-center">
                    <XCircle className="h-20 w-20 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Bạn không phải thành viên lớp này</h1>
                    <p className="text-slate-600">Vui lòng tham gia lớp trước khi điểm danh.</p>
                </main>
            </div>
        )
    }

    // Check if already checked in
    const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
            sessionId_userId: {
                sessionId: session.id,
                userId: user.id,
            },
        },
    })

    if (existingRecord) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
                <Header />
                <main className="container mx-auto px-4 py-20 text-center">
                    <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500" />
                    <h1 className="text-2xl font-bold mb-2">Bạn đã điểm danh rồi!</h1>
                    <p className="text-slate-600">{session.title}</p>
                </main>
            </div>
        )
    }

    // Create attendance record
    await prisma.attendanceRecord.create({
        data: {
            sessionId: session.id,
            userId: user.id,
            status: 'PRESENT',
            isManual: false,
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
            <Header />
            <main className="container mx-auto px-4 py-20 text-center">
                <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-500 animate-bounce" />
                <h1 className="text-2xl font-bold mb-2 text-green-700">Điểm danh thành công!</h1>
                <p className="text-slate-600 mb-4">{session.title}</p>
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <p className="text-lg font-medium">{session.class.name}</p>
                        <p className="text-sm text-slate-500">{new Date().toLocaleString('vi-VN')}</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
