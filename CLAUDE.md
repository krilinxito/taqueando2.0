# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taqueando 2.0 is a restaurant order management system (sistema de pedidos). Full-stack app with a Node.js/Express backend and a React/Vite frontend, using MySQL as the database.

## Commands

### Backend (`backend/`)
```bash
npm run dev     # Start with nodemon (development)
npm start       # Start with node (production)
```

### Frontend (`frontend/`)
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run lint    # ESLint
npm run preview # Preview production build
```

## Environment Variables

**Backend** (`backend/.env`):
- `PORT` — server port
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` — MySQL connection
- `JWT_SECRET` — JWT signing secret
- `CORS_ORIGINS` — comma-separated allowed origins (or `FRONTEND_URL`)

**Frontend** (`frontend/.env`):
- `VITE_API_URL` — base URL for the backend API (e.g., `http://localhost:3000/api`)

## Architecture

### Backend
- **Entry point**: `backend/index.js` — sets up Express, CORS, and mounts all routers under `/api`
- **Pattern**: routes → controllers → models (direct SQL queries via mysql2 pool)
- **Database**: MySQL connection pool in `backend/config/db.js`
- **Auth middleware**: `backend/middlewares/auth.middleware.js` — `verificarToken` (JWT + in-memory cache) and `soloAdmin` (role check)
- All models use raw SQL with parameterized queries via `mysql2/promise` pool

### Frontend
- **Entry**: `frontend/src/main.jsx` → `App.jsx` → `AppRoutes.jsx`
- **Routing**: React Router v7. Two protected route trees:
  - `/menu/*` — admin only (`adminOnly` prop on `ProtectedRoute`)
  - `/usuario/*` — authenticated users
- **Auth**: `AuthContext` (`frontend/src/context/AuthContext.jsx`) stores user state, handles login/logout/token expiry (12-hour inactivity timeout). Token stored in `localStorage`.
- **HTTP client**: `frontend/src/API/axios.js` — Axios instance with `VITE_API_URL` as base, auto-attaches JWT from localStorage, redirects to `/login` on 401/403.
- **API modules**: `frontend/src/API/*.js` — one file per resource (pedidos, productos, caja, arqueo, etc.)
- **UI**: Material UI (MUI v7) + Emotion, Recharts for statistics, `@react-pdf/renderer` for PDF generation

### User Roles
- `admin` — full access including `/menu` routes (products management, statistics, user logs, arqueos)
- `user` — limited access via `/usuario` routes (active orders, caja summary, logs)

### Database
Schema is in `bd.sql` at the project root.
