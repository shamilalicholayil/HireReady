# HireReady

AI-powered employability and interview preparation platform. Full-stack capstone project.

## Stack

- **Backend:** Node.js, Express, MongoDB, Redis, Socket.io
- **Frontend:** React, Vite, Redux Toolkit, Tailwind CSS
- **AI:** Claude API (question generation, scoring, feedback)
- **Real-time:** Socket.io (messaging, WebRTC signaling)
- **Notifications:** gRPC microservice (in progress)

## Project Structure

```
hireready/
├── client/          # React + Vite frontend
├── server/          # Express API + Socket.io
└── grpc-service/     # Notification microservice (gRPC)
```

## Core Features

- JWT auth (access + refresh tokens) with Google OAuth
- Profile management, resume parsing, skill extraction
- HR verification flow with admin approval
- Job board — posting, applications, shortlisting, auto-scheduling
- Friend system + real-time messaging (Socket.io)
- WebRTC video interviews
- AI-powered mock interviews (Claude API) with voice-to-text answers
- Session scoring, feedback, and follow-up questions

## Setup

```bash
# Server
cd server
npm install
cp .env.example .env   # fill in your own values
npm run dev

# Client
cd client
npm install
npm run dev
```

## Known Limitations

- PM2 running in fork mode (not cluster) for this deploy — Socket.io in-memory
  online-user tracking doesn't support multi-process state without a Redis
  adapter. Documented tradeoff, not an oversight.
- Voice-to-text (Web Speech API) is unsupported in Firefox and unreliable in
  Opera GX due to built-in network blocking; verified working in Chrome/Edge.
- gRPC Notification Service integration in progress.

## Status

Active development — capstone project, Week 13-16.
