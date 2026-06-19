'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Pencil } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface EditClassButtonProps {
    classId: string
    currentName: string
    currentDescription: string | null
}

export function EditClassButton({ classId, currentName, currentDescription }: EditClassButtonProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(currentName)
    const [description, setDescription] = useState(currentDescription || '')
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: 'Lỗi', description: 'Tên lớp không được trống', variant: 'destructive' })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Không thể cập nhật')
            }

            toast({ title: '✓ Đã cập nhật thông tin lớp!' })
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sửa thông tin lớp</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tên lớp *</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Toán 12A1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn về lớp học"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
