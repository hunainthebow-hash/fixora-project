# Fixora secure + fast database setup

## Recommended production stack
- PostgreSQL 16+
- PostGIS for provider location data
- Connection pooling (`pg` Pool)
- TLS connection to the database
- JWT access tokens (server-issued)
- bcrypt password hashing (12 rounds)
- Helmet security headers
- Rate limiting on login/signup
- Parameterized SQL queries

## Important
No database can honestly be promised to be "100% unhackable". This setup prevents common problems by keeping database credentials server-side, hashing passwords, validating input, rate-limiting auth, and scoping wallet/booking reads to the authenticated user's ID.

## Run schema
```bash
psql "$DATABASE_URL" -f db_schema.sql
```

## Environment
Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong random `JWT_SECRET`. Never commit `.env`.

## Wallet privacy
The API exposes `/api/me/wallet`, which reads only the wallet for the authenticated user. Never send `allUsers` wallet balances to the browser.

## Booking privacy
`/api/me/bookings` only returns bookings where the authenticated user is the customer or provider. Admin-only reporting should use a separate protected endpoint and role check.

## Booking date/time
Bookings store a real `scheduled_at` timestamp in PostgreSQL. The UI still shows a friendly date + time slot, while the database keeps the exact ISO timestamp for sorting, reminders and provider availability checks.

## Balance privacy
Customer/provider wallet balance is never selected in the public bookings endpoint. `/api/me/wallet` requires the user's own JWT. Do not expose the `wallet_accounts` table directly to the frontend.
