'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ClipboardList, Plus, QrCode, Check, X, Clock, UserCheck, Users, TrendingUp, Calendar, Trash2, Pencil } from 'lucide-react'
import QRCode from 'qrcode'

interface AttendanceTabProps {
    classData: any
    isOwner: boolean
}

export function AttendanceTab({ classData, isOwner }: AttendanceTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isCreating, setIsCreating] = useState(false)
    const [sessionTitle, setSessionTitle] = useState('')
    const [duration, setDuration] = useState('15')
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [activeSession, setActiveSession] = useState<any>(null)
    const [showQR, setShowQR] = useState(false)
    const [updatingCell, setUpdatingCell] = useState<string | null>(null)
    const [deletingSession, setDeletingSession] = useState<{ id: string, title: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editingSession, setEditingSession] = useState<{ id: string, title: string } | null>(null)
    const [newTitle, setNewTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    // Optimistic updates - lưu trạng thái local để UI cập nhật ngay
    const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

    const sessions = classData.attendanceSessions || []


    const handleCreateSession = async () => {
        if (!sessionTitle.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tên buổi học', variant: 'destructive' })
            return
        }

        try {
            const response = await fetch(`/api/classes/${classData.id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: sessionTitle.trim(),
                    durationMinutes: parseInt(duration),
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Không thể tạo phiên điểm danh')
            }

            const attendanceUrl = `${window.location.origin}/attendance/${result.code}`
            const qr = await QRCode.toDataURL(attendanceUrl)
            setQrCodeUrl(qr)
            setActiveSession(result)
            setShowQR(true)
            setIsCreating(false)
            setSessionTitle('')

            toast({ title: '✓ Tạo phiên điểm danh thành công!' })
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Đã xảy ra lỗi', variant: 'destructive' })
        }
    }

    const handleUpdateStatus = async (sessionId: string, userId: string, status: string) => {
        const cellKey = `${sessionId}-${userId}`

        // Optimistic update - cập nhật UI ngay lập tức
        setLocalStatuses(prev => ({ ...prev, [cellKey]: status }))

        try {
            const response = await fetch(`/api/classes/${classData.id}/attendance/${sessionId}/records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status, isManual: true }),
            })

            if (!response.ok) throw new Error('API failed')

            // Hiện toast thông báo đã lưu
            const labels: Record<string, string> = { 'PRESENT': 'Có mặt', 'ABSENT': 'Vắng', 'LATE': 'Muộn', 'EXCUSED': 'Có phép' }
            toast({ title: `✓ Đã lưu: ${labels[status] || status}` })

            // Refresh data từ server (chạy ngầm, không block UI)
            router.refresh()
        } catch (error) {
            // Rollback nếu lỗi
            setLocalStatuses(prev => {
                const newState = { ...prev }
                delete newState[cellKey]
                return newState
            })
            toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' })
        }
    }

    const handleDeleteSession = async () => {
        if (!deletingSession) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/attendance/${deletingSession.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã xóa buổi điểm danh' })
            setDeletingSession(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSaveTitle = async () => {
        if (!editingSession || !newTitle.trim()) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/attendance/${editingSession.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle.trim() }),
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã lưu' })
            setEditingSession(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể lưu', variant: 'destructive' })
        } finally {
            setIsSaving(false)
        }
    }

    // Calculate stats - sử dụng localStatuses để cập nhật realtime
    const memberStats = classData.members.map((member: any) => {
        const totalSessions = sessions.length
        let present = 0

        sessions.forEach((s: any) => {
            const cellKey = `${s.id}-${member.user.id}`
            // Ưu tiên lấy từ localStatuses, sau đó từ records
            const record = s.records?.find((r: any) => r.userId === member.user.id)
            const currentStatus = localStatuses[cellKey] ?? record?.status ?? 'ABSENT'

            if (currentStatus === 'PRESENT' || currentStatus === 'LATE') {
                present++
            }
        })

        const rate = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0
        return { ...member, present, totalSessions, rate }
    })

    const avgAttendance = memberStats.length > 0
        ? Math.round(memberStats.reduce((sum: number, m: any) => sum + m.rate, 0) / memberStats.length)
        : 0

    return (
        <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{sessions.length}</p>
                                <p className="text-xs text-blue-600">Buổi học</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">{avgAttendance}%</p>
                                <p className="text-xs text-green-600">Có mặt TB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-700">{classData.members.length}</p>
                                <p className="text-xs text-purple-600">Học sinh</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {isOwner && (
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setIsCreating(true)}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                    <Plus className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-orange-700">Tạo mới</p>
                                    <p className="text-xs text-orange-600">Điểm danh</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create Session Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-blue-500" />
                            Tạo phiên điểm danh mới
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên buổi học</Label>
                            <Input
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                placeholder="VD: Buổi 1 - Giới thiệu môn học"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Thời gian điểm danh</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 phút</SelectItem>
                                    <SelectItem value="10">10 phút</SelectItem>
                                    <SelectItem value="15">15 phút</SelectItem>
                                    <SelectItem value="30">30 phút</SelectItem>
                                    <SelectItem value="60">60 phút</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)}>Hủy</Button>
                        <Button onClick={handleCreateSession} className="bg-blue-500 hover:bg-blue-600">
                            <QrCode className="h-4 w-4 mr-2" />
                            Tạo & Mở QR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogContent className="text-center">
                    <DialogHeader>
                        <DialogTitle>🎯 Mã QR điểm danh</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {qrCodeUrl && (
                            <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-64 h-64 rounded-lg shadow-lg" />
                        )}
                        <p className="text-3xl font-mono font-bold mt-4 text-blue-600">{activeSession?.code}</p>
                        <p className="text-sm text-slate-500 mt-2">
                            ⏱️ Hết hạn sau {duration} phút
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ClipboardList className="h-5 w-5 text-blue-500" />
                        Bảng điểm danh
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length > 0 ? (
                        <div className="overflow-x-auto -mx-4 px-4">
                            <table className="w-full min-w-max">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-medium text-slate-600">Học sinh</th>
                                        <th className="text-center py-3 px-2 font-medium text-slate-600 w-24">Tỷ lệ</th>
                                        {sessions.slice(0, 6).map((session: any) => (
                                            <th key={session.id} className="text-center py-2 px-1 min-w-[100px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-xs font-medium text-slate-700 truncate max-w-[60px]">
                                                        {session.title || 'Buổi học'}
                                                    </span>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingSession({ id: session.id, title: session.title || 'Buổi học' })
                                                                setNewTitle(session.title || '')
                                                            }}
                                                            className="p-0.5 text-slate-400 hover:text-blue-500 rounded transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {new Date(session.date).toLocaleDateString('vi-VN')}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberStats.map((member: any) => (
                                        <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-3 px-2">
                                                <p className="font-medium text-slate-800">{member.displayName || member.user.name}</p>
                                                <p className="text-xs text-slate-400">{member.present}/{member.totalSessions} buổi</p>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-sm font-bold ${member.rate >= 80 ? 'text-green-600' :
                                                        member.rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {member.rate}%
                                                    </span>
                                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${member.rate >= 80 ? 'bg-green-500' :
                                                                member.rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${member.rate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            {sessions.slice(0, 6).map((session: any) => {
                                                const record = session.records?.find((r: any) => r.userId === member.user.id)
                                                const cellKey = `${session.id}-${member.user.id}`
                                                // Ưu tiên lấy từ localStatuses (optimistic), sau đó từ record
                                                const status = localStatuses[cellKey] ?? record?.status ?? 'ABSENT'

                                                const getStatusLabel = (s: string) => {
                                                    switch (s) {
                                                        case 'PRESENT': return 'Có mặt'
                                                        case 'ABSENT': return 'Vắng'
                                                        case 'LATE': return 'Muộn'
                                                        case 'EXCUSED': return 'Có phép'
                                                        default: return 'Vắng'
                                                    }
                                                }

                                                const getStatusColor = (s: string) => {
                                                    switch (s) {
                                                        case 'PRESENT': return 'text-green-600'
                                                        case 'ABSENT': return 'text-red-600'
                                                        case 'LATE': return 'text-yellow-600'
                                                        case 'EXCUSED': return 'text-blue-600'
                                                        default: return 'text-slate-600'
                                                    }
                                                }

                                                return (
                                                    <td key={session.id} className="py-2 px-1">
                                                        {isOwner ? (
                                                            <Select
                                                                value={status}
                                                                onValueChange={(v) => handleUpdateStatus(session.id, member.user.id, v)}
                                                            >
                                                                <SelectTrigger className={`w-[100px] h-8 text-xs border-slate-200 mx-auto ${getStatusColor(status)}`}>
                                                                    <SelectValue>{getStatusLabel(status)}</SelectValue>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="PRESENT">
                                                                        <span className="text-green-600">Có mặt</span>
                                                                    </SelectItem>
                                                                    <SelectItem value="ABSENT">
                                                                        <span className="text-red-600">Vắng</span>
                                                                    </SelectItem>
                                                                    <SelectItem value="LATE">
                                                                        <span className="text-yellow-600">Muộn</span>
                                                                    </SelectItem>
                                                                    <SelectItem value="EXCUSED">
                                                                        <span className="text-blue-600">Có phép</span>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                                status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                                                                    status === 'EXCUSED' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-red-100 text-red-700'
                                                                }`}>
                                                                {getStatusLabel(status)}
                                                            </span>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium mb-2">Chưa có buổi điểm danh nào</p>
                            <p className="text-sm text-slate-400 mb-4">Tạo phiên điểm danh để bắt đầu theo dõi</p>
                            {isOwner && (
                                <Button onClick={() => setIsCreating(true)} className="bg-blue-500 hover:bg-blue-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo phiên điểm danh đầu tiên
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Session Dialog */}
            <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-500" />
                            Chỉnh sửa buổi điểm danh
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Tên buổi học</Label>
                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="VD: Buổi 1 - Giới thiệu"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setEditingSession(null)
                                setDeletingSession({ id: editingSession!.id, title: editingSession!.title })
                            }}
                            className="gap-1"
                        >
                            <Trash2 className="h-4 w-4" />
                            Xóa buổi này
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" onClick={() => setEditingSession(null)}>Hủy</Button>
                        <Button onClick={handleSaveTitle} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600">
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingSession} onOpenChange={(open) => !open && setDeletingSession(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Xóa buổi điểm danh
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            Bạn có chắc muốn xóa buổi <strong>"{deletingSession?.title}"</strong>?
                            <br />
                            <span className="text-red-500">Tất cả dữ liệu điểm danh của buổi này sẽ bị mất vĩnh viễn.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSession}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa buổi này'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
