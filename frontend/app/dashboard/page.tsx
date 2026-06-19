'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Users, LogIn, BookOpen, ArrowRight, GraduationCap, Trash2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { ClassCardSkeleton } from '@/components/ui/skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ClassData {
    id: string
    name: string
    description: string | null
    code: string
    ownerId: string
    _count?: { members: number }
    owner?: { name: string }
    myStatus?: string // 'pending' | 'approved'
}

export default function DashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [ownedClasses, setOwnedClasses] = useState<ClassData[]>([])
    const [joinedClasses, setJoinedClasses] = useState<ClassData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Create class dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newClassName, setNewClassName] = useState('')
    const [newClassDesc, setNewClassDesc] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    // Join class dialog
    const [joinDialogOpen, setJoinDialogOpen] = useState(false)
    const [classCode, setClassCode] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const [deletingClassId, setDeletingClassId] = useState<string | null>(null)
    const [leavingClassId, setLeavingClassId] = useState<string | null>(null)

    const { user, isLoaded } = useUser()

    useEffect(() => {
        if (!isLoaded || !user) return;

        const init = async () => {
            try {
                // Sync user with backend, passing email explicitly since JWT might not have it
                await fetch('/api/users/sync', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.primaryEmailAddress?.emailAddress,
                        name: user.fullName || user.firstName || 'User'
                    })
                })
            } catch (e) {
                console.error('Failed to sync user', e)
            }
            fetchClasses()
        }
        init()
    }, [isLoaded, user])

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes')
            if (response.ok) {
                const data = await response.json()
                setOwnedClasses(data.ownedClasses || [])
                // Extract class data và giữ lại status
                const joined = (data.joinedClasses || []).map((item: any) => ({
                    ...item.class,
                    myStatus: item.status
                }))
                setJoinedClasses(joined)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateClass = async () => {
        if (!newClassName.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tên lớp', variant: 'destructive' })
            return
        }

        setIsCreating(true)
        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newClassName.trim(),
                    description: newClassDesc.trim(),
                }),
            })

            let errorMsg = 'Không thể tạo lớp'
            if (!response.ok) {
                const text = await response.text()
                errorMsg = `Lỗi: ${response.status} - ${text.substring(0, 100)}`
                throw new Error(errorMsg)
            }

            const newClass = await response.json()
            toast({ title: '✓ Tạo lớp thành công!' })
            setCreateDialogOpen(false)
            setNewClassName('')
            setNewClassDesc('')
            router.push(`/class/${newClass.id}`)
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message || 'Không thể tạo lớp', variant: 'destructive' })
        } finally {
            setIsCreating(false)
        }
    }

    const handleJoinClass = async () => {
        if (!classCode.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập mã lớp', variant: 'destructive' })
            return
        }

        setIsJoining(true)
        try {
            const response = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: classCode.trim().toUpperCase() }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Không thể tham gia lớp')
            }

            toast({ title: '✓ Tham gia lớp thành công!' })
            setJoinDialogOpen(false)
            setClassCode('')
            fetchClasses()
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' })
        } finally {
            setIsJoining(false)
        }
    }

    const handleDeleteClass = async (classId: string, className: string) => {
        setDeletingClassId(classId)
        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Không thể xóa lớp')
            }

            toast({ title: `✓ Đã xóa lớp "${className}"` })
            fetchClasses()
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' })
        } finally {
            setDeletingClassId(null)
        }
    }

    const handleLeaveClass = async () => {
        if (!leavingClassId) return

        try {
            const response = await fetch(`/api/classes/${leavingClassId}/leave`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const classItem = joinedClasses.find(c => c.id === leavingClassId)
                toast({
                    title: classItem?.myStatus === 'pending' ? 'Đã hủy yêu cầu' : 'Đã rời lớp',
                    description: `Bạn đã rời khỏi lớp "${classItem?.name}"`,
                })
                fetchClasses()
            } else {
                throw new Error('Không thể rời lớp')
            }
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Đã xảy ra lỗi khi rời lớp',
                variant: 'destructive',
            })
        } finally {
            setLeavingClassId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <main className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="mb-8">
                        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded mb-2" />
                        <div className="h-4 w-64 bg-slate-200 animate-pulse rounded" />
                    </div>
                    <div className="flex gap-3 mb-8">
                        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
                        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
                    </div>
                    <div className="space-y-8">
                        <div>
                            <div className="h-6 w-40 bg-slate-200 animate-pulse rounded mb-4" />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <ClassCardSkeleton />
                                <ClassCardSkeleton />
                                <ClassCardSkeleton />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">📚 Lớp học của tôi</h1>
                    <p className="text-slate-500 mt-1">Quản lý các lớp học của bạn</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tạo lớp mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo lớp học mới</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Tên lớp *</Label>
                                    <Input
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        placeholder="VD: Toán 12A1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mô tả</Label>
                                    <Textarea
                                        value={newClassDesc}
                                        onChange={(e) => setNewClassDesc(e.target.value)}
                                        placeholder="Mô tả ngắn về lớp học"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleCreateClass} disabled={isCreating}>
                                    {isCreating ? 'Đang tạo...' : 'Tạo lớp'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <LogIn className="h-4 w-4" />
                                Tham gia lớp
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tham gia lớp học</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Mã lớp</Label>
                                    <Input
                                        value={classCode}
                                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                        placeholder="Nhập mã lớp"
                                        className="text-center text-2xl tracking-widest uppercase"
                                        maxLength={6}
                                    />
                                    <p className="text-sm text-slate-500 text-center">
                                        Nhập mã 6 ký tự do giáo viên cung cấp
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleJoinClass} disabled={isJoining}>
                                    {isJoining ? 'Đang tham gia...' : 'Tham gia'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Owned Classes */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                        Lớp tôi dạy ({ownedClasses.length})
                    </h2>
                    {ownedClasses.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed">
                            <CardContent className="py-8 text-center text-slate-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>Bạn chưa tạo lớp nào</p>
                                <Button variant="link" onClick={() => setCreateDialogOpen(true)}>
                                    Tạo lớp đầu tiên →
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {ownedClasses.map((classItem) => (
                                <div key={classItem.id} className="relative group">
                                    <Link href={`/class/${classItem.id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg pr-8">{classItem.name}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {classItem.description || 'Không có mô tả'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Users className="h-4 w-4" />
                                                        {classItem._count?.members || 0} học sinh
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                                        {classItem.code}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Joined Classes */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        Lớp tôi học ({joinedClasses.length})
                    </h2>
                    {joinedClasses.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed">
                            <CardContent className="py-8 text-center text-slate-500">
                                <LogIn className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                <p>Bạn chưa tham gia lớp nào</p>
                                <Button variant="link" onClick={() => setJoinDialogOpen(true)}>
                                    Tham gia lớp →
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {joinedClasses.map((classItem) => (
                                <div key={classItem.id} className="relative group">
                                    <Link href={classItem.myStatus === 'pending' ? '#' : `/class/${classItem.id}/student`}>
                                        <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${classItem.myStatus === 'pending' ? 'border-amber-200 bg-amber-50/50' : 'border-green-100'}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                                                    {classItem.myStatus === 'pending' && (
                                                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium whitespace-nowrap">
                                                            Đang chờ
                                                        </span>
                                                    )}
                                                </div>
                                                <CardDescription className="line-clamp-2">
                                                    GV: {classItem.owner?.name || 'N/A'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Users className="h-4 w-4" />
                                                        {classItem._count?.members || 0} thành viên
                                                    </div>
                                                    {classItem.myStatus === 'approved' && (
                                                        <ArrowRight className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    {/* Nút Hủy yêu cầu - chỉ cho lớp pending */}
                                    {classItem.myStatus === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute bottom-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 gap-1 text-xs h-7 px-2"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setLeavingClassId(classItem.id)
                                            }}
                                        >
                                            <LogOut className="h-3 w-3" />
                                            Rời
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Leave Class Alert Dialog */}
                <AlertDialog open={!!leavingClassId} onOpenChange={(open) => !open && setLeavingClassId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {joinedClasses.find(c => c.id === leavingClassId)?.myStatus === 'pending'
                                    ? 'Hủy yêu cầu tham gia?'
                                    : 'Rời khỏi lớp học?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {joinedClasses.find(c => c.id === leavingClassId)?.myStatus === 'pending'
                                    ? 'Bạn có chắc chắn muốn hủy yêu cầu tham gia lớp này không?'
                                    : 'Bạn có chắc chắn muốn rời khỏi lớp học này không?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Không</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveClass} className="bg-red-500 hover:bg-red-600">
                                {joinedClasses.find(c => c.id === leavingClassId)?.myStatus === 'pending' ? 'Hủy yêu cầu' : 'Rời lớp'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    )
}
