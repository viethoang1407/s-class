'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Sparkles, Menu, X, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { QRScanner } from '@/components/qr-scanner'

export function Header() {
    const { user, isLoaded } = useUser()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const router = useRouter()

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
                                        Dashboard
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
                                        AI
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3 ml-2">
                                    <span className="text-sm text-slate-600">
                                        {user.firstName || user.emailAddresses[0]?.emailAddress}
                                    </span>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {isLoaded && user && (
                            <QRScanner
                                onScan={handleQRScan}
                                buttonText=""
                                iconOnly
                            />
                        )}
                        <button
                            className="p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        {isLoaded && user && (
                            <div className="flex flex-col gap-2">
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href="/ai-chat" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        AI Assistant
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-3 px-4 py-2 mt-2 border-t pt-4">
                                    <UserButton afterSignOutUrl="/" />
                                    <span className="text-sm text-slate-600">
                                        {user.firstName || user.emailAddresses[0]?.emailAddress}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
