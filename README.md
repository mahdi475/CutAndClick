# ✂️ Cut & Click

A booking web app for barbershops. Customers find a barber, see services, prices and opening hours, and book a free time slot. Barbers run their own page from a dashboard: services, products, opening hours and bookings.

**Live:** [cut-and-click.vercel.app](https://cut-and-click.vercel.app) (the app is in Swedish)

## Features

**Customers**
- Browse barbers as a guest, or sign in with email or Google
- Find barbers in your city (sorted by rating) or search by name
- See free time slots and book. Double bookings are blocked in the database
- Booking history, cancellation, favourites and notifications
- Leave a review, only after a real booking

**Barbers**
- Sign up with a salon profile and pick the address on a map
- Add, edit and hide services (haircuts) and products
- Set opening hours for each weekday
- See and complete bookings

## Tech stack

| Part | Tech |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Leaflet |
| Backend | Node.js, Express 5, express-validator, Helmet, rate limiting |
| Database and auth | Supabase (PostgreSQL, Auth with Google OAuth) |
| Email | Resend |
| Hosting | Vercel (frontend, and the API as a serverless function) |

## Project structure

```text
client/      React app (pages, components, context)
server/      Express API (routes, controllers, middleware)
  db/        SQL schema and migrations
api/         Vercel entry point that wraps the Express app
docs/        API reference and planning notes (Swedish)
```

## Run locally

You need Node.js 18+ and a Supabase project.

1. Install dependencies:

   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. Create `server/.env`:

   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-key
   CLIENT_URL=http://localhost:5173
   ```

   and `client/.env`:

   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Set up the database with the SQL files in `server/db/` (`schema.sql` first, then the migrations).

4. Start the frontend and the API together:

   ```bash
   cd client
   npm run dev
   ```

   The app runs on `http://localhost:5173` and the API on `http://localhost:3000`.

API reference: [docs/API_DOKUMENTATION.md](docs/API_DOKUMENTATION.md)
