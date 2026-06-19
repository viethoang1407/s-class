'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { GraduationCap, Plus, BookOpen, TrendingUp, Users, Calculator, Pencil, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface GradesTabProps {
    classData: any
    isOwner: boolean
}

export function GradesTab({ classData, isOwner }: GradesTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [subjects, setSubjects] = useState<any[]>(classData.subjects || [])
    const [newSubjectName, setNewSubjectName] = useState('')
    const [newComponentName, setNewComponentName] = useState('')
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
    const [isAddingSubject, setIsAddingSubject] = useState(false)
    const [isAddingComponent, setIsAddingComponent] = useState(false)
    const [savingGrade, setSavingGrade] = useState<string | null>(null)
    // Edit/Delete subject states
    const [editingSubject, setEditingSubject] = useState<{ id: string, name: string } | null>(null)
    const [editSubjectName, setEditSubjectName] = useState('')
    const [deletingSubject, setDeletingSubject] = useState<{ id: string, name: string } | null>(null)
    const [deletingComponent, setDeletingComponent] = useState<{ id: string, name: string, subjectId: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return

        try {
            const response = await fetch(`/api/classes/${classData.id}/subjects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSubjectName.trim() }),
            })

            if (!response.ok) throw new Error('Không thể thêm môn học')

            toast({ title: '✓ Đã thêm môn học' })
            setNewSubjectName('')
            setIsAddingSubject(false)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể thêm môn học', variant: 'destructive' })
        }
    }

    const handleAddComponent = async () => {
        if (!newComponentName.trim() || !selectedSubjectId) return

        try {
            const response = await fetch(`/api/classes/${classData.id}/subjects/${selectedSubjectId}/components`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newComponentName.trim() }),
            })

            if (!response.ok) throw new Error('Không thể thêm đầu điểm')

            toast({ title: '✓ Đã thêm đầu điểm' })
            setNewComponentName('')
            setIsAddingComponent(false)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể thêm đầu điểm', variant: 'destructive' })
        }
    }

    const handleEditSubject = async () => {
        if (!editingSubject || !editSubjectName.trim()) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/subjects/${editingSubject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editSubjectName.trim() }),
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã lưu' })
            setEditingSubject(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể lưu', variant: 'destructive' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteSubject = async () => {
        if (!deletingSubject) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/classes/${classData.id}/subjects/${deletingSubject.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã xóa môn học' })
            setDeletingSubject(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteComponent = async () => {
        if (!deletingComponent) return

        setIsDeleting(true)
        try {
            const response = await fetch(
                `/api/classes/${classData.id}/subjects/${deletingComponent.subjectId}/components/${deletingComponent.id}`,
                { method: 'DELETE' }
            )

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã xóa đầu điểm' })
            setDeletingComponent(null)
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSaveGrade = async (studentId: string, componentId: string, score: number) => {
        const key = `${studentId}-${componentId}`
        setSavingGrade(key)

        try {
            const subject = subjects.find(s => s.gradeComponents.some((c: any) => c.id === componentId))

            const response = await fetch(`/api/classes/${classData.id}/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    subjectId: subject?.id,
                    componentId,
                    score,
                }),
            })

            if (response.ok) {
                toast({ title: '✓ Đã lưu', duration: 1500 })
            } else {
                throw new Error()
            }
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể lưu điểm', variant: 'destructive' })
        } finally {
            setTimeout(() => setSavingGrade(null), 300)
        }
    }

    // Calculate averages
    const calculateAverage = (memberId: string, subjectId: string) => {
        const subject = subjects.find(s => s.id === subjectId)
        if (!subject?.gradeComponents?.length) return null

        const grades = subject.gradeComponents.map((comp: any) => {
            const grade = classData.grades?.find(
                (g: any) => g.userId === memberId && g.componentId === comp.id
            )
            return grade?.score
        }).filter((s: any) => s !== undefined && s !== null)

        if (grades.length === 0) return null
        return (grades.reduce((a: number, b: number) => a + b, 0) / grades.length).toFixed(1)
    }

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-slate-400'
        if (score >= 8) return 'text-green-600'
        if (score >= 6.5) return 'text-blue-600'
        if (score >= 5) return 'text-yellow-600'
        return 'text-red-600'
    }

    // Stats
    const totalComponents = subjects.reduce((sum, s) => sum + (s.gradeComponents?.length || 0), 0)
    const totalGrades = classData.grades?.length || 0

    if (subjects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                        Bảng điểm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-slate-500">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium mb-2">Chưa có môn học nào</p>
                        <p className="text-sm text-slate-400 mb-4">Thêm môn học để bắt đầu quản lý điểm</p>
                        {isOwner && (
                            <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-500 hover:bg-blue-600">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm môn học đầu tiên
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Thêm môn học mới</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label>Tên môn học</Label>
                                        <Input
                                            value={newSubjectName}
                                            onChange={(e) => setNewSubjectName(e.target.value)}
                                            placeholder="VD: Toán, Văn, Anh..."
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddingSubject(false)}>Hủy</Button>
                                        <Button onClick={handleAddSubject}>Thêm</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with add button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Bảng điểm</h3>
                    <span className="text-sm text-slate-500">({subjects.length} môn)</span>
                </div>
                {isOwner && (
                    <Button size="sm" onClick={() => setIsAddingSubject(true)} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Thêm môn
                    </Button>
                )}
            </div>


            {/* Add Subject Dialog */}
            <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Thêm môn học mới
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Tên môn học</Label>
                        <Input
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="VD: Toán, Văn, Anh..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingSubject(false)}>Hủy</Button>
                        <Button onClick={handleAddSubject} className="bg-blue-500 hover:bg-blue-600">Thêm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subject Cards */}
            {subjects.map((subject) => (
                <Card key={subject.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-white" />
                                </div>
                                {subject.name}
                                {isOwner && (
                                    <button
                                        onClick={() => {
                                            setEditingSubject({ id: subject.id, name: subject.name })
                                            setEditSubjectName(subject.name)
                                        }}
                                        className="p-1 text-slate-400 hover:text-blue-500 rounded transition-colors"
                                        title="Chỉnh sửa môn"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </CardTitle>
                            {isOwner && (
                                <Dialog open={isAddingComponent && selectedSubjectId === subject.id} onOpenChange={(open) => {
                                    setIsAddingComponent(open)
                                    if (open) setSelectedSubjectId(subject.id)
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8">
                                            <Plus className="h-3 w-3 mr-1" />
                                            Thêm đầu điểm
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Thêm đầu điểm - {subject.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label>Tên đầu điểm</Label>
                                            <Input
                                                value={newComponentName}
                                                onChange={(e) => setNewComponentName(e.target.value)}
                                                placeholder="VD: Miệng, 15 phút, 1 tiết..."
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddingComponent(false)}>Hủy</Button>
                                            <Button onClick={handleAddComponent}>Thêm</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {subject.gradeComponents?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-slate-50">
                                            <th className="text-left py-3 px-4 font-medium text-slate-600">Học sinh</th>
                                            {subject.gradeComponents.map((comp: any) => (
                                                <th key={comp.id} className="text-center py-3 px-2 font-medium text-slate-600 min-w-[70px]">
                                                    {comp.name}
                                                </th>
                                            ))}
                                            <th className="text-center py-3 px-4 font-medium text-blue-600 bg-blue-50 min-w-[70px]">
                                                TB
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classData.members.map((member: any) => {
                                            const avg = calculateAverage(member.user.id, subject.id)
                                            return (
                                                <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50">
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-slate-800">
                                                            {member.displayName || member.user.name}
                                                        </p>
                                                    </td>
                                                    {subject.gradeComponents.map((comp: any) => {
                                                        const existingGrade = classData.grades?.find(
                                                            (g: any) => g.userId === member.user.id && g.componentId === comp.id
                                                        )
                                                        const key = `${member.user.id}-${comp.id}`
                                                        const isSaving = savingGrade === key

                                                        return (
                                                            <td key={comp.id} className="text-center py-2 px-2">
                                                                {isOwner ? (
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={10}
                                                                        step={0.1}
                                                                        className={`w-16 h-9 text-center mx-auto text-sm font-medium transition-all ${isSaving ? 'bg-green-100 border-green-300' : ''
                                                                            } ${getScoreColor(existingGrade?.score)}`}
                                                                        defaultValue={existingGrade?.score ?? ''}
                                                                        onBlur={(e) => {
                                                                            const value = parseFloat(e.target.value)
                                                                            if (!isNaN(value) && value >= 0 && value <= 10) {
                                                                                handleSaveGrade(member.user.id, comp.id, value)
                                                                            }
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                (e.target as HTMLInputElement).blur()
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className={`font-medium ${getScoreColor(existingGrade?.score)}`}>
                                                                        {existingGrade?.score ?? '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                    <td className="text-center py-3 px-4 bg-blue-50">
                                                        <span className={`text-lg font-bold ${getScoreColor(avg ? parseFloat(avg) : null)}`}>
                                                            {avg ?? '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Calculator className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                <p>Chưa có đầu điểm</p>
                                {isOwner && (
                                    <Button
                                        variant="link"
                                        className="mt-2"
                                        onClick={() => {
                                            setSelectedSubjectId(subject.id)
                                            setIsAddingComponent(true)
                                        }}
                                    >
                                        + Thêm đầu điểm
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Edit Subject Dialog */}
            <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-500" />
                            Chỉnh sửa môn học
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Tên môn học</Label>
                            <Input
                                value={editSubjectName}
                                onChange={(e) => setEditSubjectName(e.target.value)}
                                placeholder="VD: Toán, Văn, Anh..."
                            />
                        </div>

                        {/* Danh sách đầu điểm */}
                        {editingSubject && (() => {
                            const subject = subjects.find(s => s.id === editingSubject.id)
                            const components = subject?.gradeComponents || []
                            if (components.length === 0) return null

                            return (
                                <div className="space-y-2">
                                    <Label>Đầu điểm đã tạo</Label>
                                    <div className="border rounded-lg divide-y">
                                        {components.map((comp: any) => (
                                            <div key={comp.id} className="flex items-center justify-between px-3 py-2">
                                                <span className="text-sm">{comp.name}</span>
                                                <button
                                                    onClick={() => {
                                                        setDeletingComponent({
                                                            id: comp.id,
                                                            name: comp.name,
                                                            subjectId: editingSubject.id
                                                        })
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                                    title="Xóa đầu điểm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setEditingSubject(null)
                                setDeletingSubject({ id: editingSubject!.id, name: editingSubject!.name })
                            }}
                            className="gap-1"
                        >
                            <Trash2 className="h-4 w-4" />
                            Xóa môn này
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" onClick={() => setEditingSubject(null)}>Hủy</Button>
                        <Button onClick={handleEditSubject} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600">
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subject AlertDialog */}
            <AlertDialog open={!!deletingSubject} onOpenChange={(open) => !open && setDeletingSubject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Xóa môn học
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            Bạn có chắc muốn xóa môn <strong>"{deletingSubject?.name}"</strong>?
                            <br />
                            <span className="text-red-500">Tất cả đầu điểm và điểm số của môn này sẽ bị mất vĩnh viễn.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSubject}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa môn này'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Component AlertDialog */}
            <AlertDialog open={!!deletingComponent} onOpenChange={(open) => !open && setDeletingComponent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Xóa đầu điểm
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            Bạn có chắc muốn xóa đầu điểm <strong>"{deletingComponent?.name}"</strong>?
                            <br />
                            <span className="text-red-500">Tất cả điểm số của đầu điểm này sẽ bị mất vĩnh viễn.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteComponent}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa đầu điểm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
