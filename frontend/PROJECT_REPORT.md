# 📚 BÁO CÁO DỰ ÁN: HỆ THỐNG QUẢN LÝ LỚP HỌC STUDY 1.0

## 📋 THÔNG TIN TỔNG QUAN

### Tên dự án
**Study 1.0** - Hệ thống quản lý lớp học trực tuyến

### Mô tả
Ứng dụng web hỗ trợ giáo viên quản lý lớp học, tạo bài kiểm tra, điểm danh, chấm điểm và tương tác với học sinh. Học sinh có thể tham gia lớp, làm bài kiểm tra, xem điểm và theo dõi thông tin lớp học.

### Công nghệ sử dụng
| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | TailwindCSS, Radix UI, Shadcn/ui |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | Clerk |
| **AI Integration** | Google Gemini AI, OpenAI, Groq |
| **PWA** | next-pwa |
| **QR Code** | html5-qrcode, qrcode |
| **Export** | xlsx, file-saver |

---

## 🗂️ CẤU TRÚC DỰ ÁN

```
study-1.0/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── classes/       # API quản lý lớp học
│   │   ├── ai-generate-quiz/  # API tạo quiz bằng AI
│   │   ├── attendance/    # API điểm danh
│   │   └── ...
│   ├── class/[classId]/   # Trang lớp học (Giáo viên)
│   ├── dashboard/         # Trang Dashboard
│   ├── attendance/        # Trang điểm danh
│   ├── sign-in/          # Trang đăng nhập
│   └── sign-up/          # Trang đăng ký
├── components/            # React Components
│   ├── class/            # Components lớp học
│   ├── quiz/             # Components quiz
│   ├── layout/           # Layout components
│   └── ui/               # UI components (Shadcn)
├── lib/                  # Utilities và helpers
├── prisma/               # Database schema
└── public/               # Static files
```

---

## 📊 CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### Các Model chính

#### 1. **User** (Người dùng)
- `id`, `clerkId`, `name`, `email`
- Liên kết: sở hữu lớp, thành viên lớp, bài nộp, điểm, thông báo

#### 2. **Class** (Lớp học)
- `id`, `name`, `description`, `code` (mã lớp 6 ký tự), `ownerId`
- Liên kết: thành viên, quiz, môn học, điểm, điểm danh, tài liệu, thông báo

#### 3. **ClassMember** (Thành viên lớp)
- `id`, `classId`, `userId`, `displayName`, `status` (pending/approved/rejected)
- Hỗ trợ tính năng **Phòng chờ (Waiting Room)**

#### 4. **Quiz** (Bài kiểm tra)
- `id`, `classId`, `title`, `description`, `openAt`, `dueAt`, `durationMinutes`
- `isPublished`, `allowRetake`, `maxAttempts`

#### 5. **QuizQuestion** (Câu hỏi)
- `id`, `quizId`, `content`, `options` (JSON), `correctOption`, `points`

#### 6. **QuizSubmission** (Bài nộp)
- `id`, `quizId`, `userId`, `score`, `totalPoints`, `answers` (JSON)

#### 7. **Subject** (Môn học)
- `id`, `classId`, `name`

#### 8. **GradeComponent** (Thành phần điểm)
- `id`, `classId`, `subjectId`, `name`, `weight`

#### 9. **Grade** (Điểm)
- `id`, `classId`, `subjectId`, `componentId`, `userId`, `score`, `note`

#### 10. **AttendanceSession** (Phiên điểm danh)
- `id`, `classId`, `title`, `code`, `date`, `expiresAt`

#### 11. **AttendanceRecord** (Bản ghi điểm danh)
- `id`, `sessionId`, `userId`, `status` (PRESENT/ABSENT/LATE/EXCUSED), `isManual`

#### 12. **Document** (Tài liệu)
- `id`, `classId`, `uploaderId`, `title`, `fileName`, `fileUrl`, `fileType`, `fileSize`

#### 13. **Announcement** (Thông báo/Bảng tin)
- `id`, `classId`, `authorId`, `title`, `content`, `link`, `linkTitle`

---

## ✨ TÍNH NĂNG CHÍNH

### 🎓 Dành cho Giáo viên

| Tính năng | Mô tả |
|-----------|-------|
| **Tạo lớp học** | Tạo lớp với mã code tự động |
| **Quản lý thành viên** | Xem danh sách, đổi tên hiển thị, xóa thành viên |
| **Phòng chờ** | Duyệt/từ chối yêu cầu tham gia lớp |
| **Tạo bài kiểm tra** | Tạo quiz trắc nghiệm, có thời hạn |
| **AI tạo quiz** | Tự động tạo câu hỏi từ chủ đề/tài liệu |
| **Chấm điểm** | Nhập điểm theo môn và thành phần |
| **Điểm danh** | Tạo phiên điểm danh với mã QR |
| **Bảng tin** | Đăng thông báo, link tài liệu |
| **Xuất Excel** | Export danh sách điểm, điểm danh |
| **Thống kê** | Xem tổng quan lớp học |

### 📖 Dành cho Học sinh

| Tính năng | Mô tả |
|-----------|-------|
| **Tham gia lớp** | Nhập mã lớp để tham gia |
| **Phòng chờ** | Chờ giáo viên duyệt, có thể hủy yêu cầu |
| **Làm bài kiểm tra** | Làm quiz trong thời gian quy định |
| **Xem điểm** | Xem điểm theo môn học |
| **Điểm danh** | Quét QR hoặc nhập mã điểm danh |
| **Xem bảng tin** | Đọc thông báo từ giáo viên |
| **Rời lớp** | Tự rời khỏi lớp học |

### 🤖 Tính năng AI

| Tính năng | Mô tả |
|-----------|-------|
| **AI Quiz Generator** | Tạo câu hỏi trắc nghiệm từ chủ đề |
| **AI Chatbot** | Trợ lý học tập thông minh |

---

## 🖥️ CÁC TRANG CHÍNH

### 1. Landing Page (`/`)
- Giới thiệu ứng dụng
- Nút đăng nhập/đăng ký

### 2. Dashboard (`/dashboard`)
- Hiển thị lớp đang quản lý (Giáo viên)
- Hiển thị lớp đang theo học (Học sinh)
- Tạo lớp mới, tham gia lớp

### 3. Trang lớp học - Giáo viên (`/class/[classId]`)
Các Tab:
- **Bảng tin**: Thông báo, link tài liệu
- **Thành viên**: Danh sách học sinh
- **Phòng chờ**: Duyệt yêu cầu tham gia
- **Điểm danh**: Tạo phiên, xem lịch sử
- **Điểm**: Quản lý điểm số
- **Quiz**: Tạo và quản lý bài kiểm tra
- **Thống kê**: Tổng quan lớp học

### 4. Trang lớp học - Học sinh (`/class/[classId]/student`)
Các Tab:
- **Bảng tin**: Xem thông báo
- **Bài kiểm tra**: Làm quiz
- **Bảng điểm**: Xem điểm
- **Điểm danh**: Lịch sử điểm danh

### 5. Trang điểm danh (`/attendance`)
- Quét mã QR điểm danh
- Nhập mã điểm danh thủ công

---

## 🔒 PHÂN QUYỀN

| Vai trò | Quyền hạn |
|---------|-----------|
| **Giáo viên (Owner)** | Toàn quyền quản lý lớp học của mình |
| **Học sinh (Member)** | Chỉ xem và tương tác với nội dung được phép |
| **Pending Member** | Chờ duyệt, chỉ xem thông tin cơ bản |

---

## 📱 API ENDPOINTS

### Classes
- `GET /api/classes` - Lấy danh sách lớp
- `POST /api/classes` - Tạo lớp mới
- `DELETE /api/classes/[classId]` - Xóa lớp
- `POST /api/classes/join` - Tham gia lớp
- `DELETE /api/classes/[classId]/leave` - Rời lớp

### Members
- `GET /api/classes/[classId]/members` - Danh sách thành viên
- `POST /api/classes/[classId]/members/[memberId]/approve` - Duyệt thành viên
- `DELETE /api/classes/[classId]/members/[memberId]` - Xóa/Từ chối

### Quiz
- `GET/POST /api/classes/[classId]/quizzes` - CRUD quiz
- `POST /api/classes/[classId]/quizzes/[quizId]/submit` - Nộp bài

### Attendance
- `POST /api/classes/[classId]/attendance` - Tạo phiên
- `POST /api/attendance/checkin` - Điểm danh

### AI
- `POST /api/ai-generate-quiz` - Tạo quiz bằng AI
- `POST /api/ai-chat` - Chat với AI

---

## 🎨 UI/UX

### Design System
- **Colors**: Gradient màu xanh dương, tím, xanh lá
- **Typography**: Inter font
- **Components**: Shadcn/ui với Radix UI
- **Animations**: TailwindCSS animations

### Responsive
- Mobile-first design
- Hỗ trợ PWA (Progressive Web App)

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI

### 1. Cài đặt
```bash
npm install
```

### 2. Cấu hình môi trường
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
GEMINI_API_KEY="..."
```

### 3. Database
```bash
npx prisma db push
npx prisma generate
```

### 4. Chạy development
```bash
npm run dev
```

### 5. Build production
```bash
npm run build
npm start
```

---

## 📈 TÍNH NĂNG TƯƠNG LAI

- [ ] Realtime notifications
- [ ] Video call integration
- [ ] File upload to cloud
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Export PDF reports

---

## 👨‍💻 THÔNG TIN PHÁT TRIỂN

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Hosting**: Vercel
- **Repository**: GitHub

---

*Báo cáo được tạo tự động bởi Antigravity AI - 29/12/2024*
