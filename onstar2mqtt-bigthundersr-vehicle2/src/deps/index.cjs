'use strict';

var axios = require('axios');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var uuid = require('uuid');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var appId = "OMB_CVY_iOS_6Y2";
var appSecret = "KXbtAmTMVT9Pczz8UkhLSu3RHrjevKgLecwD";
var optionalClientScope = "";
var requiredClientScope = "onstar gmoc user_trailer user priv";
var serviceUrl = "https://api.gm.com";
var userAgent = "myChevrolet/118 CFNetwork/1408.0.4 Darwin/22.5.0";
var onStarAppConfig = {
	appId: appId,
	appSecret: appSecret,
	optionalClientScope: optionalClientScope,
	requiredClientScope: requiredClientScope,
	serviceUrl: serviceUrl,
	userAgent: userAgent
};

class TokenHandler {
    constructor(config) {
        this.config = config;
    }
    static authTokenIsValid(authToken) {
        return authToken.expiration > Date.now() + 5 * 60 * 1000;
    }
    createUpgradeJWT() {
        const payload = {
            client_id: onStarAppConfig.appId,
            credential: this.config.onStarPin,
            credential_type: "PIN",
            device_id: this.config.deviceId,
            grant_type: "password",
            nonce: this.generateNonce(),
            timestamp: this.generateTimestamp(),
        };
        return jwt.sign(payload, onStarAppConfig.appSecret, { noTimestamp: true });
    }
    createAuthJWT() {
        const payload = {
            client_id: onStarAppConfig.appId,
            device_id: this.config.deviceId,
            grant_type: "password",
            nonce: this.generateNonce(),
            password: this.config.password,
            scope: onStarAppConfig.requiredClientScope,
            timestamp: this.generateTimestamp(),
            username: this.config.username,
        };
        return jwt.sign(payload, onStarAppConfig.appSecret, { noTimestamp: true });
    }
    decodeAuthRequestResponse(encodedToken) {
        const authToken = this.decodeToken(encodedToken);
        authToken.expiration = Date.now() + authToken.expires_in * 1000;
        return authToken;
    }
    decodeToken(token) {
        const authToken = jwt.verify(token, onStarAppConfig.appSecret);
        authToken.expiration = 0;
        authToken.upgraded = false;
        return authToken;
    }
    generateTimestamp() {
        const date = new Date();
        date.setMilliseconds(1);
        return date.toISOString();
    }
    generateNonce() {
        const uuidHex = Buffer.from(uuid.v4(), "utf8").toString("hex");
        const shaHex = crypto.createHash("sha256").update(uuidHex).digest("hex");
        // base32 was used in gm-onstar-probe
        return Buffer.from(shaHex).toString("base64").substring(0, 26);
    }
}

var RequestMethod;
(function (RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
})(RequestMethod || (RequestMethod = {}));
class Request {
    constructor(url) {
        this.method = RequestMethod.Post;
        this.body = "{}";
        this.contentType = "application/json; charset=UTF-8";
        this.authRequired = true;
        this.upgradeRequired = false;
        this.checkRequestStatus = null;
        this.headers = {};
        this.url = url;
    }
    getUrl() {
        return this.url;
    }
    getMethod() {
        return this.method;
    }
    setMethod(method) {
        this.method = method;
        return this;
    }
    getHeaders() {
        return this.headers;
    }
    setHeaders(headers) {
        this.headers = headers;
        return this;
    }
    getBody() {
        return this.body;
    }
    setBody(body) {
        if (typeof body === "object") {
            body = JSON.stringify(body);
        }
        this.body = body;
        return this;
    }
    isAuthRequired() {
        return this.authRequired;
    }
    setAuthRequired(authRequired) {
        this.authRequired = authRequired;
        return this;
    }
    isUpgradeRequired() {
        return this.upgradeRequired;
    }
    setUpgradeRequired(upgradeRequired) {
        this.upgradeRequired = upgradeRequired;
        return this;
    }
    getContentType() {
        return this.contentType;
    }
    setContentType(type) {
        this.contentType = type;
        return this;
    }
    getCheckRequestStatus() {
        return this.checkRequestStatus;
    }
    setCheckRequestStatus(checkStatus) {
        this.checkRequestStatus = checkStatus;
        return this;
    }
}

class RequestResult {
    constructor(status) {
        this.status = status;
    }
    setResponse(response) {
        this.response = response;
        return this;
    }
    setMessage(message) {
        this.message = message;
        return this;
    }
    getResult() {
        const result = {
            status: this.status,
        };
        if (this.response) {
            result.response = this.response;
        }
        if (this.message) {
            result.message = this.message;
        }
        return result;
    }
}

class RequestError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, RequestError);
    }
    getResponse() {
        return this.response;
    }
    setResponse(response) {
        this.response = response;
        return this;
    }
    getRequest() {
        return this.request;
    }
    setRequest(request) {
        this.request = request;
        return this;
    }
}

var CommandResponseStatus;
(function (CommandResponseStatus) {
    CommandResponseStatus["success"] = "success";
    CommandResponseStatus["failure"] = "failure";
    CommandResponseStatus["inProgress"] = "inProgress";
})(CommandResponseStatus || (CommandResponseStatus = {}));
var AlertRequestAction;
(function (AlertRequestAction) {
    AlertRequestAction["Honk"] = "Honk";
    AlertRequestAction["Flash"] = "Flash";
})(AlertRequestAction || (AlertRequestAction = {}));
var AlertRequestOverride;
(function (AlertRequestOverride) {
    AlertRequestOverride["DoorOpen"] = "DoorOpen";
    AlertRequestOverride["IgnitionOn"] = "IgnitionOn";
})(AlertRequestOverride || (AlertRequestOverride = {}));
var DiagnosticRequestItem;
(function (DiagnosticRequestItem) {
    DiagnosticRequestItem["AmbientAirTemperature"] = "AMBIENT AIR TEMPERATURE";
    DiagnosticRequestItem["EngineCoolantTemp"] = "ENGINE COOLANT TEMP";
    DiagnosticRequestItem["EngineRpm"] = "ENGINE RPM";
    DiagnosticRequestItem["EvBatteryLevel"] = "EV BATTERY LEVEL";
    DiagnosticRequestItem["EvChargeState"] = "EV CHARGE STATE";
    DiagnosticRequestItem["EvEstimatedChargeEnd"] = "EV ESTIMATED CHARGE END";
    DiagnosticRequestItem["EvPlugState"] = "EV PLUG STATE";
    DiagnosticRequestItem["EvPlugVoltage"] = "EV PLUG VOLTAGE";
    DiagnosticRequestItem["EvScheduledChargeStart"] = "EV SCHEDULED CHARGE START";
    DiagnosticRequestItem["FuelTankInfo"] = "FUEL TANK INFO";
    DiagnosticRequestItem["GetChargeMode"] = "GET CHARGE MODE";
    DiagnosticRequestItem["GetCommuteSchedule"] = "GET COMMUTE SCHEDULE";
    DiagnosticRequestItem["HandsFreeCalling"] = "HANDS FREE CALLING";
    DiagnosticRequestItem["HotspotConfig"] = "HOTSPOT CONFIG";
    DiagnosticRequestItem["HotspotStatus"] = "HOTSPOT STATUS";
    DiagnosticRequestItem["IntermVoltBattVolt"] = "INTERM VOLT BATT VOLT";
    DiagnosticRequestItem["LastTripDistance"] = "LAST TRIP DISTANCE";
    DiagnosticRequestItem["LastTripFuelEconomy"] = "LAST TRIP FUEL ECONOMY";
    DiagnosticRequestItem["LifetimeEvOdometer"] = "LIFETIME EV ODOMETER";
    DiagnosticRequestItem["LifetimeFuelEcon"] = "LIFETIME FUEL ECON";
    DiagnosticRequestItem["LifetimeFuelUsed"] = "LIFETIME FUEL USED";
    DiagnosticRequestItem["Odometer"] = "ODOMETER";
    DiagnosticRequestItem["OilLife"] = "OIL LIFE";
    DiagnosticRequestItem["TirePressure"] = "TIRE PRESSURE";
    DiagnosticRequestItem["VehicleRange"] = "VEHICLE RANGE";
})(DiagnosticRequestItem || (DiagnosticRequestItem = {}));
var ChargingProfileChargeMode;
(function (ChargingProfileChargeMode) {
    ChargingProfileChargeMode["DefaultImmediate"] = "DEFAULT_IMMEDIATE";
    ChargingProfileChargeMode["Immediate"] = "IMMEDIATE";
    ChargingProfileChargeMode["DepartureBased"] = "DEPARTURE_BASED";
    ChargingProfileChargeMode["RateBased"] = "RATE_BASED";
    ChargingProfileChargeMode["PhevAfterMidnight"] = "PHEV_AFTER_MIDNIGHT";
})(ChargingProfileChargeMode || (ChargingProfileChargeMode = {}));
var ChargingProfileRateType;
(function (ChargingProfileRateType) {
    ChargingProfileRateType["Offpeak"] = "OFFPEAK";
    ChargingProfileRateType["Midpeak"] = "MIDPEAK";
    ChargingProfileRateType["Peak"] = "PEAK";
})(ChargingProfileRateType || (ChargingProfileRateType = {}));
var ChargeOverrideMode;
(function (ChargeOverrideMode) {
    ChargeOverrideMode["ChargeNow"] = "CHARGE_NOW";
    ChargeOverrideMode["CancelOverride"] = "CANCEL_OVERRIDE";
})(ChargeOverrideMode || (ChargeOverrideMode = {}));

var OnStarApiCommand;
(function (OnStarApiCommand) {
    OnStarApiCommand["Alert"] = "alert";
    OnStarApiCommand["CancelAlert"] = "cancelAlert";
    OnStarApiCommand["CancelStart"] = "cancelStart";
    OnStarApiCommand["ChargeOverride"] = "chargeOverride";
    OnStarApiCommand["Connect"] = "connect";
    OnStarApiCommand["Diagnostics"] = "diagnostics";
    OnStarApiCommand["GetChargingProfile"] = "getChargingProfile";
    OnStarApiCommand["LockDoor"] = "lockDoor";
    OnStarApiCommand["SetChargingProfile"] = "setChargingProfile";
    OnStarApiCommand["Start"] = "start";
    OnStarApiCommand["UnlockDoor"] = "unlockDoor";
    OnStarApiCommand["Location"] = "location";
    OnStarApiCommand["LockTrunk"] = "lockTrunk";
    OnStarApiCommand["UnlockTrunk"] = "unlockTrunk";
})(OnStarApiCommand || (OnStarApiCommand = {}));
class RequestService {
    constructor(config, tokenHandler, client) {
        var _a, _b, _c;
        this.tokenHandler = tokenHandler;
        this.client = client;
        this.config = Object.assign(Object.assign({}, config), { vin: config.vin.toUpperCase() });
        this.checkRequestStatus = (_a = this.config.checkRequestStatus) !== null && _a !== void 0 ? _a : true;
        this.requestPollingTimeoutSeconds =
            (_b = config.requestPollingTimeoutSeconds) !== null && _b !== void 0 ? _b : 60;
        this.requestPollingIntervalSeconds =
            (_c = config.requestPollingIntervalSeconds) !== null && _c !== void 0 ? _c : 6;
    }
    setClient(client) {
        this.client = client;
        return this;
    }
    setAuthToken(authToken) {
        this.authToken = authToken;
        return this;
    }
    setRequestPollingTimeoutSeconds(seconds) {
        this.requestPollingTimeoutSeconds = seconds;
        return this;
    }
    setRequestPollingIntervalSeconds(seconds) {
        this.requestPollingIntervalSeconds = seconds;
        return this;
    }
    setCheckRequestStatus(checkStatus) {
        this.checkRequestStatus = checkStatus;
        return this;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.Start);
            return this.sendRequest(request);
        });
    }
    cancelStart() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.CancelStart);
            return this.sendRequest(request);
        });
    }
    lockDoor() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.LockDoor).setBody({
                lockDoorRequest: Object.assign({ delay: 0 }, options),
            });
            return this.sendRequest(request);
        });
    }
    unlockDoor() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.UnlockDoor).setBody({
                unlockDoorRequest: Object.assign({ delay: 0 }, options),
            });
            return this.sendRequest(request);
        });
    }
    lockTrunk() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.LockTrunk).setBody({
                lockTrunkRequest: Object.assign({ delay: 0 }, options),
            });
            return this.sendRequest(request);
        });
    }
    unlockTrunk() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.UnlockTrunk).setBody({
                unlockTrunkRequest: Object.assign({ delay: 0 }, options),
            });
            return this.sendRequest(request);
        });
    }
    alert() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.Alert).setBody({
                alertRequest: Object.assign({ action: [AlertRequestAction.Honk, AlertRequestAction.Flash], delay: 0, duration: 1, override: [
                        AlertRequestOverride.DoorOpen,
                        AlertRequestOverride.IgnitionOn,
                    ] }, options),
            });
            return this.sendRequest(request);
        });
    }
    cancelAlert() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.CancelAlert);
            return this.sendRequest(request);
        });
    }
    chargeOverride() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.ChargeOverride).setBody({
                chargeOverrideRequest: Object.assign({ mode: ChargeOverrideMode.ChargeNow }, options),
            });
            return this.sendRequest(request);
        });
    }
    getChargingProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.GetChargingProfile);
            return this.sendRequest(request);
        });
    }
    setChargingProfile() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.SetChargingProfile).setBody({
                chargingProfile: Object.assign({ chargeMode: ChargingProfileChargeMode.Immediate, rateType: ChargingProfileRateType.Midpeak }, options),
            });
            return this.sendRequest(request);
        });
    }
    diagnostics() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.Diagnostics).setBody({
                diagnosticsRequest: Object.assign({ diagnosticItem: [
                        DiagnosticRequestItem.Odometer,
                        DiagnosticRequestItem.TirePressure,
                        DiagnosticRequestItem.AmbientAirTemperature,
                        DiagnosticRequestItem.LastTripDistance,
                    ] }, options),
            });
            return this.sendRequest(request);
        });
    }
    getAccountVehicles() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Request(`${this.getApiUrlForPath("/account/vehicles")}?includeCommands=true&includeEntitlements=true&includeModules=true&includeSharedVehicles=true`)
                .setUpgradeRequired(false)
                .setMethod(RequestMethod.Get);
            return this.sendRequest(request);
        });
    }
    location() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sendRequest(this.getCommandRequest(OnStarApiCommand.Location));
        });
    }
    getCommandRequest(command) {
        return new Request(this.getCommandUrl(command));
    }
    getApiUrlForPath(path) {
        return `${onStarAppConfig.serviceUrl}/api/v1${path}`;
    }
    getCommandUrl(command) {
        return this.getApiUrlForPath(`/account/vehicles/${this.config.vin}/commands/${command}`);
    }
    getHeaders(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                Accept: "application/json",
                "Accept-Language": "en-US",
                "Content-Type": request.getContentType(),
                Host: "api.gm.com",
                Connection: "keep-alive",
                "Accept-Encoding": "br, gzip, deflate",
                "User-Agent": onStarAppConfig.userAgent,
            };
            if (request.isAuthRequired()) {
                const authToken = yield this.getAuthToken();
                if (request.isUpgradeRequired() && !authToken.upgraded) {
                    yield this.connectAndUpgradeAuthToken();
                }
                headers["Authorization"] = `Bearer ${authToken.access_token}`;
            }
            return headers;
        });
    }
    connectRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.Connect).setUpgradeRequired(false);
            return this.sendRequest(request);
        });
    }
    upgradeRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const jwt = this.tokenHandler.createUpgradeJWT();
            const request = new Request(this.getApiUrlForPath("/oauth/token/upgrade"))
                .setContentType("text/plain")
                .setUpgradeRequired(false)
                .setBody(jwt);
            return this.sendRequest(request);
        });
    }
    authTokenRequest(jwt) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new Request(this.getApiUrlForPath("/oauth/token"))
                .setContentType("text/plain")
                .setAuthRequired(false)
                .setBody(jwt)
                .setHeaders({
                "Accept-Language": "en",
                "User-Agent": onStarAppConfig.userAgent,
            });
            return this.sendRequest(request);
        });
    }
    getAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.authToken || !TokenHandler.authTokenIsValid(this.authToken)) {
                this.authToken = yield this.refreshAuthToken();
            }
            return this.authToken;
        });
    }
    refreshAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tokenRefreshPromise) {
                this.tokenRefreshPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const token = yield this.createNewAuthToken();
                        resolve(token);
                    }
                    catch (e) {
                        reject(e);
                    }
                    this.tokenRefreshPromise = undefined;
                }));
            }
            return this.tokenRefreshPromise;
        });
    }
    createNewAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const jwt = this.tokenHandler.createAuthJWT();
            const { response } = yield this.authTokenRequest(jwt);
            if (typeof (response === null || response === void 0 ? void 0 : response.data) !== "string") {
                throw new Error("Failed to fetch token");
            }
            return this.tokenHandler.decodeAuthRequestResponse(response.data);
        });
    }
    connectAndUpgradeAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tokenUpgradePromise) {
                this.tokenUpgradePromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    if (!this.authToken) {
                        return reject("Missing auth token");
                    }
                    try {
                        yield this.connectRequest();
                        yield this.upgradeRequest();
                        this.authToken.upgraded = true;
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                    this.tokenUpgradePromise = undefined;
                }));
            }
            return this.tokenUpgradePromise;
        });
    }
    sendRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield this.makeClientRequest(request);
                const { data } = response;
                const checkRequestStatus = (_a = request.getCheckRequestStatus()) !== null && _a !== void 0 ? _a : this.checkRequestStatus;
                if (checkRequestStatus && typeof data === "object") {
                    const { commandResponse } = data;
                    if (commandResponse) {
                        const { requestTime, status, url, type } = commandResponse;
                        const requestTimestamp = new Date(requestTime).getTime();
                        if (status === CommandResponseStatus.failure) {
                            throw new RequestError("Command Failure")
                                .setResponse(response)
                                .setRequest(request);
                        }
                        if (Date.now() >=
                            requestTimestamp + this.requestPollingTimeoutSeconds * 1000) {
                            throw new RequestError("Command Timeout")
                                .setResponse(response)
                                .setRequest(request);
                        }
                        if (status === CommandResponseStatus.inProgress &&
                            type !== "connect") {
                            yield this.checkRequestPause();
                            const request = new Request(url)
                                .setMethod(RequestMethod.Get)
                                .setUpgradeRequired(false)
                                .setCheckRequestStatus(checkRequestStatus);
                            return this.sendRequest(request);
                        }
                        return new RequestResult(status).setResponse(response).getResult();
                    }
                }
                return new RequestResult(CommandResponseStatus.success)
                    .setResponse(response)
                    .getResult();
            }
            catch (error) {
                if (error instanceof RequestError) {
                    throw error;
                }
                let errorObj = new RequestError();
                if (axios.isAxiosError(error)) {
                    if (error.response) {
                        errorObj.message = `Request Failed with status ${error.response.status} - ${error.response.statusText}`;
                        errorObj.setResponse(error.response);
                        errorObj.setRequest(error.request);
                    }
                    else if (error.request) {
                        errorObj.message = "No response";
                        errorObj.setRequest(error.request);
                    }
                    else {
                        errorObj.message = error.message;
                    }
                }
                else if (error instanceof Error) {
                    errorObj.message = error.message;
                }
                throw errorObj;
            }
        });
    }
    makeClientRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders(request);
            let requestOptions = {
                headers: Object.assign(Object.assign({}, headers), request.getHeaders()),
            };
            if (request.getMethod() === RequestMethod.Post) {
                requestOptions.headers = Object.assign(Object.assign({}, requestOptions.headers), { "Content-Length": request.getBody().length });
                return this.client.post(request.getUrl(), request.getBody(), requestOptions);
            }
            else {
                return this.client.get(request.getUrl(), requestOptions);
            }
        });
    }
    checkRequestPause() {
        return new Promise((resolve) => setTimeout(resolve, this.requestPollingIntervalSeconds * 1000));
    }
}

class OnStar {
    constructor(requestService) {
        this.requestService = requestService;
    }
    static create(config) {
        const requestService = new RequestService(config, new TokenHandler(config), axios);
        return new OnStar(requestService);
    }
    getAccountVehicles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.getAccountVehicles();
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.start();
        });
    }
    cancelStart() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.cancelStart();
        });
    }
    lockDoor(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.lockDoor(options);
        });
    }
    unlockDoor(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.unlockDoor(options);
        });
    }
    lockTrunk(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.lockTrunk(options);
        });
    }
    unlockTrunk(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.unlockTrunk(options);
        });
    }
    alert(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.alert(options);
        });
    }
    cancelAlert() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.cancelAlert();
        });
    }
    chargeOverride(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.chargeOverride(options);
        });
    }
    getChargingProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.getChargingProfile();
        });
    }
    setChargingProfile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.setChargingProfile(options);
        });
    }
    diagnostics(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.diagnostics(options);
        });
    }
    location() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.location();
        });
    }
    setCheckRequestStatus(checkStatus) {
        this.requestService.setCheckRequestStatus(checkStatus);
    }
}

module.exports = OnStar;
