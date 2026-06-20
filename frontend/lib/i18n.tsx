'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type Locale = 'vi' | 'en'

// Flat key-value translation type
type Translations = Record<string, string>

const vi: Translations = {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.classes': 'Lớp học',
    'nav.attendance': 'Điểm danh',
    'nav.aiChat': 'AI Chat',
    'nav.account': 'Tài khoản',
    'nav.user': 'Người dùng',
    'nav.manageAccountHelp': 'Nhấn vào avatar để quản lý tài khoản',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.myClasses': 'Lớp của tôi',
    'dashboard.joinedClasses': 'Lớp đã tham gia',
    'dashboard.createClass': 'Tạo lớp',
    'dashboard.joinClass': 'Tham gia lớp',
    'dashboard.noClasses': 'Chưa có lớp nào',
    'dashboard.myClassesHeader': '📚 Lớp học của tôi',
    'dashboard.myClassesDesc': 'Quản lý các lớp học của bạn',
    'dashboard.createNewClass': 'Tạo lớp mới',
    'dashboard.createClassTitle': 'Tạo lớp học mới',
    'dashboard.classNameLabel': 'Tên lớp *',
    'dashboard.classDescLabel': 'Mô tả',
    'dashboard.classNamePlaceholder': 'VD: Toán 12A1',
    'dashboard.classDescPlaceholder': 'Mô tả ngắn về lớp học',
    'dashboard.creating': 'Đang tạo...',
    'dashboard.joinClassTitle': 'Tham gia lớp học',
    'dashboard.classCodeLabel': 'Mã lớp',
    'dashboard.classCodePlaceholder': 'Nhập mã lớp',
    'dashboard.classCodeHelp': 'Nhập mã 6 ký tự do giáo viên cung cấp',
    'dashboard.joining': 'Đang tham gia...',
    'dashboard.classesITeach': 'Lớp tôi dạy',
    'dashboard.classesIStudy': 'Lớp tôi học',
    'dashboard.noOwnedClasses': 'Bạn chưa tạo lớp nào',
    'dashboard.noJoinedClasses': 'Bạn chưa tham gia lớp nào',
    'dashboard.createFirstClass': 'Tạo lớp đầu tiên →',
    'dashboard.joinFirstClass': 'Tham gia lớp →',
    'dashboard.noDesc': 'Không có mô tả',
    'dashboard.studentsCount': '{count} học sinh',
    'dashboard.membersCount': '{count} thành viên',
    'dashboard.pendingBadge': 'Đang chờ',
    'dashboard.teacherPrefix': 'GV:',
    'dashboard.cancelRequest': 'Hủy yêu cầu',
    'dashboard.leave': 'Rời',
    'dashboard.leaveClassAlertTitlePending': 'Hủy yêu cầu tham gia?',
    'dashboard.leaveClassAlertTitleApproved': 'Rời khỏi lớp học?',
    'dashboard.leaveClassAlertDescPending': 'Bạn có chắc chắn muốn hủy yêu cầu tham gia lớp này không?',
    'dashboard.leaveClassAlertDescApproved': 'Bạn có chắc chắn muốn rời khỏi lớp học này không?',
    'dashboard.leaveClassAlertNo': 'Không',
    'dashboard.leaveClassAlertYesPending': 'Hủy yêu cầu',
    'dashboard.leaveClassAlertYesApproved': 'Rời lớp',
    'dashboard.toastError': 'Lỗi',
    'dashboard.toastEnterClassName': 'Vui lòng nhập tên lớp',
    'dashboard.toastCreateSuccess': 'Tạo lớp thành công!',
    'dashboard.toastEnterClassCode': 'Vui lòng nhập mã lớp',
    'dashboard.toastJoinSuccess': 'Tham gia lớp thành công!',
    'dashboard.toastDeleteSuccess': 'Đã xóa lớp "{className}"',
    'dashboard.toastCancelRequestSuccess': 'Đã hủy yêu cầu',
    'dashboard.toastLeaveSuccess': 'Đã rời lớp',
    'dashboard.toastLeftClassDesc': 'Bạn đã rời khỏi lớp "{className}"',
    'dashboard.toastLeaveError': 'Đã xảy ra lỗi khi rời lớp',

    // Class
    'class.members': 'Thành viên',
    'class.quizzes': 'Quiz',
    'class.grades': 'Điểm số',
    'class.attendance': 'Điểm danh',
    'class.bulletin': 'Thông báo',
    'class.waitingRoom': 'Phòng chờ',
    'class.stats': 'Thống kê',
    'class.documents': 'Tài liệu',
    'class.code': 'Mã lớp',
    'class.students': 'học sinh',
    'class.tab.bulletin': 'Bảng tin',
    'class.tab.members': 'Thành viên',
    'class.tab.waitingRoom': 'Phòng chờ',
    'class.tab.attendance': 'Điểm danh',
    'class.tab.grades': 'Điểm',
    'class.tab.quizzes': 'Quiz',
    'class.tab.stats': 'Thống kê',

    // Quiz
    'quiz.title': 'Quiz',
    'quiz.create': 'Tạo quiz',
    'quiz.edit': 'Chỉnh sửa',
    'quiz.duplicate': 'Nhân bản',
    'quiz.duplicating': 'Đang nhân bản...',
    'quiz.publish': 'Công bố',
    'quiz.unpublish': 'Hủy công bố',
    'quiz.delete': 'Xóa',
    'quiz.view': 'Xem chi tiết',
    'quiz.noQuizzes': 'Chưa có quiz nào',
    'quiz.createFirst': 'Tạo quiz đầu tiên',
    'quiz.questions': 'câu',
    'quiz.submissions': 'bài nộp',
    'quiz.draft': 'Nháp',
    'quiz.upcoming': 'Chưa mở',
    'quiz.open': 'Đang mở',
    'quiz.expired': 'Đã đóng',
    'quiz.filterAll': 'Tất cả',
    'quiz.filterPublished': 'Đã đăng',
    'quiz.filterDraft': 'Nháp',
    'quiz.filterExpired': 'Hết hạn',
    'quiz.noFilter': 'Không có quiz nào trong bộ lọc này',
    'quiz.submitted': 'Đã nộp',
    'quiz.take': 'Làm bài',
    'quiz.confirmDelete': 'Bạn có chắc muốn xóa quiz này?',
    'quiz.deleteSuccess': 'Đã xóa quiz',
    'quiz.deleteError': 'Không thể xóa',
    'quiz.publishSuccess': 'Đã công bố quiz',
    'quiz.publishError': 'Không thể công bố',
    'quiz.unpublishSuccess': 'Đã hủy công bố quiz',
    'quiz.unpublishError': 'Không thể hủy công bố',
    'quiz.duplicateSuccess': 'Đã nhân bản quiz',
    'quiz.duplicateDraft': 'Quiz mới ở trạng thái nháp',
    'quiz.duplicateError': 'Không thể nhân bản quiz',
    'quiz.quizzesCount': '{count} bài quiz',
    'quiz.titleCol': 'Tiêu đề',
    'quiz.questionsCol': 'Số câu',
    'quiz.statusCol': 'Trạng thái',
    'quiz.submissionsCol': 'Bài nộp',
    'quiz.timeCol': 'Thời gian',
    'quiz.actionCol': 'Thao tác',

    // Stats
    'stats.title': 'Thống kê',
    'stats.totalQuizzes': 'Tổng quiz',
    'stats.totalSubmissions': 'Tổng bài nộp',
    'stats.averageScore': 'Điểm trung bình',
    'stats.completionRate': 'Tỷ lệ hoàn thành',
    'stats.scoreDistribution': 'Phân bố điểm',
    'stats.topStudents': 'Top học sinh',
    'stats.noData': 'Chưa có dữ liệu thống kê',

    // Common
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.confirm': 'Xác nhận',
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.close': 'Đóng',
    'common.back': 'Quay lại',
    'common.next': 'Tiếp theo',
    'common.submit': 'Nộp bài',
    'common.search': 'Tìm kiếm',

    // PWA
    'pwa.addToHome': 'Thêm S-Class vào màn hình chính',
    'pwa.betterExperience': 'Thêm S-Class vào màn hình chính để trải nghiệm tốt hơn',
    'pwa.install': 'Cài đặt ứng dụng',
    'pwa.iosInstructions': 'Nhấn nút Chia sẻ → Thêm vào MH chính',

    // Auth
    'auth.signIn': 'Đăng nhập',
    'auth.signUp': 'Đăng ký',
    'auth.signOut': 'Đăng xuất',
}

const en: Translations = {
    // Navigation
    'nav.home': 'Home',
    'nav.classes': 'Classes',
    'nav.attendance': 'Attendance',
    'nav.aiChat': 'AI Chat',
    'nav.account': 'Account',
    'nav.user': 'User',
    'nav.manageAccountHelp': 'Click avatar to manage account',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.myClasses': 'My Classes',
    'dashboard.joinedClasses': 'Joined Classes',
    'dashboard.createClass': 'Create Class',
    'dashboard.joinClass': 'Join Class',
    'dashboard.noClasses': 'No classes yet',
    'dashboard.myClassesHeader': '📚 My Classes',
    'dashboard.myClassesDesc': 'Manage your classes',
    'dashboard.createNewClass': 'Create New Class',
    'dashboard.createClassTitle': 'Create New Class',
    'dashboard.classNameLabel': 'Class Name *',
    'dashboard.classDescLabel': 'Description',
    'dashboard.classNamePlaceholder': 'e.g. Math 12A1',
    'dashboard.classDescPlaceholder': 'Short description about class',
    'dashboard.creating': 'Creating...',
    'dashboard.joinClassTitle': 'Join Class',
    'dashboard.classCodeLabel': 'Class Code',
    'dashboard.classCodePlaceholder': 'Enter class code',
    'dashboard.classCodeHelp': 'Enter 6-character code provided by teacher',
    'dashboard.joining': 'Joining...',
    'dashboard.classesITeach': 'Classes I Teach',
    'dashboard.classesIStudy': 'Classes I Study',
    'dashboard.noOwnedClasses': "You haven't created any classes",
    'dashboard.noJoinedClasses': "You haven't joined any classes",
    'dashboard.createFirstClass': 'Create first class →',
    'dashboard.joinFirstClass': 'Join class →',
    'dashboard.noDesc': 'No description',
    'dashboard.studentsCount': '{count} students',
    'dashboard.membersCount': '{count} members',
    'dashboard.pendingBadge': 'Pending',
    'dashboard.teacherPrefix': 'Teacher:',
    'dashboard.cancelRequest': 'Cancel request',
    'dashboard.leave': 'Leave',
    'dashboard.leaveClassAlertTitlePending': 'Cancel join request?',
    'dashboard.leaveClassAlertTitleApproved': 'Leave class?',
    'dashboard.leaveClassAlertDescPending': 'Are you sure you want to cancel your join request for this class?',
    'dashboard.leaveClassAlertDescApproved': 'Are you sure you want to leave this class?',
    'dashboard.leaveClassAlertNo': 'No',
    'dashboard.leaveClassAlertYesPending': 'Cancel request',
    'dashboard.leaveClassAlertYesApproved': 'Leave class',
    'dashboard.toastError': 'Error',
    'dashboard.toastEnterClassName': 'Please enter class name',
    'dashboard.toastCreateSuccess': 'Class created successfully!',
    'dashboard.toastEnterClassCode': 'Please enter class code',
    'dashboard.toastJoinSuccess': 'Joined class successfully!',
    'dashboard.toastDeleteSuccess': 'Deleted class "{className}"',
    'dashboard.toastCancelRequestSuccess': 'Request cancelled',
    'dashboard.toastLeaveSuccess': 'Left class',
    'dashboard.toastLeftClassDesc': 'You have left class "{className}"',
    'dashboard.toastLeaveError': 'An error occurred when leaving class',

    // Class
    'class.members': 'Members',
    'class.quizzes': 'Quizzes',
    'class.grades': 'Grades',
    'class.attendance': 'Attendance',
    'class.bulletin': 'Bulletin',
    'class.waitingRoom': 'Waiting Room',
    'class.stats': 'Statistics',
    'class.documents': 'Documents',
    'class.code': 'Class Code',
    'class.students': 'students',
    'class.tab.bulletin': 'Bulletin',
    'class.tab.members': 'Members',
    'class.tab.waitingRoom': 'Waiting Room',
    'class.tab.attendance': 'Attendance',
    'class.tab.grades': 'Grades',
    'class.tab.quizzes': 'Quizzes',
    'class.tab.stats': 'Statistics',

    // Quiz
    'quiz.title': 'Quiz',
    'quiz.create': 'Create Quiz',
    'quiz.edit': 'Edit',
    'quiz.duplicate': 'Duplicate',
    'quiz.duplicating': 'Duplicating...',
    'quiz.publish': 'Publish',
    'quiz.unpublish': 'Unpublish',
    'quiz.delete': 'Delete',
    'quiz.view': 'View Details',
    'quiz.noQuizzes': 'No quizzes yet',
    'quiz.createFirst': 'Create First Quiz',
    'quiz.questions': 'questions',
    'quiz.submissions': 'submissions',
    'quiz.draft': 'Draft',
    'quiz.upcoming': 'Upcoming',
    'quiz.open': 'Open',
    'quiz.expired': 'Closed',
    'quiz.filterAll': 'All',
    'quiz.filterPublished': 'Published',
    'quiz.filterDraft': 'Draft',
    'quiz.filterExpired': 'Expired',
    'quiz.noFilter': 'No quizzes match this filter',
    'quiz.submitted': 'Submitted',
    'quiz.take': 'Take Quiz',
    'quiz.confirmDelete': 'Are you sure you want to delete this quiz?',
    'quiz.deleteSuccess': 'Quiz deleted',
    'quiz.deleteError': 'Could not delete',
    'quiz.publishSuccess': 'Quiz published',
    'quiz.publishError': 'Could not publish',
    'quiz.unpublishSuccess': 'Quiz unpublished',
    'quiz.unpublishError': 'Could not unpublish',
    'quiz.duplicateSuccess': 'Quiz duplicated',
    'quiz.duplicateDraft': 'New quiz is in draft status',
    'quiz.duplicateError': 'Could not duplicate quiz',
    'quiz.quizzesCount': '{count} quizzes',
    'quiz.titleCol': 'Title',
    'quiz.questionsCol': 'Questions',
    'quiz.statusCol': 'Status',
    'quiz.submissionsCol': 'Submissions',
    'quiz.timeCol': 'Time',
    'quiz.actionCol': 'Actions',

    // Stats
    'stats.title': 'Statistics',
    'stats.totalQuizzes': 'Total Quizzes',
    'stats.totalSubmissions': 'Total Submissions',
    'stats.averageScore': 'Average Score',
    'stats.completionRate': 'Completion Rate',
    'stats.scoreDistribution': 'Score Distribution',
    'stats.topStudents': 'Top Students',
    'stats.noData': 'No statistics data yet',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',

    // PWA
    'pwa.addToHome': 'Add S-Class to Home Screen',
    'pwa.betterExperience': 'Add S-Class to your home screen for a better experience',
    'pwa.install': 'Install App',
    'pwa.iosInstructions': 'Tap Share → Add to Home Screen',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
}


const translations: Record<Locale, Translations> = { vi, en }

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
    locale: 'vi',
    setLocale: () => {},
    t: (key) => key,
})

const LOCALE_KEY = 'sclass-locale'

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('vi')

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCALE_KEY) as Locale
            if (saved && (saved === 'vi' || saved === 'en')) {
                setLocaleState(saved)
            }
        } catch {}
    }, [])

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
        try {
            localStorage.setItem(LOCALE_KEY, newLocale)
        } catch {}
        // Update HTML lang attribute
        document.documentElement.lang = newLocale
    }, [])

    const t = useCallback((key: string): string => {
        return translations[locale][key] || key
    }, [locale])

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    return useContext(I18nContext)
}

export type { Locale }
