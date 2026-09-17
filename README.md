# ClinicFlow

Conflict-free appointment management for busy clinics.

A lightweight system for clinic front-desk staff: book appointments, see a doctor's daily schedule, find patients, and cancel appointments with automatic free/late-fee calculation — with a hard guarantee that no doctor is ever double-booked.

## Features
- Register / login (JWT + bcrypt), protected APIs
- Doctor list + a doctor's day schedule
- Book an appointment (doctor, patient, date, start time, duration)
- **Zero-tolerance overlap prevention** for the same doctor
- Cancel an appointment with automatic free (≥24h) / ₹200 late (<24h) fee, calculated server-side
- Patient search by name
- Appointment list with backend pagination and sorting
- Seed data + demo account for instant evaluation

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, JWT, bcrypt, Zod
- **Database:** SQLite via Prisma ORM (see note below on switching to Postgres)

## Architecture
```
React Client  --REST-->  Express Server  --Prisma-->  Database
```
`server/src/services/appointment.service.js` holds the two pieces of business logic that matter most: conflict detection and cancellation-fee calculation. Everything else (controllers, routes) is thin.

## Prerequisites
- Node.js 18+
- npm

## Installation
```bash
# Backend
cd server
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev          # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev           # http://localhost:5173
```

## Environment Variables
**server/.env**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="clinicflow-dev-secret-change-me"
PORT=5000
```
**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## Database Setup
This project uses **SQLite** by default (a single `dev.db` file, created by `prisma migrate dev`) so it runs with zero external services — no Postgres install, no Docker. This was a deliberate time-boxing trade-off (see REASONING.md).

To use Postgres instead:
1. In `server/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL="postgresql://postgres:password@localhost:5432/clinicflow"` in `server/.env`.
3. `docker compose up -d` (starts Postgres using the provided `docker-compose.yml`).
4. Re-run `npx prisma migrate dev --name init` and `npm run seed`.

## Demo Credentials
```
Email:    demo@clinicflow.com
Password: Demo@123
```

## API Documentation
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/doctors | List doctors |
| GET | /api/doctors/:id | Doctor details |
| GET | /api/doctors/:id/appointments?date=YYYY-MM-DD | Doctor's day schedule |
| GET | /api/patients?search= | Search/list patients |
| POST | /api/patients | Create patient |
| GET | /api/appointments?page=&limit=&sortBy=&order=&doctorId=&date=&patientName= | List/search/paginate/sort appointments |
| GET | /api/appointments/:id | Appointment details |
| POST | /api/appointments | Book appointment |
| PATCH | /api/appointments/:id/cancel | Cancel appointment (fee computed server-side) |

All appointment/doctor/patient routes require `Authorization: Bearer <token>`.

## Business Rules
**Overlap rule:** `newStart < existingEnd AND newEnd > existingStart` → conflict, for the same doctor, among `SCHEDULED` appointments only. Adjacent bookings (one ends exactly when another starts) are allowed. Cancelled appointments never block a slot.

**Cancellation rule:** ≥24 hours before start → free. <24 hours before start → ₹200. Already-cancelled or already-started appointments cannot be cancelled again. The fee is always computed by the backend, never trusted from the client.

## Pagination & Sorting
`GET /api/appointments` accepts `page`, `limit` (backend-enforced, default 10, max 100), `sortBy` (`startTime` | `createdAt` | `status`), and `order` (`asc` | `desc`). Response includes a `pagination` object with `page`, `limit`, `total`, `totalPages`.

## Testing
Manually verified scenarios (see REASONING.md for the full matrix): normal booking, exact-slot conflict, overlapping conflict, adjacent-slot success, different-doctor success, cancelled-appointment-doesn't-block, cancellation ≥24h/=24h/<24h, already-cancelled rejection, past-appointment cancellation rejection, register/login, invalid password, protected route without token.

## Screenshots
_(add screenshots here after running the app)_

## Future Improvements
1. Automated SMS/email reminders before appointments.
2. Doctor availability management (working hours, breaks, leave).
3. Analytics dashboard (appointments/day, cancellation rate, doctor utilization).
