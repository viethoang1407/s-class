'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { QrCode, Loader2, Camera } from 'lucide-react'
import { QRScanner } from '@/components/qr-scanner'

export default function AttendanceInputPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (code.length !== 6) {
            toast({ title: 'Lỗi', description: 'Mã điểm danh phải có 6 ký tự', variant: 'destructive' })
            return
        }

        setIsLoading(true)
        router.push(`/attendance/${code.toUpperCase()}`)
    }

    const handleQRScan = async (scannedCode: string): Promise<boolean> => {
        // Extract code from QR (could be URL or just code)
        let attendanceCode = scannedCode

        // If it's a URL, extract the code
        if (scannedCode.includes('/attendance/')) {
            const match = scannedCode.match(/\/attendance\/([A-Z0-9]{6})/i)
            if (match) {
                attendanceCode = match[1]
            }
        }

        // Validate code
        if (attendanceCode.length === 6) {
            router.push(`/attendance/${attendanceCode.toUpperCase()}`)
            return true
        }

        return false
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <main className="container mx-auto px-4 py-10 max-w-md">
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto p-4 rounded-full bg-blue-100 mb-4">
                            <QrCode className="h-12 w-12 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Điểm danh</CardTitle>
                        <CardDescription>
                            Quét mã QR hoặc nhập mã điểm danh
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* QR Scanner Button */}
                        <div className="pb-6 border-b">
                            <QRScanner
                                onScan={handleQRScan}
                                buttonText="Quét mã QR"
                            />
                        </div>

                        {/* Manual input */}
                        <div>
                            <p className="text-sm text-slate-500 mb-3">
                                Hoặc nhập mã 6 ký tự:
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="Nhập mã điểm danh"
                                    className="text-center text-2xl font-mono tracking-widest"
                                    maxLength={6}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Điểm danh'
                                    )}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
