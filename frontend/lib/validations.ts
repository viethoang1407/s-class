import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export const registerSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

// Class schemas
export const createClassSchema = z.object({
    name: z.string().min(1, 'Tên lớp không được để trống').max(100, 'Tên lớp quá dài'),
    description: z.string().max(500, 'Mô tả quá dài').optional(),
})

export const updateClassSchema = createClassSchema.partial()

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>

// Student schemas
export const createStudentSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
})

export const updateStudentSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên quá dài').optional(),
    email: z.string().email('Email không hợp lệ').optional(),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>

// Quiz schemas
export const createQuizSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
    description: z.string().max(1000, 'Mô tả quá dài').optional(),
    openAt: z.string().or(z.date()),
    dueAt: z.string().or(z.date()),
    durationMinutes: z.number().int().positive().optional(),
})

export const updateQuizSchema = createQuizSchema.partial().extend({
    isPublished: z.boolean().optional(),
})

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>

// Question schemas
export const questionOptionsSchema = z.object({
    A: z.string().min(1, 'Đáp án A không được để trống'),
    B: z.string().min(1, 'Đáp án B không được để trống'),
    C: z.string().min(1, 'Đáp án C không được để trống'),
    D: z.string().min(1, 'Đáp án D không được để trống'),
})

export const createQuestionSchema = z.object({
    content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
    options: questionOptionsSchema,
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    points: z.number().int().positive().default(1),
})

export const updateQuestionSchema = createQuestionSchema.partial()

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

// Submit quiz schema
export const submitQuizSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        selectedOption: z.enum(['A', 'B', 'C', 'D']),
    })),
})

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>

// Subject schemas
export const createSubjectSchema = z.object({
    name: z.string().min(1, 'Tên môn học không được để trống').max(100, 'Tên môn học quá dài'),
})

export const updateSubjectSchema = createSubjectSchema.partial()

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>

// Grade Component schemas
export const createGradeComponentSchema = z.object({
    name: z.string().min(1, 'Tên đầu điểm không được để trống').max(100, 'Tên đầu điểm quá dài'),
    subjectId: z.string().optional(),
    weight: z.number().positive().optional(),
})

export const updateGradeComponentSchema = createGradeComponentSchema.partial()

export type CreateGradeComponentInput = z.infer<typeof createGradeComponentSchema>
export type UpdateGradeComponentInput = z.infer<typeof updateGradeComponentSchema>

// Grade schemas
export const gradeEntrySchema = z.object({
    studentId: z.string(),
    subjectId: z.string(),
    componentId: z.string(),
    score: z.number().min(0, 'Điểm không được âm').max(10, 'Điểm tối đa là 10'),
    note: z.string().max(500).optional(),
})

export const bulkUpsertGradesSchema = z.object({
    grades: z.array(gradeEntrySchema),
})

export type GradeEntry = z.infer<typeof gradeEntrySchema>
export type BulkUpsertGradesInput = z.infer<typeof bulkUpsertGradesSchema>
