import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateClassCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDateShort(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

export function isQuizAvailable(openAt: Date | string, dueAt: Date | string): boolean {
    const now = new Date()
    const open = new Date(openAt)
    const due = new Date(dueAt)
    return now >= open && now <= due
}

export function getQuizStatus(openAt: Date | string, dueAt: Date | string, isPublished: boolean): string {
    if (!isPublished) return 'Chưa công bố'
    const now = new Date()
    const open = new Date(openAt)
    const due = new Date(dueAt)
    if (now < open) return 'Chưa mở'
    if (now > due) return 'Đã hết hạn'
    return 'Đang mở'
}
