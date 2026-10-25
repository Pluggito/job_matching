# Staff Guru Real-Time Socket Microservice (`@staffguru/socket`)

A high-performance standalone WebSocket / Socket.io server providing low-latency communication, typing indicators, read receipts, and live anti-circumvention protection for errand execution and coordination.

## Features
- **Stateless & Scalable**: Runs independently from the Next.js web application.
- **Bi-Directional Messaging**: Instant delivery of coordination chat messages between employers and runners.
- **Anti-Circumvention Protection**: Automatically redacts sensitive contact info (phone numbers, 10-digit NUBAN account numbers, social handles, emails) using `@repo/shared` before persisting to database or broadcasting.
- **Live State Awareness**: Emits real-time typing indicators (`chat:typing_update`) and double-checkmark read receipts (`chat:read_receipt`).
- **Resilient Fallback**: The client hook (`useErrandChat`) automatically falls back to Next.js server actions if the socket service is offline or unreachable.
- **Admin Supervision Stream**: Admin dashboard can observe flagged messages and active task threads over the `admin:stream` channel.
- **Health Check Endpoint**: `GET /health` returns JSON uptime and connection metrics for container orchestrator liveness probes.

---

## Local Development

```bash
# 1. Install monorepo dependencies (from repo root)
pnpm install

# 2. Build shared packages
pnpm --filter @repo/shared build
pnpm --filter @repo/db build

# 3. Start the socket server in watch mode
cd apps/socket
pnpm dev
# Default port: 4000 (configurable via PORT env)
```

In `apps/web/.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## Production Deployment

### Option 1: Docker Container (Render / Railway / Fly.io / AWS ECS)
A production multi-stage Dockerfile is provided at `apps/socket/Dockerfile`.

Build & run container:
```bash
docker build -f apps/socket/Dockerfile -t staffguru-socket .
docker run -p 4000:4000 \
  -e PORT=4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-jwt-secret" \
  -e ALLOWED_ORIGIN="https://staffguru.ng" \
  staffguru-socket
```

### Option 2: Platform as a Service (Railway / Render)
1. Set Root Directory to repository root or `apps/socket`.
2. Build Command: `pnpm --filter @repo/shared build && pnpm --filter @repo/db build && pnpm --filter @staffguru/socket build`
3. Start Command: `pnpm --filter @staffguru/socket start`
4. Expose Port `4000` (or platform default `$PORT`).
5. Set Environment Variables:
   - `PORT`: platform port (e.g., `4000`)
   - `DATABASE_URL`: Connection string to PostgreSQL
   - `JWT_SECRET`: Secret used to verify authentication tokens
   - `ALLOWED_ORIGIN`: `https://staffguru.ng` (or `*` for permissive CORS)
