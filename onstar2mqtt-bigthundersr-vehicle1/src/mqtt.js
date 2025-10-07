const _ = require('lodash');
const commands = require('./commands');

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
            Alert: {
                Name: 'alert',
                Icon: 'mdi:alert',
            },
            AlertFlash: {
                Name: 'alertFlash',
                Icon: 'mdi:car-light-alert',
            },
            AlertHonk: {
                Name: 'alertHonk',
                Icon: 'mdi:bugle',
            },
            CancelAlert: {
                Name: 'cancelAlert',
                Icon: 'mdi:alert-minus',
            },
            LockDoor: {
                Name: 'lockDoor',
                Icon: 'mdi:car-door-lock',
            },
            UnlockDoor: {
                Name: 'unlockDoor',
                Icon: 'mdi:car-door-lock-open',
            },
            LockTrunk: {
                Name: 'lockTrunk',
                Icon: 'mdi:archive-lock',
            },
            UnlockTrunk: {
                Name: 'unlockTrunk',
                Icon: 'mdi:archive-lock-open',
            },
            Start: {
                Name: 'startVehicle',
                Icon: 'mdi:car-key',
            },
            CancelStart: {
                Name: 'cancelStartVehicle',
                Icon: 'mdi:car-off',
            },
            GetLocation: {
                Name: 'getLocation',
                Icon: 'mdi:map-marker-radius',
            },
            Diagnostics: {
                Name: 'diagnostics',
                Icon: 'mdi:car-info',
            },
            EngineRPM: {
                Name: 'enginerpm',
                Icon: 'mdi:speedometer',
            },
            ChargeOverride: {
                Name: 'chargeOverride',
                Icon: 'mdi:ev-station',
            },
            CancelChargeOverride: {
                Name: 'cancelChargeOverride',
                Icon: 'mdi:battery-charging-wireless-alert',
            },
            GetChargingProfile: {
                Name: 'getChargingProfile',
                Icon: 'mdi:battery-charging-wireless',
            },
            SetChargingProfile: {
                Name: 'setChargingProfile',
                Icon: 'mdi:battery-sync',
            },
        }
    };

    static validateButtonNames() {
        const buttonNames = Object.values(MQTT.CONSTANTS.BUTTONS).map(button => button.Name);
        const commandNames = commands.getFunctionNames();

        buttonNames.forEach(buttonName => {
            if (!commandNames.includes(buttonName)) {
                //console.log(`Button name "${buttonName}" does not match any command in commands.js`);
                throw new Error(`Button name "${buttonName}" does not match any command in commands.js`);
            }
        });
    }

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
            case 'LOC BASED CHARGING HOME LOC STORED':
            case 'SCHEDULED CABIN PRECONDTION CUSTOM SET REQ ACTIVE': // There is a typo in the data coming from the API; 'PRECONDTION' is missing an 'i'.
            case 'VEH IN HOME LOCATION':
            case 'VEH NOT IN HOME LOC':
            case 'VEH LOCATION STATUS INVALID':
            case 'CABIN PRECOND REQUEST':
            case 'PREF CHARGING TIMES SETTING':
            case 'LOCATION BASE CHARGE SETTING':
            case 'CABIN PRECONDITIONING REQUEST':
            case 'HIGH VOLTAGE BATTERY PRECONDITIONING STATUS':
            case 'EXHST PART FLTR WARN ON':
            case 'EXHST PART FLTR WARN2 ON':
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

    createCommandStatusSensorConfigPayload(command, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/${command}_status_monitor/config`;
        let commandStatusTopic = `${this.prefix}/${this.instance}/command/${command}/state`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createCommandStatusSensorTimestampConfigPayload(command, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/${command}_status_timestamp/config`;
        let commandStatusTopic = `${this.prefix}/${this.instance}/command/${command}/state`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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
                "icon": MQTT.CONSTANTS.BUTTONS[button.name].Icon,
                "command_topic": this.getCommandTopic(),
                "payload_press": JSON.stringify({ "command": MQTT.CONSTANTS.BUTTONS[button.name].Name }),
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
                "icon": MQTT.CONSTANTS.BUTTONS[button.name].Icon,
                "command_topic": this.getCommandTopic(),
                "payload_press": JSON.stringify({ "command": MQTT.CONSTANTS.BUTTONS[button.name].Name }),
                "qos": 2,
                "enabled_by_default": false,
            });

            buttonConfigs.push(buttonConfig);
        }

        return { buttonInstances, buttonConfigs, configPayloads };
    }

    createPollingStatusMessageSensorConfigPayload(pollingStatusTopicState, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_message/config`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createPollingStatusCodeSensorConfigPayload(pollingStatusTopicState, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_code/config`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createPollingStatusTimestampSensorConfigPayload(pollingStatusTopicState, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_status_timestamp/config`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createPollingRefreshIntervalSensorConfigPayload(refreshIntervalCurrentValTopic, listAllSensorsTogether) {
        let topic = `${this.prefix}/sensor/${this.instance}/polling_refresh_interval/config`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createPollingStatusTFSensorConfigPayload(pollingStatusTopicTF, listAllSensorsTogether) {
        let topic = `${this.prefix}/binary_sensor/${this.instance}/polling_status_tf/config`;

        let device;
        if (listAllSensorsTogether === true) {
            device = {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            };
        } else {
            device = {
                "identifiers": [this.vehicle.vin + "_Command_Status_Monitor"],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString() + ' Command Status Monitor Sensors',
                "suggested_area": this.vehicle.toString() + ' Command Status Monitor Sensors',
            };
        }

        let payload = {
            "device": device,
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

    createSensorMessageConfigPayload(sensor, component, icon) {
        let topic, unique_id, sensor_name, value_template;
        if (!component) {
            topic = `${this.prefix}/sensor/${this.instance}/${sensor}_message/config`;
            unique_id = MQTT.convertName(this.vehicle.vin) + '_' + sensor + '_message';
            sensor_name = `${sensor.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Message`;
            value_template = `{{ value_json.${sensor}_message }}`;
        } else {
            let transformedComponent;
            if (component === 'tire_pressure_rf_message') {
                transformedComponent = 'Tire Pressure: Right Front Message';
            } else if (component === 'tire_pressure_lf_message') {
                transformedComponent = 'Tire Pressure: Left Front Message';
            } else if (component === 'tire_pressure_lr_message') {
                transformedComponent = 'Tire Pressure: Left Rear Message';
            } else if (component === 'tire_pressure_rr_message') {
                transformedComponent = 'Tire Pressure: Right Rear Message';
            } else {
                transformedComponent = component.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
            topic = `${this.prefix}/sensor/${this.instance}/${component}/config`;
            //unique_id = MQTT.convertName(this.vehicle.vin) + '_' + sensor + '_' + component;
            unique_id = MQTT.convertName(this.vehicle.vin) + '_' + component;
            sensor_name = `${transformedComponent}`;
            value_template = `{{ value_json.${component} }}`;
        }

        let payload = {
            "device": {
                "identifiers": [this.vehicle.vin],
                "manufacturer": this.vehicle.make,
                "model": this.vehicle.year + ' ' + this.vehicle.model,
                "name": this.vehicle.toString(),
                "suggested_area": this.vehicle.toString(),
            },
            "availability": {
                "topic": this.getAvailabilityTopic(),
                "payload_available": 'true',
                "payload_not_available": 'false',
            },
            "unique_id": unique_id,
            "name": sensor_name,
            "state_topic": `${this.prefix}/sensor/${this.instance}/${sensor}/state`,
            "value_template": value_template,
            "icon": icon,
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
                case 'LOC BASED CHARGING HOME LOC STORED': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'SCHEDULED CABIN PRECONDTION CUSTOM SET REQ ACTIVE': // FALSE/TRUE - There is a typo in the data coming from the API; 'PRECONDTION' is missing an 'i'.
                    value = e.value === 'TRUE';
                    break;
                case 'VEH IN HOME LOCATION': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'VEH NOT IN HOME LOC': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'VEH LOCATION STATUS INVALID': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'CABIN PRECOND REQUEST': // OFF/ON
                    value = e.value === 'ON';
                    break;
                case 'PREF CHARGING TIMES SETTING': // OFF/ON
                    value = e.value === 'ON';
                    break;
                case 'LOCATION BASE CHARGE SETTING': // OFF/ON
                    value = e.value === 'ON';
                    break;
                case 'CABIN PRECONDITIONING REQUEST': // NO_ACTION/ACTION
                    value = e.value === 'ACTION';
                    break;
                case 'HIGH VOLTAGE BATTERY PRECONDITIONING STATUS': // DISABLED/ENABLED
                    value = e.value === 'ENABLED';
                    break;
                case 'EXHST PART FLTR WARN ON': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                case 'EXHST PART FLTR WARN2 ON': // FALSE/TRUE
                    value = e.value === 'TRUE';
                    break;
                default:
                    // coerce to number if possible, API uses strings :eyeroll:
                    // eslint-disable-next-line no-case-declarations
                    const num = _.toNumber(e.value);
                    value = _.isNaN(num) ? e.value : num;
                    break;
            }
            state[MQTT.convertName(e.name)] = value;
            // Only add _message field if message exists (not undefined/null/empty)
            // This prevents overwriting legitimate messages with undefined values
            if (e.message !== undefined && e.message !== null && e.message !== '') {
                state[`${MQTT.convertName(e.name)}_message`] = e.message;
            }
        });
        return state;
    }

    mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr, icon) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        name = this.addNamePrefix(name);
        // Generate the unique id from the vin and name
        let unique_id = `${this.vehicle.vin}-${diagEl.name}`
        unique_id = unique_id.replace(/\s+/g, '-').toLowerCase();
        return {
            state_class,
            device_class,
            name,
            icon,
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

    mapSensorConfigPayload(diag, diagEl, state_class, device_class, name, attr, icon) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        // Ignore units that are "NA" or "XXX"
        const unit = diagEl.unit && !['NA', 'XXX'].includes(diagEl.unit.toUpperCase()) ? diagEl.unit : undefined;
        return _.extend(
            this.mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr, icon),
            { unit_of_measurement: unit });
    }

    mapBinarySensorConfigPayload(diag, diagEl, state_class, device_class, name, attr, icon) {
        name = name || MQTT.convertFriendlyName(diagEl.name);
        return _.extend(
            this.mapBaseConfigPayload(diag, diagEl, state_class, device_class, name, attr, icon),
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
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'energy', undefined, undefined, 'mdi:lightning-bolt');
            case 'INTERM VOLT BATT VOLT':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'voltage', undefined, undefined, 'mdi:car-battery');
            case 'EV PLUG VOLTAGE':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'voltage', undefined, undefined, 'mdi:ev-plug-type1');
            case 'HYBRID BATTERY MINIMUM TEMPERATURE':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'temperature', undefined, undefined, 'mdi:battery-high');
            case 'AMBIENT AIR TEMPERATURE':
            case 'AMBIENT AIR TEMPERATURE F':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'temperature', undefined, undefined, 'mdi:thermometer');
            case 'ENGINE COOLANT TEMP':
            case 'ENGINE COOLANT TEMP F':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'temperature', undefined, undefined, 'mdi:coolant-temperature');
            case 'SCHEDULED CABIN PRECONDTION CUSTOM SET VALUE':
            case 'SCHEDULED CABIN PRECONDTION CUSTOM SET VALUE F':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'temperature', undefined, undefined, 'mdi:thermostat');
            case 'EV BATTERY LEVEL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'battery', undefined, undefined, 'mdi:battery-high');
            case 'TIRE PRESSURE LF':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Front', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LF_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE LF PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Front PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LF_PSI_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE LR':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Rear', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LR_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE LR PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Left Rear PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_LR_PSI_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE RF':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Front', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RF_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE RF PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Front PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_FRONT_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RF_PSI_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE RR':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Rear', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RR_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            case 'TIRE PRESSURE RR PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'pressure', 'Tire Pressure: Right Rear PSI', `{{ {'recommendation': value_json.${MQTT.convertName('TIRE_PRESSURE_PLACARD_REAR_PSI')}, 'message': value_json.${MQTT.convertName('TIRE_PRESSURE_RR_PSI_MESSAGE')}} | tojson }}`, 'mdi:car-tire-alert');
            // binary_sensor, no state_class, has device_class
            case 'EV PLUG STATE': // unplugged/plugged
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, 'plug', undefined, undefined, 'mdi:ev-plug-type1');
            case 'EV CHARGE STATE': // not_charging/charging
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, 'battery_charging', undefined, undefined, 'mdi:battery-charging');
            // binary_sensor, no state_class and no applicable device_class
            case 'PRIORITY CHARGE INDICATOR': // FALSE/TRUE
            case 'PRIORITY CHARGE STATUS': // NOT_ACTIVE/ACTIVE
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:battery-charging-high');
            case 'LOC BASED CHARGING HOME LOC STORED': // FALSE/TRUE
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:home-lightning-bolt');
            case 'SCHEDULED CABIN PRECONDTION CUSTOM SET REQ ACTIVE': // FALSE/TRUE - There is a typo in the data coming from the API; 'PRECONDTION' is missing an 'i'.
            case 'CABIN PRECOND REQUEST': // OFF/ON
            case 'CABIN PRECONDITIONING REQUEST': // NO_ACTION/ACTION
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:air-conditioner');
            case 'VEH IN HOME LOCATION': // FALSE/TRUE
            case 'VEH NOT IN HOME LOC': // FALSE/TRUE
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:home-map-marker');
            case 'VEH LOCATION STATUS INVALID': // FALSE/TRUE
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:map-marker-question');
            case 'PREF CHARGING TIMES SETTING': // OFF/On
            case 'LOCATION BASE CHARGE SETTING': // OFF/On
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:cog');
            case 'HIGH VOLTAGE BATTERY PRECONDITIONING STATUS': // DISABLED/ENABLED
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:battery-alert');
            case 'EXHST PART FLTR WARN ON': // FALSE/TRUE - Diesel Exhaust Particulate Filter Warning On
            case 'EXHST PART FLTR WARN2 ON': // FALSE/TRUE - Diesel Exhaust Particulate Filter Warning 2 On
                return this.mapBinarySensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:air-filter');
            // non-numeric sensor, no state_class or device_class
            case 'CHARGER POWER LEVEL':
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:flash');
            case 'WEEKEND END TIME': // 08:00
            case 'WEEKEND START TIME': // 08:00
            case 'WEEKDAY START TIME': // 08:00
            case 'WEEKDAY END TIME': // 08:00
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:clock-outline');
            case 'CHARGE DAY OF WEEK': // Monday
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:calendar');
            case 'EXHST FL LEVL WARN STATUS': // Diesel Exhaust Fluid Level Warning Status
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:hydraulic-oil-level');
            case 'ENGINE_TYPE': // ICE/EV/HYBRID - Engine type string
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:engine');
            case 'LAST_OIL_CHANGE_DATE': // Date string like "2025-09-19"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:calendar-check');
            case 'ENGINE_AIR_FILTER_LIFE_RMAINING_HMI': // Engine air filter life remaining percentage
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:air-filter');
            case 'ENGINE_AIR_FILTER_DIAGNOSTICS': // Diagnostic status strings like "NO FAULT"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:air-filter');
            case 'ENGINE_AIR_FILTER_MONITOR_STATUS': // Monitor status strings like "OK"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:air-filter');
            case 'INITIALIZATION_STATUS': // Initialization status strings like "INITIALIZED"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:checkbox-marked-circle');
            case 'BRAKE_FLUID_LOW': // String values like "FALSE"/"TRUE"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:car-brake-fluid-level');
            case 'WASHER_FLUID_LOW': // String values like "FALSE"/"TRUE"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:wiper-wash');
            case 'LEFT_FRONT_TIRE_PRESSURE_STATUS': // Tire pressure status strings like "TPM_STATUS_NOMINAL"
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:car-tire-alert');
            case 'LEFT_REAR_TIRE_PRESSURE_STATUS': // Tire pressure status strings
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:car-tire-alert');
            case 'RIGHT_FRONT_TIRE_PRESSURE_STATUS': // Tire pressure status strings
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:car-tire-alert');
            case 'RIGHT_REAR_TIRE_PRESSURE_STATUS': // Tire pressure status strings
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:car-tire-alert');
            case 'LEFT_FRONT_TIRE_PRESSURE_VALID': // Validation status (0/1 but as diagnostic field)
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:check-circle');
            case 'LEFT_REAR_TIRE_PRESSURE_VALID': // Validation status
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:check-circle');
            case 'RIGHT_FRONT_TIRE_PRESSURE_VALID': // Validation status
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:check-circle');
            case 'RIGHT_REAR_TIRE_PRESSURE_VALID': // Validation status
                return this.mapSensorConfigPayload(diag, diagEl, undefined, undefined, undefined, undefined, 'mdi:check-circle');
            // has state_class, new device class, camel case name
            case 'GAS RANGE':
            case 'GAS RANGE MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'distance', undefined, undefined, 'mdi:gas-station');
            case 'EV RANGE':
            case 'EV RANGE MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'distance', undefined, undefined, 'mdi:ev-station');
            case 'LAST TRIP TOTAL DISTANCE':
            case 'LAST TRIP TOTAL DISTANCE MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'distance', undefined, undefined, 'mdi:map-marker-distance');
            case 'PROJECTED EV RANGE GENERAL AWAY TARGET CHARGE SET':
            case 'PROJECTED EV RANGE GENERAL AWAY TARGET CHARGE SET MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'distance', undefined, undefined, 'mdi:map-marker-path');
            case 'ODOMETER':
            case 'ODOMETER MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'distance', undefined, undefined, 'mdi:counter');
            case 'LIFETIME FUEL USED':
            case 'LIFETIME FUEL USED GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'total_increasing', 'volume', undefined, undefined, 'mdi:gas-station');
            case 'FUEL AMOUNT':
            case 'FUEL AMOUNT GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'volume_storage', undefined, undefined, 'mdi:fuel');
            case 'FUEL CAPACITY':
            case 'FUEL CAPACITY GAL':
            case 'FUEL_CAPACITY':
            case 'FUEL_CAPACITY_GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'volume_storage', undefined, undefined, 'mdi:gas-station');
            case 'FUEL LEVEL IN GAL':
            case 'FUEL LEVEL IN GAL GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', 'volume_storage', undefined, undefined, 'mdi:fuel');
            // has state_class, no device_class, has message
            case 'OIL LIFE':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, 'Oil Life', `{{ {'message': value_json.${MQTT.convertName('OIL_LIFE_MESSAGE')}} | tojson }}`, 'mdi:oil');
            // has state_class, no device class
            case 'LAST TRIP ELECTRIC ECON':
            case 'LIFETIME MPGE':
            case 'LIFETIME EFFICIENCY':
            case 'ELECTRIC ECONOMY':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:leaf-circle');
            case 'AVERAGE FUEL ECONOMY':
            case 'AVERAGE FUEL ECONOMY MPG':
            case 'AVERAGE_FUEL_ECONOMY':
            case 'AVERAGE_FUEL_ECONOMY MPG':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:gauge');
            case 'LIFETIME FUEL ECONOMY':
            case 'LIFETIME FUEL ECONOMY MPG':
            case 'LIFETIME FUEL ECON':
            case 'LIFETIME FUEL ECON MPG':
            case 'LIFETIME_FUEL_ECONOMY':
            case 'LIFETIME_FUEL_ECONOMY MPG':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:leaf-circle');
            case 'FUEL LEVEL':
            case 'FUEL_LEVEL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:fuel');
            case 'FUEL RANGE':
            case 'FUEL RANGE MI':
            case 'FUEL_RANGE':
            case 'FUEL_RANGE MI':
            case 'FUEL_RANGE_MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:gas-station');
            case 'FUEL REMAINING':
            case 'FUEL REMAINING GAL':
            case 'FUEL_REMAINING':
            case 'FUEL_REMAINING GAL':
            case 'FUEL_REMAINING_GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:gas-station');
            case 'FUEL USED':
            case 'FUEL USED GAL':
            case 'FUEL_USED':
            case 'FUEL_USED GAL':
            case 'FUEL_USED_GAL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:gas-station');
            case 'ENGINE RPM':
            case 'ENGINE_RPM':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:engine');
            case 'BATT SAVER MODE COUNTER':
            case 'BATT_SAVER_MODE_COUNTER':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:battery-arrow-down');
            case 'BATT SAVER MODE SEV LVL':
            case 'BATT_SAVER_MODE_SEV_LVL':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:battery-alert');
            case 'EOL READ':
            case 'EOL_READ':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:oil-level');
            case 'ODO READ':
            case 'ODO READ MI':
            case 'ODO_READ':
            case 'ODO_READ MI':
            case 'ODO_READ_MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:counter');
            case 'TRIP A ODO':
            case 'TRIP A ODO MI':
            case 'TRIP_A_ODO':
            case 'TRIP_A_ODO MI':
            case 'TRIP_A_ODO_MI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:map-marker-distance');
            case 'LEFT_FRONT_TIRE_PRESSURE':
            case 'LEFT_REAR_TIRE_PRESSURE':
            case 'RIGHT_FRONT_TIRE_PRESSURE':
            case 'RIGHT_REAR_TIRE_PRESSURE':
            case 'LEFT FRONT TIRE PRESSURE':
            case 'LEFT REAR TIRE PRESSURE':
            case 'RIGHT FRONT TIRE PRESSURE':
            case 'RIGHT REAR TIRE PRESSURE':
            case 'LEFT_FRONT_TIRE_PRESSURE PSI':
            case 'LEFT_REAR_TIRE_PRESSURE PSI':
            case 'RIGHT_FRONT_TIRE_PRESSURE PSI':
            case 'RIGHT_REAR_TIRE_PRESSURE PSI':
            case 'LEFT FRONT TIRE PRESSURE PSI':
            case 'LEFT REAR TIRE PRESSURE PSI':
            case 'RIGHT FRONT TIRE PRESSURE PSI':
            case 'RIGHT REAR TIRE PRESSURE PSI':
            case 'LEFT_FRONT_TIRE_PRESSURE_IN_PSI':
            case 'LEFT_REAR_TIRE_PRESSURE_IN_PSI':
            case 'RIGHT_FRONT_TIRE_PRESSURE_IN_PSI':
            case 'RIGHT_REAR_TIRE_PRESSURE_IN_PSI':
            case 'LEFT_FRONT_TIRE_PRESSURE_IN_PSI PSI':
            case 'LEFT_REAR_TIRE_PRESSURE_IN_PSI PSI':
            case 'RIGHT_FRONT_TIRE_PRESSURE_IN_PSI PSI':
            case 'RIGHT_REAR_TIRE_PRESSURE_IN_PSI PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:car-tire-alert');
            case 'FRONT_PLACARD':
            case 'REAR_PLACARD':
            case 'FRONT PLACARD':
            case 'REAR PLACARD':
            case 'FRONT_PLACARD PSI':
            case 'REAR_PLACARD PSI':
            case 'FRONT PLACARD PSI':
            case 'REAR PLACARD PSI':
            case 'FRONT_PLACARD_IN_PSI':
            case 'REAR_PLACARD_IN_PSI':
            case 'FRONT_PLACARD_IN_PSI PSI':
            case 'REAR_PLACARD_IN_PSI PSI':
            case 'TIRE PRESSURE PLACARD FRONT':
            case 'TIRE PRESSURE PLACARD REAR':
            case 'TIRE PRESSURE PLACARD FRONT PSI':
            case 'TIRE PRESSURE PLACARD REAR PSI':
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:card-text');
            case 'EXHST FL LEVL WARN IND': // Diesel Exhaust Fluid Level Warning Indicator
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement', undefined, undefined, undefined, 'mdi:gauge');
            default:
                return this.mapSensorConfigPayload(diag, diagEl, 'measurement');
        }
    }
}

MQTT.validateButtonNames();

module.exports = MQTT;
