'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { Users, Pencil, Trash2, UserX, AlertTriangle } from 'lucide-react'

interface MembersTabProps {
    classData: any
    isOwner: boolean
}

export function MembersTab({ classData, isOwner }: MembersTabProps) {
    const [editingMember, setEditingMember] = useState<any>(null)
    const [deletingMember, setDeletingMember] = useState<any>(null)
    const [displayName, setDisplayName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // Only show approved members in the members list
    const approvedMembers = classData.members?.filter((m: any) => m.status === 'approved') || []

    const handleEditName = (member: any) => {
        setEditingMember(member)
        setDisplayName(member.displayName || member.user.name)
    }

    const handleSaveName = async () => {
        if (!editingMember) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/members/${editingMember.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: displayName.trim() }),
            })

            if (!response.ok) throw new Error('Không thể cập nhật')

            toast({ title: '✓ Đã cập nhật tên hiển thị' })
            setEditingMember(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveMember = async () => {
        if (!deletingMember) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/members/${deletingMember.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error('Không thể xóa')

            toast({ title: '✓ Đã xóa thành viên khỏi lớp' })
            setDeletingMember(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa thành viên', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Danh sách thành viên
                    </CardTitle>
                    <CardDescription>
                        {approvedMembers.length} thành viên trong lớp
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {approvedMembers.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <UserX className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>Chưa có thành viên nào</p>
                            <p className="text-sm mt-2">Chia sẻ mã lớp <strong>{classData.code}</strong> để mời học sinh</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead>Tên hiển thị</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                        {isOwner && <TableHead className="text-right">Thao tác</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvedMembers.map((member: any, index: number) => (
                                        <TableRow key={member.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {member.displayName || member.user.name}
                                                {member.displayName && (
                                                    <span className="text-xs text-slate-400 block">
                                                        ({member.user.name})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-slate-500">
                                                {member.user.email}
                                            </TableCell>
                                            {isOwner && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditName(member)}
                                                            title="Đổi tên hiển thị"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => setDeletingMember(member)}
                                                            title="Xóa thành viên"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Name Dialog */}
            <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đổi tên hiển thị</DialogTitle>
                        <DialogDescription>
                            Tên này chỉ hiển thị trong lớp học này
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Nhập tên hiển thị"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMember(null)}>Hủy</Button>
                        <Button onClick={handleSaveName} disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Member AlertDialog */}
            <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Xóa thành viên?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Bạn có chắc muốn xóa <strong className="text-slate-700">
                                    {deletingMember?.displayName || deletingMember?.user?.name}
                                </strong> khỏi lớp?
                            </p>
                            <p className="text-sm text-slate-500">
                                • Thành viên này sẽ không thể truy cập lớp học<br />
                                • Họ có thể tham gia lại bằng mã lớp
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleRemoveMember}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa thành viên'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
