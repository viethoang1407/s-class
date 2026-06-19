'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

export function JoinClassDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [code, setCode] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const cleanCode = code.trim().toUpperCase()

        if (!cleanCode || cleanCode.length !== 6) {
            toast({
                title: 'Lỗi',
                description: 'Mã lớp phải có 6 ký tự',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: cleanCode }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Không thể tham gia lớp học')
            }

            if (result.pending) {
                toast({
                    title: 'Đã gửi yêu cầu! ⏳',
                    description: `Bạn đang ở phòng chờ lớp "${result.className}". Vui lòng đợi giáo viên duyệt.`,
                })
            } else {
                toast({
                    title: 'Tham gia thành công! 🎉',
                    description: `Bạn đã tham gia lớp "${result.className}"`,
                })
            }

            setOpen(false)
            setCode('')
            router.refresh()
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Tham gia lớp
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tham gia lớp học</DialogTitle>
                        <DialogDescription>
                            Nhập mã lớp do giáo viên cung cấp để tham gia
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Mã lớp (6 ký tự)</Label>
                            <Input
                                id="code"
                                placeholder="Nhập mã lớp"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                disabled={isLoading}
                                maxLength={6}
                                className="text-center text-2xl font-mono tracking-widest uppercase"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading || code.length !== 6}>
                            {isLoading ? 'Đang tham gia...' : 'Tham gia'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
