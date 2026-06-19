'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Bot, Send, User, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function AIChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Lỗi khi gửi tin nhắn')
            }

            setMessages(prev => [...prev, { role: 'assistant', content: result.message }])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Xin lỗi, đã xảy ra lỗi: ${error instanceof Error ? error.message : 'Không rõ nguyên nhân'}`,
            }])
        } finally {
            setIsLoading(false)
            // Focus back to input
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const suggestedQuestions = [
        'Giúp tôi soạn giáo án môn Toán',
        'Tạo 5 câu hỏi trắc nghiệm về lịch sử',
        'Phương pháp dạy học tích cực',
        'Cách đánh giá học sinh hiệu quả',
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">AI Assistant</h1>
                        <p className="text-sm text-slate-500">Trợ lý thông minh hỗ trợ giảng dạy</p>
                    </div>
                </div>

                {/* Chat Container */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <div className="p-4 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 mb-4">
                                    <Bot className="h-10 w-10 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-700">Xin chào! Tôi là AI Assistant</h3>
                                <p className="text-slate-500 mb-6 max-w-md text-sm">
                                    Tôi có thể giúp bạn soạn giáo án, tạo câu hỏi, giải đáp thắc mắc và nhiều hơn nữa.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                    {suggestedQuestions.map((q, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="text-left h-auto py-3 px-4 text-sm"
                                            onClick={() => setInput(q)}
                                        >
                                            {q}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                                : 'bg-slate-100 text-slate-800'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </CardContent>

                    {/* Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                disabled={isLoading}
                                className="flex-1"
                                autoFocus
                            />
                            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    )
}
