'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, CheckCircle, XCircle, TrendingUp, Users } from 'lucide-react'

interface QuizAnalyticsProps {
    classId: string
    quizId: string
}

interface AnalyticsData {
    totalSubmissions: number
    averageScore: number
    passRate: number
    questionStats: {
        questionId: string
        content: string
        correctRate: number
        totalAnswers: number
    }[]
}

export function QuizAnalytics({ classId, quizId }: QuizAnalyticsProps) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [classId, quizId])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}/quizzes/${quizId}/analytics`)
            if (response.ok) {
                const data = await response.json()
                setAnalytics(data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </CardContent>
            </Card>
        )
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-slate-400">
                    Không có dữ liệu
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">Số bài nộp</p>
                                <p className="text-2xl font-bold text-blue-700">{analytics.totalSubmissions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Điểm TB</p>
                                <p className="text-2xl font-bold text-green-700">{analytics.averageScore}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-600">Tỉ lệ đạt</p>
                                <p className="text-2xl font-bold text-purple-700">{analytics.passRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Question Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Phân tích câu hỏi
                    </CardTitle>
                    <CardDescription>Tỉ lệ trả lời đúng mỗi câu</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.questionStats.map((q, index) => (
                            <div key={q.questionId} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                        <span className="text-slate-400 mr-2">Câu {index + 1}:</span>
                                        {q.content.length > 50 ? q.content.slice(0, 50) + '...' : q.content}
                                    </span>
                                    <span className={`text-sm font-bold ${q.correctRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                        {q.correctRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${q.correctRate >= 70 ? 'bg-green-500' :
                                                q.correctRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${q.correctRate}%` }}
                                    />
                                </div>
                                {q.correctRate < 50 && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <XCircle className="h-3 w-3" />
                                        Câu khó - cần xem lại
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
