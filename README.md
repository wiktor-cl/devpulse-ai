# 🚀 DevPulse AI

> **AI-powered developer productivity and project monitoring platform**

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

DevPulse AI is a production-ready SaaS platform that helps software development teams monitor projects, manage tasks, and gain AI-powered insights into team productivity. Built with enterprise-grade technologies and best practices.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT access tokens + refresh token rotation
- BCrypt password hashing (cost factor 12)
- Role-based access control (`USER` / `ADMIN`)
- Spring Security filter chain with stateless sessions

### 📊 Dashboard
- Real-time productivity metrics and KPIs
- 7-day activity charts (tasks created vs completed)
- Project progress overview
- Recent tasks and projects feed

### 📁 Project Management
- Full CRUD with status, priority, deadline, and color
- Team member management (add/remove)
- Progress tracking with visual indicators
- Repository URL linking

### ✅ Task Management
- Kanban board with drag-and-drop (react-beautiful-dnd)
- Status columns: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
- Priority levels with color coding
- Tag support, time tracking (estimated vs actual hours)

### 🤖 AI Analytics (OpenAI GPT-4o-mini)
- Weekly productivity report generation
- Project health analysis and risk assessment
- Intelligent AI chat assistant (context-aware)
- Graceful fallback when API key not configured

### 🔔 Notifications
- Real-time WebSocket notifications (STOMP over SockJS)
- In-app notification centre with unread count
- Mark as read / mark all as read

### 🛡️ Admin Panel
- User management (activate/deactivate, role promotion)
- System-wide statistics
- Activity log viewer

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Nginx Reverse Proxy                    │
│               /api/* → backend  /ws → websocket            │
└────────────────────┬──────────────────────────┬────────────┘
                     │                          │
         ┌───────────▼───────────┐   ┌─────────▼──────────┐
         │   Spring Boot 3 API   │   │    React Frontend  │
         │   Java 21 · JWT       │   │    TypeScript · Vite│
         │   Spring Security     │   │    Tailwind · Zustand│
         │   WebSocket/STOMP     │   │    React Query      │
         └──────────┬────────────┘   └────────────────────┘
                    │
         ┌──────────▼────────────┐   ┌────────────────────┐
         │     PostgreSQL 16     │   │      Redis 7       │
         │  Flyway migrations    │   │   Cache · Sessions │
         └───────────────────────┘   └────────────────────┘
```

**Design Patterns Used:**
- **Repository Pattern** — Spring Data JPA repositories
- **Strategy Pattern** — Report generation strategies (weekly/project/custom)
- **Builder Pattern** — All entities and DTOs use Lombok `@Builder`
- **Observer Pattern** — WebSocket notification events
- **Factory Pattern** — AI report type routing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Java 21, TypeScript 5.3 |
| **Backend** | Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Shadcn UI |
| **Database** | PostgreSQL 16 (Flyway migrations) |
| **Cache** | Redis 7 |
| **Real-time** | WebSocket, STOMP, SockJS |
| **Auth** | JWT (jjwt 0.12), BCrypt |
| **ORM** | Hibernate 6, MapStruct, Lombok |
| **State** | React Query v5, Zustand |
| **Charts** | Recharts |
| **AI** | OpenAI GPT-4o-mini |
| **Testing** | JUnit 5, Mockito, Testcontainers |
| **API Docs** | SpringDoc OpenAPI 3 / Swagger UI |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
- OR: Java 21, Node 20, PostgreSQL 16, Redis 7

### Option A — Docker Compose (recommended)

```bash
git clone https://github.com/yourusername/devpulse-ai.git
cd devpulse-ai

# Copy and configure environment
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY (optional)

# Start all services
docker compose up -d

# Check logs
docker compose logs -f backend
```

Open **http://localhost** (frontend) and **http://localhost:8080/api/swagger-ui.html** (API docs).

**Demo credentials:**
```
Admin:  admin@devpulse.ai   / Password123!
User:   john.doe@devpulse.ai / Password123!
```

### Option B — Local Development

**1. Start infrastructure:**
```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Backend:**
```bash
cd backend
cp src/main/resources/application.yml src/main/resources/application-local.yml
# Edit DB/Redis connection if needed
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8080/api  
Swagger UI: http://localhost:8080/api/swagger-ui.html

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && mvn test -Dtest="*Test"

# Backend integration tests (requires Docker for Testcontainers)
cd backend && mvn test -Dtest="*IntegrationTest"

# Full test suite
cd backend && mvn verify

# Frontend lint
cd frontend && npm run lint

# Frontend build check
cd frontend && npm run build
```

---

## 📁 Project Structure

```
devpulse-ai/
├── backend/
│   ├── src/main/java/com/devpulse/
│   │   ├── config/           # Security, Redis, WebSocket, OpenAPI
│   │   ├── controller/       # REST controllers (Auth, Projects, Tasks, AI, Admin)
│   │   ├── dto/              # Request/Response DTOs
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/           # JPA entities (User, Project, Task, ...)
│   │   ├── exception/        # GlobalExceptionHandler + custom exceptions
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/jwt/     # JwtService + JwtAuthenticationFilter
│   │   └── service/
│   │       ├── impl/         # AuthService, ProjectService, TaskService, ...
│   │       └── ai/           # AiAnalyticsService (OpenAI integration)
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/     # Flyway V1__initial_schema.sql, V2__seed_data.sql
├── frontend/
│   └── src/
│       ├── api/              # Axios client + service functions
│       ├── components/       # Reusable UI components
│       │   ├── layout/       # AppLayout (sidebar, topbar)
│       │   ├── projects/     # CreateProjectModal
│       │   └── tasks/        # CreateTaskModal
│       ├── pages/            # Route-level pages
│       ├── store/            # Zustand stores (auth, ui)
│       ├── types/            # TypeScript interfaces
│       └── utils/            # cn() utility
├── docs/
│   ├── architecture.md       # Mermaid architecture diagram
│   └── database-diagram.md   # Mermaid ERD
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions pipeline
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Development (infra only)
├── .env.example
└── README.md
```

---

## 🔌 API Reference

Full interactive docs: `http://localhost:8080/api/swagger-ui.html`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login, get JWT tokens |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Invalidate refresh tokens |
| `/dashboard/stats` | GET | Dashboard statistics |
| `/projects` | GET/POST | List / create projects |
| `/projects/{id}` | GET/PUT/DELETE | Project CRUD |
| `/projects/{id}/members/{uid}` | POST/DELETE | Manage members |
| `/tasks/project/{pid}` | GET | Kanban tasks list |
| `/tasks` | POST | Create task |
| `/tasks/{id}` | GET/PUT/DELETE | Task CRUD |
| `/tasks/{id}/move` | PATCH | Move task (status/position) |
| `/notifications` | GET | Paginated notifications |
| `/notifications/unread-count` | GET | Unread badge count |
| `/notifications/{id}/read` | PATCH | Mark as read |
| `/notifications/read-all` | PATCH | Mark all as read |
| `/ai/reports` | GET | List AI reports |
| `/ai/reports/weekly` | POST | Generate weekly report |
| `/ai/reports/project/{id}` | POST | Generate project report |
| `/ai/chat` | POST | AI assistant chat |
| `/admin/stats` | GET | System stats (ADMIN) |
| `/admin/users` | GET | All users (ADMIN) |
| `/admin/users/{id}/toggle-active` | PATCH | Toggle user active (ADMIN) |
| `/admin/users/{id}/role` | PATCH | Change user role (ADMIN) |
| `/admin/activity-logs` | GET | Activity logs (ADMIN) |

All protected endpoints require: `Authorization: Bearer <jwt_token>`

---

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `devpulse` |
| `DB_USERNAME` | DB username | `devpulse` |
| `DB_PASSWORD` | DB password | `devpulse123` |
| `REDIS_HOST` | Redis host | `localhost` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRATION` | Access token TTL in ms | `86400000` |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL in ms | `604800000` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-placeholder` |
| `OPENAI_MODEL` | GPT model | `gpt-4o-mini` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):

1. **`backend-test`** — JUnit 5 unit tests with PostgreSQL + Redis service containers
2. **`frontend-test`** — ESLint + Vite production build
3. **`build-and-push`** — Multi-stage Docker builds → GitHub Container Registry (`ghcr.io`)
4. **`deploy`** — SSH deploy to production server (triggered on `main` only)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by the DevPulse team &nbsp;·&nbsp;
  <a href="https://devpulse.ai">devpulse.ai</a>
</div>
