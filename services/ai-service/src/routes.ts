/**
 * 🤖 AI Routes - Chat + Quiz Generation
 */

import { Router, Request, Response } from 'express'
import Groq from 'groq-sdk'
import OpenAI from 'openai'

export const aiRoutes = Router()

const fallbackResponses = [
    'Xin lỗi, tôi đang bận. Bạn thử lại sau nhé! 😊',
    'Hệ thống đang bảo trì, vui lòng quay lại sau!',
    'AI đang nghỉ ngơi, bạn thử hỏi lại sau vài phút nhé! 🤖',
]

// POST /api/ai-chat
aiRoutes.post('/api/ai-chat', async (req: Request, res: Response) => {
    try {
        const { message } = req.body
        if (!message) return res.status(400).json({ error: 'Thiếu nội dung' })

        if (!process.env.GROQ_API_KEY) {
            return res.json({ reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] })
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Bạn là trợ lý AI học tập thân thiện cho học sinh Việt Nam.\n\nQuy tắc:\n- Trả lời ngắn gọn, dễ hiểu (tối đa 150 từ)\n- Sử dụng tiếng Việt\n- Thân thiện, dùng emoji phù hợp\n- Nếu là câu hỏi về bài học, giải thích rõ ràng\n- Nếu không liên quan học tập, vẫn trả lời lịch sự`,
                },
                { role: 'user', content: message },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        })

        const reply = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không hiểu.'
        return res.json({ reply })
    } catch (error: any) {
        console.error('AI Chat error:', error?.message)
        return res.json({ reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] })
    }
})

// POST /api/ai-generate-quiz
aiRoutes.post('/api/ai-generate-quiz', async (req: Request, res: Response) => {
    try {
        const { topic, numQuestions, difficulty } = req.body
        if (!topic) return res.status(400).json({ error: 'Vui lòng nhập chủ đề' })

        let difficultyText = 'trung bình'
        if (difficulty === 'easy') difficultyText = 'dễ, cơ bản'
        else if (difficulty === 'hard') difficultyText = 'khó, nâng cao'
        else if (difficulty === 'random') difficultyText = 'hỗn hợp (có cả dễ, trung bình và khó)'

        const prompt = `Bạn là giáo viên Việt Nam. Hãy tạo ${numQuestions || 5} câu hỏi trắc nghiệm về chủ đề: "${topic}"\n\nYêu cầu:\n- Độ khó: ${difficultyText}\n- Mỗi câu có 4 đáp án A, B, C, D\n- Chỉ có 1 đáp án đúng\n- Câu hỏi rõ ràng, chính xác\n\nTrả về JSON theo format sau (KHÔNG markdown, CHỈ JSON thuần):\n[\n  {\n    "content": "Nội dung câu hỏi?",\n    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],\n    "correctIndex": 0\n  }\n]\n\ncorrectIndex là vị trí đáp án đúng (0=A, 1=B, 2=C, 3=D).`

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000,
        })

        const responseText = completion.choices[0]?.message?.content || '[]'
        let questions: any[] = []
        try {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            if (jsonMatch) questions = JSON.parse(jsonMatch[0])
        } catch (parseError) {
            return res.status(500).json({ error: 'AI không thể tạo câu hỏi. Thử lại!' })
        }

        if (!questions || questions.length === 0) {
            return res.status(500).json({ error: 'Không tạo được câu hỏi' })
        }

        return res.json({ questions })
    } catch (error) {
        console.error('AI Generate Quiz error:', error)
        return res.status(500).json({ error: 'Lỗi AI. Vui lòng thử lại!' })
    }
})

// POST /api/chat (advanced chat with history)
aiRoutes.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) return res.status(500).json({ error: 'API Key chưa được cấu hình.' })

        const { message, history } = req.body
        if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Tin nhắn không hợp lệ' })

        const groqClient = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
                role: 'system',
                content: `Bạn là AI Assistant trên hệ thống Study 1.0 - một nền tảng quản lý lớp học trực tuyến.\nBạn có thể giúp người dùng:\n- Soạn giáo án và kế hoạch bài học\n- Tạo câu hỏi kiểm tra và bài tập\n- Giải đáp thắc mắc về kiến thức các môn học\n- Tư vấn phương pháp giảng dạy\n\nHãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu và chuyên nghiệp.`,
            },
        ]

        if (history && Array.isArray(history)) {
            history.forEach((msg: { role: string; content: string }) => {
                messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content })
            })
        }

        messages.push({ role: 'user', content: message })

        const completion = await groqClient.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 2048,
            temperature: 0.7,
        })

        const text = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời.'
        return res.json({ success: true, message: text })
    } catch (error: unknown) {
        console.error('Chat error:', error)
        const errorMessage = error instanceof Error ? `Lỗi: ${error.message}` : 'Đã xảy ra lỗi.'
        return res.status(500).json({ error: errorMessage })
    }
})
