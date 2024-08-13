ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    nodejs \
    npm

RUN mkdir /app
WORKDIR /app

COPY ["package.json", "/app/"]
COPY ["package-lock.json", "/app/"]
RUN npm ci --omit=dev --no-fund --legacy-peer-deps

COPY ["src", "/app/src"]

COPY run.sh /app/
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]

#  Labels 

ARG BUILD_DESCRIPTION="Home Assistant Add On Version of BigThunderSR/onstar2mqtt for Vehicle 1"
ARG BUILD_NAME="OnStar2MQTT Home Assistant Add-on (BigThunderSR) for Vehicle 1"
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