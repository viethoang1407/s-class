'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface QuizTimerProps {
    durationMinutes: number
    startTime: Date
    onTimeUp: () => void
}

export function QuizTimer({ durationMinutes, startTime, onTimeUp }: QuizTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [isWarning, setIsWarning] = useState(false)

    useEffect(() => {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

        const updateTimer = () => {
            const now = new Date()
            const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
            setTimeLeft(remaining)

            // Warning when less than 5 minutes
            if (remaining <= 300 && remaining > 0) {
                setIsWarning(true)
            }

            if (remaining <= 0) {
                onTimeUp()
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [durationMinutes, startTime, onTimeUp])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={`fixed top-20 right-4 z-40 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all ${isWarning
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white border shadow-md text-slate-700'
            }`}>
            {isWarning ? (
                <AlertTriangle className="h-5 w-5" />
            ) : (
                <Clock className="h-5 w-5" />
            )}
            <span className="font-mono font-bold text-lg">
                {formatTime(timeLeft)}
            </span>
        </div>
    )
}
