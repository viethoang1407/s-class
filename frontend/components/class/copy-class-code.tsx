'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CopyClassCodeProps {
    code: string
}

export function CopyClassCode({ code }: CopyClassCodeProps) {
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            toast({ title: '✓ Đã copy mã lớp!' })
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast({ title: 'Lỗi', description: 'Không thể copy', variant: 'destructive' })
        }
    }

    return (
        <div
            onClick={handleCopy}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors group"
        >
            <p className="text-xs text-blue-600 mb-1 flex items-center justify-center gap-1">
                Mã lớp
                {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </p>
            <p className="text-2xl font-mono font-bold text-blue-700 tracking-wider">
                {code}
            </p>
        </div>
    )
}
