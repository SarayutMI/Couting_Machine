# 📷 Camera Counting Machine

A **Hi-Tech** web-based dashboard for managing IP cameras (ONVIF protocol) and counting people/objects. Built with Next.js 14+, TypeScript, Tailwind CSS, and a Cyberpunk-lite aesthetic.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

## ✨ Features

### 🔐 Authentication & User Management
- **Register** — email, username, password (bcrypt hashed), role (Admin/Viewer)
- **Login** — credentials-based, JWT session
- **Forgot Password** — email token flow
- **Reset Password** — token-validated form
- **Account Management** — change username, email, password

### 📊 Dashboard (Bento Grid Layout)
- **Animated counter widgets** — big number roll-up animations per camera
- **Count history chart** — 24h line chart (Recharts)
- **System status panel** — camera online/offline indicators
- **Recent alerts feed** — count threshold alerts
- Glassmorphism cards with neon cyan glow effect

### 📷 Camera Integration
- **ONVIF IP Camera** support — connect via IP/user/pass
- **Camera CRUD** — add, edit, delete cameras; test connection
- **REST ingest endpoint** — `POST /api/counts/ingest` for ML service integration
- **Webcam fallback** (browser `getUserMedia`)

### 🌐 i18n — Thai 🇹🇭 & English 🇬🇧
- All UI labels in both `th` and `en`
- **Slide toggle** in top bar — instant language swap (no page reload)

### 🎨 Theming — Dark & Light
- Dark: deep navy + **cyan `#00D4FF`** neon glow
- Light: clean white + muted accents
- Toggle switch in top bar
- CSS custom properties + Tailwind `dark:` classes

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | NextAuth.js v4 (credentials + JWT) |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Real-time** | Socket.io |
| **i18n** | next-intl (Thai + English) |
| **Charts** | Recharts |
| **Camera** | ONVIF (`node-onvif`) |
| **Icons** | lucide-react |
| **Fonts** | Space Grotesk + JetBrains Mono |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET and DATABASE_URL

# 3. Start PostgreSQL
docker-compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

After seeding, use these test accounts:
- **Admin**: `admin@example.com` / `admin123`
- **Viewer**: `viewer@example.com` / `viewer123`

---

## 📋 Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with sample data
npm run db:generate  # Regenerate Prisma client
npm run db:studio    # Open Prisma Studio (database GUI)
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/counting_machine` |
| `NEXTAUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server for password reset | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | your email |
| `SMTP_PASS` | SMTP password | your app password |
| `ONVIF_DISCOVERY_TIMEOUT` | ONVIF discovery timeout (ms) | `5000` |

---

## 🌐 API Reference

### Authentication
```
POST /api/auth/register         — Register new user
POST /api/auth/forgot-password  — Request password reset email
POST /api/auth/reset-password   — Reset password with token
POST /api/auth/[...nextauth]    — NextAuth signin/signout
```

### Cameras
```
GET    /api/cameras       — List cameras
POST   /api/cameras       — Add camera
GET    /api/cameras/:id   — Get camera details
PUT    /api/cameras/:id   — Update camera
DELETE /api/cameras/:id   — Delete camera
```

### Counts
```
GET  /api/counts          — Get count records (supports ?cameraId, ?from, ?to, ?limit)
POST /api/counts/ingest   — Ingest count from external ML service
```

### Dashboard
```
GET /api/dashboard/stats  — Get dashboard statistics
```

### ML Service Integration

External counting services can POST data directly:

```bash
curl -X POST http://localhost:3000/api/counts/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "cameraId": "your-camera-id",
    "count": 42,
    "timestamp": "2024-01-01T12:00:00Z",
    "metadata": { "confidence": 0.95, "model": "yolov8" }
  }'
```

---

## 🏗 Project Structure

```
/
├── prisma/
│   ├── schema.prisma      # Database schema (User, Camera, CountRecord, PasswordResetToken)
│   └── seed.ts            # Database seeder
├── public/
│   └── locales/
│       ├── en.json        # English translations
│       └── th.json        # Thai translations
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, register, forgot/reset password)
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── bento/         # Bento grid card component
│   │   ├── camera/        # Camera status badge
│   │   ├── dashboard/     # Animated counter widget
│   │   ├── layout/        # Sidebar, Topbar
│   │   ├── providers/     # Theme provider
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client singleton
│   │   ├── onvif.ts       # ONVIF camera helpers
│   │   ├── socket.ts      # Socket.io helpers
│   │   └── utils.ts       # Utility functions (cn)
│   └── types/
│       └── index.ts       # TypeScript type definitions
├── docker-compose.yml     # PostgreSQL service
├── .env.example           # Environment variables template
└── package.json
```

---

## 🎨 UI Style Guide

- **Aesthetic**: Hi-Tech / Cyberpunk-lite
- **Dark accent**: `#00D4FF` (cyan) with glow: `box-shadow: 0 0 8px #00D4FF`
- **Cards**: Glassmorphism — `backdrop-blur`, semi-transparent backgrounds
- **Fonts**: `Space Grotesk` (UI) + `JetBrains Mono` (numbers/code)
- **Animations**: Counter roll-up, pulsing online indicators, glow effects

---

## 📄 License

MIT
