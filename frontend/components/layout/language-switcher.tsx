'use client'

import { useTranslation, Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
    const { locale, setLocale } = useTranslation()

    const languages: { code: Locale; flag: string; label: string }[] = [
        { code: 'vi', flag: '🇻🇳', label: 'VI' },
        { code: 'en', flag: '🇬🇧', label: 'EN' },
    ]

    return (
        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
            {languages.map(({ code, flag, label }) => (
                <button
                    key={code}
                    onClick={() => setLocale(code)}
                    className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                        locale === code
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                    )}
                >
                    <span className="text-sm">{flag}</span>
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    )
}
