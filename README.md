# EcoTrack - Projeto scaffold gerado

Este repositório contém um scaffold inicial para o projeto EcoTrack — frontend (React + Vite) e backend (Node + Express + Prisma + SQLite).

## Como usar

### Backend
1. Vá para `backend/`
2. Copie `.env.example` para `.env` e ajuste `JWT_SECRET` se quiser.
3. `npm install`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`

### Frontend
1. Vá para `frontend/`
2. `npm install`
3. `npm run dev`
