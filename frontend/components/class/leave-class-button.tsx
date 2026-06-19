'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { LogOut, Loader2 } from 'lucide-react'

interface LeaveClassButtonProps {
    classId: string
    className: string
    isPending?: boolean
}

export function LeaveClassButton({ classId, className, isPending = false }: LeaveClassButtonProps) {
    const [open, setOpen] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleLeave = async () => {
        setIsLeaving(true)
        try {
            const response = await fetch(`/api/classes/${classId}/leave`, {
                method: 'DELETE',
            })

            if (response.ok) {
                toast({
                    title: isPending ? 'Đã hủy yêu cầu' : 'Đã rời lớp',
                    description: `Bạn đã rời khỏi lớp "${className}"`,
                })
                router.push('/dashboard')
                router.refresh()
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
            setIsLeaving(false)
            setOpen(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={() => setOpen(true)}
            >
                <LogOut className="h-4 w-4" />
                {isPending ? 'Hủy yêu cầu' : 'Rời lớp'}
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isPending ? 'Hủy yêu cầu tham gia?' : 'Rời khỏi lớp học?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isPending
                                ? `Bạn có chắc chắn muốn hủy yêu cầu tham gia lớp "${className}" không?`
                                : `Bạn có chắc chắn muốn rời khỏi lớp "${className}" không?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeaving}>Không</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isLeaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                isPending ? 'Hủy yêu cầu' : 'Rời lớp'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
