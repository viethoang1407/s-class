'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, ClipboardList, TrendingUp, Trophy, BarChart3, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportGradesToExcel, exportAttendanceToExcel } from '@/lib/export-excel'

interface StatsTabProps {
    classData: any
}

export function StatsTab({ classData }: StatsTabProps) {
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [classData.id])

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/stats`)
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExportGrades = () => {
        if (!classData.members || !classData.subjects) return
        exportGradesToExcel(classData, classData.grades || [], classData.subjects)
    }

    const handleExportAttendance = () => {
        if (!classData.members || !classData.attendanceSessions) return
        exportAttendanceToExcel(classData, classData.attendanceSessions)
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

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Học sinh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Bài kiểm tra
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.totalQuizzes || 0}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Điểm TB
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.averageScore || 0}%</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            Điểm danh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats?.attendanceRate || 0}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Export Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-green-500" />
                        Xuất dữ liệu
                    </CardTitle>
                    <CardDescription>Tải xuống dữ liệu lớp học</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={handleExportGrades} className="gap-2">
                            <Download className="h-4 w-4" />
                            Xuất bảng điểm (Excel)
                        </Button>
                        <Button variant="outline" onClick={handleExportAttendance} className="gap-2">
                            <Download className="h-4 w-4" />
                            Xuất điểm danh (Excel)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Students */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top học sinh
                        </CardTitle>
                        <CardDescription>Điểm quiz cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.topStudents && stats.topStudents.length > 0 ? (
                            <div className="space-y-3">
                                {stats.topStudents.map((student: any, index: number) => (
                                    <div key={student.id || index} className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-slate-100 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-50 text-slate-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium">{student.name}</p>
                                        </div>
                                        <span className="font-bold text-green-600">{student.score}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">Chưa có dữ liệu</p>
                        )}
                    </CardContent>
                </Card>

                {/* Quiz Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Kết quả Quiz
                        </CardTitle>
                        <CardDescription>Thống kê theo bài</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.quizStats && stats.quizStats.length > 0 ? (
                            <div className="space-y-3">
                                {stats.quizStats.map((quiz: any) => (
                                    <div key={quiz.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate flex-1">{quiz.title}</span>
                                            <span className="text-sm text-slate-500">{quiz.submissions} bài nộp</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${quiz.avgScore}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">TB: {quiz.avgScore}%</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">Chưa có quiz nào</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
