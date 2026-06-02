# Courtio — Setup Guide

**Stack:** Next.js 14 · NestJS · MongoDB · Clerk (auth)

---

## Table of Contents

1. [Clerk Configuration (required for both environments)](#1-clerk-configuration)
2. [Local Development — Manual](#2-local-development--manual)
3. [Local Development — Docker Compose](#3-local-development--docker-compose)
4. [Cloud Deployment](#4-cloud-deployment)

---

## 1. Clerk Configuration

Clerk is the auth provider for the entire app. Both the frontend and backend use separate Clerk keys but they must come from the **same Clerk application**.

### 1.1 Create a Clerk application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in.
2. Click **"Create application"**.
3. Name it (e.g. `courtio`) and choose your sign-in methods (Email, Google, etc.).
4. Click **Create**.

### 1.2 Collect your keys

From the Clerk dashboard → **API Keys** page, copy:

| Key | Where you'll use it |
|-----|---------------------|
| **Publishable Key** (`pk_test_…`) | Frontend `.env` |
| **Secret Key** (`sk_test_…`) | Frontend `.env` + Backend `.env` |

> For production, use `pk_live_…` / `sk_live_…` keys (Clerk "Production" instance).

### 1.3 Configure redirect URLs (important)

In Clerk dashboard → **Paths** (or **Customization → Paths**):

| Setting | Value |
|---------|-------|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in | `/discover` |
| After sign-up | `/discover` |

For production, also add your domain to **Clerk → Domains** and create a separate **Production instance** with `pk_live_` / `sk_live_` keys.

---

## 2. Local Development — Manual

### Prerequisites

- Node.js 20+
- MongoDB running locally (port `27017`) **or** use the Docker step below just for Mongo

### 2.1 Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/courtio
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
FRONTEND_URL=http://localhost:3000
```

Install and start:

```bash
npm install
npm run start:dev
```

The backend runs on **http://localhost:3001**.

### 2.2 Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/discover
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/discover
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Install and start:

```bash
npm install
npm run dev
```

The frontend runs on **http://localhost:3000**.

### 2.3 How auth works locally

1. User signs in through Clerk's hosted UI at `/sign-in`.
2. Clerk issues a JWT session token to the browser.
3. The frontend's `ApiAuthProvider` (via `useApiAuth` hook) attaches the token as `Authorization: Bearer <token>` on every API call.
4. The backend's `ClerkAuthGuard` verifies the token against Clerk's servers using `CLERK_SECRET_KEY`.
5. On first login, the guard auto-creates a user record in MongoDB from the Clerk profile.

---

## 3. Local Development — Docker Compose

This spins up all three services (Mongo, backend, frontend) in containers.

### 3.1 Create a root `.env` file

Create `.env` in the project root (next to `docker-compose.yml`):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
FRONTEND_URL=http://localhost:3000
```

> The `docker-compose.yml` reads these variables and injects them into the right containers. The `NEXT_PUBLIC_API_URL` is hardcoded to `http://backend:3001/api` (internal Docker network) in the compose file — no need to set it.

### 3.2 Build and start

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| MongoDB | localhost:27017 |

### 3.3 Stop and clean up

```bash
# Stop containers
docker compose down

# Stop + remove the mongo volume (resets the database)
docker compose down -v
```

### 3.4 Rebuild a single service after code changes

```bash
docker compose up --build backend
docker compose up --build frontend
```

---

## 4. Cloud Deployment

The recommended approach is to containerize and deploy on any cloud that supports Docker (Railway, Render, Fly.io, AWS ECS, GCP Cloud Run, etc.). The steps below are provider-agnostic.

### 4.1 Create a Clerk Production instance

1. In Clerk dashboard, click **"Create instance"** and choose **Production**.
2. Copy the **Live Publishable Key** (`pk_live_…`) and **Live Secret Key** (`sk_live_…`).
3. Under **Domains**, add your production frontend domain (e.g. `app.courtio.com`).
4. The production Clerk instance automatically enables email verification, rate limiting, and fraud protection.

### 4.2 Set environment variables on your cloud provider

**Backend service:**

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `MONGODB_URI` | Your cloud MongoDB connection string (e.g. MongoDB Atlas) |
| `CLERK_SECRET_KEY` | `sk_live_…` |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
| `FRONTEND_URL` | `https://app.courtio.com` |

**Frontend service:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
| `CLERK_SECRET_KEY` | `sk_live_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/discover` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/discover` |
| `NEXT_PUBLIC_API_URL` | `https://api.courtio.com/api` |

> `NEXT_PUBLIC_*` variables are embedded at **build time** by Next.js. They must be set before `npm run build` or the Docker image build.

### 4.3 MongoDB Atlas (recommended cloud database)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com), create a free cluster.
2. Under **Database Access**, create a database user with a strong password.
3. Under **Network Access**, allow connections from your backend service's IP (or `0.0.0.0/0` for managed cloud with egress NAT).
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/courtio?retryWrites=true&w=majority`

### 4.4 Build and push Docker images

```bash
# From project root
docker build -t courtio-backend:latest ./backend
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... \
  --build-arg NEXT_PUBLIC_API_URL=https://api.courtio.com/api \
  -t courtio-frontend:latest ./frontend
```

Push to your container registry:

```bash
docker tag courtio-backend:latest registry.example.com/courtio-backend:latest
docker push registry.example.com/courtio-backend:latest

docker tag courtio-frontend:latest registry.example.com/courtio-frontend:latest
docker push registry.example.com/courtio-frontend:latest
```

### 4.5 CORS / allowed origins

The backend reads `FRONTEND_URL` and should use it to configure CORS. Verify that your backend's CORS config allows the production frontend domain. If you add CORS in `main.ts`, it should look like:

```ts
app.enableCors({ origin: process.env.FRONTEND_URL });
```

### 4.6 Clerk production checklist

- [ ] Using `pk_live_` and `sk_live_` keys (not `pk_test_`)
- [ ] Production domain added to Clerk → **Domains**
- [ ] Email templates customized in Clerk → **Email & SMS**
- [ ] Social OAuth redirect URLs updated to production domain in Clerk → **Social Connections** → each provider's settings
- [ ] `FRONTEND_URL` in backend env matches your production domain exactly (no trailing slash)

---

## Environment Variables Reference

### `frontend/.env.local` (local) or cloud env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (embedded in browser bundle) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server-side only, never exposed to browser) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Yes | Path for Clerk sign-in page |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Yes | Path for Clerk sign-up page |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Yes | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Yes | Redirect after sign-up |
| `NEXT_PUBLIC_API_URL` | Yes | Full base URL of the backend API |

### `backend/.env` (local) or cloud env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Port the NestJS server listens on (default: `3001`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CLERK_SECRET_KEY` | Yes | Used by `ClerkAuthGuard` to verify JWTs |
| `CLERK_PUBLISHABLE_KEY` | No | Included for reference, not actively used by the guard |
| `FRONTEND_URL` | Yes | Used for CORS — must match the frontend's exact origin |
