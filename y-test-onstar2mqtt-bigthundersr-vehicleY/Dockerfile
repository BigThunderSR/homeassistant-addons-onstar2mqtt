ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install Node.js 22.x from NodeSource (replaces Debian's Node.js 18.x)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Previous Node.js installation from Debian repos (Node 18.x)
# RUN apt-get update \
#     && apt-get install -y --no-install-recommends \
#     nodejs \
#     npm \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app

COPY ["package.json", "/app/"]
COPY ["package-lock.json", "/app/"]
RUN npm ci --omit=dev --no-fund --legacy-peer-deps
RUN npx patchright install chromium --with-deps

COPY ["overrides/index.cjs", "/app/node_modules/onstarjs/dist/"]
COPY ["overrides/index.mjs", "/app/node_modules/onstarjs/dist/"]

COPY ["src", "/app/src"]

COPY run.sh /app/
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]

#  Labels 

ARG BUILD_DESCRIPTION="Y Test Home Assistant Add On Version of BigThunderSR/onstar2mqtt for Vehicle 2"
ARG BUILD_NAME="Y Test OnStar2MQTT Home Assistant Add-on (BigThunderSR) for Vehicle 2"
ARG BUILD_REPOSITORY="BigThunderSR/homeassistant-addons-onstar2mqtt"

LABEL \
    maintainer="BigThunderSR (https://github.com/BigThunderSR)" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.vendor="Home Assistant OnStar2MQTT Add-ons by BigThunderSR" \
    org.opencontainers.image.authors="BigThunderSR (https://github.com/BigThunderSR)" \    
    org.opencontainers.image.url="https://github.com/BigThunderSR" \
    org.opencontainers.image.source="https://github.com/${BUILD_REPOSITORY}" \
    org.opencontainers.image.documentation="https://github.com/${BUILD_REPOSITORY}/blob/main/README.md"