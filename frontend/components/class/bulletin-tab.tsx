'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Newspaper, Plus, Link2, Calendar, User, Trash2, ExternalLink, Megaphone, BookMarked, Video, FileText } from 'lucide-react'

interface BulletinTabProps {
    classData: any
    isOwner: boolean
}

interface Post {
    id: string
    title: string
    content: string
    link?: string
    linkTitle?: string
    createdAt: string
    author: {
        name: string
    }
}

export function BulletinTab({ classData, isOwner }: BulletinTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deletingPost, setDeletingPost] = useState<Post | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Form states
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [link, setLink] = useState('')
    const [linkTitle, setLinkTitle] = useState('')

    const posts: Post[] = classData.announcements || []

    const handleCreatePost = async () => {
        if (!title.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề', variant: 'destructive' })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/bulletin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    link: link.trim() || null,
                    linkTitle: linkTitle.trim() || null
                }),
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã đăng bài viết' })
            setTitle('')
            setContent('')
            setLink('')
            setLinkTitle('')
            setIsCreating(false)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể đăng bài', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeletePost = async () => {
        if (!deletingPost) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/bulletin/${deletingPost.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã xóa bài viết' })
            setDeletingPost(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getLinkIcon = (url: string) => {
        if (url.includes('youtube') || url.includes('youtu.be')) return <Video className="h-4 w-4" />
        if (url.includes('docs.google') || url.includes('drive.google')) return <FileText className="h-4 w-4" />
        return <Link2 className="h-4 w-4" />
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
                        <Newspaper className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Bảng tin lớp học</h3>
                        <p className="text-sm text-slate-500">{posts.length} bài viết</p>
                    </div>
                </div>
                {isOwner && (
                    <Button onClick={() => setIsCreating(true)} className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                        <Plus className="h-4 w-4" />
                        Đăng bài mới
                    </Button>
                )}
            </div>

            {/* Empty State */}
            {posts.length === 0 && (
                <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center mb-4">
                            <Megaphone className="h-8 w-8 text-orange-500" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-700 mb-2">Chưa có bài viết nào</h4>
                        <p className="text-slate-500 mb-4">
                            {isOwner
                                ? 'Hãy đăng bài viết đầu tiên để thông báo với học sinh!'
                                : 'Giáo viên chưa đăng thông báo nào.'}
                        </p>
                        {isOwner && (
                            <Button onClick={() => setIsCreating(true)} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Đăng bài đầu tiên
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500" />
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BookMarked className="h-5 w-5 text-orange-500" />
                                        {post.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            {post.author?.name || 'Giáo viên'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(post.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={() => setDeletingPost(post)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Xóa bài viết"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {post.content && (
                                <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>
                            )}
                            {post.link && (
                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all group"
                                >
                                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                                        {getLinkIcon(post.link)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-blue-700 group-hover:text-blue-800 truncate">
                                            {post.linkTitle || 'Xem tài liệu'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{post.link}</p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Post Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg">
                                <Megaphone className="h-5 w-5 text-white" />
                            </div>
                            Đăng bài mới
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tiêu đề <span className="text-red-500">*</span></Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="VD: Thông báo lịch kiểm tra, Bài giảng buổi 5..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nội dung</Label>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Nhập nội dung thông báo..."
                                rows={4}
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                            <Label className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-blue-500" />
                                Đính kèm link (tùy chọn)
                            </Label>
                            <Input
                                value={linkTitle}
                                onChange={(e) => setLinkTitle(e.target.value)}
                                placeholder="Tên hiển thị (VD: Bài giảng buổi 5)"
                            />
                            <Input
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="Dán link (YouTube, Google Drive, ...)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>Hủy</Button>
                        <Button
                            onClick={handleCreatePost}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                        >
                            {isLoading ? 'Đang đăng...' : 'Đăng bài'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingPost} onOpenChange={(open) => !open && setDeletingPost(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Xóa bài viết
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            Bạn có chắc muốn xóa bài viết <strong>"{deletingPost?.title}"</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePost}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
