'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, Check, Calendar } from 'lucide-react'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { vi } from 'date-fns/locale'

interface Question {
    content: string
    options: { A: string; B: string; C: string; D: string }
    correctOption: 'A' | 'B' | 'C' | 'D'
    points: number
}

interface AIQuestion {
    content: string
    options: { A: string; B: string; C: string; D: string }
    correctOption: 'A' | 'B' | 'C' | 'D'
    selected: boolean
}

export default function NewQuizPage({ params }: { params: { classId: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [openAt, setOpenAt] = useState('')
    const [dueAt, setDueAt] = useState('')
    const [openDate, setOpenDate] = useState<Date | null>(null)
    const [dueDate, setDueDate] = useState<Date | null>(null)
    const [durationMinutes, setDurationMinutes] = useState('')
    const [defaultPoints, setDefaultPoints] = useState('1')
    const [questions, setQuestions] = useState<Question[]>([
        { content: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A', points: 1 }
    ])

    // AI Generator state
    const [aiDialogOpen, setAiDialogOpen] = useState(false)
    const [aiContent, setAiContent] = useState('')
    const [aiNumQuestions, setAiNumQuestions] = useState('5')
    const [aiDifficulty, setAiDifficulty] = useState('medium')
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<AIQuestion[]>([])
    const [showAiReview, setShowAiReview] = useState(false)

    const addQuestion = () => {
        setQuestions([...questions, { content: '', options: { A: '', B: '', C: '', D: '' }, correctOption: 'A', points: parseInt(defaultPoints) || 1 }])
    }

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index))
        }
    }

    const updateQuestion = (index: number, field: string, value: string | number) => {
        const updated = [...questions]
        if (field === 'content') {
            updated[index].content = value as string
        } else if (field === 'correctOption') {
            updated[index].correctOption = value as 'A' | 'B' | 'C' | 'D'
        } else if (field === 'points') {
            updated[index].points = parseInt(value as string) || 1
        } else if (field.startsWith('option')) {
            const option = field.replace('option', '') as 'A' | 'B' | 'C' | 'D'
            updated[index].options[option] = value as string
        }
        setQuestions(updated)
    }

    const handleAIGenerate = async () => {
        if (!aiContent.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập nội dung', variant: 'destructive' })
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/ai-generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: aiContent,
                    numQuestions: parseInt(aiNumQuestions) || 5,
                    difficulty: aiDifficulty,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Không thể tạo câu hỏi')
            }

            // Convert format from new API
            const generated: AIQuestion[] = result.questions.map((q: any) => ({
                content: q.content,
                options: {
                    A: q.options[0],
                    B: q.options[1],
                    C: q.options[2],
                    D: q.options[3],
                },
                correctOption: ['A', 'B', 'C', 'D'][q.correctIndex] as 'A' | 'B' | 'C' | 'D',
                selected: true,
            }))

            setAiGeneratedQuestions(generated)
            setShowAiReview(true)
            toast({ title: 'Thành công!', description: `Đã tạo ${generated.length} câu hỏi. Hãy chọn câu muốn dùng.` })
        } catch (error) {
            toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Đã xảy ra lỗi', variant: 'destructive' })
        } finally {
            setIsGenerating(false)
        }
    }

    const toggleAiQuestion = (index: number) => {
        const updated = [...aiGeneratedQuestions]
        updated[index].selected = !updated[index].selected
        setAiGeneratedQuestions(updated)
    }

    const confirmAiQuestions = () => {
        const selectedQuestions = aiGeneratedQuestions
            .filter(q => q.selected)
            .map(q => ({
                content: q.content,
                options: q.options,
                correctOption: q.correctOption,
                points: parseInt(defaultPoints) || 1,
            }))

        if (selectedQuestions.length === 0) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn ít nhất 1 câu hỏi', variant: 'destructive' })
            return
        }

        // Add to existing questions (remove empty ones first)
        const existingValidQuestions = questions.filter(q => q.content.trim())
        setQuestions([...existingValidQuestions, ...selectedQuestions])

        setAiDialogOpen(false)
        setShowAiReview(false)
        setAiGeneratedQuestions([])
        setAiContent('')
        toast({ title: 'Đã thêm!', description: `Đã thêm ${selectedQuestions.length} câu hỏi` })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề', variant: 'destructive' })
            return
        }

        if (!openAt || !dueAt) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn thời gian mở và đóng', variant: 'destructive' })
            return
        }

        const validQuestions = questions.filter(q =>
            q.content.trim() &&
            q.options.A.trim() &&
            q.options.B.trim() &&
            q.options.C.trim() &&
            q.options.D.trim()
        )

        if (validQuestions.length === 0) {
            toast({ title: 'Lỗi', description: 'Cần ít nhất 1 câu hỏi đầy đủ', variant: 'destructive' })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/classes/${params.classId}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    openAt: new Date(openAt).toISOString(),
                    dueAt: new Date(dueAt).toISOString(),
                    durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
                    questions: validQuestions,
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || 'Không thể tạo quiz')
            }

            toast({ title: 'Tạo quiz thành công!' })
            router.push(`/class/${params.classId}`)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Đã xảy ra lỗi', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/class/${params.classId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Tạo Quiz mới</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Kiểm tra chương 1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả về bài kiểm tra"
                                    rows={2}
                                />
                            </div>

                            {/* Quick time buttons */}
                            <div className="space-y-2">
                                <Label>Thời gian nhanh</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const now = new Date()
                                            const later = new Date(now.getTime() + 60 * 60 * 1000)
                                            const formatLocal = (d: Date) => {
                                                const pad = (n: number) => n.toString().padStart(2, '0')
                                                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
                                            }
                                            setOpenAt(formatLocal(now))
                                            setDueAt(formatLocal(later))
                                            setOpenDate(now)
                                            setDueDate(later)
                                        }}
                                    >
                                        Mở ngay (1 giờ)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const now = new Date()
                                            const later = new Date(now.getTime() + 24 * 60 * 60 * 1000)
                                            const formatLocal = (d: Date) => {
                                                const pad = (n: number) => n.toString().padStart(2, '0')
                                                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
                                            }
                                            setOpenAt(formatLocal(now))
                                            setDueAt(formatLocal(later))
                                            setOpenDate(now)
                                            setDueDate(later)
                                        }}
                                    >
                                        Mở ngay (24 giờ)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const now = new Date()
                                            const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                                            const formatLocal = (d: Date) => {
                                                const pad = (n: number) => n.toString().padStart(2, '0')
                                                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
                                            }
                                            setOpenAt(formatLocal(now))
                                            setDueAt(formatLocal(later))
                                            setOpenDate(now)
                                            setDueDate(later)
                                        }}
                                    >
                                        Mở ngay (1 tuần)
                                    </Button>
                                </div>
                            </div>

                            {/* Date/Time selectors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Open At */}
                                <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                                    <Label className="text-base font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Mở lúc *
                                    </Label>
                                    <DatePicker
                                        selected={openDate}
                                        onChange={(date: Date | null) => {
                                            setOpenDate(date)
                                            if (date) {
                                                const pad = (n: number) => n.toString().padStart(2, '0')
                                                setOpenAt(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`)
                                            }
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        locale={vi}
                                        placeholderText="Chọn ngày và giờ"
                                        className="w-full h-10 px-3 border rounded-md bg-white text-center font-medium"
                                        calendarClassName="shadow-xl"
                                        minDate={new Date()}
                                    />
                                </div>

                                {/* Due At */}
                                <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                                    <Label className="text-base font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Đóng lúc *
                                    </Label>
                                    <DatePicker
                                        selected={dueDate}
                                        onChange={(date: Date | null) => {
                                            setDueDate(date)
                                            if (date) {
                                                const pad = (n: number) => n.toString().padStart(2, '0')
                                                setDueAt(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`)
                                            }
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        locale={vi}
                                        placeholderText="Chọn ngày và giờ"
                                        className="w-full h-10 px-3 border rounded-md bg-white text-center font-medium"
                                        calendarClassName="shadow-xl"
                                        minDate={openDate || new Date()}
                                    />
                                </div>
                            </div>

                            {/* Other options */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Thời gian làm (phút)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        placeholder="Không giới hạn"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="defaultPoints">Điểm/câu</Label>
                                    <Input
                                        id="defaultPoints"
                                        type="number"
                                        value={defaultPoints}
                                        onChange={(e) => setDefaultPoints(e.target.value)}
                                        min={1}
                                    />
                                </div>
                            </div>

                            {openAt && dueAt && (
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                                    📅 <strong>Từ:</strong> {new Date(openAt).toLocaleString('vi-VN', { hour12: false })}
                                    <strong className="mx-2">→</strong>
                                    <strong>Đến:</strong> {new Date(dueAt).toLocaleString('vi-VN', { hour12: false })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Câu hỏi ({questions.length}) - Tổng: {totalPoints} điểm</CardTitle>
                                <CardDescription>Thêm các câu hỏi trắc nghiệm</CardDescription>
                            </div>
                            <Dialog open={aiDialogOpen} onOpenChange={(open) => {
                                setAiDialogOpen(open)
                                if (!open) {
                                    setShowAiReview(false)
                                    setAiGeneratedQuestions([])
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" className="gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Tạo bằng AI
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            {showAiReview ? 'Chọn câu hỏi' : 'Tạo câu hỏi bằng AI'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {showAiReview
                                                ? 'Chọn những câu hỏi bạn muốn thêm vào quiz'
                                                : 'Nhập nội dung bài học, AI sẽ tự động tạo câu hỏi'}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {!showAiReview ? (
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Nội dung bài học</Label>
                                                <Textarea
                                                    value={aiContent}
                                                    onChange={(e) => setAiContent(e.target.value)}
                                                    placeholder="Dán nội dung bài học vào đây..."
                                                    rows={8}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Số câu hỏi</Label>
                                                <Input
                                                    type="number"
                                                    value={aiNumQuestions}
                                                    onChange={(e) => setAiNumQuestions(e.target.value)}
                                                    min={1}
                                                    max={20}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Độ khó</Label>
                                                <select
                                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                                    value={aiDifficulty}
                                                    onChange={(e) => setAiDifficulty(e.target.value)}
                                                >
                                                    <option value="random">🎲 Ngẫu nhiên</option>
                                                    <option value="easy">Dễ</option>
                                                    <option value="medium">Trung bình</option>
                                                    <option value="hard">Khó</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 py-4">
                                            {aiGeneratedQuestions.map((q, index) => (
                                                <div
                                                    key={index}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${q.selected ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'
                                                        }`}
                                                    onClick={() => toggleAiQuestion(index)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox checked={q.selected} />
                                                        <div className="flex-1">
                                                            <p className="font-medium mb-2">Câu {index + 1}: {q.content}</p>
                                                            <div className="grid grid-cols-2 gap-1 text-sm text-slate-600">
                                                                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                                                    <p key={opt} className={q.correctOption === opt ? 'text-green-600 font-medium' : ''}>
                                                                        {opt}. {q.options[opt]} {q.correctOption === opt && '✓'}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-sm text-slate-500 text-center">
                                                Đã chọn {aiGeneratedQuestions.filter(q => q.selected).length}/{aiGeneratedQuestions.length} câu
                                            </p>
                                        </div>
                                    )}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => {
                                            if (showAiReview) {
                                                setShowAiReview(false)
                                            } else {
                                                setAiDialogOpen(false)
                                            }
                                        }}>
                                            {showAiReview ? 'Quay lại' : 'Hủy'}
                                        </Button>

                                        {!showAiReview ? (
                                            <Button type="button" onClick={handleAIGenerate} disabled={isGenerating}>
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Đang tạo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Tạo câu hỏi
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button type="button" onClick={confirmAiQuestions}>
                                                <Check className="h-4 w-4 mr-2" />
                                                Thêm {aiGeneratedQuestions.filter(q => q.selected).length} câu đã chọn
                                            </Button>
                                        )}
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.map((q, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <Label className="text-lg font-medium">Câu {index + 1}</Label>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm">Điểm:</Label>
                                            <Input
                                                type="number"
                                                value={q.points}
                                                onChange={(e) => updateQuestion(index, 'points', e.target.value)}
                                                className="w-20"
                                                min={1}
                                            />
                                            {questions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeQuestion(index)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <Textarea
                                        value={q.content}
                                        onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                                        placeholder="Nội dung câu hỏi"
                                        rows={2}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                            <div key={opt} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${index}`}
                                                    checked={q.correctOption === opt}
                                                    onChange={() => updateQuestion(index, 'correctOption', opt)}
                                                    className="w-4 h-4"
                                                />
                                                <Label className="w-6">{opt}.</Label>
                                                <Input
                                                    value={q.options[opt]}
                                                    onChange={(e) => updateQuestion(index, `option${opt}`, e.target.value)}
                                                    placeholder={`Đáp án ${opt}`}
                                                    className="flex-1"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={addQuestion} className="w-full gap-2">
                                <Plus className="h-4 w-4" />
                                Thêm câu hỏi thủ công
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Link href={`/class/${params.classId}`}>
                            <Button type="button" variant="outline">Hủy</Button>
                        </Link>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang tạo...' : `Tạo Quiz (${totalPoints} điểm)`}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
