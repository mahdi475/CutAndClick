# Cut & Click — API Dokumentation

**Base URL (dev):** `http://localhost:3000`  
**Base URL (prod):** `https://cutandclick-api.onrender.com`

> 🔒 = kräver `Authorization: Bearer <token>` i headern  
> 🌐 = publik (ingen autentisering krävs)

---

## 🔐 Auth — `/api/auth`

### `POST /api/auth/register`
Registrera ny användare (kund eller barber).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "minst6tecken",
  "username": "Mahdi",
  "role": "customer",
  "location": "Göteborg",
  "salon_name": "Mahdi Cuts",
  "salon_address": "Storgatan 1",
  "city": "Göteborg",
  "phone": "+46701234567"
}
```
✅ `201` → `{ "message": "Kontot är skapat!" }`  
❌ `400` → `{ "error": "Ogiltig e-postadress" }` (validering)  
❌ `409` → `{ "error": "E-postadressen är redan registrerad" }`

---

### `POST /api/auth/login`
**Body:** `{ "email": "", "password": "" }`  
✅ `200` →
```json
{
  "message": "Välkommen in!",
  "session": { "access_token": "..." },
  "user": { "id": "...", "username": "...", "role": "customer", "location": "..." }
}
```
❌ `401` → `{ "error": "Felaktiga inloggningsuppgifter" }`

---

### `GET /api/auth/profile` 🔒
✅ `200` → `{ "id": "...", "username": "...", "role": "...", "location": "...", "barber_profiles": {...} }`

### `PUT /api/auth/profile` 🔒
**Body:** `{ "username": "", "location": "", "salon_name": "", "bio": "", "cover_image": "" }`  
✅ `200` → `{ "message": "Profil uppdaterad!" }`

### `POST /api/auth/logout` 🔒
✅ `200` → `{ "message": "Utloggad!" }`

---

## ✂️ Barbershops — `/api/barbers`

### `GET /api/barbers` 🌐
Hämta alla barbershops sorterade efter betyg.  
✅ `200` → Array med `{ id, name, salon_name, city, salon_address, image, rating, total_reviews }`

### `GET /api/barbers/:id` 🌐
Hämta detaljer om en specifik barbershop inkl. tjänster, produkter och öppettider.  
✅ `200` → `{ ...barberInfo, services: [...], products: [...], opening_hours: [...] }`

### `GET /api/barbers/nearby?city=Göteborg` 🌐
Filtrera barbershops per stad.  
✅ `200` → Filtrerade barbershops

---

## 💇 Klipptjänster/Produkter — `/api/posts`

### `GET /api/posts/haircuts` 🌐
Alla klipptjänster (is_active = true).

### `GET /api/posts/items` 🌐
Alla produkter (is_active = true).

### `GET /api/posts/items/:barberId` 🌐
Produkter för en specifik barber, sorterade per kategori.

### `GET /api/posts/my/haircuts` 🔒 (barber)
Inloggad barbers egna klipptjänster.

### `GET /api/posts/my/items` 🔒 (barber)
Inloggad barbers egna produkter.

### `POST /api/posts/haircuts` 🔒 (barber)
```json
{ "title": "", "description": "", "price": 450, "duration_minutes": 60, "image_url": "" }
```
✅ `201` → Skapad tjänst

### `PUT /api/posts/haircuts/:id` 🔒 (barber + ägare)
Uppdatera en klipptjänst.

### `PATCH /api/posts/haircuts/:id/toggle` 🔒 (barber)
Aktivera/inaktivera tjänst.

### `DELETE /api/posts/haircuts/:id` 🔒 (barber + ägare)
Ta bort en tjänst.

*(Samma mönster för `/api/posts/items`)*

---

## 📅 Bokningar — `/api/bookings`

### `GET /api/bookings/available/:haircutId?date=2026-03-01` 🌐
Lediga tider för ett datum.  
✅ `200` → `{ "date": "2026-03-01", "available": ["09:00", "10:00", "13:00"], "closed": false }`  
✅ `200` (stängt) → `{ "date": "...", "available": [], "closed": true }`

### `POST /api/bookings` 🔒
```json
{ "haircut_id": 42, "booking_date": "2026-03-01", "booking_time": "10:00" }
```
✅ `201` → Bekräftad bokning  
❌ `409` → `{ "error": "Tyvärr tog någon annan den just nu" }`  
❌ `400` → `{ "error": "Datumet måste vara i framtiden" }` (validering)

### `GET /api/bookings/my` 🔒
Kundens bokningar med salon-info.  
✅ `200` → `[{ "id": "", "booking_date": "", "booking_time": "", "status": "confirmed", "salon_name": "", ... }]`

### `PATCH /api/bookings/:id/cancel` 🔒
Avboka en kommande bokning.  
✅ `200` → `{ "message": "Bokning avbokad!" }`  
❌ `403` → `{ "error": "Du kan bara avboka dina egna bokningar" }`

### `GET /api/bookings/barber` 🔒 (barber)
Barbers bokningar. Query: `?date=2026-03-01` för att filtrera per dag.

---

## 🕐 Öppettider — `/api/opening-hours`

### `GET /api/opening-hours/:userId` 🌐
Barbers öppettider (7 rader, en per veckodag).  
✅ `200` → `[{ "day_of_week": "monday", "open_time": "09:00", "close_time": "18:00", "is_closed": false }]`

### `PUT /api/opening-hours` 🔒 (barber)
Spara öppettider för alla 7 dagar.  
**Body:** `{ "hours": [{ "day_of_week": "monday", "open_time": "09:00", "close_time": "18:00", "is_closed": false }, ...] }`  
✅ `200` → `{ "message": "Öppettider sparade!" }`

---

## ❤️ Favoriter — `/api/favourites`

### `GET /api/favourites` 🔒
Kundens sparade barbershops.  
✅ `200` → `[{ "barber_id": "...", "salon_name": "...", "city": "", "rating": 4.5, "image": "" }]`

### `POST /api/favourites` 🔒
**Body:** `{ "barber_id": "uuid..." }`  
✅ `201` → `{ "message": "Tillagd som favorit" }`  
❌ `409` → `{ "error": "Redan en favorit" }`

### `DELETE /api/favourites/:barberId` 🔒
Ta bort favorit.  
✅ `200` → `{ "message": "Borttagen från favoriter" }`

---

## ⭐ Omdömen — `/api/reviews`

### `GET /api/reviews/:barberId` 🌐
Alla omdömen för en barber.  
✅ `200` → `[{ "id": 1, "stars": 5, "review_title": "...", "review_description": "...", "reviewer_name": "Mahdi", "created_at": "" }]`

### `POST /api/reviews` 🔒
Kräver att kunden bokat hos barbern.  
**Body:**
```json
{ "barber_id": "uuid...", "stars": 5, "review_title": "Fantastisk!", "review_description": "Bästa klippningen jag haft." }
```
✅ `201` → `{ "message": "Omdöme skapat, tack!" }`  
❌ `403` → `{ "error": "Du måste ha bokat hos denna barber..." }`  
❌ `409` → `{ "error": "Du har redan lämnat ett omdöme..." }`  
❌ `400` → `{ "error": "Stars måste vara 1–5" }` (validering)

*Rating på `barber_profiles.rating` uppdateras automatiskt med rullande medelvärde.*

---

## 🔔 Notifikationer — `/api/notifications`

### `GET /api/notifications` 🔒
Senaste 50 notifikationer, nyast först.  
✅ `200` → `[{ "id": 1, "type": "booking_confirmed", "title": "Bokning bekräftad! ✅", "body": "...", "is_read": false, "created_at": "" }]`

**Typer:** `booking_confirmed` | `new_booking` | `review_received` | `booking_reminder`

### `PATCH /api/notifications/:id` 🔒
Markera en notifikation som läst.  
✅ `200` → `{ "message": "Markerad som läst" }`

### `PATCH /api/notifications/read-all` 🔒
Markera alla notifikationer som lästa.  
✅ `200` → `{ "message": "Alla markerade som lästa" }`

---

## 🚦 Rate Limits

| Route | Max requests | Per |
|---|---|---|
| `/api/auth/*` | 10 | 1 minut per IP |
| `/api/bookings/*` | 30 | 1 minut per IP |
| Övriga `/api/*` | 100 | 1 minut per IP |

**429 Too Many Requests** → `{ "error": "För många försök — vänta en minut och försök igen" }`

---

## 🔑 Auth Header

Alla 🔒-routes kräver:
```
Authorization: Bearer <access_token>
```
Token fås från `POST /api/auth/login` → `session.access_token`.
