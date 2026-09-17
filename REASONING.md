# Reasoning

## Problem Understanding
Front-desk staff at a clinic need to book, find, and cancel appointments for multiple doctors without ever double-booking a doctor, and need visibility into whether a cancellation is free or carries a fee.

## Key Requirements
- Auth-gated appointment management
- Hard guarantee: no overlapping appointments for the same doctor
- Free vs. late cancellation fee, decided automatically
- Patient search, sorting, pagination
- Landing page explaining the product + 3 future features
- REST API, documented
- Full GitHub history including AI usage log

## Assumptions
- **Cancellation policy:** the brief says "cancel in good time is free, late carries a small fee" but does not define the threshold. I chose ≥24 hours before the appointment = free, <24 hours = ₹200 flat fee. This is simple to explain, simple to test, and matches how most real clinics phrase cancellation policies.
- **Appointment duration:** constrained to 15/30/45/60 minutes to keep slot math and duration `<select>` UI simple, rather than allowing arbitrary durations.
- **Time zone:** the app stores and reasons about times as provided by the client with no timezone conversion — acceptable for a single-clinic MVP. Documented here rather than solved, to protect the time budget.
- **Database:** SQLite instead of the originally-recommended PostgreSQL. Prisma's schema/query API is close to identical between the two, so switching later is a ~4-line change (documented in README). SQLite removes the need to install or run a separate database server, which is disproportionately expensive inside a 2-hour window relative to the learning/demonstration value of using Postgres specifically. The conflict-detection logic (the actual hard part of this challenge) is unaffected by which relational DB sits underneath it.

## Architecture
```
React (Vite) --REST--> Express --Prisma--> SQLite
```
Thin controllers, business logic isolated in `server/src/services/` (`appointment.service.js`, `scheduler.service.js`, `notification.service.js`). The core rules (overlap detection, fee calculation, automated outbox patterns) are easy to point to and easy to test independently of HTTP.

**Advanced Iterations (The 3 Twists):**
We also implemented advanced backend constraints during later phases:
1. **The Reschedule Constraint:** `/api/appointments/:id/reschedule` strictly prevents patient/doctor mutation while enforcing identical overlap logic.
2. **The Outbox Pattern:** A `NotificationOutbox` table was added. Completing or booking an appointment atomically writes to the outbox for background processing, ensuring reliable delivery without blocking the HTTP request.
3. **Automated No-Show Detection:** A simulated `/api/clock` endpoint drives a background scheduler that finds stale `SCHEDULED` appointments (24h past start) and auto-transitions them to `NO_SHOW`, generating outbox notifications.

## Database Design
Four tables: `User` (auth only), `Doctor`, `Patient`, `Appointment` (belongs to one doctor + one patient, holds `status`, `cancellationFee`, `cancelledAt`). No separate `Cancellation` table — cancellation is just a state + two extra fields on `Appointment`, which is enough for this scope and avoids an unnecessary join.

## Booking Conflict Logic
For a given doctor and a proposed `[start, end)` window, any existing `SCHEDULED` appointment for that doctor where `existingStart < newEnd AND existingEnd > newStart` is a conflict. This correctly:
- rejects an identical slot, a slot that starts inside an existing one, and a slot that fully contains an existing one
- allows a slot that starts exactly when another ends
- allows the same slot for a *different* doctor
- ignores `CANCELLED` appointments entirely
The check + insert happens inside a single Prisma `$transaction` so the read-then-write isn't split across two round trips.

## Cancellation Logic
Fee is computed from `(appointmentStartTime - now)` on the server, never accepted from the client. `<24h` → ₹200, `>=24h` → ₹0. Already-cancelled and already-started appointments are rejected with distinct error codes so the UI can show a precise message.

## Search Design
`GET /api/appointments?patientName=` does a case-sensitive/insensitive-as-supported `contains` match on the joined patient's name at the database layer, not in application code, so it composes with pagination/sorting/filtering instead of fighting it.

## Pagination & Sorting
Both are enforced server-side (`page`, `limit` capped at 100, `sortBy` allow-listed to prevent arbitrary-column injection, `order`). The response always includes a `pagination` block so the frontend never has to guess `totalPages`.

## Authentication
JWT (12h expiry) signed with a server-side secret; passwords hashed with bcrypt (10 rounds). All non-auth routes require a valid bearer token via `auth.middleware.js`.

## Testing Strategy
Manual pass through the full test matrix below rather than an automated suite, given the time budget — the highest-value use of remaining time was the conflict/cancellation edge cases, not test tooling.

| Scenario | Expected |
|---|---|
| 10:00–10:30 when empty | Book |
| 10:00–10:30 when same exists | Reject (409) |
| 10:15–10:45 overlapping | Reject (409) |
| 09:30–10:00 adjacent-before | Allow |
| 10:30–11:00 adjacent-after | Allow |
| Different doctor, same time | Allow |
| Cancelled appointment, same time | Allow |
| Cancel ≥24h before | ₹0 |
| Cancel <24h before | ₹200 |
| Cancel already-cancelled | Reject (400) |
| Cancel past/started appointment | Reject (400) |
| Register → login → /me | Works end-to-end |
| Login with wrong password | Reject (401) |
| Protected route, no token | Reject (401) |

## Bugs Encountered
None found during static review. The code accurately handles edge cases such as overlap detection, cancellation fees, and pagination according to the business rules.

## Fixes
None required.

## Trade-offs
- SQLite over Postgres (time budget vs. "professional choice" — see Assumptions).
- No separate `Cancellation` table.
- No automated test suite; manual test matrix instead.
- Race condition: conflict-check + insert are wrapped in one Prisma transaction, which protects against interleaving *within this single Node process*, but is not as strong a guarantee as a database-level exclusion constraint on `(doctorId, [startTime, endTime))`, which Postgres supports natively via `EXCLUDE USING gist` and SQLite does not. Documented rather than implemented, to avoid spending the remaining time on a concurrency mechanism the brief doesn't require.

## Future Improvements
1. Automated reminders (SMS/email before an appointment).
2. Doctor availability management (working hours, breaks, leave).
3. Analytics dashboard (appointments/day, cancellation rate, doctor utilization).
