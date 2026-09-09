# PIR Cricket Academy — Website & Management Platform

**Live site:** [pircricketacademy.co.in](https://pircricketacademy.co.in)  
**Admin portal:** [pircricketacademy.co.in/admin](https://pircricketacademy.co.in/admin)  
**Stack:** React 18 + TypeScript + Vite · Tailwind CSS · Neon PostgreSQL · Drizzle ORM · Vercel Serverless

---

## What this project is

A full-stack website + operations platform for **PIR Cricket Academy, Patna, Bihar**, built and maintained by Indrajit kumar.

It serves three audiences:
- **Parents / Students** — public website with admissions, turf booking, and a student portal
- **Admin (founder)** — full management dashboard: CRM, admissions, bookings, student tracker, communications, fees, attendance
- **Receptionist** — restricted portal for walk-in admissions and daily operations

---

## Project structure

```
pir-academy/
├── api/                   # Vercel serverless functions
│   ├── router.ts          # Single entry point — routes all /api/* requests
│   └── _handlers.ts       # All business logic (admissions, bookings, students, auth, emails…)
├── src/
│   ├── pages/
│   │   ├── Admin.tsx      # Main admin dashboard (tabbed: Admissions, Bookings, Students, Fees…)
│   │   ├── admin/
│   │   │   ├── CRM.tsx        # Lead CRM (pipeline, list, analytics, follow-up log)
│   │   │   ├── Comms.tsx      # Communications center (WhatsApp broadcast to all parents)
│   │   │   ├── Attendance.tsx # Daily attendance tracker
│   │   │   ├── Fees.tsx       # Fee collection tracker
│   │   │   └── Reception.tsx  # Receptionist portal
│   │   ├── Booking.tsx    # Public turf/wicket booking with Razorpay payment
│   │   ├── Admissions.tsx # Public admission form
│   │   ├── Student.tsx    # Student/parent self-service portal (login by phone)
│   │   └── …              # Home, WhyPIR, Coaches, Facilities, etc.
│   ├── components/        # Shared UI components (Navbar, Hero, Contact, AnnouncementBar…)
│   └── lib/db.ts          # Drizzle ORM schema (students, admissions, bookings, batches…)
├── public/                # Static assets (logo, images, PDFs)
├── server/                # Local dev server (mirrors Vercel routing)
├── drizzle.config.ts      # DB migration config (Neon PostgreSQL)
├── vite.config.ts         # Vite build config
└── index.html             # SPA entry point
```

---

## Database tables (Neon PostgreSQL via Drizzle ORM)

| Table | Purpose |
|---|---|
| `admissions` | Parent-submitted admission forms |
| `students` | Manually enrolled students (linked to batches) |
| `batches` | Training batches (age group, schedule, coach) |
| `bookings` | Turf/wicket bookings with Razorpay order tracking |
| `inquiries` | Lead CRM — contact form submissions |
| `follow_ups` | Follow-up notes per inquiry lead |
| `attendance` | Daily attendance records per student |
| `fees` | Fee payment records per student |
| `session_notes` | Coach session notes |
| `player_ratings` | Per-student skill ratings |
| `notifications` | System notification log |

---

## Auth model

- **Admin** — JWT stored in `localStorage` as `pir_admin_token`. Full access to all endpoints via `requireAdmin`.
- **Receptionist** — JWT stored as `pir_reception_token`. Limited access via `requireAdminOrReception`.
- **Student portal** — Phone-number login (no password). Returns student dashboard data.

---

## Key features

### Public-facing
- Landing page with hero, facilities, coaches, testimonials, FAQ
- **Admission form** — submits to `admissions` table, triggers admin email notification
- **Turf/wicket booking** — Razorpay payment integration; booking only confirmed after payment verified
- **Student portal** — parents log in by phone number, see child's batch, attendance, fees; supports multiple children under same phone number (sibling picker)
- **Contact / Inquiry form** — feeds into Lead CRM

### Admin dashboard (`/admin`)
- **Admissions tab** — view all applications, enroll as student (deduped by phone + name to support siblings), filter by status
- **Bookings tab** — view confirmed bookings, pending payments auto-expire after 30 min
- **Students tab** — full student list with batch, attendance, fees
- **Lead CRM** (`/admin/crm`) — pipeline + list + analytics views, follow-up logging, stage progression, delete inquiry
- **Communications** (`/admin/comms`) — auto-loads all parent contacts, compose WhatsApp broadcast messages
- **Fees, Attendance, Session Notes, Player Ratings** — operational management tools

---

## Deployment

Deployed on **Vercel** (auto-deploy from `main` branch).

```bash
# Deploy to production
npx vercel --prod

# Local development
npm run dev          # Vite dev server on :5173
node server/index.js # API dev server on :3001
```

Environment variables required (set in Vercel dashboard, never commit `.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Admin/receptionist JWT signing key |
| `RAZORPAY_KEY_ID` | Razorpay payment key |
| `RAZORPAY_KEY_SECRET` | Razorpay payment secret |
| `RESEND_API_KEY` | Email sending via Resend |
| `ADMIN_EMAIL` | Email address for admin notifications |

---

## Phone number handling

All phone matching uses last-10-digit normalization:
```ts
phone.replace(/\D/g, "").slice(-10)
```
Numbers starting with `91` that are 10 digits long (e.g. `9179030532`) are treated as 10-digit numbers, not country codes.

Sibling support: deduplication uses `phone + studentName` combination, not phone alone.

---

## Contact

**Indrajit kumar** — kumarindrajitcricket@gmail.com  
PIR Cricket Academy, Sector-A, Police Colony, Anisabad, Patna – 800002, Bihar  
Under the Aegis of S.P Sports & Cultural Foundation · Powered by Savera Cancer Hospital
