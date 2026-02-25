# Cut & Click – API

**URL:** `http://localhost:3000`

---

### POST `/api/auth/register`
```json
{ "email": "", "password": "", "username": "", "location": "" }
```
✅ `201` → `{ "message": "Kontot är skapat!" }`  
❌ `400` → `{ "error": "..." }`

---

### POST `/api/auth/login`
```json
{ "email": "", "password": "" }
```
✅ `200` → `{ "message": "Välkommen in!", "session": { "access_token": "..." } }`  
❌ `401` → `{ "error": "Fel mejl eller lösenord" }`

---

### GET `/api/posts/haircuts` — publik
Inga headers eller body.  
✅ `200` → Array med alla klippningar från databasen.

---

### GET `/api/posts/items` — publik
Inga headers eller body.  
✅ `200` → Array med alla produkter från databasen.

---

### Token (för skyddade routes)
Spara `access_token` och skicka den såhär:
```
Authorization: Bearer <access_token>
```
