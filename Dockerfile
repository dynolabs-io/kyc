# kyc-service — tsup bundles all deps into a self-contained dist/index.js.
# Mirrors the pattern used by ping-cash services (Node 20 + alpine for slim image).
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs kyc

USER kyc

COPY --from=builder --chown=kyc:nodejs /app/dist ./dist
COPY --from=builder --chown=kyc:nodejs /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3010
EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/healthz || exit 1

CMD ["node", "dist/index.js"]
