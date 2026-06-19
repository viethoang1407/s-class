'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Question {
    id: string
    content: string
    options: { A: string; B: string; C: string; D: string }
    points: number
}

interface Quiz {
    id: string
    title: string
    description: string | null
    durationMinutes: number | null
    questions: Question[]
}

export default function TakeQuizPage({ params }: { params: { classId: string; quizId: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState<{ score: number; totalPoints: number; correctAnswers: Record<string, string> } | null>(null)

    useEffect(() => {
        fetchQuiz()
    }, [])

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer)
                    if (!submitted) handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, submitted])

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/classes/${params.classId}/quizzes/${params.quizId}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể tải quiz')
            }

            if (data.alreadySubmitted) {
                setSubmitted(true)
                setResult(data.submission)
            } else {
                setQuiz(data.quiz)
                if (data.quiz.durationMinutes) {
                    setTimeLeft(data.quiz.durationMinutes * 60)
                }
            }
        } catch (error) {
            toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Đã xảy ra lỗi', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectAnswer = (questionId: string, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }))
    }

    const handleSubmit = async () => {
        if (isSubmitting) return

        const unanswered = quiz?.questions.filter(q => !answers[q.id]).length || 0
        if (unanswered > 0 && !confirm(`Còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/classes/${params.classId}/quizzes/${params.quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể nộp bài')
            }

            setSubmitted(true)
            setResult(data)
            toast({ title: 'Nộp bài thành công!' })
        } catch (error) {
            toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Đã xảy ra lỗi', variant: 'destructive' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (submitted && result) {
        const percentage = Math.round((result.score / result.totalPoints) * 100)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
                <Header />
                <main className="container mx-auto px-4 py-6 max-w-2xl">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl">Đã hoàn thành!</CardTitle>
                            <CardDescription>Kết quả bài làm của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-5xl font-bold text-primary">
                                {result.score}/{result.totalPoints}
                            </div>
                            <div className="text-2xl text-slate-600">
                                {percentage}%
                            </div>
                            <div className={`text-lg font-medium ${percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                {percentage >= 80 ? 'Xuất sắc! 🌟' :
                                    percentage >= 50 ? 'Đạt yêu cầu 👍' :
                                        'Cần cố gắng thêm 💪'}
                            </div>

                            <div className="pt-4">
                                <Link href={`/class/${params.classId}/student`}>
                                    <Button>Quay lại lớp học</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <main className="container mx-auto px-4 py-6 max-w-2xl text-center">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-xl font-bold mb-4">Không thể tải quiz</h1>
                    <Link href={`/class/${params.classId}/student`}>
                        <Button>Quay lại</Button>
                    </Link>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            {/* Sticky Timer */}
            {timeLeft !== null && (
                <div className={`sticky top-14 z-40 py-2 px-4 text-center font-mono text-lg ${timeLeft < 60 ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    <Clock className="inline h-5 w-5 mr-2" />
                    Thời gian còn lại: {formatTime(timeLeft)}
                </div>
            )}

            <main className="container mx-auto px-4 py-6 max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/class/${params.classId}/student`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                        {quiz.description && <p className="text-slate-600">{quiz.description}</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base">Câu {index + 1}</CardTitle>
                                    <span className="text-sm text-slate-500">{question.points} điểm</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="font-medium">{question.content}</p>
                                <div className="grid gap-2">
                                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleSelectAnswer(question.id, opt)}
                                            className={`text-left p-3 rounded-lg border transition-all ${answers[question.id] === opt
                                                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="font-medium mr-2">{opt}.</span>
                                            {question.options[opt]}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t mt-6 -mx-4 px-4 py-4">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            Đã trả lời: {Object.keys(answers).length}/{quiz.questions.length} câu
                        </span>
                        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang nộp...
                                </>
                            ) : (
                                'Nộp bài'
                            )}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
