import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-slate-200',
                className
            )}
        />
    )
}

// Card skeleton
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-xl border p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4 pt-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    )
}

// Class card skeleton
export function ClassCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border p-6 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded" />
            </div>
        </div>
    )
}

// Quiz card skeleton
export function QuizCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <div className="flex gap-4 p-4 border-b">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    )
}

// Page loading skeleton
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
                {/* Content */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    )
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ClassCardSkeleton />
                    <ClassCardSkeleton />
                    <ClassCardSkeleton />
                </div>
            </div>
        </div>
    )
}
