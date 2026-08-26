FROM node:24-alpine AS base
# Prisma's query engine needs libssl3 present (and detectable) at runtime on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY src/prisma ./src/prisma
RUN npm ci

FROM deps AS builder
# Next.js inlines NEXT_PUBLIC_* vars into the compiled output at build time, so it
# must be supplied as a build arg here rather than as a runtime environment variable.
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY . .
RUN npm run build

# Web target: Next.js standalone server
FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
# Docker sets HOSTNAME to the container ID; Next's standalone server.js binds to
# process.env.HOSTNAME instead of all interfaces when it's set, which breaks
# both the healthcheck below and Traefik's routing to this container.
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# The standalone output only bundles node_modules actually imported at runtime,
# which excludes the prisma CLI; copy the full node_modules so `prisma migrate
# deploy` below can run without a separate migration step in CI.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/prisma ./src/prisma
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && node server.js"]

# Worker target: BullMQ expiry-sweep worker (persistent process, not compatible with serverless)
FROM deps AS worker
ENV NODE_ENV=production
COPY . .
# Prisma's migrate deploy takes an advisory lock, so it's safe for both the web
# and worker containers to run it on boot even if they start concurrently.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/prisma/schema.prisma && npx tsx src/worker.ts"]
