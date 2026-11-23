# RITA System Assurance Website

Monorepo with the website frontend and the backend API.

```
Frontend/   React 19 + Vite + Tailwind CSS (public site + admin panel)
Server/     Node.js + Express + MySQL/MariaDB (REST API)
```

## Requirements
- Node.js 18.18+
- MySQL 5.7+ / MariaDB 10.3+ (e.g. a Hostinger database). Tables are created automatically.
  Or use the in-memory DB for quick testing (`npm run dev:memory`).

## Setup

### Backend
```bash
cd Server
cp .env.example .env      # edit DB_HOST/DB_NAME/DB_USER/DB_PASSWORD, JWT_SECRET, admin credentials, SMTP
npm install
npm run dev               # or: npm run dev:memory  (in-memory DB, no MySQL needed)
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

## Production (Hostinger Node.js Web App / any Node host)
The repo root is a single Node.js app: Express serves the API and the built React site.
```bash
npm install        # also installs Server dependencies (postinstall)
npm run build      # builds Frontend/dist
npm start          # node Server/src/server.js
```
Environment variables: `NODE_ENV=production`, `JWT_SECRET` (32+ random chars), `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `CLIENT_URL=https://yourdomain.com`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, optional `UPLOAD_DIR` and SMTP.

## Notes
- `.env` files are not committed. Use the `.env.example` files as templates.
- Change the default admin password after first login.
