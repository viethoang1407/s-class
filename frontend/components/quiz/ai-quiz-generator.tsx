'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'
import { Sparkles, Upload, FileText, Trash2, Check } from 'lucide-react'

interface GeneratedQuestion {
    content: string
    options: {
        A: string
        B: string
        C: string
        D: string
    }
    correctOption: 'A' | 'B' | 'C' | 'D'
    selected?: boolean
}

interface AIQuizGeneratorProps {
    classId: string
    onQuestionsGenerated: (questions: GeneratedQuestion[]) => void
}

export function AIQuizGenerator({ classId, onQuestionsGenerated }: AIQuizGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text')
    const [textContent, setTextContent] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [numQuestions, setNumQuestions] = useState(10)
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
    const [step, setStep] = useState<'input' | 'review'>('input')
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            // Read text files directly for preview
            if (file.type === 'text/plain') {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setTextContent(e.target?.result as string || '')
                }
                reader.readAsText(file)
            }
        }
    }

    const handleGenerate = async () => {
        if (!textContent) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng nhập chủ đề hoặc nội dung',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/ai-generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: textContent,
                    numQuestions: numQuestions,
                    difficulty: 'medium',
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Không thể tạo quiz')
            }

            // Convert new format to old format
            const questionsWithSelection = result.questions.map((q: any) => ({
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

            setGeneratedQuestions(questionsWithSelection)
            setStep('review')

            toast({
                title: 'Thành công',
                description: `Đã tạo ${result.questions.length} câu hỏi từ AI`,
            })
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const toggleQuestionSelection = (index: number) => {
        setGeneratedQuestions(prev =>
            prev.map((q, i) => i === index ? { ...q, selected: !q.selected } : q)
        )
    }

    const handleConfirm = () => {
        const selectedQuestions = generatedQuestions.filter(q => q.selected)
        if (selectedQuestions.length === 0) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn ít nhất 1 câu hỏi',
                variant: 'destructive',
            })
            return
        }
        onQuestionsGenerated(selectedQuestions)
        handleClose()
        toast({
            title: 'Thành công',
            description: `Đã thêm ${selectedQuestions.length} câu hỏi vào quiz`,
        })
    }

    const handleClose = () => {
        setIsOpen(false)
        setStep('input')
        setTextContent('')
        setSelectedFile(null)
        setGeneratedQuestions([])
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Tạo quiz bằng AI
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Tạo Quiz bằng AI
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'input'
                            ? 'Nhập nội dung đề cương hoặc upload file để AI tự động tạo câu hỏi trắc nghiệm'
                            : 'Xem lại và chọn các câu hỏi muốn thêm vào quiz'
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'input' ? (
                    <div className="space-y-4 py-4">
                        {/* Input method tabs */}
                        <div className="flex gap-2">
                            <Button
                                variant={inputMethod === 'text' ? 'default' : 'outline'}
                                onClick={() => setInputMethod('text')}
                                className="gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Nhập văn bản
                            </Button>
                            <Button
                                variant={inputMethod === 'file' ? 'default' : 'outline'}
                                onClick={() => setInputMethod('file')}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Upload file
                            </Button>
                        </div>

                        {inputMethod === 'file' && (
                            <div className="space-y-2">
                                <Label>Chọn file (TXT, PDF)</Label>
                                <Input
                                    type="file"
                                    accept=".txt,.pdf"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                                {selectedFile && (
                                    <p className="text-sm text-muted-foreground">
                                        Đã chọn: {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Nội dung đề cương / câu hỏi mẫu</Label>
                            <Textarea
                                placeholder="Nhập hoặc dán nội dung đề cương, bài giảng, hoặc các câu hỏi mẫu ở đây...

Ví dụ:
- Thủ đô của Việt Nam là gì?
- Công thức tính diện tích hình tròn
- Năm nào Việt Nam thống nhất đất nước?

AI sẽ tự động tạo câu hỏi trắc nghiệm từ nội dung này."
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                disabled={isLoading}
                                rows={10}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Số câu hỏi muốn tạo</Label>
                            <Input
                                type="number"
                                min={1}
                                max={50}
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Đã tạo {generatedQuestions.length} câu hỏi. Chọn các câu muốn thêm vào quiz:
                        </p>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                            {generatedQuestions.map((question, index) => (
                                <Card
                                    key={index}
                                    className={`cursor-pointer transition-all ${question.selected ? 'ring-2 ring-primary' : 'opacity-60'}`}
                                    onClick={() => toggleQuestionSelection(index)}
                                >
                                    <CardHeader className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${question.selected ? 'bg-primary text-white' : 'bg-muted'}`}>
                                                {question.selected ? <Check className="h-4 w-4" /> : index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-base font-medium">
                                                    {question.content}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                                                <div
                                                    key={opt}
                                                    className={`p-2 rounded ${question.correctOption === opt ? 'bg-green-100 text-green-800 font-medium' : 'bg-muted'}`}
                                                >
                                                    {opt}. {question.options[opt]}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'input' ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button onClick={handleGenerate} disabled={isLoading || (!textContent && !selectedFile)}>
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Tạo câu hỏi
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep('input')}>
                                Quay lại
                            </Button>
                            <Button onClick={handleConfirm}>
                                Thêm {generatedQuestions.filter(q => q.selected).length} câu hỏi
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
