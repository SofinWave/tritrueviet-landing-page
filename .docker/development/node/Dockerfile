FROM node:22.15.0

LABEL maintainer="KingNNT"

ARG UID_HOST_USER
ARG GID_HOST_USER
ARG NAME_CONTAINER_GROUP=group_container
ARG NAME_CONTAINER_USER=user_container

RUN apt update

RUN userdel -r node
RUN addgroup --system --gid ${GID_HOST_USER} ${NAME_CONTAINER_GROUP}
RUN adduser --system -uid ${UID_HOST_USER} --home /home/${NAME_CONTAINER_USER} --disabled-password ${NAME_CONTAINER_USER}
RUN adduser ${NAME_CONTAINER_USER} ${NAME_CONTAINER_GROUP}
RUN usermod --gid sudo ${NAME_CONTAINER_USER}

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

ENV PNPM_HOME=/home/${NAME_CONTAINER_USER}/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

USER ${NAME_CONTAINER_USER}

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

EXPOSE 3000
