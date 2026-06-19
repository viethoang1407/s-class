'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Bell, Send, Trash2, AlertCircle, Info, MessageSquare } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Announcement {
    id: string
    title: string
    content: string
    priority: string
    createdAt: string
}

interface AnnouncementsTabProps {
    classData: any
    isOwner: boolean
}

export function AnnouncementsTab({ classData, isOwner }: AnnouncementsTabProps) {
    const { toast } = useToast()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [priority, setPriority] = useState('normal')
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        fetchAnnouncements()
    }, [classData.id])

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/announcements`)
            if (response.ok) {
                const data = await response.json()
                setAnnouncements(data)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề và nội dung', variant: 'destructive' })
            return
        }

        setIsSending(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), content: content.trim(), priority }),
            })

            if (!response.ok) throw new Error('Không thể gửi thông báo')

            toast({ title: '✓ Đã gửi thông báo!' })
            setDialogOpen(false)
            setTitle('')
            setContent('')
            setPriority('normal')
            fetchAnnouncements()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể gửi thông báo', variant: 'destructive' })
        } finally {
            setIsSending(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa thông báo này?')) return

        try {
            const response = await fetch(`/api/classes/${classData.id}/announcements?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                toast({ title: '✓ Đã xóa thông báo' })
                fetchAnnouncements()
            }
        } catch (error) {
            toast({ title: 'Lỗi', variant: 'destructive' })
        }
    }

    const getPriorityIcon = (p: string) => {
        switch (p) {
            case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'low': return <Info className="h-4 w-4 text-slate-400" />
            default: return <MessageSquare className="h-4 w-4 text-blue-500" />
        }
    }

    const getPriorityStyles = (p: string) => {
        switch (p) {
            case 'high': return 'border-red-200 bg-red-50'
            case 'low': return 'border-slate-200 bg-slate-50'
            default: return 'border-blue-200 bg-blue-50'
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-500" />
                            Thông báo
                        </CardTitle>
                        <CardDescription>Thông báo từ giáo viên</CardDescription>
                    </div>
                    {isOwner && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Send className="h-4 w-4" />
                                    Gửi thông báo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Gửi thông báo mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Tiêu đề *</Label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="VD: Nhắc nhở nộp bài"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nội dung *</Label>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Nội dung thông báo..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mức độ</Label>
                                        <Select value={priority} onValueChange={setPriority}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Thấp</SelectItem>
                                                <SelectItem value="normal">Bình thường</SelectItem>
                                                <SelectItem value="high">Quan trọng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                                    <Button onClick={handleSend} disabled={isSending}>
                                        {isSending ? 'Đang gửi...' : 'Gửi'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có thông báo nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((ann) => (
                            <div
                                key={ann.id}
                                className={`p-4 rounded-lg border ${getPriorityStyles(ann.priority)}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {getPriorityIcon(ann.priority)}
                                        <h4 className="font-semibold">{ann.title}</h4>
                                    </div>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-slate-400 hover:text-red-500"
                                            onClick={() => handleDelete(ann.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{ann.content}</p>
                                <p className="mt-2 text-xs text-slate-400">
                                    {new Date(ann.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
