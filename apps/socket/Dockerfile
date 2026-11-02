FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN turbo prune @staffguru/socket --docker

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/out/full/ .
RUN pnpm --filter @staffguru/socket build

ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/socket/dist/index.js"]
