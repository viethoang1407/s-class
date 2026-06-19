# Study 1.0 - Hệ thống quản lý lớp học

Nền tảng giáo dục trực tuyến cho giáo viên và học sinh với các tính năng quản lý lớp học, quiz trắc nghiệm và điểm số.

## 📋 Tính năng

### Giáo viên (Teacher)
- ✅ Quản lý lớp học (CRUD)
- ✅ Quản lý học sinh trong lớp (thêm/sửa/xóa)
- ✅ Tạo và quản lý quiz trắc nghiệm
- ✅ Xem kết quả bài nộp của học sinh
- ✅ Quản lý môn học và đầu điểm
- ✅ Nhập điểm cho học sinh

### Học sinh (Student)
- ✅ Xem danh sách lớp tham gia
- ✅ Làm quiz trắc nghiệm
- ✅ Xem điểm số của mình

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth v4 (Credentials Provider + JWT)
- **UI**: TailwindCSS + shadcn/ui
- **Form**: React Hook Form + Zod
- **Password**: bcryptjs

## 📁 Cấu trúc thư mục

```
study-1.0/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth routes
│   │   ├── teacher/                 # Teacher API routes
│   │   └── student/                 # Student API routes
│   ├── login/                       # Login page
│   ├── teacher/                     # Teacher pages
│   │   ├── classes/
│   │   │   ├── new/                 # Create class
│   │   │   └── [classId]/           # Class detail
│   │   │       └── quizzes/
│   │   │           ├── new/         # Create quiz
│   │   │           └── [quizId]/    # Quiz detail
│   │   └── page.tsx                 # Dashboard
│   └── student/                     # Student pages
│       ├── classes/
│       │   └── [classId]/
│       │       └── quizzes/
│       │           └── [quizId]/    # Take quiz
│       └── page.tsx                 # Dashboard
├── components/
│   ├── layout/                      # Layout components
│   ├── providers/                   # Context providers
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── auth.ts                      # Auth helpers
│   ├── prisma.ts                    # Prisma client
│   ├── utils.ts                     # Utility functions
│   └── validations.ts               # Zod schemas
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Seed data
└── middleware.ts                    # Route protection
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Clone và cài đặt dependencies

```bash
cd study-1.0
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

File `.env` sẽ có nội dung (SQLite - không cần cài database):

```env
# Database - SQLite (file local)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
```

### Bước 3: Chạy migration

```bash
npx prisma migrate dev --name init
```

### Bước 4: Seed dữ liệu demo

```bash
npm run db:seed
```

### Bước 5: Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại: http://localhost:3000

## 👤 Tài khoản Demo

| Role | Email | Mật khẩu |
|------|-------|----------|
| Giáo viên | teacher@demo.com | Password123! |
| Học sinh 1 | student1@demo.com | Password123! |
| Học sinh 2 | student2@demo.com | Password123! |

## 📖 Hướng dẫn sử dụng

### Đăng nhập Giáo viên

1. Truy cập http://localhost:3000/login
2. Đăng nhập với `teacher@demo.com / Password123!`
3. Tạo lớp học mới hoặc chọn lớp có sẵn
4. Trong lớp học:
   - Tab "Học sinh": Thêm/sửa/xóa học sinh
   - Tab "Quiz": Tạo quiz, thêm câu hỏi, công bố
   - Tab "Điểm số": Thêm môn học, đầu điểm và nhập điểm

### Đăng nhập Học sinh

1. Truy cập http://localhost:3000/login
2. Đăng nhập với `student1@demo.com / Password123!`
3. Chọn lớp học để xem
4. Trong lớp học:
   - Tab "Quiz": Xem và làm quiz (nếu còn hạn)
   - Tab "Điểm số": Xem điểm của mình

## 🔐 Phân quyền

### Routes
- `/teacher/*` - Chỉ role TEACHER mới truy cập được
- `/student/*` - Chỉ role STUDENT mới truy cập được

### Quy tắc
- Giáo viên chỉ quản lý được lớp mình tạo (ownerTeacherId)
- Học sinh chỉ xem được lớp mình tham gia (classMember)
- Học sinh không xem được điểm của người khác
- Quiz chỉ làm được 1 lần

## 📝 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run prisma:migrate   # Chạy database migration
npm run prisma:studio    # Mở Prisma Studio
npm run db:seed          # Seed dữ liệu demo
npm run db:reset         # Reset database
```

## 🗄 Database Schema

### Models
- **User**: Người dùng (Teacher/Student)
- **Class**: Lớp học
- **ClassMember**: Thành viên lớp
- **Quiz**: Bài kiểm tra
- **QuizQuestion**: Câu hỏi trắc nghiệm
- **QuizSubmission**: Bài nộp
- **Subject**: Môn học
- **GradeComponent**: Đầu điểm
- **Grade**: Điểm số

## 📱 API Endpoints

### Auth
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Teacher APIs
- `GET/POST /api/teacher/classes` - Lấy/tạo lớp
- `GET/PATCH/DELETE /api/teacher/classes/[classId]` - Quản lý lớp
- `GET/POST /api/teacher/classes/[classId]/students` - Quản lý học sinh
- `GET/POST /api/teacher/classes/[classId]/quizzes` - Quản lý quiz
- `POST /api/teacher/classes/[classId]/quizzes/[quizId]/publish` - Công bố quiz
- `GET/POST /api/teacher/classes/[classId]/subjects` - Môn học
- `GET/POST /api/teacher/classes/[classId]/grade-components` - Đầu điểm
- `POST /api/teacher/classes/[classId]/grades/bulk-upsert` - Nhập điểm

### Student APIs
- `GET /api/student/classes` - Lớp tham gia
- `GET /api/student/classes/[classId]/quizzes` - Quiz trong lớp
- `POST /api/student/classes/[classId]/quizzes/[quizId]/submit` - Nộp bài
- `GET /api/student/classes/[classId]/grades` - Điểm của mình

## ⚠️ Lưu ý

- Đảm bảo PostgreSQL đang chạy trước khi start app
- Chạy `prisma:migrate` mỗi khi thay đổi schema
- `NEXTAUTH_SECRET` phải thay đổi trong production
- Password mặc định cho học sinh mới: `Password123!`

## 📄 License

MIT License
