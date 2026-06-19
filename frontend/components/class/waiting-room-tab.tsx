'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Clock, UserCheck, UserX, User, Loader2 } from 'lucide-react'

interface WaitingRoomTabProps {
    classData: any
    isOwner: boolean
}

export function WaitingRoomTab({ classData, isOwner }: WaitingRoomTabProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [processingId, setProcessingId] = useState<string | null>(null)

    // Filter pending members
    const pendingMembers = classData.members?.filter((m: any) => m.status === 'pending') || []

    const handleApprove = async (memberId: string) => {
        setProcessingId(memberId)
        try {
            const response = await fetch(`/api/classes/${classData.id}/members/${memberId}/approve`, {
                method: 'POST',
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã duyệt học sinh' })
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể duyệt', variant: 'destructive' })
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (memberId: string) => {
        setProcessingId(memberId)
        try {
            const response = await fetch(`/api/classes/${classData.id}/members/${memberId}`, {
                method: 'DELETE',
            })

            if (!response.ok) throw new Error()

            toast({ title: '✓ Đã từ chối' })
            router.refresh()
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể từ chối', variant: 'destructive' })
        } finally {
            setProcessingId(null)
        }
    }

    if (!isOwner) return null

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                    <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Phòng chờ</h3>
                    <p className="text-sm text-slate-500">{pendingMembers.length} học sinh đang chờ duyệt</p>
                </div>
            </div>

            {/* Empty State */}
            {pendingMembers.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="h-8 w-8 text-green-500" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-700 mb-2">Không có ai đang chờ</h4>
                        <p className="text-slate-500">Tất cả yêu cầu tham gia đã được xử lý</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {pendingMembers.map((member: any) => (
                        <Card key={member.id} className="overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate">
                                                {member.user?.name || 'Học sinh'}
                                            </h4>
                                            <p className="text-sm text-slate-500 truncate">
                                                {member.user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReject(member.id)}
                                            disabled={processingId === member.id}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {processingId === member.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserX className="h-4 w-4 mr-1" />
                                                    Từ chối
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(member.id)}
                                            disabled={processingId === member.id}
                                            className="bg-green-500 hover:bg-green-600"
                                        >
                                            {processingId === member.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserCheck className="h-4 w-4 mr-1" />
                                                    Duyệt
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
