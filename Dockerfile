FROM node:24-alpine AS base
# Prisma's query engine needs libssl3 present (and detectable) at runtime on Alpine.
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY src/prisma ./src/prisma
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

# Web target: Next.js standalone server
FROM base AS web
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]

# Worker target: BullMQ expiry-sweep worker (persistent process, not compatible with serverless)
FROM deps AS worker
ENV NODE_ENV=production
COPY . .
CMD ["npx", "tsx", "src/worker.ts"]
