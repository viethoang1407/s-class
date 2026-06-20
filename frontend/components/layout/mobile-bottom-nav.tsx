'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, QrCode, Sparkles, User } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

const navItems = [
    {
        labelKey: 'nav.home',
        icon: Home,
        href: '/dashboard',
        matchPaths: ['/dashboard'],
    },
    {
        labelKey: 'nav.classes',
        icon: BookOpen,
        href: '/dashboard#classes',
        matchPaths: ['/class'],
    },
    {
        labelKey: 'nav.attendance',
        icon: QrCode,
        href: '/attendance',
        matchPaths: ['/attendance'],
    },
    {
        labelKey: 'nav.aiChat',
        icon: Sparkles,
        href: '/ai-chat',
        matchPaths: ['/ai-chat'],
    },
]

export function MobileBottomNav() {
    const pathname = usePathname()
    const { user, isLoaded } = useUser()
    const { t } = useTranslation()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false)
            }
        }
        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showUserMenu])

    // Don't render on auth pages
    if (!isLoaded || !user) return null
    if (pathname === '/' || pathname?.startsWith('/sign-')) return null

    function isActive(item: typeof navItems[0]) {
        if (item.href === '/dashboard' && pathname === '/dashboard') return true
        return item.matchPaths.some(
            (p) => p !== '/dashboard' && pathname?.startsWith(p)
        )
    }

    return (
        <>
            {/* Spacer to prevent content from being hidden behind bottom nav */}
            <div className="h-20 md:hidden" aria-hidden="true" />

            {/* Bottom Navigation */}
            <nav
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-40',
                    'md:hidden',
                    'bg-white/80 backdrop-blur-xl',
                    'border-t border-slate-200/60',
                    'transition-transform duration-300 ease-out'
                )}
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                <div className="flex items-center justify-around h-16 px-1">
                    {navItems.map((item) => {
                        const active = isActive(item)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center',
                                    'min-w-[56px] min-h-[48px] px-2 py-1',
                                    'rounded-xl transition-all duration-200 ease-out',
                                    'active:scale-90',
                                    active
                                        ? 'text-blue-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-lg',
                                        'transition-all duration-200',
                                        active && 'bg-blue-50 scale-110'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 transition-all duration-200',
                                            active && 'stroke-[2.5]'
                                        )}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'text-[10px] mt-0.5 font-medium transition-all duration-200',
                                        active ? 'text-blue-600' : 'text-slate-400'
                                    )}
                                >
                                    {t(item.labelKey)}
                                </span>
                            </Link>
                        )
                    })}

                    {/* User/Account tab */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className={cn(
                                'flex flex-col items-center justify-center',
                                'min-w-[56px] min-h-[48px] px-2 py-1',
                                'rounded-xl transition-all duration-200 ease-out',
                                'active:scale-90',
                                showUserMenu
                                    ? 'text-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-lg',
                                    'transition-all duration-200',
                                    showUserMenu && 'bg-blue-50 scale-110'
                                )}
                            >
                                <User
                                    className={cn(
                                        'h-5 w-5 transition-all duration-200',
                                        showUserMenu && 'stroke-[2.5]'
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    'text-[10px] mt-0.5 font-medium transition-all duration-200',
                                    showUserMenu ? 'text-blue-600' : 'text-slate-400'
                                )}
                            >
                                {t('nav.account')}
                            </span>
                        </button>

                        {/* User Menu Popup */}
                        {showUserMenu && (
                            <div
                                className={cn(
                                    'absolute bottom-full right-0 mb-2',
                                    'bg-white rounded-2xl shadow-xl border border-slate-200/60',
                                    'p-4 min-w-[200px]',
                                    'animate-slide-up'
                                )}
                            >
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                    <UserButton afterSignOutUrl="/" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {user.firstName || t('nav.user')}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {user.emailAddresses[0]?.emailAddress}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 text-xs text-slate-400 text-center">
                                    {t('nav.manageAccountHelp')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}
