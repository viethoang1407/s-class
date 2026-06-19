# 🎓 S-Class - Microservices Architecture

## Kiến Trúc Hệ Thống (SOA - Service-Oriented Architecture)

Ứng dụng quản lý lớp học trực tuyến, được xây dựng theo mô hình **Microservices**.

### 📊 Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js)                  │
│                   Port: 3000                        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│              🌐 API GATEWAY (Express.js)             │
│                   Port: 4000                        │
│    ┌─────────┬──────────┬────────────────────┐      │
│    │  Auth   │  Routing │  CORS / Logging    │      │
│    └─────────┴──────────┴────────────────────┘      │
└──┬──────┬──────┬──────┬──────┬──────┬───────────────┘
   │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│ 👤   ││ 📚   ││ 📝   ││ 📋   ││ 📊   ││ 🤖   │
│User  ││Class ││Quiz  ││Atten.││Grade ││  AI  │
│:4001 ││:4002 ││:4003 ││:4004 ││:4005 ││:4006 │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──────┘
   │       │       │       │       │     (stateless)
   ▼       ▼       ▼       ▼       ▼
┌─────────────────────────────────────────────────┐
│           PostgreSQL Database (Neon)            │
│         (Each service = own tables)             │
└─────────────────────────────────────────────────┘
```

### 🧩 Danh Sách Microservices

| Service | Port | Mô tả | Database |
|---------|------|--------|----------|
| **API Gateway** | 4000 | Routing, Auth JWT, CORS, Logging | ❌ |
| **User Service** | 4001 | Quản lý người dùng, đồng bộ Clerk | User |
| **Class Service** | 4002 | Lớp học, thành viên, thông báo, tài liệu | Class, ClassMember, Announcement, Document |
| **Quiz Service** | 4003 | Quiz, câu hỏi, nộp bài, thống kê | Quiz, QuizQuestion, QuizSubmission |
| **Attendance Service** | 4004 | Điểm danh, phiên, QR code | AttendanceSession, AttendanceRecord |
| **Grade Service** | 4005 | Môn học, thành phần điểm, bảng điểm | Subject, GradeComponent, Grade |
| **AI Service** | 4006 | Chatbot AI, tạo quiz tự động | ❌ (stateless) |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu Cầu
- Node.js >= 18
- Docker & Docker Compose (tùy chọn)

### Cách 1: Chạy trực tiếp (Development)

```bash
# 1. Cài đặt dependencies cho tất cả services
npm run install:all

# 2. Generate Prisma clients
npm run prisma:generate

# 3. Chạy tất cả services cùng lúc
npm run dev

# 4. Chạy frontend (terminal khác)
npm run dev:frontend
```

### Cách 2: Chạy bằng Docker

```bash
# Build và chạy tất cả services
docker-compose up --build

# Dừng
docker-compose down
```

### Kiểm tra services

```bash
# Health check từng service
curl http://localhost:4000/health   # Gateway
curl http://localhost:4001/health   # User Service
curl http://localhost:4002/health   # Class Service
curl http://localhost:4003/health   # Quiz Service
curl http://localhost:4004/health   # Attendance Service
curl http://localhost:4005/health   # Grade Service
curl http://localhost:4006/health   # AI Service
```

---

## 🔑 Luồng Xác Thực (Authentication Flow)

```
1. User đăng nhập qua Clerk (Frontend)
2. Clerk trả về JWT Token
3. Frontend gửi API request kèm Bearer Token
4. API Gateway verify JWT → extract user info
5. Gateway forward request + headers (x-user-clerk-id, x-user-email)
6. Service nhận request + user info → xử lý business logic
```

---

## 📁 Cấu Trúc Thư Mục

```
study-microservices/
├── gateway/                  # API Gateway
│   ├── src/
│   │   ├── index.ts          # Server chính
│   │   ├── proxy.ts          # Route → Service mapping
│   │   └── auth-middleware.ts # JWT verification
│   ├── Dockerfile
│   └── package.json
│
├── services/
│   ├── user-service/         # 👤 User Service
│   ├── class-service/        # 📚 Class Service
│   ├── quiz-service/         # 📝 Quiz Service
│   ├── attendance-service/   # 📋 Attendance Service
│   ├── grade-service/        # 📊 Grade Service
│   └── ai-service/           # 🤖 AI Service
│
├── frontend/                 # Next.js Frontend
├── shared/                   # Shared utilities
├── docker-compose.yml        # Container orchestration
├── .env                      # Environment variables
└── README.md
```

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: Next.js 14, React, TailwindCSS, Clerk Auth
- **API Gateway**: Express.js, http-proxy-middleware
- **Microservices**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Neon Cloud)
- **AI**: Groq SDK (LLaMA 3.3 70B)
- **Container**: Docker, Docker Compose
- **Auth**: Clerk + JWT (RS256)

---

## 👨‍🎓 Thông Tin Dự Án

- **Môn học**: Kiến trúc hướng dịch vụ (SOA)
- **Kiến trúc**: Microservices
- **Pattern**: API Gateway, Database per Service, BFF
