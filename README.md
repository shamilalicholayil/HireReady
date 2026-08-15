# HireReady

AI-powered interview preparation and hiring platform — mock interviews with adaptive AI questioning, real-time WebRTC video, a full job board, and live leaderboards. Built as a production-deployed full-stack capstone, not a tutorial project.

**Live:** [hireready.space](https://hireready.space)

## Tech Stack

**Frontend:** React (Vite), Redux Toolkit, Tailwind CSS
**Backend:** Node.js, Express, MongoDB, Redis
**Real-time:** Socket.IO (messaging, presence, WebRTC signaling), WebRTC (video interviews)
**AI:** Gemini API via an MCP server exposing candidate-profile and past-performance tools — the AI interviewer has actual context on the candidate, not just a generic prompt
**Microservices:** gRPC notification service
**Infra:** Docker (multi-stage builds), GitHub Actions CI/CD → GHCR → AWS EC2, Nginx (SSL termination)

## Project Structure

```
hireready/
├── client/          # React + Vite frontend
├── server/          # Express API + Socket.IO
└── grpc-service/    # gRPC notification microservice
```

## Core Features

- **JWT auth** (access token in memory, refresh token in HTTP-only cookie) with Google OAuth
- **AI mock interviews** — Gemini API + MCP tools for candidate-aware question generation, bank-first strategy with adaptive follow-ups, automated scoring and feedback
- **WebRTC video interviews** — host-gated waiting room, Perfect Negotiation pattern for glare-free reconnection, screen sharing
- **Real-time messaging** — Socket.IO with multi-device presence (`Map<userId, Set<socketId>>`), friend-request state machine (send/accept/reject/cancel)
- **Job board** — HR posting, candidate applications, shortlisting, automated per-candidate interview slot scheduling
- **Leaderboard** — denormalized scoring model, MongoDB transactions on session finish, paginated rankings with a sticky "my rank" card
- **HR & Admin modules** — HR verification queue with approval flow, job oversight, user management
- **gRPC notification microservice** — decoupled from the main API, own service boundary
- **Track/stack-aware question filtering** — interview questions filtered by track and tech stack, with mastery-score thresholds to avoid repeat questions
- **Server-side pagination and filtering** across core list endpoints

## Infrastructure

Multi-stage Docker builds (Vite build + Nginx for frontend; non-root user for backend), deployed via a GitHub Actions pipeline that builds images to GHCR and deploys to EC2 over SSH on merge to `main`. MongoDB and Redis run natively on the host, reachable from containers via `host.docker.internal`. Host Nginx handles SSL termination and reverse-proxies into the Docker network.

## Setup

```bash
git clone https://github.com/shamilalicholayil/HireReady.git
cd HireReady
cp .env.example .env   # fill in your own values
docker compose up --build
```

That's it — client, server, and their dependencies all come up together. No separate `npm install` steps required.

<details>
<summary>Running without Docker (local dev)</summary>

```bash
# Server
cd server
npm install
cp .env.example .env
npm run dev

# Client
cd client
npm install
npm run dev
```

Note: MongoDB and Redis run natively on the host in the deployed setup — see Infrastructure below.

</details>

## Notes

Voice-to-text (Web Speech API) is unsupported in Firefox and unreliable in Opera GX due to built-in network blocking; verified working in Chrome and Edge.
