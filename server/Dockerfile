# ---------- Stage 1: install deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: production runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S nodejs && adduser -S hireready -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=hireready:nodejs . .

USER hireready

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]