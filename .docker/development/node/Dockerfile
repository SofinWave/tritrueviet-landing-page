FROM node:22.15.0

LABEL maintainer="KingNNT"

ARG UID_HOST_USER
ARG GID_HOST_USER
ARG NAME_CONTAINER_GROUP=group_container
ARG NAME_CONTAINER_USER=user_container

RUN apt update

RUN userdel -r node
RUN echo UID_HOST_USER = ${UID_HOST_USER} - GID_HOST_USER = ${GID_HOST_USER}
RUN addgroup --system --gid ${GID_HOST_USER} ${NAME_CONTAINER_GROUP}
RUN adduser --system -uid ${UID_HOST_USER} --home /home/${NAME_CONTAINER_USER} --disabled-password ${NAME_CONTAINER_USER}
RUN adduser ${NAME_CONTAINER_USER} ${NAME_CONTAINER_GROUP}
RUN usermod --gid sudo ${NAME_CONTAINER_USER}

ENV NPM_CONFIG_PREFIX=/home/${NAME_CONTAINER_USER}/.npm-global
ENV PATH=$PATH:/home/${NAME_CONTAINER_USER}/.npm-global/bin

USER ${NAME_CONTAINER_USER}

WORKDIR /app

ADD package.json .
ADD yarn.lock .

RUN yarn install

EXPOSE 3000
