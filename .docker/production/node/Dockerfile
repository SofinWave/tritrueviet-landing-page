FROM node:22.15.0-alpine AS deps
LABEL maintainer="KingNNT"
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:22.15.0-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22.15.0-alpine AS production
LABEL maintainer="KingNNT"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]
