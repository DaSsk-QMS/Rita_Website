# RITA System Assurance Website

Monorepo with the website frontend and the backend API.

```
Frontend/   React 19 + Vite + Tailwind CSS (public site + admin panel)
Server/     Node.js + Express + MongoDB (REST API)
```

## Requirements
- Node.js 18.18+
- MongoDB (local or Atlas). Or use the in-memory DB for quick testing.

## Setup

### Backend
```bash
cd Server
cp .env.example .env      # edit MONGO_URI, JWT_SECRET, admin credentials, SMTP
npm install
npm run dev               # or: npm run dev:memory  (in-memory DB, no MongoDB needed)
```
API runs on http://localhost:5000 (health check: `/api/health`).
The first admin user and default content are created automatically on an empty database.

### Frontend
```bash
cd Frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
npm run build             # production build in Frontend/dist
```

## Notes
- `.env` files are not committed. Use the `.env.example` files as templates.
- Change the default admin password after first login.
