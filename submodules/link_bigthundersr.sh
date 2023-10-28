#!/bin/sh

echo "Vehicle 1"

cd ../onstar2mqtt-bigthundersr-vehicle1/

ln -f ../submodules/bigthundersr/onstar2mqtt/package.json package.json
ln -f ../submodules/bigthundersr/onstar2mqtt/package-lock.json package-lock.json

ln -f ../submodules/bigthundersr/onstar2mqtt/src/commands.js ./src/commands.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/diagnostic.js ./src/diagnostic.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/index.js ./src/index.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/logger.js ./src/logger.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/measurement.js ./src/measurement.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/mqtt.js ./src/mqtt.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/vehicle.js ./src/vehicle.js

ln -f ../submodules/bigthundersr/onstar2mqtt/HA-MQTT.md ./DOCS.md
ln -sf ../submodules/bigthundersr/onstar2mqtt/images/lovelace.png ./images/lovelace.png

echo "Vehicle 2"

cd ../onstar2mqtt-bigthundersr-vehicle2/

ln -f ../submodules/bigthundersr/onstar2mqtt/package.json package.json
ln -f ../submodules/bigthundersr/onstar2mqtt/package-lock.json package-lock.json

ln -f ../submodules/bigthundersr/onstar2mqtt/src/commands.js ./src/commands.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/diagnostic.js ./src/diagnostic.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/index.js ./src/index.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/logger.js ./src/logger.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/measurement.js ./src/measurement.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/mqtt.js ./src/mqtt.js
ln -f ../submodules/bigthundersr/onstar2mqtt/src/vehicle.js ./src/vehicle.js

ln -f ../submodules/bigthundersr/onstar2mqtt/HA-MQTT.md ./DOCS.md
ln -sf ../submodules/bigthundersr/onstar2mqtt/images/lovelace.png ./images/lovelace.png

echo "Done!"
