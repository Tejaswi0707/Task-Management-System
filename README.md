# Earnest Tasks (Assignment)

Full-stack task manager:

- Backend: Node.js + TypeScript + Express + Prisma (SQLite)
- Frontend: Next.js (App Router) + TypeScript

## Requirements covered

### Authentication (JWT)

- Password hashing with `bcryptjs`
- Access token (short-lived) returned to client
- Refresh token (long-lived) stored as HTTP-only cookie and used to refresh access tokens

Required endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Tasks (CRUD)

Tasks are scoped to the logged-in user (protected routes).

Required endpoints:

- `GET /tasks` (pagination + filter + search)
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/toggle`

`GET /tasks` query params:

- `page` (default `1`)
- `pageSize` (default `10`)
- `status` (`PENDING` or `COMPLETED`)
- `search` (searches by title)

## How to run locally

### Backend (API)

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend runs at `http://localhost:4000`.

Optional `backend/.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
DATABASE_URL=file:./dev.db
```

### Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000`
2. Register → Login
3. Go to Tasks to add/edit/delete/toggle tasks, filter by status, and search by title


