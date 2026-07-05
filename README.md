AgLugan

Ride-hailing web application with a static client and an Express backend.

Local Development

1. Install dependencies:
   npm install
2. Set the required environment variables in `server/.env`.
3. Use a PostgreSQL database, preferably Neon, and import `client/public/database/aglugan.postgres.sql`.
4. Start the app:
   npm run dev
5. Open:
   http://localhost:3000

Required Environment Variables

Set these locally in `server/.env` and in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL` or `NEON_DATABASE_URL`
- `SESSION_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CORS_ORIGINS` (optional, comma-separated list)
- `DB_SSL` (optional, defaults to enabled when `DATABASE_URL` is used)
- `DB_SSL_REJECT_UNAUTHORIZED` (optional)

Deploying to Vercel

This project now supports Vercel through:

- `api/index.js` as the serverless entrypoint
- `vercel.json` rewrites so Express handles both pages and API routes
- PostgreSQL/Neon database configuration through `DATABASE_URL`
- cookie-based sessions that work better in a serverless environment

Deployment steps:

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables listed above.
4. Set `DATABASE_URL` in Vercel to your Neon connection string.
5. Deploy.

Important Notes

- The app can no longer rely on `localhost` database credentials in production.
- Neon is PostgreSQL, so the old MySQL dump in `client/public/database/aglugan.sql` is not directly importable without conversion.
- Use `client/public/database/aglugan.postgres.sql` in the Neon SQL editor or with your preferred PostgreSQL client.
- One seeded admin row in the original dump stores `admin123` as plain text, which will not work with the current bcrypt-based login flow.
- Profile image uploads are not persisted on Vercel without external object storage such as Cloudinary, S3, or Vercel Blob.
- Login and reset-password requests now use the current site origin, so they work in both local development and production.

Admin Access

- Admin page: `/adminlogin`
- Example admin credentials depend on your database contents.

Driver and Passenger Notes

- Passengers must exist in the allowed ID list before registration.
- Drivers need a vehicle before they can queue rides.

