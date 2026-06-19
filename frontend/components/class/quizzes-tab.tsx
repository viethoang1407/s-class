'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { BookOpen, Plus, Eye, Trash2, Send, Sparkles } from 'lucide-react'
import { AIQuizGenerator } from '@/components/quiz/ai-quiz-generator'

interface QuizzesTabProps {
    classData: any
    isOwner: boolean
}

export function QuizzesTab({ classData, isOwner }: QuizzesTabProps) {
    const router = useRouter()
    const { toast } = useToast()

    const getStatusBadge = (quiz: any) => {
        const now = new Date()
        const openAt = new Date(quiz.openAt)
        const dueAt = new Date(quiz.dueAt)

        if (!quiz.isPublished) {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Nháp</span>
        }
        if (now < openAt) {
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Chưa mở</span>
        }
        if (now > dueAt) {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Đã đóng</span>
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Đang mở</span>
    }

    const handleDelete = async (quizId: string) => {
        if (!confirm('Bạn có chắc muốn xóa quiz này?')) return

        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Không thể xóa')

            toast({ title: 'Đã xóa quiz' })
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' })
        }
    }

    const handlePublish = async (quizId: string) => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}/publish`, {
                method: 'POST',
            })

            if (!response.ok) throw new Error('Không thể công bố')

            toast({ title: 'Đã công bố quiz' })
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể công bố', variant: 'destructive' })
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Quiz
                    </CardTitle>
                    <CardDescription>
                        {classData.quizzes.length} bài quiz
                    </CardDescription>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <Link href={`/class/${classData.id}/quiz/new`}>
                            <Button size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tạo quiz</span>
                            </Button>
                        </Link>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {classData.quizzes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Chưa có quiz nào</p>
                        {isOwner && (
                            <Link href={`/class/${classData.id}/quiz/new`}>
                                <Button variant="outline" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo quiz đầu tiên
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead className="hidden sm:table-cell">Số câu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="hidden sm:table-cell">Bài nộp</TableHead>
                                    {isOwner && <TableHead className="text-right">Thao tác</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classData.quizzes.map((quiz: any) => (
                                    <TableRow key={quiz.id}>
                                        <TableCell className="font-medium">{quiz.title}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{quiz._count.questions}</TableCell>
                                        <TableCell>{getStatusBadge(quiz)}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{quiz._count.submissions}</TableCell>
                                        {isOwner && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/class/${classData.id}/quiz/${quiz.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {!quiz.isPublished && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handlePublish(quiz.id)}
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500"
                                                        onClick={() => handleDelete(quiz.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
