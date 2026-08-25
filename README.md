# SecureShare

SecureShare is a web app for sharing secrets - text messages and files - through self-destructing, single-view links, plus ephemeral end-to-end encrypted chat rooms for real-time conversations.

The core idea is zero-knowledge sharing: encryption happens entirely in the browser using the Web Crypto API. The encryption key is generated client-side and is only ever placed in the URL fragment (`#...`), which browsers never send over the network. The server only ever stores ciphertext, so SecureShare itself cannot read the contents of a shared secret.

## Key Features

- **One-time secret links** - share a text message or a file (up to 10MB) behind a link that can only be viewed once before it self-destructs.
- **Client-side AES-GCM encryption** - messages and files are encrypted in the browser before they ever leave the device; the decryption key travels in the URL fragment, never in a request body or query string.
- **Auto-expiring secrets** - every secret is created with a TTL (1 day / 1 week / 1 month) and is swept for expiry by a scheduled job.
- **View notifications** - signed-in senders can be notified by email (with device, location, and IP info) the moment their secret is opened.
- **Ephemeral E2EE chat rooms** - spin up a temporary, end-to-end encrypted LiveKit room for real-time conversations instead of a static message.
- **Dashboard** - signed-in users can see the messages they've sent, their status (pending / seen / expired), and manage account settings.
- **Light/dark themes** and a responsive UI built on Radix + Tailwind.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 13](https://nextjs.org/) (Pages Router), [TypeScript](https://www.typescriptlang.org/) |
| UI | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) primitives, [lucide-react](https://lucide.dev/) |
| Forms & validation | [react-hook-form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Auth | [Clerk](https://clerk.com/) |
| Database & ORM | Self-hosted [PostgreSQL](https://www.postgresql.org/), [Prisma](https://www.prisma.io/) |
| File storage | Self-hosted [MinIO](https://min.io/) (S3-compatible) |
| Encryption | Web Crypto API (AES-GCM), implemented in `src/shared/encrypt-decrypt.ts` / `src/shared/keychain.ts` |
| Real-time chat | [LiveKit](https://livekit.io/) (`livekit-client`, `livekit-server-sdk`, E2EE) |
| Email | [Resend](https://resend.com/) with [react-email](https://react.email/) templates |
| Scheduled jobs | [Upstash QStash](https://upstash.com/docs/qstash) (signed webhook that expires secrets) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Tooling | ESLint, Prettier, Husky + lint-staged |

## Architecture Overview

- `src/pages/index.tsx` + `src/components/message-form.tsx` - encrypts a message/file client-side, uploads ciphertext to `/api/msg/new` (and encrypted file bytes to `/api/files/upload` / MinIO), then builds a share URL of the form `/messages/{publicId}#{secretKey}`.
- `src/pages/messages/[publicId].tsx` - fetches ciphertext by `publicId`, reads the key out of the URL fragment, decrypts in the browser, and reports a "message viewed" event.
- `src/pages/api/msg/*` - Next.js API routes for creating, fetching, and expiring messages, backed by Prisma models `Message`, `Event`, `IpAddressInfo`, and `User` (see `src/prisma/schema.prisma`).
- `src/pages/api/msg/destroy.ts` - a QStash-signed endpoint that marks expired messages and logs `message_expired` events; QStash calls this on a schedule.
- `src/pages/chats/[roomName].tsx` + `src/components/livekit-room.tsx` - creates a LiveKit room token via `/api/chat/livekit_token` and joins a room with E2EE enabled, using a key also carried in the URL fragment.
- `src/middleware.ts` - Clerk auth middleware; most routes are public, with signed-in state only required for the dashboard.

## Getting Started

### Prerequisites

- Node.js 20+ (repo is developed against Node v24, see `.nvmrc`)
- A Postgres instance
- A [MinIO](https://min.io/) instance (or any S3-compatible store) with a bucket set to public **read** access - the app fetches encrypted files directly from the browser with no auth
- A [Clerk](https://clerk.com/) application
- A [LiveKit](https://livekit.io/) project (Cloud or self-hosted) for the chat feature
- A [Resend](https://resend.com/) API key for view-notification emails
- An [Upstash QStash](https://upstash.com/) schedule pointed at `/api/msg/destroy` for secret expiry

### Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Postgres connection string used by Prisma at runtime (can be the same value as below if there's no separate connection pooler in front of it) |
| `POSTGRES_URL_NON_POOLING` | Direct Postgres connection string, used for migrations |
| `MINIO_ENDPOINT` | URL the app uses to reach MinIO (e.g. `http://minio:9000` on an internal network) |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET_NAME` | MinIO bucket used for encrypted file uploads (must be public-read) |
| `MINIO_PUBLIC_URL` | Publicly reachable base URL for MinIO, used to build download links returned to the browser (may differ from `MINIO_ENDPOINT` if MinIO sits behind a different public domain) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_LIVEKIT_URL` | WebSocket URL of your LiveKit server |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `RESEND_API_KEY` | Resend API key for sending "message opened" emails |
| `QSTASH_CURRENT_SIGNING_KEY` | Used to verify signed requests from QStash to `/api/msg/destroy` |
| `QSTASH_NEXT_SIGNING_KEY` | Secondary QStash signing key (used during key rotation) |

`NEXT_PUBLIC_*` variables are inlined at build time, so they must be set before running `npm run build`.

### Local Development

A `docker-compose.yml` is included to run a local Postgres + MinIO stack:

```bash
docker compose up -d
```

Then create and expose the bucket once (via the [`mc`](https://min.io/docs/minio/linux/reference/minio-mc.html) CLI, or the MinIO Console at `http://localhost:9001`):

```bash
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/secureshare
mc anonymous set download local/secureshare
```

### Install & Run

```bash
npm install
npx prisma migrate deploy   # apply the schema in src/prisma/schema.prisma
npm run dev                 # http://localhost:3005
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port 3005 |
| `npm run build` | Production build (runs `prisma generate` first via `postinstall`) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run email` | Preview `react-email` templates locally |

## Deployment

The project builds as a standard Next.js app and can be deployed anywhere Node.js is available, including [Vercel](https://vercel.com/) or a self-hosted [Dokploy](https://dokploy.com/) instance. See all required environment variables above - `NEXT_PUBLIC_*` values must be present at build time.
