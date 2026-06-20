'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton, useUser } from '@clerk/nextjs'
import { QRScanner } from '@/components/qr-scanner'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useTranslation } from '@/lib/i18n'

export function Header() {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const { t } = useTranslation()

    const handleQRScan = async (code: string): Promise<boolean> => {
        let attendanceCode = code
        if (code.includes('/attendance/')) {
            const match = code.match(/\/attendance\/([A-Z0-9]{6})/i)
            if (match) attendanceCode = match[1]
        }
        if (attendanceCode.length === 6) {
            router.push(`/attendance/${attendanceCode.toUpperCase()}`)
            return true
        }
        return false
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
            <div className="container mx-auto px-4">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            S-Class
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLoaded && user && (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm">
                                        {t('dashboard.title')}
                                    </Button>
                                </Link>
                                <QRScanner
                                    onScan={handleQRScan}
                                    buttonText=""
                                    iconOnly
                                />
                                <Link href="/ai-chat">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        <Sparkles className="h-4 w-4" />
                                        {t('nav.aiChat')}
                                    </Button>
                                </Link>
                                <LanguageSwitcher />
                                <div className="flex items-center gap-3 ml-2">
                                    <span className="text-sm text-slate-600">
                                        {user.firstName || user.emailAddresses[0]?.emailAddress}
                                    </span>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile: compact - only QR scanner + user avatar */}
                    <div className="md:hidden flex items-center gap-2">
                        <LanguageSwitcher />
                        {isLoaded && user && (
                            <>
                                <QRScanner
                                    onScan={handleQRScan}
                                    buttonText=""
                                    iconOnly
                                />
                                <UserButton afterSignOutUrl="/" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
