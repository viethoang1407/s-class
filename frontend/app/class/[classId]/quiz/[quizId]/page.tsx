import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface QuizDetailPageProps {
    params: { classId: string; quizId: string }
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/sign-in')
    }

    const quiz = await prisma.quiz.findUnique({
        where: { id: params.quizId },
        include: {
            class: true,
            questions: {
                orderBy: { orderIndex: 'asc' },
            },
            submissions: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { submittedAt: 'desc' },
            },
        },
    })

    if (!quiz) {
        notFound()
    }

    // Check if user is class owner
    if (quiz.class.ownerId !== user.id) {
        redirect(`/class/${params.classId}`)
    }

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
    const avgScore = quiz.submissions.length > 0
        ? quiz.submissions.reduce((sum, s) => sum + s.score, 0) / quiz.submissions.length
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/class/${params.classId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        <p className="text-slate-600">{quiz.description || 'Không có mô tả'}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-4 mb-6">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-blue-600">{quiz.questions.length}</p>
                            <p className="text-sm text-slate-600">Câu hỏi</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-green-600">{totalPoints}</p>
                            <p className="text-sm text-slate-600">Tổng điểm</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-purple-600">{quiz.submissions.length}</p>
                            <p className="text-sm text-slate-600">Bài nộp</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-3xl font-bold text-orange-600">{avgScore.toFixed(1)}</p>
                            <p className="text-sm text-slate-600">Điểm TB</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Time info */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div>
                                <span className="text-slate-500">Mở lúc:</span>
                                <span className="ml-2 font-medium">{new Date(quiz.openAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Đóng lúc:</span>
                                <span className="ml-2 font-medium">{new Date(quiz.dueAt).toLocaleString('vi-VN')}</span>
                            </div>
                            {quiz.durationMinutes && (
                                <div>
                                    <span className="text-slate-500">Thời gian làm:</span>
                                    <span className="ml-2 font-medium">{quiz.durationMinutes} phút</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Danh sách bài nộp ({quiz.submissions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {quiz.submissions.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>Chưa có bài nộp nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Học sinh</TableHead>
                                            <TableHead className="text-center">Điểm</TableHead>
                                            <TableHead className="text-center">Tỷ lệ</TableHead>
                                            <TableHead>Thời gian nộp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quiz.submissions.map((submission, index) => {
                                            const percentage = Math.round((submission.score / submission.totalPoints) * 100)
                                            return (
                                                <TableRow key={submission.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{submission.user.name}</p>
                                                            <p className="text-sm text-slate-500">{submission.user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`font-bold ${submission.score >= submission.totalPoints / 2 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {submission.score}/{submission.totalPoints}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`px-2 py-1 rounded-full text-sm ${percentage >= 80 ? 'bg-green-100 text-green-700' :
                                                                percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {percentage}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(submission.submittedAt).toLocaleString('vi-VN')}
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

                {/* Questions preview */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Đáp án</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quiz.questions.map((q, index) => (
                            <div key={q.id} className="border rounded-lg p-4">
                                <p className="font-medium mb-2">
                                    <span className="text-blue-600">Câu {index + 1}</span> ({q.points} điểm): {q.content}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                        <p
                                            key={opt}
                                            className={q.correctOption === opt ? 'text-green-600 font-medium' : 'text-slate-600'}
                                        >
                                            {opt}. {(q.options as any)[opt]} {q.correctOption === opt && '✓'}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
