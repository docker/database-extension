#syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder

WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

# install
COPY ui /ui
RUN npm run build

FROM alpine AS dl
WORKDIR /tmp
RUN apk add --no-cache curl tar unzip
ARG TARGETARCH
ARG USQL_VERSION=0.13.4
ARG USQL_RELEASE_URL="https://github.com/xo/usql/releases/download/v${USQL_VERSION}/usql-${USQL_VERSION}"
RUN <<EOT ash
    mkdir -p /out/darwin
    curl -fSsLo /out/darwin/usql.tar.bz2 "${USQL_RELEASE_URL}-darwin-${TARGETARCH}.tar.bz2"
    tar -xf /out/darwin/usql.tar.bz2 -C /out/darwin
    chmod a+x /out/darwin/usql
EOT
RUN <<EOT ash
    if [ "amd64" = "$TARGETARCH" ]; then
        mkdir -p /out/linux
        curl -fSsLo /out/linux/usql.tar.bz2 "${USQL_RELEASE_URL}-linux-${TARGETARCH}.tar.bz2"
        tar -xf /out/linux/usql.tar.bz2 -C /out/linux
        chmod a+x /out/linux/usql
    fi
EOT
RUN <<EOT ash
    if [ "amd64" = "$TARGETARCH" ]; then
        mkdir -p /out/windows
        curl -fSsLo /out/windows/usql.zip "${USQL_RELEASE_URL}-windows-${TARGETARCH}.zip"
        unzip /out/windows/usql.zip -d /out/windows
        chmod a+x /out/windows/usql.exe
    fi
EOT


FROM alpine
LABEL org.opencontainers.image.title="Databases" \
    org.opencontainers.image.description="One-click connect to your existing MySQL, Postgres, etc. or create a new Database and view or edit its content." \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version="0.3.2" \
    com.docker.extension.screenshots="[ \
        {\"alt\": \"Home page - list of databases\", \"url\": \"https://raw.githubusercontent.com/docker/database-extension/main/docs/images/1.png\"}, \
        {\"alt\": \"Add a new database\", \"url\": \"https://raw.githubusercontent.com/docker/database-extension/main/docs/images/2.png\"}, \
        {\"alt\": \"See your database data\", \"url\": \"https://raw.githubusercontent.com/docker/database-extension/main/docs/images/3.png\"}, \
        {\"alt\": \"Modify your data\", \"url\": \"https://raw.githubusercontent.com/docker/database-extension/main/docs/images/4.png\"}, \
        {\"alt\": \"Query your database\", \"url\": \"https://raw.githubusercontent.com/docker/database-extension/main/docs/images/5.png\"}, \
    ]" \
    com.docker.extension.detailed-description="<p>The Databases Extension allows you to interact with any type of database you have currently running in a container. You can see its tables, query some data and modify it from the UI. It also allows you to create new databases.</p> \
    <h2 id="-features">✨ See your existing databases</h2> \
    <ul> \
    <li>Easily connect to your existing databases or see if there are any connection issues.</li> \
    <li>See all tables within your database.</li> \
    <li>Query your database.</li> \
    <li>Modify some data without leaving Docker Desktop!</li> \
    </ul> \
    <h2 id="-features2">✨ Create new databases</h2> \
    <ul> \
    <li>You can create new databases directly from Docker Desktop.</li> \
    <li>Choose from a list of predefined databases.</li></ul> \
    <li>Select the desired ports and connection string.</li> \
    <li>Enjoy!</li> \
    </ul> \
    "\
    com.docker.extension.publisher-url="https://www.docker.com/" \
    com.docker.extension.additional-urls="[ \
        {\"title\":\"Support\", \"url\":\"https://github.com/docker/database-extension/issues\"} \
    ]" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/docker/database-extension/main/icon.svg" \
    com.docker.extension.changelog=""

COPY metadata.json .
COPY icon.svg .
COPY --from=client-builder /ui/build ui
COPY --from=dl /out /host
