'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
    BookOpen, Plus, Eye, Trash2, Send, Copy, Pencil, MoreHorizontal,
    EyeOff, Calendar, HelpCircle, Users, Filter
} from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/lib/i18n'

interface QuizzesTabProps {
    classData: any
    isOwner: boolean
}

type FilterType = 'all' | 'published' | 'draft' | 'expired'

export function QuizzesTab({ classData, isOwner }: QuizzesTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useTranslation()
    const [filter, setFilter] = useState<FilterType>('all')
    const [duplicating, setDuplicating] = useState<string | null>(null)

    const getQuizStatus = (quiz: any): 'draft' | 'upcoming' | 'open' | 'expired' => {
        const now = new Date()
        if (!quiz.isPublished) return 'draft'
        if (now < new Date(quiz.openAt)) return 'upcoming'
        if (now > new Date(quiz.dueAt)) return 'expired'
        return 'open'
    }

    const getStatusBadge = (quiz: any) => {
        const status = getQuizStatus(quiz)
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-600',
            upcoming: 'bg-yellow-100 text-yellow-700',
            open: 'bg-green-100 text-green-700',
            expired: 'bg-red-100 text-red-700',
        }
        const labels: Record<string, string> = {
            draft: t('quiz.draft'),
            upcoming: t('quiz.upcoming'),
            open: t('quiz.open'),
            expired: t('quiz.expired'),
        }
        return <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>{labels[status]}</span>
    }

    const filteredQuizzes = classData.quizzes.filter((quiz: any) => {
        if (filter === 'all') return true
        const status = getQuizStatus(quiz)
        if (filter === 'published') return status !== 'draft'
        if (filter === 'draft') return status === 'draft'
        if (filter === 'expired') return status === 'expired'
        return true
    })

    const handleDelete = async (quizId: string) => {
        if (!confirm(t('quiz.confirmDelete'))) return
        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}`, { method: 'DELETE' })
            if (!response.ok) throw new Error(t('quiz.deleteError'))
            toast({ title: t('quiz.deleteSuccess') })
            router.refresh()
        } catch (error) {
            toast({ title: t('common.error'), description: t('quiz.deleteError'), variant: 'destructive' })
        }
    }

    const handlePublish = async (quizId: string) => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}/publish`, { method: 'POST' })
            if (!response.ok) throw new Error(t('quiz.publishError'))
            toast({ title: t('quiz.publishSuccess') })
            router.refresh()
        } catch (error) {
            toast({ title: t('common.error'), description: t('quiz.publishError'), variant: 'destructive' })
        }
    }

    const handleUnpublish = async (quizId: string) => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}/unpublish`, { method: 'POST' })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || t('quiz.unpublishError'))
            }
            toast({ title: t('quiz.unpublishSuccess') })
            router.refresh()
        } catch (error: any) {
            toast({ title: t('common.error'), description: error.message, variant: 'destructive' })
        }
    }

    const handleDuplicate = async (quizId: string) => {
        setDuplicating(quizId)
        try {
            const response = await fetch(`/api/classes/${classData.id}/quizzes/${quizId}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            if (!response.ok) throw new Error(t('quiz.duplicateError'))
            toast({ title: t('quiz.duplicateSuccess'), description: t('quiz.duplicateDraft') })
            router.refresh()
        } catch (error) {
            toast({ title: t('common.error'), description: t('quiz.duplicateError'), variant: 'destructive' })
        } finally {
            setDuplicating(null)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        })
    }

    const filterButtons: { key: FilterType; label: string }[] = [
        { key: 'all', label: t('quiz.filterAll') },
        { key: 'published', label: t('quiz.filterPublished') },
        { key: 'draft', label: t('quiz.filterDraft') },
        { key: 'expired', label: t('quiz.filterExpired') },
    ]

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {t('quiz.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('quiz.quizzesCount').replace('{count}', classData.quizzes.length.toString())}
                    </CardDescription>
                </div>
                {isOwner && (
                    <Link href={`/class/${classData.id}/quiz/new`}>
                        <Button size="sm" className="gap-1 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            {t('quiz.create')}
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                {/* Filter tabs */}
                {isOwner && classData.quizzes.length > 0 && (
                    <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                        {filterButtons.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                                    filter === key
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {classData.quizzes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>{t('quiz.noQuizzes')}</p>
                        {isOwner && (
                            <Link href={`/class/${classData.id}/quiz/new`}>
                                <Button variant="outline" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('quiz.createFirst')}
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        {t('quiz.noFilter')}
                    </div>
                ) : (
                    <>
                        {/* Mobile Card Layout */}
                        <div className="space-y-3 sm:hidden">
                            {filteredQuizzes.map((quiz: any) => (
                                <div key={quiz.id} className="border rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{quiz.title}</h4>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                {getStatusBadge(quiz)}
                                                <span className="text-xs text-gray-400">
                                                    <HelpCircle className="inline h-3 w-3 mr-0.5" />
                                                    {quiz._count.questions} {t('quiz.questions')}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    <Users className="inline h-3 w-3 mr-0.5" />
                                                    {quiz._count.submissions} {t('quiz.submissions')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(quiz.openAt)} - {formatDate(quiz.dueAt)}
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/class/${classData.id}/quiz/${quiz.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" /> {t('quiz.view')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {(!quiz.isPublished || quiz._count.submissions === 0) && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/class/${classData.id}/quiz/new?edit=${quiz.id}`}>
                                                                <Pencil className="h-4 w-4 mr-2" /> {t('quiz.edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDuplicate(quiz.id)} disabled={duplicating === quiz.id}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        {duplicating === quiz.id ? t('quiz.duplicating') : t('quiz.duplicate')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {!quiz.isPublished ? (
                                                        <DropdownMenuItem onClick={() => handlePublish(quiz.id)}>
                                                            <Send className="h-4 w-4 mr-2" /> {t('quiz.publish')}
                                                        </DropdownMenuItem>
                                                    ) : quiz._count.submissions === 0 ? (
                                                        <DropdownMenuItem onClick={() => handleUnpublish(quiz.id)}>
                                                            <EyeOff className="h-4 w-4 mr-2" /> {t('quiz.unpublish')}
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(quiz.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> {t('quiz.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden sm:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('quiz.titleCol')}</TableHead>
                                        <TableHead>{t('quiz.questionsCol')}</TableHead>
                                        <TableHead>{t('quiz.statusCol')}</TableHead>
                                        <TableHead>{t('quiz.submissionsCol')}</TableHead>
                                        <TableHead>{t('quiz.timeCol')}</TableHead>
                                        {isOwner && <TableHead className="text-right">{t('quiz.actionCol')}</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredQuizzes.map((quiz: any) => (
                                        <TableRow key={quiz.id}>
                                            <TableCell className="font-medium">{quiz.title}</TableCell>
                                            <TableCell>{quiz._count.questions}</TableCell>
                                            <TableCell>{getStatusBadge(quiz)}</TableCell>
                                            <TableCell>{quiz._count.submissions}</TableCell>
                                            <TableCell className="text-xs text-gray-500">
                                                {formatDate(quiz.openAt)} - {formatDate(quiz.dueAt)}
                                            </TableCell>
                                            {isOwner && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/class/${classData.id}/quiz/${quiz.id}`}>
                                                            <Button variant="ghost" size="icon" title={t('quiz.view')}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {(!quiz.isPublished || quiz._count.submissions === 0) && (
                                                            <Link href={`/class/${classData.id}/quiz/new?edit=${quiz.id}`}>
                                                                <Button variant="ghost" size="icon" title={t('quiz.edit')}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Button
                                                            variant="ghost" size="icon" title={t('quiz.duplicate')}
                                                            onClick={() => handleDuplicate(quiz.id)}
                                                            disabled={duplicating === quiz.id}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        {!quiz.isPublished ? (
                                                            <Button variant="ghost" size="icon" title={t('quiz.publish')}
                                                                onClick={() => handlePublish(quiz.id)}>
                                                                <Send className="h-4 w-4" />
                                                            </Button>
                                                        ) : quiz._count.submissions === 0 ? (
                                                            <Button variant="ghost" size="icon" title={t('quiz.unpublish')}
                                                                onClick={() => handleUnpublish(quiz.id)}>
                                                                <EyeOff className="h-4 w-4" />
                                                            </Button>
                                                        ) : null}
                                                        <Button variant="ghost" size="icon" className="text-red-500" title={t('quiz.delete')}
                                                            onClick={() => handleDelete(quiz.id)}>
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
                    </>
                )}
            </CardContent>
        </Card>
    )
}
