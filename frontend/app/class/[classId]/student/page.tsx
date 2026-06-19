import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, GraduationCap, ClipboardList, QrCode, Clock, Newspaper } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CopyClassCode } from '@/components/class/copy-class-code'
import { LeaveClassButton } from '@/components/class/leave-class-button'

interface StudentClassPageProps {
    params: { classId: string }
}

export default async function StudentClassPage({ params }: StudentClassPageProps) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/sign-in')
    }

    const classData = await prisma.class.findUnique({
        where: { id: params.classId },
        include: {
            owner: { select: { name: true } },
            subjects: {
                include: {
                    gradeComponents: true,
                },
                orderBy: { createdAt: 'asc' },
            },
            quizzes: {
                where: { isPublished: true },
                include: {
                    _count: { select: { questions: true } },
                    submissions: {
                        where: { userId: user.id },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            grades: {
                where: { userId: user.id },
            },
            attendanceSessions: {
                include: {
                    records: {
                        where: { userId: user.id },
                    },
                },
                orderBy: { date: 'desc' },
            },
            announcements: {
                include: {
                    author: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
            },
            _count: { select: { members: true } },
        },
    })

    if (!classData) {
        notFound()
    }

    // Check if user is owner or member
    const membership = await prisma.classMember.findFirst({
        where: {
            classId: params.classId,
            userId: user.id,
        },
    })

    if (classData.ownerId === user.id) {
        redirect(`/class/${params.classId}`)
    }

    if (!membership) {
        redirect('/dashboard')
    }

    // Check if user is pending approval
    if (membership.status === 'pending') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
                <Header />
                <main className="container mx-auto px-4 py-20 max-w-lg">
                    <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="h-10 w-10 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Đang chờ duyệt</h1>
                        <p className="text-slate-600 mb-6">
                            Yêu cầu tham gia lớp <strong>"{classData.name}"</strong> của bạn đã được gửi.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <p className="text-amber-700 text-sm">
                                ⏳ Vui lòng đợi giáo viên duyệt để được tham gia lớp.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Link href="/dashboard">
                                <Button variant="outline">← Quay về Dashboard</Button>
                            </Link>
                            <LeaveClassButton classId={classData.id} className={classData.name} isPending />
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    const now = new Date()

    // Group grades by subject and component
    const gradesBySubject: Record<string, Record<string, number>> = {}
    classData.grades.forEach((grade: any) => {
        if (!gradesBySubject[grade.subjectId]) {
            gradesBySubject[grade.subjectId] = {}
        }
        gradesBySubject[grade.subjectId][grade.componentId] = grade.score
    })

    // Calculate attendance stats
    const totalSessions = classData.attendanceSessions.length
    const presentCount = classData.attendanceSessions.filter(
        (s: any) => s.records.some((r: any) => r.status === 'PRESENT' || r.status === 'LATE')
    ).length
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Class Header */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                                <span>/</span>
                                <span>{classData.name}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{classData.name}</h1>
                            <p className="text-slate-600 mt-1">Quản lý bởi: {classData.owner.name}</p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {classData._count.members} thành viên
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClipboardList className="h-4 w-4" />
                                    Chuyên cần: {attendanceRate}%
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <CopyClassCode code={classData.code} />
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                        <Link href="/attendance">
                            <Button variant="outline" className="gap-2">
                                <QrCode className="h-4 w-4" />
                                Điểm danh
                            </Button>
                        </Link>
                        <LeaveClassButton classId={classData.id} className={classData.name} />
                    </div>
                </div>

                <Tabs defaultValue="bulletin" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="bulletin" className="gap-2">
                            <Newspaper className="h-4 w-4" />
                            Bảng tin
                        </TabsTrigger>
                        <TabsTrigger value="quizzes" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Bài kiểm tra
                        </TabsTrigger>
                        <TabsTrigger value="grades" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Bảng điểm
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Điểm danh
                        </TabsTrigger>
                    </TabsList>

                    {/* Bulletin Tab */}
                    <TabsContent value="bulletin">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
                                    <Newspaper className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Bảng tin lớp học</h3>
                                    <p className="text-sm text-slate-500">{classData.announcements?.length || 0} bài viết</p>
                                </div>
                            </div>

                            {(!classData.announcements || classData.announcements.length === 0) ? (
                                <Card className="border-dashed border-2">
                                    <CardContent className="py-12 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Newspaper className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500">Chưa có thông báo nào từ giáo viên</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {classData.announcements.map((post: any) => (
                                        <Card key={post.id} className="overflow-hidden">
                                            <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <BookOpen className="h-5 w-5 text-orange-500" />
                                                    {post.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {post.content && (
                                                    <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>
                                                )}
                                                {post.link && (
                                                    <a
                                                        href={post.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all"
                                                    >
                                                        <div className="p-2 bg-blue-500 rounded-lg text-white">
                                                            <BookOpen className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-blue-700 truncate">
                                                                {post.linkTitle || 'Xem tài liệu'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">{post.link}</p>
                                                        </div>
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Quizzes Tab */}
                    <TabsContent value="quizzes">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Bài kiểm tra</h3>
                                    <p className="text-sm text-slate-500">{classData.quizzes.length} bài</p>
                                </div>
                            </div>

                            {classData.quizzes.length === 0 ? (
                                <Card className="border-dashed border-2">
                                    <CardContent className="py-12 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500">Chưa có bài kiểm tra nào</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {classData.quizzes.map((quiz: any) => {
                                        const openAt = new Date(quiz.openAt)
                                        const dueAt = new Date(quiz.dueAt)
                                        const isOpen = now >= openAt && now <= dueAt
                                        const hasSubmitted = quiz.submissions.length > 0
                                        const submission = quiz.submissions[0]

                                        return (
                                            <Card key={quiz.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                <div className={`h-1 ${hasSubmitted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : isOpen ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-slate-200'}`} />
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`p-2.5 rounded-xl ${hasSubmitted ? 'bg-green-100' : isOpen ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                                <BookOpen className={`h-5 w-5 ${hasSubmitted ? 'text-green-600' : isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-slate-900 truncate">{quiz.title}</h4>
                                                                <p className="text-sm text-slate-500">{quiz._count.questions} câu hỏi</p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            {hasSubmitted ? (
                                                                <div className="px-4 py-2 bg-green-50 rounded-xl">
                                                                    <p className="text-lg font-bold text-green-600">
                                                                        {submission.score}/{submission.totalPoints}
                                                                    </p>
                                                                    <p className="text-xs text-green-500">Đã nộp ✓</p>
                                                                </div>
                                                            ) : isOpen ? (
                                                                <Link href={`/class/${params.classId}/quiz/${quiz.id}/take`}>
                                                                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                                                                        Làm bài →
                                                                    </Button>
                                                                </Link>
                                                            ) : now < openAt ? (
                                                                <div className="px-3 py-2 bg-yellow-50 rounded-xl">
                                                                    <p className="text-xs text-yellow-600">Chưa mở</p>
                                                                    <p className="text-xs text-yellow-500">{openAt.toLocaleDateString('vi-VN')}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="px-3 py-2 bg-red-50 rounded-xl">
                                                                    <p className="text-sm text-red-500 font-medium">Hết hạn</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Grades Tab */}
                    <TabsContent value="grades">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Bảng điểm của bạn
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {classData.subjects.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                        <p>Chưa có môn học nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {classData.subjects.map((subject: any) => (
                                            <div key={subject.id} className="border rounded-lg p-4">
                                                <h3 className="font-semibold text-lg mb-4">{subject.name}</h3>

                                                {subject.gradeComponents.length === 0 ? (
                                                    <p className="text-slate-400 text-center py-4">Chưa có đầu điểm</p>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    {subject.gradeComponents.map((comp: any) => (
                                                                        <TableHead key={comp.id} className="text-center">
                                                                            {comp.name}
                                                                        </TableHead>
                                                                    ))}
                                                                    <TableHead className="text-center font-bold">TB</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                <TableRow>
                                                                    {subject.gradeComponents.map((comp: any) => {
                                                                        const score = gradesBySubject[subject.id]?.[comp.id]
                                                                        return (
                                                                            <TableCell key={comp.id} className="text-center">
                                                                                <span className={`font-medium ${score !== undefined
                                                                                    ? score >= 5 ? 'text-green-600' : 'text-red-600'
                                                                                    : 'text-slate-400'
                                                                                    }`}>
                                                                                    {score !== undefined ? score.toFixed(1) : '-'}
                                                                                </span>
                                                                            </TableCell>
                                                                        )
                                                                    })}
                                                                    <TableCell className="text-center">
                                                                        {(() => {
                                                                            const scores = subject.gradeComponents
                                                                                .map((comp: any) => gradesBySubject[subject.id]?.[comp.id])
                                                                                .filter((s: any) => s !== undefined)

                                                                            if (scores.length === 0) return '-'

                                                                            const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
                                                                            return (
                                                                                <span className={`font-bold ${avg >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {avg.toFixed(1)}
                                                                                </span>
                                                                            )
                                                                        })()}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Lịch sử điểm danh
                                </CardTitle>
                                <CardDescription>
                                    Có mặt {presentCount}/{totalSessions} buổi ({attendanceRate}%)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {classData.attendanceSessions.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                        <p>Chưa có buổi điểm danh nào</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Ngày</TableHead>
                                                    <TableHead>Buổi học</TableHead>
                                                    <TableHead className="text-center">Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {classData.attendanceSessions.map((session: any) => {
                                                    const record = session.records[0]
                                                    const status = record?.status || 'ABSENT'

                                                    return (
                                                        <TableRow key={session.id}>
                                                            <TableCell>
                                                                {new Date(session.date).toLocaleDateString('vi-VN')}
                                                            </TableCell>
                                                            <TableCell>{session.title}</TableCell>
                                                            <TableCell className="text-center">
                                                                {status === 'PRESENT' && (
                                                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                                                                        ✓ Có mặt
                                                                    </span>
                                                                )}
                                                                {status === 'LATE' && (
                                                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                                                                        ⏰ Muộn
                                                                    </span>
                                                                )}
                                                                {status === 'EXCUSED' && (
                                                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                                                                        📝 Có phép
                                                                    </span>
                                                                )}
                                                                {status === 'ABSENT' && (
                                                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                                                                        ✗ Vắng
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
