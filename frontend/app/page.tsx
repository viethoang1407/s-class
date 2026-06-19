import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Users, Sparkles, ArrowRight } from 'lucide-react'

export default async function HomePage() {
    const { userId } = await auth()

    if (userId) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">S-Class</span>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/sign-in">
                            <Button variant="ghost" className="text-white hover:bg-white/10">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="bg-white text-indigo-600 hover:bg-white/90">
                                Đăng ký
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center text-center py-16 md:py-24">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white/90 text-sm mb-6">
                        <Sparkles className="h-4 w-4" />
                        Tích hợp AI thông minh
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Quản lý lớp học
                        <br />
                        <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                            đơn giản & hiệu quả
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl px-4">
                        Tạo lớp học, mời học sinh bằng mã lớp, quản lý điểm số và tổ chức kiểm tra chỉ trong vài phút.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/sign-up">
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8 py-6 gap-2">
                                Bắt đầu miễn phí
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl px-4">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white border border-white/10">
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Mời bằng mã lớp</h3>
                            <p className="text-blue-100 text-sm">
                                Chia sẻ mã 6 ký tự để học sinh tự tham gia lớp học
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white border border-white/10">
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Quiz trắc nghiệm</h3>
                            <p className="text-blue-100 text-sm">
                                Tạo bài kiểm tra, tự động chấm điểm và xem kết quả
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white border border-white/10">
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">AI tạo đề thi</h3>
                            <p className="text-blue-100 text-sm">
                                Nhập nội dung, AI tự động tạo câu hỏi trắc nghiệm
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center text-blue-200 py-8 mt-8">
                    <p>© 2025 S-Class. Được xây dựng với ❤️</p>
                </footer>
            </div>
        </div>
    )
}
