'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardProps {
    classId: string
    quizId: string
}

interface LeaderboardEntry {
    rank: number
    userId: string
    userName: string
    score: number
    totalPoints: number
    percentage: number
    submittedAt: string
}

export function QuizLeaderboard({ classId, quizId }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [classId, quizId])

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`/api/classes/${classId}/quizzes/${quizId}/leaderboard`)
            if (response.ok) {
                const data = await response.json()
                setLeaderboard(data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />
            case 2:
                return <Medal className="h-6 w-6 text-slate-400" />
            case 3:
                return <Award className="h-6 w-6 text-orange-500" />
            default:
                return <span className="w-6 h-6 flex items-center justify-center font-bold text-slate-500">{rank}</span>
        }
    }

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
            case 2:
                return 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
            case 3:
                return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
            default:
                return 'bg-white border-slate-100'
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Bảng xếp hạng
                </CardTitle>
                <CardDescription>Top điểm cao nhất</CardDescription>
            </CardHeader>
            <CardContent>
                {leaderboard.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">Chưa có ai làm bài</p>
                ) : (
                    <div className="space-y-2">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(entry.rank)}`}
                            >
                                <div className="w-8 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{entry.userName}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(entry.submittedAt).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{entry.score}/{entry.totalPoints}</p>
                                    <p className={`text-sm font-medium ${entry.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.percentage}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
