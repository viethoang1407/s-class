'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, GraduationCap, ClipboardList, BarChart3, Newspaper, Clock } from 'lucide-react'
import { MembersTab } from './members-tab'
import { GradesTab } from './grades-tab'
import { QuizzesTab } from './quizzes-tab'
import { AttendanceTab } from './attendance-tab'
import { BulletinTab } from './bulletin-tab'
import { StatsTab } from './stats-tab'
import { WaitingRoomTab } from './waiting-room-tab'
import { useTranslation } from '@/lib/i18n'

interface ClassTabsProps {
    classData: any
    isOwner: boolean
}

export function ClassTabs({ classData, isOwner }: ClassTabsProps) {
    const { t } = useTranslation()
    // Count pending members for badge
    const pendingCount = classData.members?.filter((m: any) => m.status === 'pending')?.length || 0

    return (
        <Tabs defaultValue="bulletin" className="space-y-4">
            {/* Scrollable tab container with snap points on mobile */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2 mobile-scroll-snap">
                <TabsList className="inline-flex min-w-max gap-1 md:gap-1 h-auto p-1 md:p-1">
                    <TabsTrigger
                        value="bulletin"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                    >
                        <Newspaper className="h-4 w-4 shrink-0" />
                        <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.bulletin')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="members"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                    >
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.members')}</span>
                    </TabsTrigger>
                    {isOwner && (
                        <TabsTrigger
                            value="waiting"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm relative"
                        >
                            <Clock className="h-4 w-4 shrink-0" />
                            <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.waitingRoom')}</span>
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="attendance"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                    >
                        <ClipboardList className="h-4 w-4 shrink-0" />
                        <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.attendance')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="grades"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                    >
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.grades')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="quizzes"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                    >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.quizzes')}</span>
                    </TabsTrigger>
                    {isOwner && (
                        <TabsTrigger
                            value="stats"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-full md:rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                        >
                            <BarChart3 className="h-4 w-4 shrink-0" />
                            <span className="hidden xs:inline-block sm:inline-block">{t('class.tab.stats')}</span>
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            <TabsContent value="bulletin">
                <BulletinTab classData={classData} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="members">
                <MembersTab classData={classData} isOwner={isOwner} />
            </TabsContent>

            {isOwner && (
                <TabsContent value="waiting">
                    <WaitingRoomTab classData={classData} isOwner={isOwner} />
                </TabsContent>
            )}

            <TabsContent value="attendance">
                <AttendanceTab classData={classData} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="grades">
                <GradesTab classData={classData} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="quizzes">
                <QuizzesTab classData={classData} isOwner={isOwner} />
            </TabsContent>

            {isOwner && (
                <TabsContent value="stats">
                    <StatsTab classData={classData} />
                </TabsContent>
            )}
        </Tabs>
    )
}
