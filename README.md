# NexusChat

Real-time collaboration & messaging platform (Slack/Discord-like).

## Stack
- Frontend: React + Vite + TypeScript + Tailwind + Socket.io client
- Backend: Node.js + Express + TypeScript + Socket.io
- Database: MongoDB + Mongoose
- Auth: JWT access + refresh (httpOnly cookies), bcrypt

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Server
```
cd server
cp .env.example .env
# edit .env (MONGO_URI, secrets)
npm install
npm run seed        # creates admin@nexuschat.app / Admin@123 and demo user
npm run dev
```

### Client
```
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

### Docker
```
docker-compose up --build
```

## Features
Auth (register/login/refresh/logout), 3-column chat, real-time messaging (Socket.io), typing indicators, presence, groups/channels, file uploads, read receipts, reactions, notifications, search, profile/settings, admin dashboard.

## API
See prompt spec. Base URL http://localhost:5000/api

## Deployment
- Frontend: Vercel
- Backend: Render/Railway
- DB: MongoDB Atlas
- Files: local /uploads (swap to Cloudinary/S3 for prod)
