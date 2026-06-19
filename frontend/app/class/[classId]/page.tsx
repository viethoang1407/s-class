import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { ClassTabs } from '@/components/class/class-tabs'
import { DeleteClassButton } from '@/components/class/delete-class-button'
import { CopyClassCode } from '@/components/class/copy-class-code'
import { EditClassButton } from '@/components/class/edit-class-button'
import { Users, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ClassPageProps {
    params: { classId: string }
}

export default async function ClassPage({ params }: ClassPageProps) {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/sign-in')
    }

    const classData = await prisma.class.findUnique({
        where: { id: params.classId },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { joinedAt: 'asc' },
            },
            subjects: {
                include: {
                    gradeComponents: true,
                },
                orderBy: { createdAt: 'asc' },
            },
            quizzes: {
                include: {
                    _count: { select: { questions: true, submissions: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
            grades: true,
            attendanceSessions: {
                include: { records: true },
                orderBy: { date: 'desc' },
            },
            announcements: {
                include: { author: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
            },
            _count: { select: { members: true, quizzes: true } },
        },
    })

    if (!classData) {
        notFound()
    }

    // Check if user is the owner
    if (classData.ownerId !== user.id) {
        redirect(`/class/${params.classId}/student`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
                {/* Class Header */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                                <span>/</span>
                                <span>{classData.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{classData.name}</h1>
                                <EditClassButton
                                    classId={classData.id}
                                    currentName={classData.name}
                                    currentDescription={classData.description}
                                />
                            </div>
                            {classData.description && (
                                <p className="text-slate-600 mt-1">{classData.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <CopyClassCode code={classData.code} />
                        </div>
                    </div>

                    {/* Stats + Delete Button */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="h-4 w-4" />
                                <span>{classData.members.filter((m: any) => m.status === 'approved').length} thành viên</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <BookOpen className="h-4 w-4" />
                                <span>{classData._count.quizzes} quiz</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <GraduationCap className="h-4 w-4" />
                                <span>{classData.subjects.length} môn học</span>
                            </div>
                        </div>
                        <DeleteClassButton classId={classData.id} className={classData.name} />
                    </div>
                </div>

                {/* Tabs Content */}
                <ClassTabs
                    classData={classData}
                    isOwner={true}
                />
            </main>
        </div>
    )
}
