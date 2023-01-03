FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/.yarnrc.yml /ui/.yarnrc.yml
COPY ui/.yarn /ui/.yarn
COPY ui/yarn.lock /ui/yarn.lock
RUN echo "cacheFolder: '/usr/src/app/.npm'" >> /ui/.yarnrc.yml
RUN --mount=type=cache,target=/usr/src/app/.npm \
    yarn install --immutable

# install
COPY ui /ui
RUN yarn build

FROM alpine
LABEL org.opencontainers.image.title="Databases" \
    org.opencontainers.image.description="Databases extension allows you to have a look at the content of all your databases running in a container." \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version="0.3.2" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
