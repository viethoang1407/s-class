'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Camera, X, CheckCircle, Loader2, ScanLine } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface QRScannerProps {
    onScan: (code: string) => Promise<boolean>
    buttonText?: string
    iconOnly?: boolean
}

export function QRScanner({ onScan, buttonText = 'Quét QR điểm danh', iconOnly = false }: QRScannerProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode('qr-reader')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    // QR code detected
                    setIsProcessing(true)

                    try {
                        await scanner.stop()
                        const result = await onScan(decodedText)

                        if (result) {
                            setSuccess(true)
                            toast({ title: '✓ Điểm danh thành công!' })
                            setTimeout(() => {
                                setIsOpen(false)
                                setSuccess(false)
                            }, 1500)
                        } else {
                            toast({ title: 'Lỗi', description: 'Mã QR không hợp lệ', variant: 'destructive' })
                            // Restart scanner
                            startScanner()
                        }
                    } catch (error) {
                        toast({ title: 'Lỗi', description: 'Không thể điểm danh', variant: 'destructive' })
                        startScanner()
                    } finally {
                        setIsProcessing(false)
                    }
                },
                (errorMessage) => {
                    // Ignore scan errors (no QR found)
                }
            )

            setIsScanning(true)
        } catch (error) {
            console.error('Camera error:', error)
            toast({
                title: 'Lỗi camera',
                description: 'Không thể truy cập camera. Hãy cho phép quyền camera.',
                variant: 'destructive'
            })
        }
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
            } catch (error) {
                // Ignore
            }
            scannerRef.current = null
        }
        setIsScanning(false)
    }

    useEffect(() => {
        if (isOpen) {
            // Wait for dialog to render
            setTimeout(startScanner, 100)
        } else {
            stopScanner()
        }

        return () => {
            stopScanner()
        }
    }, [isOpen])

    return (
        <>
            {iconOnly ? (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    title="Quét QR điểm danh"
                    className="text-slate-600 hover:text-blue-600"
                >
                    <ScanLine className="h-5 w-5" />
                </Button>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="gap-3 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base font-medium py-6"
                >
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Camera className="h-5 w-5" />
                    </div>
                    {buttonText}
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-blue-500" />
                            Quét mã QR điểm danh
                        </DialogTitle>
                    </DialogHeader>

                    <div className="relative">
                        {success ? (
                            <div className="flex flex-col items-center justify-center py-16 text-green-500">
                                <CheckCircle className="h-20 w-20 mb-4 animate-bounce" />
                                <p className="text-xl font-semibold">Điểm danh thành công!</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    id="qr-reader"
                                    className="w-full rounded-lg overflow-hidden bg-slate-900"
                                    style={{ minHeight: '300px' }}
                                />

                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                        <div className="text-center text-white">
                                            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                                            <p>Đang xử lý...</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-center text-sm text-slate-500 mt-4">
                                    Đưa mã QR vào khung hình để quét
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="gap-2">
                            <X className="h-4 w-4" />
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
