'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { FileText, Upload, Trash2, Download, File, FileImage, FileVideo, Plus, ExternalLink } from 'lucide-react'

interface DocumentsTabProps {
    classData: any
    isOwner: boolean
}

interface Document {
    id: string
    title: string
    description: string | null
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    createdAt: string
}

const FILE_ICONS: Record<string, any> = {
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    ppt: FileText,
    pptx: FileText,
    xls: FileText,
    xlsx: FileText,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    gif: FileImage,
    mp4: FileVideo,
    avi: FileVideo,
    mov: FileVideo,
    default: File,
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(fileType: string) {
    const Icon = FILE_ICONS[fileType.toLowerCase()] || FILE_ICONS.default
    return <Icon className="h-8 w-8" />
}

export function DocumentsTab({ classData, isOwner }: DocumentsTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [fileUrl, setFileUrl] = useState('')
    const [fileName, setFileName] = useState('')

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const response = await fetch(`/api/classes/${classData.id}/documents`)
            if (response.ok) {
                const data = await response.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error('Fetch documents error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddDocument = async () => {
        if (!title.trim() || !fileUrl.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề và link file', variant: 'destructive' })
            return
        }

        setIsUploading(true)
        try {
            // Extract file info from URL
            const urlParts = fileUrl.split('/')
            const extractedFileName = fileName || urlParts[urlParts.length - 1] || 'file'
            const fileExt = extractedFileName.split('.').pop()?.toLowerCase() || 'unknown'

            const response = await fetch(`/api/classes/${classData.id}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    fileName: extractedFileName,
                    fileUrl: fileUrl.trim(),
                    fileType: fileExt,
                    fileSize: 0, // Unknown for URL links
                }),
            })

            if (!response.ok) throw new Error('Không thể thêm tài liệu')

            toast({ title: '✓ Đã thêm tài liệu!' })
            setTitle('')
            setDescription('')
            setFileUrl('')
            setFileName('')
            setDialogOpen(false)
            fetchDocuments()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể thêm tài liệu', variant: 'destructive' })
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (documentId: string) => {
        if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return

        try {
            const response = await fetch(`/api/classes/${classData.id}/documents?id=${documentId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Không thể xóa')

            toast({ title: '✓ Đã xóa tài liệu' })
            fetchDocuments()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa tài liệu', variant: 'destructive' })
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-slate-500">
                    Đang tải...
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Tài liệu
                    </CardTitle>
                    <CardDescription>
                        {documents.length} tài liệu
                    </CardDescription>
                </div>
                {isOwner && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Thêm tài liệu
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Thêm tài liệu mới</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Tiêu đề *</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="VD: Bài giảng Chương 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mô tả</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả ngắn về tài liệu"
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link file (Google Drive, OneDrive, ...) *</Label>
                                    <Input
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                    />
                                    <p className="text-xs text-slate-500">
                                        💡 Tip: Upload file lên Google Drive → Share → Copy link
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tên file (tùy chọn)</Label>
                                    <Input
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="VD: bai-giang.pdf"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleAddDocument} disabled={isUploading}>
                                    {isUploading ? 'Đang thêm...' : 'Thêm tài liệu'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>Chưa có tài liệu nào</p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        {getFileIcon(doc.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{doc.title}</h4>
                                        {doc.description && (
                                            <p className="text-sm text-slate-500 truncate">{doc.description}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                            {doc.fileSize > 0 && ` • ${formatFileSize(doc.fileSize)}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button variant="outline" size="sm" className="w-full gap-1">
                                            <ExternalLink className="h-3 w-3" />
                                            Mở
                                        </Button>
                                    </a>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
