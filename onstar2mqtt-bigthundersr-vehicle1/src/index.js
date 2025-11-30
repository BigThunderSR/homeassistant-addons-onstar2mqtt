const OnStar = require('onstarjs2').default;
const mqtt = require('mqtt');
const uuidv4 = require('uuid').v4;
const _ = require('lodash');
const axios = require('axios');
const Vehicle = require('./vehicle');
const { Diagnostic, AdvancedDiagnostic } = require('./diagnostic');
const MQTT = require('./mqtt');
const Commands = require('./commands');
const logger = require('./logger');
const { normalizeError } = require('./error-utils');
const fs = require('fs');
//const CircularJSON = require('circular-json');

let buttonConfigsPublished = '';
let refreshIntervalConfigPublished = '';
let cachedVehicleImageBase64 = null; // Cache the downloaded image

const onstarConfig = {
    deviceId: process.env.ONSTAR_DEVICEID || uuidv4(),
    vin: process.env.ONSTAR_VIN,
    username: process.env.ONSTAR_USERNAME,
    password: process.env.ONSTAR_PASSWORD,
    onStarTOTP: process.env.ONSTAR_TOTP,
    onStarPin: process.env.ONSTAR_PIN,
    tokenLocation: process.env.TOKEN_LOCATION || '',
    checkRequestStatus: _.get(process.env, 'ONSTAR_SYNC', 'true') === 'true',
    refreshInterval: parseInt(process.env.ONSTAR_REFRESH) || (30 * 60 * 1000), // 30 min
    recallRefreshInterval: parseInt(process.env.ONSTAR_RECALL_REFRESH) || (7 * 24 * 60 * 60 * 1000), // 7 days default
    requestPollingIntervalSeconds: parseInt(process.env.ONSTAR_POLL_INTERVAL) || 6, // 6 sec default
    requestPollingTimeoutSeconds: parseInt(process.env.ONSTAR_POLL_TIMEOUT) || 90, // 60 sec default
    allowCommands: _.get(process.env, 'ONSTAR_ALLOW_COMMANDS', 'true') === 'true'
};

const onstarRequiredProperties = {
    vin: 'ONSTAR_VIN',
    username: 'ONSTAR_USERNAME',
    password: 'ONSTAR_PASSWORD',
    onStarTOTP: 'ONSTAR_TOTP',
    onStarPin: 'ONSTAR_PIN'
};

for (let prop in onstarRequiredProperties) {
    if (!onstarConfig[prop]) {
        throw new Error(`"${onstarRequiredProperties[prop]}" is not defined`);
    }
}

// Validate VIN
if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(onstarConfig.vin)) {
    throw new Error('Invalid VIN. Please check the value entered for VIN in ONSTAR_VIN.');
}

// Validate PIN
if (!/^\d{4}$/.test(onstarConfig.onStarPin)) {
    throw new Error('ONSTAR_PIN must be a 4-digit number');
}

if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('OnStar Config:', { onstarConfig });
} else {
    logger.info('OnStar Config:', { onstarConfig: { ...onstarConfig, password: '********', onStarTOTP: '***************', onStarPin: '####' } });
}

const mqttConfig = {
    host: process.env.MQTT_HOST || 'localhost',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    port: parseInt(process.env.MQTT_PORT) >= 0 ? parseInt(process.env.MQTT_PORT) : 1883,
    tls: process.env.MQTT_TLS === 'true',
    rejectUnauthorized: process.env.MQTT_REJECT_UNAUTHORIZED !== 'false',
    prefix: process.env.MQTT_PREFIX || 'homeassistant',
    namePrefix: process.env.MQTT_NAME_PREFIX || '',
    pollingStatusTopic: process.env.MQTT_ONSTAR_POLLING_STATUS_TOPIC,
    listAllSensorsTogether: process.env.MQTT_LIST_ALL_SENSORS_TOGETHER === 'true',
    ca: process.env.MQTT_CA_FILE ? [fs.readFileSync(process.env.MQTT_CA_FILE)] : undefined,
    cert: process.env.MQTT_CERT_FILE ? fs.readFileSync(process.env.MQTT_CERT_FILE) : undefined,
    key: process.env.MQTT_KEY_FILE ? fs.readFileSync(process.env.MQTT_KEY_FILE) : undefined,
};

const mqttRequiredProperties = {
    username: 'MQTT_USERNAME',
    password: 'MQTT_PASSWORD',
    //pollingStatusTopic: 'MQTT_ONSTAR_POLLING_STATUS_TOPIC'    # No longer mandatory
};

for (let prop in mqttRequiredProperties) {
    if (!mqttConfig[prop]) {
        throw new Error(`"${mqttRequiredProperties[prop]}" is not defined`);
    }
}

if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('MQTT Config:', { mqttConfig });
} else {
    logger.info('MQTT Config:', { mqttConfig: { ...mqttConfig, password: '********', ca: undefined, cert: undefined, key: undefined } });
}

const init = () => new Commands(OnStar.create(onstarConfig));

const getVehicles = async commands => {
    logger.info('Requesting vehicles');
    const vehiclesRes = await commands.getAccountVehicles();
    logger.info('Vehicle request status:', { status: _.get(vehiclesRes, 'status') });
    // DEBUG: Log the full response to see the actual structure
    logger.debug('Full vehicles response:', { vehiclesRes });
    // API CHANGE: New API format returns vehicles directly in data.vehicles array
    // Old path: response.data.vehicles.vehicle (nested structure)
    // New path: data.vehicles (direct array, no response wrapper in new API)
    const vehicles = _.map(
        _.get(vehiclesRes, 'data.vehicles') || _.get(vehiclesRes, 'response.data.vehicles'),
        v => new Vehicle(v)
    );
    logger.debug('Vehicle request response:', { vehicles: _.map(vehicles, v => v.toString()) });
    return vehicles;
}

const getCurrentVehicle = async commands => {
    const vehicles = await getVehicles(commands);
    const currentVeh = _.find(vehicles, v => v.vin.toLowerCase() === onstarConfig.vin.toLowerCase());
    if (!currentVeh) {
        throw new Error(`Configured vehicle VIN ${onstarConfig.vin} not available in account vehicles`);
    }
    return currentVeh;
}

const connectMQTT = async availabilityTopic => {
    const url = `${mqttConfig.tls ? 'mqtts' : 'mqtt'}://${mqttConfig.host}:${mqttConfig.port}`;

    if (!mqttConfig.tls) {
        mqttConfig.ca = undefined;
        mqttConfig.cert = undefined;
        mqttConfig.key = undefined;
    }

    const config = {
        username: mqttConfig.username,
        password: mqttConfig.password,
        rejectUnauthorized: mqttConfig.rejectUnauthorized,
        ca: mqttConfig.ca,
        cert: mqttConfig.cert,
        key: mqttConfig.key,
        will: { topic: availabilityTopic, payload: 'false', retain: true }
    };
    logger.info('Connecting to MQTT:', { url, config: _.omit(config, 'password', 'ca', 'cert', 'key') });

    // Use Promise wrapper for regular mqtt.connect() with timeout
    const client = await new Promise((resolve, reject) => {
        const timeout = global.setTimeout(() => {
            reject(new Error('MQTT connection timeout'));
        }, 30000); // 30 second timeout
        
        const mqttClient = mqtt.connect(url, config);
        
        // Set up persistent event handler for availability restoration on every (re)connect
        // Must be attached BEFORE the first connect event fires
        mqttClient.on('connect', () => {
            logger.info('MQTT connection established, publishing availability');
            mqttClient.publish(availabilityTopic, 'true', { retain: true });
            logger.debug('Published availability=true');
        });
        
        // Use .once() for initial connection to resolve Promise only once
        mqttClient.once('connect', () => {
            global.clearTimeout(timeout);
            logger.info('Connected to MQTT!');
            resolve(mqttClient);
        });
        
        // Use .once() for initial connection error to reject Promise only once
        mqttClient.once('error', (error) => {
            global.clearTimeout(timeout);
            logger.error('MQTT initial connection error:', error);
            reject(error);
        });
    });
    
    // Set up persistent error handler for runtime errors (after initial connection)
    client.on('error', (error) => {
        logger.error('MQTT runtime error:', error);
    });
    
    // Additional event handlers for connection lifecycle monitoring
    client.on('reconnect', () => {
        logger.info('MQTT client attempting to reconnect...');
    });
    
    client.on('close', () => {
        logger.warn('MQTT connection closed');
    });
    
    client.on('offline', () => {
        logger.warn('MQTT client is offline');
    });
    
    client.on('disconnect', (packet) => {
        logger.warn('MQTT client disconnected', { packet });
    });
    
    return client;
}

// Helper function to publish with Promise support and timeout (maintaining async-mqtt behavior)
const publishAsync = (client, topic, payload, options = {}) => {
    return new Promise((resolve, reject) => {
        const timeout = global.setTimeout(() => {
            reject(new Error('MQTT publish timeout'));
        }, 10000); // 10 second timeout
        
        client.publish(topic, payload, options, (error) => {
            global.clearTimeout(timeout);
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

const configureMQTT = async (commands, client, mqttHA) => {
    if (!onstarConfig.allowCommands)
        return;

    client.on('message', (topic, message) => {
        logger.debug(`Subscription message: ${topic, message}`);
        const { command, options } = JSON.parse(message);
        
        const cmd = commands[command];
        if (!cmd) {
            if (topic === mqttHA.getRefreshIntervalTopic()) {
                logger.info(`Processing refreshInterval`);
                return;
            } else {
                logger.error('Command not found', { command });
                return;
            }
        }

        const topicArray = _.concat({ topic }, '/', { command }.command, '/', 'state');
        const commandStatusTopic = topicArray.map(item => item.topic || item).join('');

        const commandStatusSensorConfig = mqttHA.createCommandStatusSensorConfigPayload(command, mqttConfig.listAllSensorsTogether);
        logger.debug("Command Status Sensor Config:", commandStatusSensorConfig);
        const commandStatusSensorTimestampConfig = mqttHA.createCommandStatusSensorTimestampConfigPayload(command, mqttConfig.listAllSensorsTogether);
        logger.debug("Command Status Sensor Timestamp Config:", commandStatusSensorTimestampConfig);

        const commandFn = cmd.bind(commands);
        logger.debug(`List of const: Command: ${command}, cmd: ${cmd}, commandFn: ${commandFn.toString()}, options: ${options}`);
        if (command === 'diagnostics') { // || command === 'enginerpm') {
            logger.warn('Command sent:', { command });
            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            (async () => {
                const states = new Map();
                logger.debug(`Options in command async block: ${options}`)
                let diagnosticItem;
                if (options) {
                    diagnosticItem = options.split(',');
                } else {
                    diagnosticItem = undefined;
                }
                logger.debug("Diagnostic Item:", diagnosticItem)
                const statsRes = await commands[command]({ diagnosticItem });
                logger.info('Diagnostic request status', { status: _.get(statsRes, 'status') });
                logger.info('Diagnostic response keys:', Object.keys(statsRes || {}));
                logger.info('Diagnostic response.data keys:', Object.keys(_.get(statsRes, 'response.data') || {}));
                
                // API CHANGE: New API v3 format changes diagnostic response structure completely
                // Old path: response.data.commandResponse.body.diagnosticResponse (array)
                // New path: response.data.diagnostics (array within HealthStatusResponse object)
                // New structure has response.data as HealthStatusResponse with diagnostics array
                let diagnosticResponses = _.get(statsRes, 'response.data.commandResponse.body.diagnosticResponse');
                
                // If old path doesn't exist, try new API v3 path
                if (!diagnosticResponses) {
                    diagnosticResponses = _.get(statsRes, 'response.data.diagnostics');
                    logger.warn('Using API v3 path: response.data.diagnostics');
                } else {
                    logger.warn('Using API v2 path: response.data.commandResponse.body.diagnosticResponse');
                }
                
                logger.info('Diagnostic responses found:', Array.isArray(diagnosticResponses) ? diagnosticResponses.length : 'not an array');
                if (diagnosticResponses && Array.isArray(diagnosticResponses)) {
                    logger.warn('Diagnostic group names:', diagnosticResponses.map(d => d.name));
                }
                // Make sure the response is always an array
                const diagArray = Array.isArray(diagnosticResponses) ? diagnosticResponses : [diagnosticResponses];
                const stats = _.map(
                    diagArray,
                    (d, index) => {
                        logger.debug('Diagnostic Array', { ...d, number: index + 1 });
                        const diag = new Diagnostic({ ...d, number: index + 1 });
                        logger.warn(`Diagnostic "${diag.name}" has ${diag.diagnosticElements.length} elements`);
                        return diag;
                    }
                );
                logger.debug('stats', stats);
                logger.debug('Diagnostic request response:', { stats: _.map(stats, s => s.toString()) });
                for (const s of stats) {
                    // configure once, then set or update states
                    for (const d of s.diagnosticElements) {
                        mqttHA.getConfigTopic(d);
                        mqttHA.getConfigPayload(s, d);
                    }
                    const topic = mqttHA.getStateTopic(s);
                    const payload = mqttHA.getStatePayload(s);
                    states.set(topic, payload);
                }
                const publishes = [];
                for (let [topic, state] of states) {
                    logger.info('Publishing message:', { topic, state });
                    publishes.push(
                        publishAsync(client, topic, JSON.stringify(state), { retain: true })
                    );
                }
                await Promise.all(publishes);
                // refactor the response handling for commands - Done!
                const completionTimestamp = new Date().toISOString();
                logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                logger.warn('Command completed:', { command });
                logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                client.publish(
                    commandStatusTopic,
                    JSON.stringify({
                        "command": {
                            "error": {
                                "message": "Completed Successfully",
                                "response": {
                                    "status": 0,
                                    "statusText": "Completed Successfully"
                                }
                            }
                        },
                        "completionTimestamp": completionTimestamp
                    }), { retain: true }
                );
            })()
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('Command Error!', { command, error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                })
        }
        else if (command === 'alert') {
            //const modifiedOptions = {
            //    action: 'action: ["' + options.action + '"]',
            //    delay: parseInt(options.delay) || 0, // handle invalid or missing delay
            //    duration: parseInt(options.duration) || 0, // handle invalid or missing duration
            //    override: 'override: ["' + options.override + '"]'
            //};

            let action, delay, duration, override;
            let actionArray = undefined;
            let overrideArray = undefined;

            if (!options) {
                action = undefined;
                delay = undefined;
                duration = undefined;
                override = undefined;
                logger.debug('Options is Undefined!')
                return;
            }
            else {
                action = options.action;
                logger.debug(`Action: ${action}`);
                delay = options.delay;
                logger.debug(`Delay: ${delay}`);
                duration = options.duration;
                logger.debug(`Duration: ${duration}`);
                override = options.override;
                logger.debug(`Override: ${override}`);
            }

            if (action === '' || action === undefined) {
                actionArray = undefined;
            } else {
                actionArray = action.split(',');
            }
            logger.debug(`Action Array: ${actionArray}`);

            if (override === '' || override === undefined) {
                overrideArray = undefined;
            } else {
                overrideArray = override.split(',');
            }
            logger.debug(`Override Array: ${overrideArray}`);

            let request = {
                action: actionArray || ["Flash", "Honk"],
                delay: delay || 0,
                duration: duration || 1,
                override: overrideArray || ["DoorOpen", "IgnitionOn"]
            }

            logger.warn('Command sent:', { command });
            //logger.debug(`Command sent: Command: ${ command }, ModifiedOptions: ${ modifiedOptions }`);

            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            //commandFn(modifiedOptions || {})
            logger.debug(`Command sent: Command: ${command}, Request: ${JSON.stringify(request)}`);
            commands[command](request)
                .then(data => {
                    // refactor the response handling for commands - Done!
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    logger.warn('Command completed:', { command });
                    logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                    client.publish(
                        commandStatusTopic,
                        JSON.stringify({
                            "command": {
                                "error": {
                                    "message": "Completed Successfully",
                                    "response": {
                                        "status": 0,
                                        "statusText": "Completed Successfully"
                                    }
                                }
                            },
                            "completionTimestamp": completionTimestamp
                        }), { retain: true }
                    );
                    const responseData = _.get(data, 'response.data');
                    if (responseData) {
                        logger.warn('Command response data:', { responseData });
                    }
                })
                //.catch((err)=> {logger.error('Command error', {command, err})            
                //logger.info(commandStatusTopic);
                //client.publish(commandStatusTopic, CircularJSON.stringify({"Command": err}), {retain: true})});
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('Command Error!', { command, error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                });
        }

        else if (command === 'setChargeLevelTarget') {
            // Handle setChargeLevelTarget command with target charge level value
            let targetChargeLevel;

            if (!options) {
                logger.error('Options is undefined for setChargeLevelTarget command! A target charge level (0-100) is required.');
                return;
            }

            // Support both numeric value and object format
            if (typeof options === 'number') {
                targetChargeLevel = options;
            } else if (typeof options === 'object' && options.targetChargeLevel !== undefined) {
                targetChargeLevel = options.targetChargeLevel;
            } else if (typeof options === 'object' && options.tcl !== undefined) {
                targetChargeLevel = options.tcl;
            } else {
                logger.error('Invalid options for setChargeLevelTarget. Expected a number or object with targetChargeLevel/tcl property.');
                return;
            }

            logger.info('setChargeLevelTarget command sent:', { targetChargeLevel });
            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            
            // Call the command with targetChargeLevel as first parameter
            commands[command](targetChargeLevel, {})
                .then(data => {
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    logger.warn('setChargeLevelTarget command completed:', { targetChargeLevel });
                    logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                    logger.debug('setChargeLevelTarget response:', { data });
                    client.publish(
                        commandStatusTopic,
                        JSON.stringify({
                            "command": {
                                "error": {
                                    "message": "Completed Successfully",
                                    "response": {
                                        "status": 0,
                                        "statusText": "Completed Successfully"
                                    }
                                }
                            },
                            "completionTimestamp": completionTimestamp
                        }), { retain: true }
                    );
                })
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('setChargeLevelTarget Command Error!', { command, error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                });
        }

        else if (command === 'getVehicleDetails') {
            // Handle getVehicleDetails command - doesn't take any parameters
            logger.warn('Command sent:', { command });
            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            
            commands.getVehicleDetails()
                .then(data => {
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    logger.warn('getVehicleDetails command completed');
                    logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                    
                    client.publish(
                        commandStatusTopic,
                        JSON.stringify({
                            "command": {
                                "error": {
                                    "message": "Completed Successfully",
                                    "response": {
                                        "status": 0,
                                        "statusText": "Completed Successfully"
                                    }
                                }
                            },
                            "completionTimestamp": completionTimestamp
                        }), { retain: true }
                    );
                    
                    // API returns data at data.data path (not response.data)
                    const responseData = _.get(data, 'response.data');
                    const directData = _.get(data, 'data');
                    const actualData = responseData || directData;
                    
                    if (actualData) {
                        // Extract vehicle details
                        const vehicleDetails = actualData.vehicleDetails || actualData;
                        
                        const sensorTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_details/config`;
                        const stateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_details/state`;
                        
                        const sensorConfig = {
                            name: `${mqttHA.vehicle} Vehicle Details`,
                            unique_id: `${mqttHA.instance}_vehicle_details`,
                            state_topic: stateTopic,
                            json_attributes_topic: stateTopic,
                            value_template: '{{ value_json.state }}',
                            icon: 'mdi:car-info',
                            device: mqttHA.getDevicePayload(),
                            availability: {
                                topic: mqttHA.getAvailabilityTopic(),
                                payload_available: 'true',
                                payload_not_available: 'false'
                            }
                        };
                        
                        const sensorState = {
                            state: 'Available',
                            make: vehicleDetails.make,
                            model: vehicleDetails.model,
                            year: vehicleDetails.year,
                            vin: vehicleDetails.vin,
                            onstar_capable: vehicleDetails.onstarCapable,
                            image_url: vehicleDetails.imageUrl,
                            rpo_codes: vehicleDetails.rpoCodes,
                            order_date: vehicleDetails.orderDate,
                            color: vehicleDetails.color,
                            permissions: vehicleDetails.permissions,
                            vehicle_commands: vehicleDetails.vehicleCommands,
                            last_updated: completionTimestamp
                        };
                        
                        // Log all vehicle details
                        logger.info('=== VEHICLE DETAILS ===');
                        logger.info(`Make: ${vehicleDetails.make}`);
                        logger.info(`Model: ${vehicleDetails.model}`);
                        logger.info(`Year: ${vehicleDetails.year}`);
                        logger.info(`VIN: ${vehicleDetails.vin}`);
                        logger.info(`Color: ${vehicleDetails.color || 'N/A'}`);
                        logger.info(`OnStar Capable: ${vehicleDetails.onstarCapable}`);
                        logger.info(`Image URL: ${vehicleDetails.imageUrl || 'N/A'}`);
                        logger.info(`Order Date: ${vehicleDetails.orderDate || 'N/A'}`);
                        if (vehicleDetails.rpoCodes && vehicleDetails.rpoCodes.length > 0) {
                            logger.info(`RPO Codes (${vehicleDetails.rpoCodes.length}): ${vehicleDetails.rpoCodes.slice(0, 10).join(', ')}${vehicleDetails.rpoCodes.length > 10 ? '...' : ''}`);
                        }
                        if (vehicleDetails.permissions) {
                            logger.info(`Permissions: ${JSON.stringify(vehicleDetails.permissions)}`);
                        }
                        if (vehicleDetails.vehicleCommands) {
                            logger.info(`Vehicle Commands: ${JSON.stringify(vehicleDetails.vehicleCommands)}`);
                        }
                        if (vehicleDetails.vehicleMetaData) {
                            logger.info(`Vehicle Metadata: ${JSON.stringify(vehicleDetails.vehicleMetaData)}`);
                        }
                        if (vehicleDetails.onstarInfo) {
                            logger.info(`OnStar Info: ${JSON.stringify(vehicleDetails.onstarInfo)}`);
                        }
                        logger.info('=======================');
                        
                        logger.info('Publishing vehicle details sensor configuration');
                        client.publish(sensorTopic, JSON.stringify(sensorConfig), { retain: true });
                        logger.info('Publishing vehicle details sensor state');
                        client.publish(stateTopic, JSON.stringify(sensorState), { retain: true });
                    }
                })
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('getVehicleDetails Command Error!', { error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                });
        }

        else if (command === 'getOnstarPlan') {
            // Handle getOnstarPlan command - doesn't take any parameters
            logger.warn('Command sent:', { command });
            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            
            commands.getOnstarPlan()
                .then(data => {
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    logger.warn('getOnstarPlan command completed');
                    logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                    
                    client.publish(
                        commandStatusTopic,
                        JSON.stringify({
                            "command": {
                                "error": {
                                    "message": "Completed Successfully",
                                    "response": {
                                        "status": 0,
                                        "statusText": "Completed Successfully"
                                    }
                                }
                            },
                            "completionTimestamp": completionTimestamp
                        }), { retain: true }
                    );
                    
                    // API returns data at data.data path (not response.data)
                    const responseData = _.get(data, 'response.data');
                    const directData = _.get(data, 'data');
                    const actualData = responseData || directData;
                    
                    if (actualData) {
                        // Extract the data - structure has vehicleDetails with planInfo inside
                        const vehicleDetails = actualData.vehicleDetails || actualData;
                        
                        const sensorTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/onstar_plan/config`;
                        const stateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/onstar_plan/state`;
                        
                        // Count active plans - planInfo is inside vehicleDetails
                        const planInfo = vehicleDetails.planInfo || [];
                        const activePlans = planInfo.filter(p => p.status === 'Active').length;
                        
                        const sensorConfig = {
                            name: `${mqttHA.vehicle} OnStar Plan`,
                            unique_id: `${mqttHA.instance}_onstar_plan`,
                            state_topic: stateTopic,
                            json_attributes_topic: stateTopic,
                            value_template: '{{ value_json.state }}',
                            icon: 'mdi:shield-car',
                            device: mqttHA.getDevicePayload(),
                            availability: {
                                topic: mqttHA.getAvailabilityTopic(),
                                payload_available: 'true',
                                payload_not_available: 'false'
                            }
                        };
                        
                        const sensorState = {
                            state: `${activePlans} Active`,
                            make: vehicleDetails.make,
                            model: vehicleDetails.model,
                            year: vehicleDetails.year,
                            active_plans: activePlans,
                            total_plans: planInfo.length,
                            plan_info: planInfo,
                            plan_expiry_info: vehicleDetails.planExpiryInfo || [],
                            last_updated: completionTimestamp
                        };
                        
                        logger.info('Publishing OnStar plan sensor configuration');
                        client.publish(sensorTopic, JSON.stringify(sensorConfig), { retain: true });
                        logger.info('Publishing OnStar plan sensor state');
                        client.publish(stateTopic, JSON.stringify(sensorState), { retain: true });
                        
                        // Log all OnStar plan details
                        logger.info('=== ONSTAR PLAN DETAILS ===');
                        logger.info(`Vehicle: ${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}`);
                        logger.info(`Active Plans: ${activePlans} of ${planInfo.length} total`);
                        logger.info('');
                        logger.info('All Plans:');
                        planInfo.forEach((plan, index) => {
                            logger.info(`  ${index + 1}. ${plan.productCode}`);
                            logger.info(`     Status: ${plan.status}`);
                            logger.info(`     Type: ${plan.productType}`);
                            logger.info(`     Billing: ${plan.billingCadence}`);
                            logger.info(`     Start Date: ${plan.startDate}`);
                            logger.info(`     End Date: ${plan.endDate || 'No end date'}`);
                            logger.info(`     Expiry Date: ${plan.expiryDate || 'N/A'}`);
                            logger.info(`     Trial: ${plan.isTrial ? 'Yes' : 'No'}`);
                            logger.info(`     Price Plan: ${plan.pricePlan}`);
                            if (plan.orderItemTags && plan.orderItemTags.length > 0) {
                                logger.info(`     Tags: ${plan.orderItemTags.join(', ')}`);
                            }
                            logger.info('');
                        });
                        if (vehicleDetails.planExpiryInfo && vehicleDetails.planExpiryInfo.length > 0) {
                            logger.info('Plan Expiry Info:');
                            vehicleDetails.planExpiryInfo.forEach(expiry => {
                                logger.info(`  - ${JSON.stringify(expiry)}`);
                            });
                        }
                        logger.info('===========================');
                    }
                })
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('getOnstarPlan Command Error!', { error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                });
        }

        else {
            logger.warn('Command sent:', { command }, { options });
            logger.warn(`Command Status Topic: ${commandStatusTopic}`);
            client.publish(commandStatusSensorConfig.topic, JSON.stringify(commandStatusSensorConfig.payload), { retain: true });
            client.publish(commandStatusSensorTimestampConfig.topic, JSON.stringify(commandStatusSensorTimestampConfig.payload), { retain: true });
            client.publish(commandStatusTopic,
                JSON.stringify({
                    "command": {
                        "error": {
                            "message": "Sent",
                            "response": {
                                "status": 0,
                                "statusText": "Sent"
                            }
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: true });
            commandFn(options || {})
                .then(data => {
                    // refactor the response handling for commands - Done!
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    logger.warn('Command completed:', { command });
                    logger.warn(`Command Status Topic: ${commandStatusTopic}`);
                    client.publish(
                        commandStatusTopic,
                        JSON.stringify({
                            "command": {
                                "error": {
                                    "message": "Completed Successfully",
                                    "response": {
                                        "status": 0,
                                        "statusText": "Completed Successfully"
                                    }
                                }
                            },
                            "completionTimestamp": completionTimestamp
                        }), { retain: true }
                    );
                    const responseData = _.get(data, 'response.data');
                    if (responseData) {
                        logger.warn('Command response data:', { responseData });
                        
                        // Handle getVehicleRecallInfo command - create recall sensor
                        if (command === 'getVehicleRecallInfo') {
                            const recallConfig = mqttHA.getVehicleRecallConfig();
                            const recallState = mqttHA.getVehicleRecallStatePayload(data.response);
                            const recallStateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_recalls/state`;
                            
                            logger.info('Publishing vehicle recall sensor configuration');
                            client.publish(recallConfig.topic, JSON.stringify(recallConfig.payload), { retain: true });
                            logger.info('Publishing vehicle recall sensor state');
                            client.publish(recallStateTopic, JSON.stringify(recallState), { retain: true });
                            
                            logger.info(`Recall sensor updated: ${recallState.recall_count} total recalls, ${recallState.active_recalls_count} active`);
                        }
                        
                        // Handle getEVChargingMetrics command - create EV charging sensors
                        if (command === 'getEVChargingMetrics') {
                            const evMetricsConfigs = mqttHA.getEVChargingMetricsConfigs(data.response);
                            
                            logger.info(`Publishing ${evMetricsConfigs.length} EV charging metric sensors...`);
                            evMetricsConfigs.forEach(config => {
                                // Publish config
                                client.publish(config.topic, JSON.stringify(config.payload), { retain: true });
                                // Publish state
                                client.publish(config.payload.state_topic, JSON.stringify(config.state), { retain: true });
                            });
                            
                            logger.info(`EV charging metrics updated: ${evMetricsConfigs.length} sensors published`);
                        }
                        
                        // API v3 uses telemetry.data.position and telemetry.data.velocity
                        const position = _.get(responseData, 'telemetry.data.position');
                        const velocity = _.get(responseData, 'telemetry.data.velocity');
                        if (position && position.lat && position.lng) {
                            const topic = mqttHA.getStateTopic({ name: command });
                            const deviceTrackerConfigTopic = mqttHA.getDeviceTrackerConfigTopic();
                            const vehicle = mqttHA.vehicle.toString();

                            const locationData = {
                                latitude: parseFloat(position.lat),
                                longitude: parseFloat(position.lng),
                                speed: velocity && velocity.spdInKph ? parseFloat(velocity.spdInKph) : 0,
                                direction: velocity && velocity.dir ? parseFloat(velocity.dir) : 0
                            };

                            const deviceTrackerConfig = {
                                "json_attributes_topic": topic,
                                "name": vehicle,
                                "unique_id": MQTT.convertName(vehicle) + '_device_tracker_' + onstarConfig.vin,
                            };

                            logger.debug(vehicle)

                            client.publish(topic, JSON.stringify(locationData), { retain: true });

                            client.publish(deviceTrackerConfigTopic, JSON.stringify(deviceTrackerConfig), { retain: true });
                            logger.warn(`Published device_tracker config to topic: ${deviceTrackerConfigTopic}`);
                            logger.warn(`Published location to topic: ${topic}`);
                            logger.debug("Device Tracker Config:", deviceTrackerConfig);
                        }
                    }
                })
                //.catch((err)=> {logger.error('Command error', {command, err})            
                //logger.info(commandStatusTopic);
                //client.publish(commandStatusTopic, CircularJSON.stringify({"Command": err}), {retain: true})});
                .catch((e) => {
                    if (e instanceof Error) {
                        const completionTimestamp = new Date().toISOString();
                        logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                        const errorPayload = {
                            error: normalizeError(e)
                        };
                        logger.error('Command Error!', { command, error: errorPayload });
                        logger.error(`Command Status Topic for Errored Command: ${commandStatusTopic}`);
                        client.publish(commandStatusTopic,
                            JSON.stringify({
                                "command": errorPayload,
                                "completionTimestamp": completionTimestamp
                            }), { retain: true });
                    }
                });
        }
    });
    const topic = mqttHA.getCommandTopic();
    logger.info(`Subscribed to command topic: ${topic}`);
    
    // Use Promise wrapper for regular mqtt.subscribe() with timeout
    await new Promise((resolve, reject) => {
        const timeout = global.setTimeout(() => {
            reject(new Error('MQTT subscription timeout'));
        }, 10000); // 10 second timeout
        
        client.subscribe(topic, (error, granted) => {
            global.clearTimeout(timeout);
            if (error) {
                logger.error('MQTT subscription error:', error);
                reject(error);
            } else {
                logger.debug('MQTT subscription successful:', granted);
                resolve();
            }
        });
    });

};

logger.info('!-- Starting OnStar2MQTT Polling --!');
(async () => {
    try {
        const commands = init();
        const vehicle = await getCurrentVehicle(commands);

        const mqttHA = new MQTT(vehicle, mqttConfig.prefix, mqttConfig.namePrefix);
        const availTopic = mqttHA.getAvailabilityTopic();
        const client = await connectMQTT(availTopic);
        await configureMQTT(commands, client, mqttHA);

        const configurations = new Map();
        const run = async () => {
            let topicArray;
            if (!mqttConfig.pollingStatusTopic) {
                topicArray = _.concat(mqttHA.getPollingStatusTopic(), '/', 'state');
            } else {
                topicArray = _.concat(mqttConfig.pollingStatusTopic, '/', 'state');
            }
            const pollingStatusTopicState = topicArray.map(item => item.topic || item).join('');
            logger.info(`pollingStatusTopicState: ${pollingStatusTopicState}`);

            const pollingStatusMessagePayload = mqttHA.createPollingStatusMessageSensorConfigPayload(pollingStatusTopicState, mqttConfig.listAllSensorsTogether);
            logger.debug("pollingStatusMessagePayload:", pollingStatusMessagePayload);
            const pollingStatusCodePayload = mqttHA.createPollingStatusCodeSensorConfigPayload(pollingStatusTopicState, mqttConfig.listAllSensorsTogether);
            logger.debug("pollingStatusCodePayload:", pollingStatusCodePayload);
            const pollingStatusMessageTimestampPayload = mqttHA.createPollingStatusTimestampSensorConfigPayload(pollingStatusTopicState, mqttConfig.listAllSensorsTogether);
            logger.debug("pollingStatusMessageTimestampPayload:", pollingStatusMessageTimestampPayload);

            client.publish(pollingStatusTopicState,
                JSON.stringify({
                    "error": {
                        "message": "Pending Initialization of OnStar2MQTT",
                        "response": {
                            "status": -2000,
                            "statusText": "Pending Initialization of OnStar2MQTT"
                        }
                    },
                    "completionTimestamp": new Date().toISOString()
                }), { retain: false })

            if (!buttonConfigsPublished) {
                client.publish(pollingStatusMessagePayload.topic, JSON.stringify(pollingStatusMessagePayload.payload), { retain: true });
                client.publish(pollingStatusCodePayload.topic, JSON.stringify(pollingStatusCodePayload.payload), { retain: true });
                client.publish(pollingStatusMessageTimestampPayload.topic, JSON.stringify(pollingStatusMessageTimestampPayload.payload), { retain: true });
                logger.info(`Polling Status Message Sensors Published!`);
            }

            let topicArrayTF;
            if (!mqttConfig.pollingStatusTopic) {
                topicArrayTF = _.concat(mqttHA.getPollingStatusTopic(), '/', 'lastpollsuccessful');
            } else {
                topicArrayTF = _.concat(mqttConfig.pollingStatusTopic, '/', 'lastpollsuccessful');
            }
            const pollingStatusTopicTF = topicArrayTF.map(item => item.topic || item).join('');
            logger.info(`pollingStatusTopicTF, ${pollingStatusTopicTF}`);

            if (!buttonConfigsPublished) {
                const pollingStatusTFPayload = mqttHA.createPollingStatusTFSensorConfigPayload(pollingStatusTopicTF, mqttConfig.listAllSensorsTogether);
                logger.debug("pollingStatusTFPayload:", pollingStatusTFPayload);
                client.publish(pollingStatusTFPayload.topic, JSON.stringify(pollingStatusTFPayload.payload), { retain: true });
                logger.info(`Polling Status TF Sensor Published!`);
            }

            client.publish(pollingStatusTopicTF, "false", { retain: true });

            const states = new Map();
            const v = vehicle;
            logger.info('Requesting diagnostics');
            logger.debug(`GetSupported: ${v.getSupported()}`);

            if (!buttonConfigsPublished) {
                const sensors = [
                    { name: 'oil_life', component: null, icon: 'mdi:oil-level' },
                    // Tire pressure message sensors removed - OnStar API does not provide tire pressure messages
                    // Only provides STATUS values (TPM_STATUS_NOMINAL, etc.) which are already captured in tire pressure status sensors
                ];

                for (let sensor of sensors) {
                    const sensorMessagePayload = mqttHA.createSensorMessageConfigPayload(sensor.name, sensor.component, sensor.icon);
                    logger.debug(`Sensor Message Payload: ${sensor.name}, ${sensor.component}`, sensorMessagePayload);
                    client.publish(sensorMessagePayload.topic, JSON.stringify(sensorMessagePayload.payload), { retain: true });
                }
                logger.info(`Sensor Message Configs Published!`);
            }

            function publishButtonConfigs() {
                // Only run on initial startup
                if (!buttonConfigsPublished) {
                    // Get supported commands            
                    logger.debug(`Supported Commands: ${v.getSupportedCommands()}`);

                    // Get button configs and payloads
                    let tasks;
                    if (mqttConfig.listAllSensorsTogether === true) {
                        tasks = [
                            mqttHA.createButtonConfigPayload(v),
                        ];
                    } else {
                        tasks = [
                            mqttHA.createButtonConfigPayload(v),
                            mqttHA.createButtonConfigPayloadCSMG(v),
                        ];
                    }

                    tasks.forEach(({ buttonConfigs, configPayloads }, taskIndex) => {
                        // Publish button config and payload for each button in first set
                        buttonConfigs.forEach((buttonConfig, index) => {
                            const configPayload = configPayloads[index];
                            const buttonType = taskIndex === 0 ? "Button" : "Button for Command Status";
                            logger.warn(`${buttonType} Config Topic: ${JSON.stringify(buttonConfig)}`);
                            logger.debug(`${buttonType} Config Payload: ${JSON.stringify(configPayload)}`);

                            // Publish configPayload as the payload to the respective MQTT topic
                            logger.debug(`Publishing ${buttonType} Config: ${buttonConfig} Payload: ${JSON.stringify(configPayload)}`);
                            client.publish(buttonConfig, JSON.stringify(configPayload), { retain: true });
                        });
                    });
                    buttonConfigsPublished = 'true';
                    logger.info(`Button Configs Published!`);
                }
            }
            publishButtonConfigs();

                        // Publish vehicle image entity
            async function downloadAndCacheImage(imageUrl) {
                try {
                    logger.info('Downloading vehicle image for caching...');
                    const response = await axios.get(imageUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000, // 30 second timeout
                        headers: {
                            'User-Agent': 'OnStar2MQTT/2.1.1'
                        }
                    });
                    
                    // Convert to base64 (raw format for HA image_topic)
                    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                    
                    // Cache as raw base64 for HA image entity
                    cachedVehicleImageBase64 = base64Image;
                    logger.info(`Vehicle image downloaded and cached (${Math.round(base64Image.length / 1024)}KB)`);
                    
                    return cachedVehicleImageBase64;
                } catch (e) {
                    logger.error('Failed to download vehicle image:', e.message);
                    return null;
                }
            }

            async function publishVehicleImage() {
                const imageConfig = mqttHA.getVehicleImageConfig();
                const imageStateTopic = `${mqttHA.prefix}/image/${mqttHA.instance}/vehicle_image/state`;
                
                try {
                    logger.info('Publishing vehicle image entity...');
                    const vehiclesRes = await commands.getAccountVehicles();
                    const vehiclesData = _.get(vehiclesRes, 'data.vehicles') || _.get(vehiclesRes, 'response.data.vehicles');
                    const currentVehicleData = _.find(vehiclesData, vehicle => 
                        vehicle.vin.toLowerCase() === onstarConfig.vin.toLowerCase()
                    );
                    
                    if (currentVehicleData && currentVehicleData.imageUrl) {
                        const imageUrl = mqttHA.getVehicleImageStatePayload(currentVehicleData);
                        
                        // Download and cache the image (or use cached version)
                        let imageData = cachedVehicleImageBase64;
                        if (!imageData) {
                            imageData = await downloadAndCacheImage(imageUrl);
                        }
                        
                        // Always publish config to ensure entity exists
                        await publishAsync(client, imageConfig.topic, JSON.stringify(imageConfig.payload), { retain: true });
                        
                        if (imageData) {
                            // Publish base64 image data for HA to cache locally
                            await publishAsync(client, imageStateTopic, imageData, { retain: true });
                            logger.info('Vehicle image published with cached base64 data');
                        } else {
                            // Fallback to URL if download failed
                            await publishAsync(client, imageStateTopic, imageUrl, { retain: true });
                            logger.warn('Vehicle image published with URL (download failed, using fallback)');
                        }
                    } else {
                        // Publish config anyway so entity exists but mark as unavailable
                        logger.warn('No vehicle image URL found - entity will be created but marked unavailable');
                        await publishAsync(client, imageConfig.topic, JSON.stringify(imageConfig.payload), { retain: true });
                        await publishAsync(client, imageStateTopic, '', { retain: true });
                    }
                } catch (e) {
                    // On error, still create the entity but with empty state
                    logger.error('Error publishing vehicle image, entity will be created but unavailable:', e);
                    try {
                        await publishAsync(client, imageConfig.topic, JSON.stringify(imageConfig.payload), { retain: true });
                        await publishAsync(client, imageStateTopic, '', { retain: true });
                    } catch (publishError) {
                        logger.error('Failed to publish vehicle image entity config:', publishError);
                    }
                }
            }
            await publishVehicleImage();

            // Publish vehicle recall sensor
            async function publishVehicleRecalls() {
                try {
                    logger.info('Publishing vehicle recall sensor...');
                    const recallRes = await commands.getVehicleRecallInfo();
                    
                    logger.debug('Recall response:', JSON.stringify(recallRes));
                    
                    // Try different response paths
                    const responseData = recallRes?.response || recallRes;
                    const hasData = _.get(responseData, 'data.vehicleDetails.recallInfo') || 
                                   _.get(responseData, 'data.dataPresent');
                    
                    if (responseData && hasData !== undefined) {
                        const recallConfig = mqttHA.getVehicleRecallConfig();
                        const recallState = mqttHA.getVehicleRecallStatePayload(responseData);
                        const recallStateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_recalls/state`;
                        
                        // Publish config and state
                        await publishAsync(client, recallConfig.topic, JSON.stringify(recallConfig.payload), { retain: true });
                        await publishAsync(client, recallStateTopic, JSON.stringify(recallState), { retain: true });
                        
                        logger.info(`Vehicle recall sensor published: ${recallState.recall_count} total recalls, ${recallState.active_recalls_count} active`);
                    } else {
                        logger.warn('No recall data received from getVehicleRecallInfo');
                        const recallConfig = mqttHA.getVehicleRecallConfig();
                        const emptyState = mqttHA.getVehicleRecallStatePayload({ data: { vehicleDetails: { recallInfo: [] } } });
                        const recallStateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_recalls/state`;
                        
                        await publishAsync(client, recallConfig.topic, JSON.stringify(recallConfig.payload), { retain: true });
                        await publishAsync(client, recallStateTopic, JSON.stringify(emptyState), { retain: true });
                        logger.info('Vehicle recall sensor created with empty state (no recalls found)');
                    }
                } catch (e) {
                    logger.error('Error publishing vehicle recall sensor:', e);
                    // Still create the sensor even on error
                    try {
                        const recallConfig = mqttHA.getVehicleRecallConfig();
                        const emptyState = mqttHA.getVehicleRecallStatePayload({ data: { vehicleDetails: { recallInfo: [] } } });
                        const recallStateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_recalls/state`;
                        
                        await publishAsync(client, recallConfig.topic, JSON.stringify(recallConfig.payload), { retain: true });
                        await publishAsync(client, recallStateTopic, JSON.stringify(emptyState), { retain: true });
                        logger.info('Vehicle recall sensor created with empty state due to error');
                    } catch (publishError) {
                        logger.error('Failed to publish vehicle recall sensor config:', publishError);
                    }
                }
            }
            await publishVehicleRecalls();

            const statsRes = await commands.diagnostics({ diagnosticItem: v.getSupported() });
            logger.info('Diagnostic request status', { status: _.get(statsRes, 'status') });
            
            // API CHANGE: New API v3 format changes diagnostic response structure
            // Old path: response.data.commandResponse.body.diagnosticResponse (array)
            // New path: response.data.diagnostics (array within HealthStatusResponse object)
            let diagnosticResponses = _.get(statsRes, 'response.data.commandResponse.body.diagnosticResponse');
            
            // If old path doesn't exist, try new API v3 path  
            if (!diagnosticResponses) {
                diagnosticResponses = _.get(statsRes, 'response.data.diagnostics');
            }
            
            const stats = _.map(
                diagnosticResponses,
                d => new Diagnostic(d)
            );
            logger.debug('Diagnostic request response:', { stats: _.map(stats, s => s.toString()) });

            // API CHANGE: Process advanced diagnostics from API v3
            let advancedDiagnostic = null;
            const advDiagnosticsResponse = _.get(statsRes, 'response.data.advDiagnostics');
            if (advDiagnosticsResponse && advDiagnosticsResponse.diagnosticSystems) {
                advancedDiagnostic = new AdvancedDiagnostic(advDiagnosticsResponse);
                logger.debug('Advanced diagnostic response:', { advDiag: advancedDiagnostic.toString() });
            }

            for (const s of stats) {
                if (!s.hasElements()) {
                    continue;
                }
                // configure once, then set or update states
                for (const d of s.diagnosticElements) {
                    const topic = mqttHA.getConfigTopic(d)
                    const payload = mqttHA.getConfigPayload(s, d);
                    configurations.set(topic, { configured: false, payload });
                }
                
                // API CHANGE: Add configs for group-level status fields (API v3)
                const statusConfigs = mqttHA.getStatusFieldConfigs(s);
                for (const { topic, payload } of statusConfigs) {
                    configurations.set(topic, { configured: false, payload });
                }

                const topic = mqttHA.getStateTopic(s);
                const payload = mqttHA.getStatePayload(s);
                states.set(topic, payload);
            }
            
            // API CHANGE: Configure and publish advanced diagnostics sensors (API v3)
            if (advancedDiagnostic && advancedDiagnostic.hasSystems()) {
                for (const system of advancedDiagnostic.diagnosticSystems) {
                    const { topic, payload } = mqttHA.getAdvancedDiagnosticConfig(system, advancedDiagnostic.cts);
                    configurations.set(topic, { configured: false, payload });
                }
                
                const advStateTopic = `homeassistant/${v.vin}/adv_diag/state`;
                const advStatePayload = mqttHA.getAdvancedDiagnosticStatePayload(advancedDiagnostic);
                states.set(advStateTopic, advStatePayload);
            }
            
            const publishes = [];
            // publish sensor configs
            for (let [topic, config] of configurations) {
                // configure once
                if (!config.configured) {
                    config.configured = true;
                    const { payload } = config;
                    logger.info('Publishing message:', { topic, payload });
                    publishes.push(
                        publishAsync(client, topic, JSON.stringify(payload), { retain: true })
                    );
                }
            }
            // update sensor states
            for (let [topic, state] of states) {
                logger.info('Publishing message:', { topic, state });
                publishes.push(
                    publishAsync(client, topic, JSON.stringify(state), { retain: true })
                );
            }

            await Promise.all(publishes);

            const completionTimestamp = new Date().toISOString();
            logger.debug(`Completion Timestamp: ${completionTimestamp}`);
            //client.publish(pollingStatusTopicState, JSON.stringify({"ok":{"message":"Data Polled Successfully"}}), {retain: false});
            client.publish(pollingStatusTopicState,
                JSON.stringify({
                    "error": {
                        "message": "N/A",
                        "response": {
                            "status": 0,
                            "statusText": "N/A"
                        }
                    },
                    "completionTimestamp": completionTimestamp
                }), { retain: true })
            client.publish(pollingStatusTopicTF, "true", { retain: true });
        };

        let isRunning = false;
        const main = async () => {
            if (isRunning) {
                logger.warn('Previous polling operation still running, skipping this interval');
                return;
            }
            
            isRunning = true;
            try {
                logger.debug('Starting main function run()');
                await run();
                logger.debug('Main function run() completed successfully');
                logger.info('Updates complete, sleeping.');
            } catch (e) {
                logger.error('Error in main function run():', e);
                
                let topicArray;
                if (!mqttConfig.pollingStatusTopic) {
                    topicArray = _.concat(mqttHA.getPollingStatusTopic(), '/', 'state');
                } else {
                    topicArray = _.concat(mqttConfig.pollingStatusTopic, '/', 'state');
                }
                const pollingStatusTopicState = topicArray.map(item => item.topic || item).join('');
                logger.debug('pollingStatusTopicState', { pollingStatusTopicState });

                let topicArrayTF;
                if (!mqttConfig.pollingStatusTopic) {
                    topicArrayTF = _.concat(mqttHA.getPollingStatusTopic(), '/', 'lastpollsuccessful');
                } else {
                    topicArrayTF = _.concat(mqttConfig.pollingStatusTopic, '/', 'lastpollsuccessful');
                }
                const pollingStatusTopicTF = topicArrayTF.map(item => item.topic || item).join('');
                logger.debug('pollingStatusTopicTF', { pollingStatusTopicTF });

                if (e instanceof Error) {
                    const errorPayload = {
                        error: normalizeError(e)
                    };
                    const completionTimestamp = new Date().toISOString();
                    logger.debug(`Completion Timestamp: ${completionTimestamp}`);
                    client.publish(pollingStatusTopicState,
                        JSON.stringify({
                            ...errorPayload,
                            "completionTimestamp": completionTimestamp
                        }), { retain: true })
                    logger.error('Error Polling Data:', { error: errorPayload });
                    client.publish(pollingStatusTopicTF, "false", { retain: true })

                } else {
                    const completionTimestamp = new Date().toISOString();
                    // For non-Error objects, wrap in a basic structure
                    const errorPayload = {
                        error: {
                            message: String(e),
                            response: { status: 0, statusText: 'Unknown Error' }
                        }
                    };
                    client.publish(pollingStatusTopicState,
                        JSON.stringify({
                            ...errorPayload,
                            "completionTimestamp": completionTimestamp
                        }), { retain: true })
                    logger.error('Error Polling Data:', { error: errorPayload });
                    client.publish(pollingStatusTopicTF, "false", { retain: true })
                }
            } finally {
                isRunning = false;
            }
        };

        // Run initial poll after a short delay to avoid overlapping with setup
        global.setTimeout(() => {
            main();
        }, 5000);

        let refreshInterval;
        const refreshIntervalTopic = mqttHA.getRefreshIntervalTopic();
        const refreshIntervalCurrentValTopic = mqttHA.getRefreshIntervalCurrentValTopic();
        logger.info(`refreshIntervalTopic: ${refreshIntervalTopic}`);
        logger.info(`refreshIntervalCurrentValTopic: ${refreshIntervalCurrentValTopic}`);

        if (!refreshIntervalConfigPublished) {
            const pollingRefreshIntervalPayload = mqttHA.createPollingRefreshIntervalSensorConfigPayload(refreshIntervalCurrentValTopic, mqttConfig.listAllSensorsTogether);
            logger.debug("pollingRefreshIntervalSensorConfigPayload:", pollingRefreshIntervalPayload);
            client.publish(pollingRefreshIntervalPayload.topic, JSON.stringify(pollingRefreshIntervalPayload.payload), { retain: true });
            refreshIntervalConfigPublished = 'true';
            logger.info(`Polling Refresh Interval Sensor Published!`);
        }

        // Subscribe to the topic
        client.subscribe(refreshIntervalTopic);
        // Set initial interval
        refreshInterval = setInterval(main, onstarConfig.refreshInterval);
        logger.info(`Initial refreshInterval: ${onstarConfig.refreshInterval}`);
        client.publish(refreshIntervalCurrentValTopic, onstarConfig.refreshInterval.toString(), { retain: true });
        //client.publish(refreshIntervalTopic, onstarConfig.refreshInterval.toString(), { retain: true });

        // Set up recall checking on a separate interval
        const checkRecalls = async () => {
            try {
                logger.info('Checking vehicle recalls...');
                const recallData = await commands.getVehicleRecallInfo();
                
                if (recallData && recallData.response) {
                    const recallConfig = mqttHA.getVehicleRecallConfig();
                    const recallState = mqttHA.getVehicleRecallStatePayload(recallData.response);
                    const recallStateTopic = `${mqttHA.prefix}/sensor/${mqttHA.instance}/vehicle_recalls/state`;
                    
                    await publishAsync(client, recallConfig.topic, JSON.stringify(recallConfig.payload), { retain: true });
                    await publishAsync(client, recallStateTopic, JSON.stringify(recallState), { retain: true });
                    
                    logger.info(`Recall sensor updated: ${recallState.recall_count} total recalls, ${recallState.active_recalls_count} active`);
                    
                    if (recallState.active_recalls_count > 0) {
                        logger.warn(`⚠️  Vehicle has ${recallState.active_recalls_count} active recall(s)!`);
                    }
                } else {
                    logger.warn('No recall data received from getVehicleRecallInfo');
                }
            } catch (e) {
                logger.error('Error checking recalls:', e);
            }
        };
        
        // Initial recall check on startup
        await checkRecalls();
        
        // Set up periodic recall checking
        setInterval(checkRecalls, onstarConfig.recallRefreshInterval);
        logger.info(`Recall check interval set to ${onstarConfig.recallRefreshInterval}ms (${onstarConfig.recallRefreshInterval / (60 * 60 * 1000)} hours)`);

        client.on('message', async (topic, message) => {
            if (topic === refreshIntervalTopic) {
                const newRefreshInterval = parseInt(message.toString());
                // Clear previous interval
                clearInterval(refreshInterval);
                // Start new interval with updated refresh interval
                refreshInterval = setInterval(main, newRefreshInterval);
                logger.info(`Updated refreshInterval to ${newRefreshInterval}`);
                client.publish(refreshIntervalCurrentValTopic, newRefreshInterval.toString(), { retain: true });
            }
        });

    } catch (e) {
        logger.error('Main function error:', { error: e, message: e.message, stack: e.stack });
    }
})();
