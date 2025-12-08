Here’s a concise README you can use.

---

# PlatePlan

A full-stack meal planning and diet recommendation app with JWT-based authentication, recipe browsing, personalized recommendations, and user-specific meal plan storage.

## Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind
- Backend: FastAPI, SQLAlchemy, JWT auth
- DB: PostgreSQL
- Other: Docker/Docker Compose

## Prerequisites
- Node 18+
- Python 3.10+
- PostgreSQL 13+
- Docker (optional, for containerized run)

## Environment Variables
Copy `env.local.example` to `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=<optional>
```
Backend (e.g., `.env` or export):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/plateplan
SECRET_KEY=<your-32+char-secret>   # keep stable once set
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Install & Run (Frontend)
```bash
# from project root
npm install
npm run dev   # defaults to http://localhost:3001 (check package.json)
```

## Install & Run (Backend)
```bash
cd FastAPI_Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```
The backend auto-initializes DB tables on startup.

## Docker Compose
```bash
docker-compose up --build
```
This brings up backend, frontend, and PostgreSQL (check `docker-compose.yml` for ports and service names).

## Key Features
- Auth: Register/Login, JWT stored client-side, `/auth/me` for current user
- Recipes: Browse, search, sort, filter; diet recommendations with recipe cards
- Meal Planning: User-specific meal plans (CRUD) via `/meal-plans` endpoints
- Diet Recommendation: BMI/BMR, calorie plans, meal distribution, recipe suggestions; illness filters (diabetes, hypertension, etc.)

## API (Backend)
- `POST /auth/register` — Register
- `POST /auth/login-json` — Login (JSON)
- `GET /auth/me` — Current user
- `GET /meal-plans?start_date&end_date` — List plans for user
- `GET /meal-plans/{date}` — Get plan for date
- `POST /meal-plans` — Create/Update plan
- `PUT /meal-plans/{date}` — Update plan
- `DELETE /meal-plans/{date}` — Delete plan
- `DELETE /meal-plans/{date}/meals/{meal_type}` — Remove a meal
- `POST /predict/` — Diet recommendations (uses dataset)

All protected endpoints require `Authorization: Bearer <token>`.

## JWT Notes
- `sub` claim is stored as a string user ID.
- Ensure `SECRET_KEY` is stable across token creation/validation; changing it invalidates existing tokens.

## Common Ports
- Frontend: 3000/3001
- Backend: 8081
- DB: 5432

## Scripts
- Frontend dev: `npm run dev`
- Frontend build: `npm run build && npm run start`
- Backend dev: `uvicorn main:app --reload`

## Troubleshooting
- 401 on protected endpoints: log out/in to refresh token; confirm backend `SECRET_KEY` matches the one used when tokens were created.
- CORS: ensure `CORS_ORIGINS` includes your frontend origin.
- DB connection: verify `DATABASE_URL` and that PostgreSQL is running.
