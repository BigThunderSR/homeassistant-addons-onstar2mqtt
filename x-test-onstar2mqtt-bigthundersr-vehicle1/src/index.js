const OnStar = require('onstarjs');
const mqtt = require('async-mqtt');
const uuidv4 = require('uuid').v4;
const _ = require('lodash');
const Vehicle = require('./vehicle');
const { Diagnostic } = require('./diagnostic');
const MQTT = require('./mqtt');
const Commands = require('./commands');
const logger = require('./logger');
const fs = require('fs');
//const CircularJSON = require('circular-json');


const onstarConfig = {
    deviceId: process.env.ONSTAR_DEVICEID || uuidv4(),
    vin: process.env.ONSTAR_VIN,
    username: process.env.ONSTAR_USERNAME,
    password: process.env.ONSTAR_PASSWORD,
    onStarPin: process.env.ONSTAR_PIN,
    checkRequestStatus: _.get(process.env, 'ONSTAR_SYNC', 'true') === 'true',
    refreshInterval: parseInt(process.env.ONSTAR_REFRESH) || (30 * 60 * 1000), // 30 min
    requestPollingIntervalSeconds: parseInt(process.env.ONSTAR_POLL_INTERVAL) || 6, // 6 sec default
    requestPollingTimeoutSeconds: parseInt(process.env.ONSTAR_POLL_TIMEOUT) || 90, // 60 sec default
    allowCommands: _.get(process.env, 'ONSTAR_ALLOW_COMMANDS', 'true') === 'true'
};

const onstarRequiredProperties = {
    vin: 'ONSTAR_VIN',
    username: 'ONSTAR_USERNAME',
    password: 'ONSTAR_PASSWORD',
    onStarPin: 'ONSTAR_PIN'
};

for (let prop in onstarRequiredProperties) {
    if (!onstarConfig[prop]) {
        throw new Error(`"${onstarRequiredProperties[prop]}" is not defined`);
    }
}

if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('OnStar Config:', { onstarConfig });
} else {
    logger.info('OnStar Config:', { onstarConfig: { ...onstarConfig, password: '********', onStarPin: '####' } });
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
    ca: process.env.MQTT_CA_FILE ? [fs.readFileSync(process.env.MQTT_CA_FILE)] : undefined,
    cert: process.env.MQTT_CERT_FILE ? fs.readFileSync(process.env.MQTT_CERT_FILE) : undefined,
    key: process.env.MQTT_KEY_FILE ? fs.readFileSync(process.env.MQTT_KEY_FILE) : undefined,
};

const mqttRequiredProperties = {
    username: 'MQTT_USERNAME',
    password: 'MQTT_PASSWORD',
    pollingStatusTopic: 'MQTT_ONSTAR_POLLING_STATUS_TOPIC'
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
    const vehicles = _.map(
        _.get(vehiclesRes, 'response.data.vehicles.vehicle'),
        v => new Vehicle(v)
    );
    logger.debug('Vehicle request response', { vehicles: _.map(vehicles, v => v.toString()) });
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
    const config = {
        username: mqttConfig.username,
        password: mqttConfig.password,
        rejectUnauthorized: mqttConfig.rejectUnauthorized,
        will: { topic: availabilityTopic, payload: 'false', retain: true }
    };
    logger.info('Connecting to MQTT:', { url, config: _.omit(config, 'password') });

    const client = await mqtt.connectAsync(url, config);
    logger.info('Connected to MQTT!');
    return client; 
}

const configureMQTT = async (commands, client, mqttHA) => {
    if (!onstarConfig.allowCommands)
        return;

    client.on('message', (topic, message) => {
        logger.debug('Subscription message:', { topic, message });
        const { command, options } = JSON.parse(message);
        const cmd = commands[command];
        const topicArray = _.concat({ topic }, '/', { command }.command, '/', 'state');
        const commandStatusTopic = topicArray.map(item => item.topic || item).join('');
        if (!cmd) {
            logger.error('Command not found', { command });
            return;
        }
        const commandFn = cmd.bind(commands);
        logger.debug('List of const', { command, cmd, commandFn, options });
        if (command === 'diagnostics' || command === 'enginerpm') {
            logger.warn('Command sent:', { command });
            logger.warn('Command Status Topic:', { commandStatusTopic });
            client.publish(commandStatusTopic, JSON.stringify({ "Command": "Sent" }), { retain: true });
            (async () => {
                const states = new Map();
                const statsRes = await commands[command]({ command });
                logger.debug({ statsRes });
                logger.info('Diagnostic request status', { status: _.get(statsRes, 'status') });
                logger.debug('Diagnostic Response Body from Command', statsRes.response.data.commandResponse.body.diagnosticResponse);
                // Make sure the response is always an array
                const diagnosticResponses = _.get(statsRes, 'response.data.commandResponse.body.diagnosticResponse');
                const diagArray = Array.isArray(diagnosticResponses) ? diagnosticResponses : [diagnosticResponses];
                const stats = _.map(
                    diagArray,
                    (d, index) => {
                        logger.debug('Diagnostic Array', { ...d, number: index + 1 });
                        return new Diagnostic({ ...d, number: index + 1 });
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
                        client.publish(topic, JSON.stringify(state), { retain: true })
                    );
                }
                await Promise.all(publishes);
            })()
                .catch((e) => {
                    if (e instanceof Error) {
                        const errorPayload = {
                            error: _.pick(e, [
                                'message',
                                'response.status',
                                'response.statusText',
                                'response.headers',
                                'response.data',
                                'request.method',
                                'request.body',
                                'request.contentType',
                                'request.headers',
                                'request.url',
                                'stack'
                            ])
                        };
                        //const errorJson = JSON.stringify(errorPayload);
                        logger.error('Command Error!', { command, error: errorPayload });
                        logger.error('Command Status Topic for Errored Command:', { commandStatusTopic });
                        client.publish(commandStatusTopic, JSON.stringify({ "Command": errorPayload }), { retain: true });
                    }
                })
        }
        else {
            logger.warn('Command sent:', { command });
            logger.warn('Command Status Topic:', { commandStatusTopic });
            client.publish(commandStatusTopic, JSON.stringify({ "Command": "Sent" }), { retain: true });
            commandFn(options || {})
                .then(data => {
                    // refactor the response handling for commands - Done!
                    logger.warn('Command completed:', { command });
                    logger.warn('Command Status Topic:', { commandStatusTopic });
                    client.publish(commandStatusTopic, JSON.stringify({ "Command": { "error": { "message": "Completed Successfully", "response": { "status": 0, "statusText": "Completed Successfully" } } } }), { retain: true });
                    const responseData = _.get(data, 'response.data');
                    if (responseData) {
                        logger.warn('Command response data:', { responseData });
                        const location = _.get(data, 'response.data.commandResponse.body.location');
                        if (location) {
                            const topic = mqttHA.getStateTopic({ name: command });
                            // TODO create device_tracker entity. MQTT device tracker doesn't support lat/lon and mqtt_json
                            // doesn't have discovery
                            client.publish(topic,
                                JSON.stringify({ latitude: location.lat, longitude: location.long }), { retain: true })
                                .then(() => logger.warn('Published location to topic.', { topic }));
                        }
                    }
                })
                //.catch((err)=> {logger.error('Command error', {command, err})            
                //logger.info(commandStatusTopic);
                //client.publish(commandStatusTopic, CircularJSON.stringify({"Command": err}), {retain: true})});
                .catch((e) => {
                    if (e instanceof Error) {
                        const errorPayload = {
                            error: _.pick(e, [
                                'message',
                                'response.status',
                                'response.statusText',
                                'response.headers',
                                'response.data',
                                'request.method',
                                'request.body',
                                'request.contentType',
                                'request.headers',
                                'request.url',
                                'stack'
                            ])
                        };
                        //const errorJson = JSON.stringify(errorPayload);
                        logger.error('Command Error!', { command, error: errorPayload });
                        logger.error('Command Status Topic for Errored Command:', { commandStatusTopic });
                        client.publish(commandStatusTopic, JSON.stringify({ "Command": errorPayload }), { retain: true });
                    }
                });
        }
    });
    const topic = mqttHA.getCommandTopic();
    logger.info('Subscribed to command topic:', { topic });
    await client.subscribe(topic);

};

logger.info('Starting OnStar2MQTT Polling');
(async () => {
    try {
        const commands = init();
        const vehicle = await getCurrentVehicle(commands);

        const mqttHA = new MQTT(vehicle, mqttConfig.prefix, mqttConfig.namePrefix);
        const availTopic = mqttHA.getAvailabilityTopic();
        const client = await connectMQTT(availTopic);
        client.publish(availTopic, 'true', { retain: true })
            .then(() => logger.debug('Published availability'));
        await configureMQTT(commands, client, mqttHA);

        const configurations = new Map();
        const run = async () => {
            const topicArray = _.concat(mqttConfig.pollingStatusTopic, '/', 'state');
            const pollingStatusTopicState = topicArray.map(item => item.topic || item).join('');
            client.publish(pollingStatusTopicState, JSON.stringify({ "error": { "message": "Pending Initialization of OnStar2MQTT", "response": { "status": -2000, "statusText": "Pending Initialization of OnStar2MQTT" } } }), { retain: false })
            const topicArrayTF = _.concat(mqttConfig.pollingStatusTopic, '/', 'lastpollsuccessful');
            const pollingStatusTopicTF = topicArrayTF.map(item => item.topic || item).join('');
            client.publish(pollingStatusTopicTF, "false", { retain: true });
            const states = new Map();
            const v = vehicle;
            logger.info('Requesting diagnostics');
            const statsRes = await commands.diagnostics({ diagnosticItem: v.getSupported() });
            logger.info('Diagnostic request status', { status: _.get(statsRes, 'status') });
            const stats = _.map(
                _.get(statsRes, 'response.data.commandResponse.body.diagnosticResponse'),
                d => new Diagnostic(d)
            );
            logger.debug('Diagnostic request response:', { stats: _.map(stats, s => s.toString()) });

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

                const topic = mqttHA.getStateTopic(s);
                const payload = mqttHA.getStatePayload(s);
                states.set(topic, payload);
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
                        client.publish(topic, JSON.stringify(payload), { retain: true })
                    );
                }
            }
            // update sensor states
            for (let [topic, state] of states) {
                logger.info('Publishing message:', { topic, state });
                publishes.push(
                    client.publish(topic, JSON.stringify(state), { retain: true })
                );
            }
            await Promise.all(publishes);
            //client.publish(pollingStatusTopicState, JSON.stringify({"ok":{"message":"Data Polled Successfully"}}), {retain: false})
            client.publish(pollingStatusTopicState, JSON.stringify({ "error": { "message": "N/A", "response": { "status": 0, "statusText": "N/A" } } }), { retain: true })
            client.publish(pollingStatusTopicTF, "true", { retain: true });
        };

        const main = async () => run()

            .then(() => logger.info('Updates complete, sleeping.'))
            .catch((e) => {
                const topicArray = _.concat(mqttConfig.pollingStatusTopic, '/', 'state');
                const pollingStatusTopicState = topicArray.map(item => item.topic || item).join('');
                const topicArrayTF = _.concat(mqttConfig.pollingStatusTopic, '/', 'lastpollsuccessful');
                const pollingStatusTopicTF = topicArrayTF.map(item => item.topic || item).join('');
                if (e instanceof Error) {
                    const errorPayload = {
                        error: _.pick(e, [
                            'message',
                            'response.status',
                            'response.statusText',
                            'response.headers',
                            'response.data',
                            'request.method',
                            'request.body',
                            'request.contentType',
                            'request.headers',
                            'request.url',
                            'stack'
                        ])
                    };
                    const errorJson = JSON.stringify(errorPayload);
                    client.publish(pollingStatusTopicState, errorJson, { retain: true });
                    logger.error('Error Polling Data:', { error: errorPayload });
                    client.publish(pollingStatusTopicTF, "false", { retain: true })

                } else {
                    const errorJson = JSON.stringify({ error: e })
                    client.publish(pollingStatusTopicState, errorJson, { retain: true });
                    logger.error('Error Polling Data:', { error: e });
                    client.publish(pollingStatusTopicTF, "false", { retain: true })
                }
            });

        await main();
        setInterval(main, onstarConfig.refreshInterval);
    } catch (e) {
        logger.error('Main function error:', { error: e });
    }
})();
