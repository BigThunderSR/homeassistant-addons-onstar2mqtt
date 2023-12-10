#!/usr/bin/with-contenv bashio
set +u

export VEHICLE_NAME=$(bashio::config 'VEHICLE_NAME')
export ONSTAR_DEVICEID=$(bashio::config 'ONSTAR_DEVICEID')
export ONSTAR_VIN=$(bashio::config 'ONSTAR_VIN')
export ONSTAR_USERNAME=$(bashio::config 'ONSTAR_USERNAME')
export ONSTAR_PASSWORD=$(bashio::config 'ONSTAR_PASSWORD')
export ONSTAR_PIN=$(bashio::config 'ONSTAR_PIN')
export ONSTAR_URL=$(bashio::config 'ONSTAR_URL')
export ONSTAR_REFRESH=$(bashio::config 'ONSTAR_REFRESH')
export ONSTAR_POLL_INTERVAL=$(bashio::config 'ONSTAR_POLL_INTERVAL')
export ONSTAR_POLL_TIMEOUT=$(bashio::config 'ONSTAR_POLL_TIMEOUT')
export MQTT_HOST=$(bashio::config 'MQTT_HOST')
export MQTT_USERNAME=$(bashio::config 'MQTT_USERNAME')
export MQTT_PASSWORD=$(bashio::config 'MQTT_PASSWORD')
export MQTT_PORT=$(bashio::config 'MQTT_PORT')
export MQTT_PREFIX=$(bashio::config 'MQTT_PREFIX')
export MQTT_ONSTAR_POLLING_STATUS_TOPIC=$(bashio::config 'MQTT_ONSTAR_POLLING_STATUS_TOPIC')
#export MQTT_TLS=$(bashio::config 'MQTT_TLS')

bashio::log.info "Starting OnStar2MQTT for $VEHICLE_NAME..."
npm run start
