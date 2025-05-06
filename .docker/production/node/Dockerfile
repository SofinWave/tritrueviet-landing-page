FROM node:22.15.0 as base
LABEL maintainer="KingNNT"
WORKDIR /app
COPY package*.json .
COPY yarn.lock .
RUN yarn install
COPY . .

FROM base AS builder
WORKDIR /app
RUN yarn build

FROM node:22.15.0-alpine AS production
LABEL maintainer="KingNNT"
ARG APP_PORT=3000
WORKDIR /app
COPY package*.json .
COPY yarn.lock .
RUN yarn install --prod
COPY --from=builder /app/ /app/
EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
