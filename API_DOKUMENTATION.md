# Cut & Click – API

**URL:** `http://localhost:3000`

---

### POST `/api/auth/register`
```json
{ "email": "", "password": "", "username": "", "location": "" }
```
✅ `201` → `{ "message": "Kontot är skapat!" }`

---

### POST `/api/auth/login`
```json
{ "email": "", "password": "" }
```
✅ `200` → `{ "message": "Välkommen in!", "session": { "access_token": "..." } }`

---

### GET `/api/auth/profile` — 🔒 token krävs
**Header:** `Authorization: Bearer <token>`  
✅ `200` → `{ "id": "", "username": "", "location": "", "role": "" }`

---

### GET `/api/posts/haircuts` — publik
✅ `200` → Array med alla klippningar.

---

### GET `/api/posts/items` — publik
✅ `200` → Array med alla produkter.

---

### POST `/api/posts/haircuts` — 🔒 token krävs
**Header:** `Authorization: Bearer <token>`
```json
{ "title": "", "description": "", "price": 0, "time_taken": "", "image_url": "" }
```
✅ `201` → Det skapade inlägget.

---

### GET `/api/bookings/available/:haircutId?date=YYYY-MM-DD` — publik
Exempel: `/api/bookings/available/123?date=2026-03-01`  
✅ `200` → `{ "date": "2026-03-01", "available": ["09:00", "10:00", "13:00"] }`

---

### POST `/api/bookings` — 🔒 token krävs
**Header:** `Authorization: Bearer <token>`
```json
{ "haircut_id": "", "booking_date": "2026-03-01", "booking_time": "10:00" }
```
✅ `201` → Den skapade bokningen.  
❌ `409` → `{ "error": "Tiden är redan bokad – välj en annan tid" }`

---

### GET `/api/bookings/my` — 🔒 token krävs
**Header:** `Authorization: Bearer <token>`  
✅ `200` → Array med kundens bokningar inkl. klippningsinfo:
```json
[{
  "id": "...",
  "booking_date": "2026-03-01",
  "booking_time": "10:00",
  "haircut_posts": { "title": "Ferrari Cutzz", "price": 450, "image_url": "..." }
}]
```

---

### Token (för 🔒-routes)
```
Authorization: Bearer <access_token>
```
