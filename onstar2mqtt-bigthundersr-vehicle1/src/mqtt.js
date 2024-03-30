const _ = require('lodash');
//const Buttons = require('./buttons');

/**
 * Supports Home Assistant MQTT Discovery (https://www.home-assistant.io/docs/mqtt/discovery/)
 *
 * Supplies sensor configuration data and initialize sensors in HA.
 *
 * Topic format: prefix/type/instance/name
 * Examples:
 * - homeassistant/sensor/VIN/TIRE_PRESSURE/state -- Diagnostic
 *      - payload: {
 *          TIRE_PRESSURE_LF: 244.0,
 *          TIRE_PRESSURE_LF_MESSAGE: "GREEN",
 *          TIRE_PRESSURE_LR: 240.0,
 *          TIRE_PRESSURE_LR_MESSAGE: "GREEN",
 *          TIRE_PRESSURE_PLACARD_FRONT: 262.0,
 *          TIRE_PRESSURE_PLACARD_FRONT_MESSAGE: "na",
 *          TIRE_PRESSURE_PLACARD_REAR: 262.0,
 *          TIRE_PRESSURE_PLACARD_REAR_MESSAGE: "na",
 *          TIRE_PRESSURE_RF: 240.0,
 *          TIRE_PRESSURE_RF_MESSAGE: "GREEN",
 *          TIRE_PRESSURE_RR: 236.0,
 *          TIRE_PRESSURE_LF_MESSAGE: "YELLOW"
 *      }
 * - homeassistant/sensor/VIN/TIRE_PRESSURE_LF/config -- Diagnostic Element
 *      - payload: {
 *          state_class: "measurement",         ## New starting at v1.7.0
 *          device_class: "pressure",
 *          name: "Tire Pressure: Left Front",
 *          state_topic: "homeassistant/sensor/VIN/TIRE_PRESSURE/state",
 *          unit_of_measurement: "kPa",
 *          value_template: "{{ value_json.TIRE_PRESSURE_LF }}",
 *          json_attributes_template: "{{ {'recommendation': value_json.TIRE_PRESSURE_PLACARD_FRONT, 'message': value_json.TIRE_PRESSURE_LF_MESSAGE} | tojson }}",
 *      }
 * - homeassistant/sensor/VIN/TIRE_PRESSURE_RR/config -- Diagnostic Element
 *      - payload: {
 *          state_class: "measurement",         ## New starting at v1.7.0
 *          device_class: "pressure",
 *          name: "Tire Pressure: Right Rear",
 *          state_topic: "homeassistant/sensor/VIN/TIRE_PRESSURE/state",
 *          unit_of_measurement: "kPa",
 *          value_template: "{{ value_json.TIRE_PRESSURE_RR }}",
 *          json_attributes_template: "{{ {'recommendation': value_json.TIRE_PRESSURE_PLACARD_REAR, 'message': value_json.TIRE_PRESSURE_RR_MESSAGE} | tojson }}"
 *      }
 */
class MQTT {
    static CONSTANTS = {
        BUTTONS: {
            Alert: 'alert',
            AlertFlash: 'alertFlash',
            AlertHonk: 'alertHonk',
            CancelAlert: 'cancelAlert',
            LockDoor: 'lockDoor',
            UnlockDoor: 'unlockDoor',
            LockTrunk: 'lockTrunk',
            UnlockTrunk: 'unlockTrunk',
            Start: 'start',
            CancelStart: 'cancelStart',
            GetLocation: 'getLocation',
            Diagnostics: 'diagnostics',
            EngineRPM: 'enginerpm',
            ChargeOverride: 'chargeOverride',
            CancelChargeOverride: 'cancelChargeOverride',
            GetChargingProfile: 'getChargingProfile',
            SetChargingProfile: 'setChargingProfile',
        }
    };

    constructor(vehicle, prefix = 'homeassistant', namePrefix) {
        this.prefix = prefix;
        this.vehicle = vehicle;
        this.instance = vehicle.vin;
        this.namePrefix = namePrefix
    }

    static convertName(name) {
        return _.toLower(_.replace(name, / /g, '_'));
    }

    static convertFriendlyName(name) {
        return _.startCase(_.lowerCase(name));
    }

    static determineSensorType(name) {
        switch (name) {
            case 'EV CHARGE STATE':
            case 'EV PLUG STATE':
            case 'PRIORITY CHARGE INDICATOR':
            case 'PRIORITY CHARGE STATUS':
                return 'binary_sensor';
            case 'getLocation':
                return 'device_tracker';
            default:
                return 'sensor';
        }
    }

    /**
     * @param {string} name
     * @returns {string}
     */
    addNamePrefix(name) {
        if (!this.namePrefix) return name
        return `${this.namePrefix} ${name}`
    }

    /**
     * @param {'sensor'|'binary_sensor'|'device_tracker'} type
     * @returns {string}
     */
    getBaseTopic(type = 'sensor') {
        return `${this.prefix}/${type}/${this.instance}`;
    }

    getAvailabilityTopic() {
        return `${this.prefix}/${this.instance}/available`;
    }

    getCommandTopic() {
        return `${this.prefix}/${this.instance}/command`;
    }

    getPollingStatusTopic() {
        return `${this.prefix}/${this.instance}/polling_status`;
    }

    getRefreshIntervalTopic() {
        return `${this.prefix}/${this.instance}/refresh_interval`;
    }

    getRefreshIntervalCurrentValTopic() {
        return `${this.prefix}/${this.instance}/refresh_interval_current_val`;
    }

    getDeviceTrackerConfigTopic() {
        return `${this.prefix}/device_tracker/${this.instance}/config`;
    }

    //    getCommandStatusSensorConfigTopic() {
    //        return `${this.prefix}/sensor/${this.instance}`;
    //    }

    createCommandStatusSensorConfigPayload(command) {
        let topic = `${this.prefix}/sensor/${this.instance}/${command}_status_monitor/config`;
        let commandStatusTopic = `${this.prefix}/${this.instance}/command/${command}/state`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_" + (MQTT.convertName(command)) + "_command_status_monitor",
            "name": 'Command ' + command + ' Status Monitor',
            "state_topic": commandStatusTopic,
            "value_template": "{{ value_json.command.error.message }}",
            "icon": "mdi:message-alert",
        };
        return { topic, payload };
    }

    createCommandStatusSensorTimestampConfigPayload(command) {
        let topic = `${this.prefix}/sensor/${this.instance}/${command}_status_timestamp/config`;
        let commandStatusTopic = `${this.prefix}/${this.instance}/command/${command}/state`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_" + (MQTT.convertName(command)) + "_command_status_timestamp_monitor",
            "name": 'Command ' + command + ' Status Monitor Timestamp',
            "state_topic": commandStatusTopic,
            "value_template": "{{ value_json.completionTimestamp }}",
            "device_class": "timestamp",
            "icon": "mdi:calendar-clock",
        }

        return { topic, payload };
    }

    //getButtonConfigTopic() {
    //    return `${this.prefix}/button/${this.instance}/${this.buttonName}/config`;
    //}

    createButtonConfigPayload(vehicle) {
        const buttonInstances = [];
        const buttonConfigs = [];
        const configPayloads = [];

        for (const buttonName in MQTT.CONSTANTS.BUTTONS) {
            const buttonConfig = `${this.prefix}/button/${this.instance}/${MQTT.convertName(buttonName)}/config`;
            const button = {
                name: buttonName,
                config: buttonConfig
            };

            button.vehicle = vehicle;
            buttonInstances.push(button);

            let unique_id = `${vehicle.vin}_Command_${button.name}`;
            unique_id = unique_id.replace(/\s+/g, '-').toLowerCase();

            configPayloads.push({
                "device": {
                    "identifiers": [vehicle.vin],
                    "manufacturer": vehicle.make,
                    "model": vehicle.year + ' ' + vehicle.model,
                    "name": vehicle.toString(),
                    "suggested_area": vehicle.toString(),
                },
                "availability": {
                    "topic": this.getAvailabilityTopic(),
                    "payload_available": 'true',
                    "payload_not_available": 'false',
                },
                "unique_id": unique_id,
                "name": `Command ${button.name}`,
                "command_topic": this.getCommandTopic(),
                "payload_press": JSON.stringify({ "command": MQTT.CONSTANTS.BUTTONS[button.name] }),
                "qos": 2,
                "enabled_by_default": false,
            });

            buttonConfigs.push(buttonConfig);
        }

        return { buttonInstances, buttonConfigs, configPayloads };
    }

    createButtonConfigPayloadCSMG(vehicle) {
        const buttonInstances = [];
        const buttonConfigs = [];
        const configPayloads = [];

        for (const buttonName in MQTT.CONSTANTS.BUTTONS) {
            const buttonConfig = `${this.prefix}/button/${this.instance}/${MQTT.convertName(buttonName)}_monitor/config`;
            const button = {
                name: buttonName,
                config: buttonConfig
            };

            button.vehicle = vehicle;
            buttonInstances.push(button);

            let unique_id = `${vehicle.vin}_Command_${button.name}_Monitor`;
            unique_id = unique_id.replace(/\s+/g, '-').toLowerCase();

            configPayloads.push({
                "device": {
                    "identifiers": [vehicle.vin + "_Command_Status_Monitor"],
                    "manufacturer": vehicle.make,
                    "model": vehicle.year + ' ' + vehicle.model,
                    "name": vehicle.toString() + ' Command Status Monitor Sensors',
                    "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
                },
                "availability": {
                    "topic": this.getAvailabilityTopic(),
                    "payload_available": 'true',
                    "payload_not_available": 'false',
                },
                "unique_id": unique_id,
                "name": `Command ${button.name}`,
                "command_topic": this.getCommandTopic(),
                "payload_press": JSON.stringify({ "command": MQTT.CONSTANTS.BUTTONS[button.name] }),
                "qos": 2,
                "enabled_by_default": false,
            });

            buttonConfigs.push(buttonConfig);
        }

        return { buttonInstances, buttonConfigs, configPayloads };
    }

    createPollingStatusMessageSensorConfigPayload(pollingStatusTopicState) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_message/config`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_polling_status_message",
            "name": 'Polling Status Message',
            "state_topic": pollingStatusTopicState,
            "value_template": "{{ value_json.error.message }}",
            "icon": "mdi:message-alert",
        };
        return { topic, payload };
    }

    createPollingStatusCodeSensorConfigPayload(pollingStatusTopicState) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_code/config`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_polling_status_code",
            "name": 'Polling Status Code',
            "state_topic": pollingStatusTopicState,
            "value_template": "{{ value_json.error.response.status | int(0) }}",
            "icon": "mdi:sync-alert",
        };
        return { topic, payload };
    }

    createPollingStatusTimestampSensorConfigPayload(pollingStatusTopicState) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_timestamp/config`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_polling_status_timestamp",
            "name": 'Polling Status Timestamp',
            "state_topic": pollingStatusTopicState,
            "value_template": "{{ value_json.completionTimestamp }}",
            "device_class": "timestamp",
            "icon": "mdi:calendar-clock",
        };
        return { topic, payload };
    }

    createPollingRefreshIntervalSensorConfigPayload(refreshIntervalCurrentValTopic) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_refresh_interval/config`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_polling_refresh_interval",
            "name": 'Polling Refresh Interval',
            "state_topic": refreshIntervalCurrentValTopic,
            "value_template": "{{ value | int(0) }}",
            "icon": "mdi:timer-check-outline",
            "unit_of_measurement": "ms",
            "state_class": "measurement",
            "device_class": "duration",
        };
        return { topic, payload };
    }

    createPollingStatusTFSensorConfigPayload(pollingStatusTopicTF) {
        let topic = `${this.prefix}/binary_sensor/${this.instance}/polling_status_tf/config`;
        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": (MQTT.convertName(this.vehicle.vin)) + "_onstar_polling_status_successful",
            "name": 'Polling Status Successful',
            "state_topic": pollingStatusTopicTF,
            "payload_on": "false",
            "payload_off": "true",
            "device_class": "problem",
            "icon": "mdi:sync-alert",
        };
        return { topic, payload };
    }


    /**
     *
     * @param {DiagnosticElement} diag
     */
    getConfigTopic(diag) {
        let sensorType = MQTT.determineSensorType(diag.name);
        return `${this.getBaseTopic(sensorType)}/${MQTT.convertName(diag.name)}/config`;
    }

    /**
     *
     * @param {Diagnostic} diag
     */
    getStateTopic(diag) {
        let sensorType = MQTT.determineSensorType(diag.name);
        return `${this.getBaseTopic(sensorType)}/${MQTT.convertName(diag.name)}/state`;
    }

    /**
     *
     * @param {Diagnostic} diag
     * @param {DiagnosticElement} diagEl
     */
    getConfigPayload(diag, diagEl) {
        return this.getConfigMapping(diag, diagEl);
    }

    /**
     * Return the state payload for this diagnostic
     * @param {Diagnostic} diag
     */
    getStatePayload(diag) {
        const state = {};
        _.forEach(diag.diagnosticElements, e => {
            // massage the binary_sensor values
            let value;
            switch (e.name) {
                case 'EV PLUG STATE': // unplugged/plugged
                    value = e.value === 'plugged';
                    break;
                case 'EV CHARGE STATE': // not_charging/charging
                    value = e.value === 'charging';
                    break;
                case 'PRIORITY CHARGE INDICATOR': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'PRIORITY CHARGE STATUS': // NOT_ACTIVE/ACTIVE
                    value = e.value === 'ACTIVE';
                    break;
                default:
                    // coerce to number if possible, API uses strings :eyeroll:
                    // eslint-disable-next-line no-case-declarations
                    const num = _.toNumber(e.value);
                    value = _.isNaN(num) ? e.value : num;
                    break;
            }
            state[MQTT.convertName(e.name)] = value;
            state[`${MQTT.convertName(e.name)}_message`] = e.message;
        });
        return state;
    }

    mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        name = this.addNamePrefix(name);
        // Generate the unique id from the vin and name
        let unique_id = `${this.vehicle.vin}-${diagEl.name}`
        unique_id = unique_id.replace(/\s+/g, '-').toLowerCase();
        return {
            state_class,
            device_class,
            name,
            device: {
                identifiers: [this.vehicle.vin],
                manufacturer: this.vehicle.make,
                model: this.vehicle.year + ' ' + this.vehicle.model,
                name: this.vehicle.toString(),
                suggested_area: this.vehicle.toString() + ' Sensors',
            },
            availability_topic: this.getAvailabilityTopic(),
            payload_available: 'true',
            payload_not_available: 'false',
            state_topic: this.getStateTopic(diag),
            value_template: `{{ value_json.${MQTT.convertName(diagEl.name)} }}`,
            json_attributes_topic: _.isUndefined(attr) ? undefined : this.getStateTopic(diag),
            json_attributes_template: attr,
            unique_id: unique_id,
        };
    }

    mapSensorConfigPayload(diag, diagEl, state_class, device_class, name, attr) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        return _.extend(
            this.mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr),
            { unit_of_measurement: diagEl.unit });
    }

    mapBinarySensorConfigPayload(diag, diagEl, state_class, device_class, name, attr) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        return _.extend(
            this.mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr),
            { payload_on: true, payload_off: false });
    }

    /**
     *
     * @param {Diagnostic} diag
     * @param {DiagnosticElement} diagEl
     */
    getConfigMapping(diag, diagEl) {
        // TODO: this sucks, find a better way to map these diagnostics and their elements for discovery.
        switch (diagEl.name) {
            // Format: diagnostic, diagnosticElement1, state_class, device_class, attributes
            case 'LIFETIME ENERGY USED':
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'energy');
            case 'INTERM VOLT BATT VOLT':
            case 'EV PLUG VOLTAGE':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'voltage');
            case 'HYBRID BATTERY MINIMUM TEMPERATURE':
            case 'AMBIENT AIR TEMPERATURE':
            case 'AMBIENT AIR TEMPERATURE F':
            case 'ENGINE COOLANT TEMP':
            case 'ENGINE COOLANT TEMP F':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'temperature');
            case 'EV BATTERY LEVEL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'battery');
            case 'TIRE PRESSURE LF':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Front', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LF_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE LF PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Front PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LF_PSI_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE LR':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Rear', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LR_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE LR PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Rear PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LR_PSI_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE RF':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Front', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RF_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE RF PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Front PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RF_PSI_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE RR':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Rear', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RR_MESSAGE')}} | tojson }}`);
            case 'TIRE PRESSURE RR PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Rear PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RR_PSI_MESSAGE')}} | tojson }}`);
            // binary_sensor, no state_class, has device_class
            case 'EV PLUG STATE': // unplugged/plugged
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, 'plug');
            case 'EV CHARGE STATE': // not_charging/charging
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, 'battery_charging');
            // binary_sensor, no state_class and no applicable device_class
            case 'PRIORITY CHARGE INDICATOR': // FALSE/TRUE
            case 'PRIORITY CHARGE STATUS': // NOT_ACTIVE/ACTIVE
                return this.mapBinarySensorConfigPayload(diag, diagEl);
            // non-numeric sensor, no state_class or device_class
            case 'CHARGER POWER LEVEL':
                return this.mapSensorConfigPayload(diag, diagEl);
            // has state_class, new device class, camel case name
            case 'GAS RANGE':
            case 'GAS RANGE MI':
            case 'EV RANGE':
            case 'EV RANGE MI':
            case 'LAST TRIP TOTAL DISTANCE':
            case 'LAST TRIP TOTAL DISTANCE MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'distance');
            case 'ODOMETER':
            case 'ODOMETER MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'distance');
            case 'LIFETIME FUEL USED':
            case 'LIFETIME FUEL USED GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'volume');
            case 'FUEL AMOUNT':
            case 'FUEL AMOUNT GAL':
            case 'FUEL CAPACITY':
            case 'FUEL CAPACITY GAL':
            case 'FUEL LEVEL IN GAL':
            case 'FUEL LEVEL IN GAL GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'volume_storage');
            // has state_class, no device_class, has message
            case 'OIL LIFE':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, 'Oil Life', `{{ {'message': value_json.${MQTT.convertName('OIL_LIFE_MESSAGE')}} | tojson }}`);
            // has state_class, no device class
            case 'LAST TRIP ELECTRIC ECON':
            case 'LIFETIME MPGE':
            case 'LIFETIME EFFICIENCY':
            case 'ELECTRIC ECONOMY':
            default:
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement');
        }
    }
}

module.exports = MQTT;
