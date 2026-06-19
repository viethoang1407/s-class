'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Question {
    id: string
    content: string
    options: { A: string; B: string; C: string; D: string }
    correctOption: string
    points: number
}

interface Answer {
    questionId: string
    selectedOption: string
}

interface Submission {
    id: string
    score: number
    totalPoints: number
    submittedAt: string
    answers: Answer[]
    quiz: {
        id: string
        title: string
        classId: string
        questions: Question[]
    }
}

export default function QuizReviewPage({ params }: { params: { classId: string; quizId: string } }) {
    const router = useRouter()
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchSubmission()
    }, [])

    const fetchSubmission = async () => {
        try {
            const response = await fetch(`/api/classes/${params.classId}/quizzes/${params.quizId}/review`)
            if (response.ok) {
                const data = await response.json()
                setSubmission(data)
            }
        } catch (error) {
            console.error('Error fetching submission:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <main className="container mx-auto px-4 py-6 max-w-4xl">
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-slate-500">Không tìm thấy bài làm của bạn</p>
                            <Link href={`/class/${params.classId}/student`}>
                                <Button className="mt-4">Quay lại lớp</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    const percentage = Math.round((submission.score / submission.totalPoints) * 100)
    const answers = submission.answers as Answer[]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/class/${params.classId}/student`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Xem lại bài làm</h1>
                        <p className="text-slate-500">{submission.quiz.title}</p>
                    </div>
                </div>

                {/* Score Card */}
                <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-white/80">Điểm số của bạn</p>
                                    <p className="text-4xl font-bold">{submission.score}/{submission.totalPoints}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-5xl font-bold ${percentage >= 50 ? 'text-green-300' : 'text-red-300'}`}>
                                    {percentage}%
                                </div>
                                <p className="text-white/80 text-sm">
                                    {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Review */}
                <div className="space-y-4">
                    {submission.quiz.questions.map((question, index) => {
                        const userAnswer = answers.find(a => a.questionId === question.id)
                        const isCorrect = userAnswer?.selectedOption === question.correctOption
                        const didAnswer = !!userAnswer

                        return (
                            <Card key={question.id} className={`border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="flex-1">{question.content}</span>
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isCorrect ? (
                                                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                                                    <CheckCircle className="h-4 w-4" />
                                                    +{question.points}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
                                                    <XCircle className="h-4 w-4" />
                                                    0
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {(['A', 'B', 'C', 'D'] as const).map((option) => {
                                            const isUserChoice = userAnswer?.selectedOption === option
                                            const isCorrectAnswer = question.correctOption === option

                                            let bgColor = 'bg-slate-50'
                                            let borderColor = 'border-slate-200'
                                            let textColor = 'text-slate-700'

                                            if (isCorrectAnswer) {
                                                bgColor = 'bg-green-50'
                                                borderColor = 'border-green-500'
                                                textColor = 'text-green-700'
                                            } else if (isUserChoice && !isCorrect) {
                                                bgColor = 'bg-red-50'
                                                borderColor = 'border-red-500'
                                                textColor = 'text-red-700'
                                            }

                                            return (
                                                <div
                                                    key={option}
                                                    className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} flex items-center gap-3`}
                                                >
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isCorrectAnswer ? 'bg-green-500 text-white' :
                                                            isUserChoice ? 'bg-red-500 text-white' : 'bg-slate-200'
                                                        }`}>
                                                        {option}
                                                    </span>
                                                    <span className="flex-1">{question.options[option]}</span>
                                                    {isCorrectAnswer && (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    )}
                                                    {isUserChoice && !isCorrect && (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {!didAnswer && (
                                        <p className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                                            ⚠️ Bạn không trả lời câu này
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <Link href={`/class/${params.classId}/student`}>
                        <Button size="lg">Quay lại lớp</Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}
