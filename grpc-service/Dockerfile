# ---------- Stage 1: install deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: production runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S grpcuser && adduser -S notification -G grpcuser

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=notification:grpcuser . .

USER notification

EXPOSE 50051

# No HTTP endpoint to curl — check the port is actually accepting TCP
# connections instead. Not a full gRPC health-check protocol implementation,
# but sufficient to catch "process crashed" / "never bound" failures.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('net').connect(50051, '127.0.0.1').on('connect', function(){process.exit(0)}).on('error', function(){process.exit(1)})"

CMD ["node", "server.js"]