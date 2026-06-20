'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

const DISMISS_KEY = 'sclass-pwa-install-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isIOS(): boolean {
    if (typeof window === 'undefined') return false
    const ua = window.navigator.userAgent
    return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
}

function isInStandaloneMode(): boolean {
    if (typeof window === 'undefined') return false
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    )
}

function isDismissed(): boolean {
    if (typeof window === 'undefined') return true
    try {
        const dismissed = localStorage.getItem(DISMISS_KEY)
        if (!dismissed) return false
        const dismissedAt = parseInt(dismissed, 10)
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return true
        localStorage.removeItem(DISMISS_KEY)
        return false
    } catch {
        return false
    }
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [showIOSInstructions, setShowIOSInstructions] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Don't show if already installed or dismissed
        if (isInStandaloneMode() || isDismissed()) return

        // iOS detection
        if (isIOS()) {
            setShowIOSInstructions(true)
            setShowPrompt(true)
            // Trigger slide-up animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true))
            })
            return
        }

        // Android / Desktop - listen for beforeinstallprompt
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowPrompt(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true))
            })
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Auto-hide if user installs from browser UI
        const appInstalledHandler = () => {
            setShowPrompt(false)
            setDeferredPrompt(null)
        }
        window.addEventListener('appinstalled', appInstalledHandler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', appInstalledHandler)
        }
    }, [])

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return
        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setShowPrompt(false)
            }
        } catch {
            // prompt() can fail silently
        }
        setDeferredPrompt(null)
    }, [deferredPrompt])

    const handleDismiss = useCallback(() => {
        setIsVisible(false)
        // Wait for slide-down animation to complete
        setTimeout(() => {
            setShowPrompt(false)
            try {
                localStorage.setItem(DISMISS_KEY, Date.now().toString())
            } catch {
                // localStorage might be full or unavailable
            }
        }, 300)
    }, [])

    if (!showPrompt) return null

    return (
        <div
            className={`
                fixed bottom-0 left-0 right-0 z-50
                transform transition-transform duration-300 ease-out
                ${isVisible ? 'translate-y-0' : 'translate-y-full'}
            `}
        >
            <div className="mx-3 mb-3 sm:mx-4 sm:mb-4 md:mx-auto md:max-w-lg">
                <div
                    className="
                        relative overflow-hidden rounded-2xl
                        border border-white/20
                        bg-white/80 backdrop-blur-xl
                        shadow-lg shadow-black/10
                        dark:bg-gray-900/80 dark:border-gray-700/50
                        dark:shadow-black/30
                    "
                >
                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="
                            absolute top-3 right-3
                            flex h-8 w-8 items-center justify-center
                            rounded-full
                            text-gray-400 hover:text-gray-600
                            hover:bg-gray-100/80
                            dark:text-gray-500 dark:hover:text-gray-300
                            dark:hover:bg-gray-800/80
                            transition-colors
                        "
                        aria-label="Đóng"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="p-4 pr-12">
                        {showIOSInstructions ? (
                            /* iOS Instructions */
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                    <Share className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Thêm S-Class vào màn hình chính
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Nhấn nút{' '}
                                        <span className="inline-flex items-center">
                                            <Share className="mx-0.5 inline h-3 w-3" />
                                        </span>{' '}
                                        Chia sẻ → Thêm vào MH chính
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Android / Desktop Install */
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                    <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Thêm S-Class vào màn hình chính
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Thêm S-Class vào màn hình chính để trải nghiệm tốt hơn
                                    </p>
                                    <button
                                        onClick={handleInstall}
                                        className="
                                            mt-3 inline-flex items-center gap-1.5
                                            rounded-lg bg-indigo-600 px-4 py-2
                                            text-xs font-semibold text-white
                                            hover:bg-indigo-700
                                            active:bg-indigo-800
                                            transition-colors
                                            min-h-[44px]
                                        "
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Cài đặt ứng dụng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
