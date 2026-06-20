'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, BookOpen, TrendingUp, Trophy, Target } from 'lucide-react'

interface StatsData {
    totalQuizzes: number
    totalSubmissions: number
    averageScore: number
    scoreDistribution: Record<string, number>
    topStudents: { userId: string; name: string; averageScore: number; quizzesTaken: number }[]
    completionRate: number
}

interface StatsDashboardProps {
    classId: string
}

export function StatsDashboard({ classId }: StatsDashboardProps) {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/classes/${classId}/stats`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [classId])

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!stats || stats.totalSubmissions === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium">Chưa có dữ liệu thống kê</p>
                <p className="text-sm mt-1">Dữ liệu sẽ xuất hiện khi học sinh bắt đầu làm quiz</p>
            </div>
        )
    }

    const maxDistribution = Math.max(...Object.values(stats.scoreDistribution), 1)
    const distributionColors = [
        'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'
    ]
    const distributionLabels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs font-medium">Tổng quiz</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">Bài nộp</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">Điểm TB</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium">Hoàn thành</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {/* Score Distribution Chart */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Phân bố điểm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(stats.scoreDistribution).map(([range, count], index) => (
                                <div key={range} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-14 text-right font-mono">
                                        {distributionLabels[index]}
                                    </span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${distributionColors[index]} transition-all duration-500 flex items-center justify-end pr-2`}
                                            style={{ width: `${Math.max((count / maxDistribution) * 100, count > 0 ? 15 : 0)}%` }}
                                        >
                                            {count > 0 && (
                                                <span className="text-xs font-semibold text-white">{count}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Students */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Top học sinh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.topStudents.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.topStudents.map((student, index) => {
                                    const medals = ['🥇', '🥈', '🥉']
                                    return (
                                        <div key={student.userId} className="flex items-center gap-3">
                                            <span className="text-lg w-6 text-center">
                                                {index < 3 ? medals[index] : <span className="text-xs text-gray-400 font-mono">{index + 1}</span>}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{student.name}</p>
                                                <p className="text-xs text-gray-400">{student.quizzesTaken} bài</p>
                                            </div>
                                            <div className={`text-sm font-bold ${
                                                student.averageScore >= 80 ? 'text-green-600' :
                                                student.averageScore >= 50 ? 'text-amber-600' : 'text-red-500'
                                            }`}>
                                                {student.averageScore}%
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
