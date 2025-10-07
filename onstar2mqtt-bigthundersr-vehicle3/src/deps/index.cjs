'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var axios = require('axios');
var uuid = require('uuid');
var require$$0 = require('tough-cookie');
var require$$0$1 = require('node:url');
var require$$0$2 = require('node:http');
var require$$0$3 = require('node:https');
var require$$0$5 = require('net');
var require$$0$4 = require('http');
var https = require('https');
var openidClient = require('openid-client');
var fs = require('fs');
var totpGenerator = require('totp-generator');
var path = require('path');
var jwt = require('jsonwebtoken');
var patchright = require('patchright');
var child_process = require('child_process');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var openidClient__namespace = /*#__PURE__*/_interopNamespaceDefault(openidClient);

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
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


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

exports.CommandResponseStatus = void 0;
(function (CommandResponseStatus) {
    CommandResponseStatus["success"] = "success";
    CommandResponseStatus["failure"] = "failure";
    CommandResponseStatus["inProgress"] = "inProgress";
})(exports.CommandResponseStatus || (exports.CommandResponseStatus = {}));
exports.AlertRequestAction = void 0;
(function (AlertRequestAction) {
    AlertRequestAction["Honk"] = "Honk";
    AlertRequestAction["Flash"] = "Flash";
})(exports.AlertRequestAction || (exports.AlertRequestAction = {}));
exports.AlertRequestOverride = void 0;
(function (AlertRequestOverride) {
    AlertRequestOverride["DoorOpen"] = "DoorOpen";
    AlertRequestOverride["IgnitionOn"] = "IgnitionOn";
})(exports.AlertRequestOverride || (exports.AlertRequestOverride = {}));
// DiagnosticsRequestOptions and DiagnosticRequestItem are no longer used
exports.ChargingProfileChargeMode = void 0;
(function (ChargingProfileChargeMode) {
    ChargingProfileChargeMode["DefaultImmediate"] = "DEFAULT_IMMEDIATE";
    ChargingProfileChargeMode["Immediate"] = "IMMEDIATE";
    ChargingProfileChargeMode["DepartureBased"] = "DEPARTURE_BASED";
    ChargingProfileChargeMode["RateBased"] = "RATE_BASED";
    ChargingProfileChargeMode["PhevAfterMidnight"] = "PHEV_AFTER_MIDNIGHT";
})(exports.ChargingProfileChargeMode || (exports.ChargingProfileChargeMode = {}));
exports.ChargingProfileRateType = void 0;
(function (ChargingProfileRateType) {
    ChargingProfileRateType["Offpeak"] = "OFFPEAK";
    ChargingProfileRateType["Midpeak"] = "MIDPEAK";
    ChargingProfileRateType["Peak"] = "PEAK";
})(exports.ChargingProfileRateType || (exports.ChargingProfileRateType = {}));
exports.ChargeOverrideMode = void 0;
(function (ChargeOverrideMode) {
    ChargeOverrideMode["ChargeNow"] = "CHARGE_NOW";
    ChargeOverrideMode["CancelOverride"] = "CANCEL_OVERRIDE";
})(exports.ChargeOverrideMode || (exports.ChargeOverrideMode = {}));

var serviceUrl = "https://na-mobile-api.gm.com";
var userAgent = "myChevrolet/8006 CFNetwork/3826.600.41 Darwin/24.6.0";
var onStarAppConfig = {
	serviceUrl: serviceUrl,
	userAgent: userAgent
};

var http$1 = {};

var create_cookie_agent = {};

var create_cookie_header_value = {};

var hasRequiredCreate_cookie_header_value;

function requireCreate_cookie_header_value () {
	if (hasRequiredCreate_cookie_header_value) return create_cookie_header_value;
	hasRequiredCreate_cookie_header_value = 1;

	Object.defineProperty(create_cookie_header_value, "__esModule", {
	  value: true
	});
	create_cookie_header_value.createCookieHeaderValue = createCookieHeaderValue;
	var _toughCookie = require$$0;
	function createCookieHeaderValue({
	  cookieOptions,
	  passedValues,
	  requestUrl
	}) {
	  const {
	    jar
	  } = cookieOptions;
	  const cookies = jar.getCookiesSync(requestUrl);
	  const cookiesMap = new Map(cookies.map(cookie => [cookie.key, cookie]));
	  for (const passedValue of passedValues) {
	    if (typeof passedValue !== 'string') {
	      continue;
	    }
	    for (const str of passedValue.split(';')) {
	      const cookie = _toughCookie.Cookie.parse(str.trim());
	      if (cookie != null) {
	        cookiesMap.set(cookie.key, cookie);
	      }
	    }
	  }
	  const cookieHeaderValue = Array.from(cookiesMap.values()).map(cookie => cookie.cookieString()).join(';\x20');
	  return cookieHeaderValue;
	}
	return create_cookie_header_value;
}

var save_cookies_from_header = {};

var hasRequiredSave_cookies_from_header;

function requireSave_cookies_from_header () {
	if (hasRequiredSave_cookies_from_header) return save_cookies_from_header;
	hasRequiredSave_cookies_from_header = 1;

	Object.defineProperty(save_cookies_from_header, "__esModule", {
	  value: true
	});
	save_cookies_from_header.saveCookiesFromHeader = saveCookiesFromHeader;
	function saveCookiesFromHeader({
	  cookieOptions,
	  cookies,
	  requestUrl
	}) {
	  const {
	    jar
	  } = cookieOptions;
	  for (const cookie of [cookies].flat()) {
	    if (cookie == null) {
	      continue;
	    }
	    jar.setCookieSync(cookie, requestUrl, {
	      ignoreError: true
	    });
	  }
	}
	return save_cookies_from_header;
}

var validate_cookie_options = {};

var hasRequiredValidate_cookie_options;

function requireValidate_cookie_options () {
	if (hasRequiredValidate_cookie_options) return validate_cookie_options;
	hasRequiredValidate_cookie_options = 1;

	Object.defineProperty(validate_cookie_options, "__esModule", {
	  value: true
	});
	validate_cookie_options.validateCookieOptions = validateCookieOptions;
	function validateCookieOptions(opts) {
	  if (!('jar' in opts)) {
	    throw new TypeError('invalid cookies.jar');
	  }
	  if (!opts.jar.store.synchronous) {
	    throw new TypeError('an asynchronous cookie store is not supported.');
	  }
	}
	return validate_cookie_options;
}

var hasRequiredCreate_cookie_agent;

function requireCreate_cookie_agent () {
	if (hasRequiredCreate_cookie_agent) return create_cookie_agent;
	hasRequiredCreate_cookie_agent = 1;

	Object.defineProperty(create_cookie_agent, "__esModule", {
	  value: true
	});
	create_cookie_agent.createCookieAgent = createCookieAgent;
	var _nodeUrl = _interopRequireDefault(require$$0$1);
	var _create_cookie_header_value = requireCreate_cookie_header_value();
	var _save_cookies_from_header = requireSave_cookies_from_header();
	var _validate_cookie_options = requireValidate_cookie_options();
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const kCookieOptions = Symbol('cookieOptions');
	const kReimplicitHeader = Symbol('reimplicitHeader');
	const kRecreateFirstChunk = Symbol('recreateFirstChunk');
	const kOverrideRequest = Symbol('overrideRequest');
	function createCookieAgent(BaseAgentClass) {
	  // @ts-expect-error -- BaseAgentClass is type definition.
	  class CookieAgent extends BaseAgentClass {
	    constructor(...params) {
	      const {
	        cookies: cookieOptions
	      } = params.find(opt => {
	        return opt != null && typeof opt === 'object' && 'cookies' in opt;
	      }) ?? {};
	      super(...params);
	      if (cookieOptions) {
	        (0, _validate_cookie_options.validateCookieOptions)(cookieOptions);
	      }
	      this[kCookieOptions] = cookieOptions;
	    }
	    [kReimplicitHeader](req) {
	      const _headerSent = req._headerSent;
	      req._header = null;
	      req._implicitHeader();
	      req._headerSent = _headerSent;
	    }
	    [kRecreateFirstChunk](req) {
	      const firstChunk = req.outputData[0];
	      if (req._header == null || firstChunk == null) {
	        return;
	      }
	      const prevData = firstChunk.data;
	      const prevHeaderLength = prevData.indexOf('\r\n\r\n');
	      if (prevHeaderLength === -1) {
	        firstChunk.data = req._header;
	      } else {
	        firstChunk.data = `${req._header}${prevData.slice(prevHeaderLength + 4)}`;
	      }
	      const diffSize = firstChunk.data.length - prevData.length;
	      req.outputSize += diffSize;
	      req._onPendingData(diffSize);
	    }
	    [kOverrideRequest](req, requestUrl, cookieOptions) {
	      const _implicitHeader = req._implicitHeader.bind(req);
	      req._implicitHeader = () => {
	        try {
	          const cookieHeader = (0, _create_cookie_header_value.createCookieHeaderValue)({
	            cookieOptions,
	            passedValues: [req.getHeader('Cookie')].flat(),
	            requestUrl
	          });
	          if (cookieHeader) {
	            req.setHeader('Cookie', cookieHeader);
	          }
	        } catch (err) {
	          req.destroy(err);
	          return;
	        }
	        _implicitHeader();
	      };
	      const emit = req.emit.bind(req);
	      req.emit = (event, ...args) => {
	        if (event === 'response') {
	          try {
	            const res = args[0];
	            (0, _save_cookies_from_header.saveCookiesFromHeader)({
	              cookieOptions,
	              cookies: res.headers['set-cookie'],
	              requestUrl
	            });
	          } catch (err) {
	            req.destroy(err);
	            return false;
	          }
	        }
	        return emit(event, ...args);
	      };
	    }
	    addRequest(req, options) {
	      const cookieOptions = this[kCookieOptions];
	      if (cookieOptions) {
	        try {
	          const requestUrl = _nodeUrl.default.format({
	            host: req.host,
	            pathname: req.path,
	            protocol: req.protocol
	          });
	          this[kOverrideRequest](req, requestUrl, cookieOptions);
	          if (req._header != null) {
	            this[kReimplicitHeader](req);
	          }
	          if (req._headerSent) {
	            this[kRecreateFirstChunk](req);
	          }
	        } catch (err) {
	          req.destroy(err);
	          return;
	        }
	      }
	      super.addRequest(req, options);
	    }
	  }
	  return CookieAgent;
	}
	return create_cookie_agent;
}

var http_cookie_agent = {};

var hasRequiredHttp_cookie_agent;

function requireHttp_cookie_agent () {
	if (hasRequiredHttp_cookie_agent) return http_cookie_agent;
	hasRequiredHttp_cookie_agent = 1;

	Object.defineProperty(http_cookie_agent, "__esModule", {
	  value: true
	});
	http_cookie_agent.HttpCookieAgent = void 0;
	var _nodeHttp = _interopRequireDefault(require$$0$2);
	var _create_cookie_agent = requireCreate_cookie_agent();
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	http_cookie_agent.HttpCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_nodeHttp.default.Agent);
	return http_cookie_agent;
}

var https_cookie_agent = {};

var hasRequiredHttps_cookie_agent;

function requireHttps_cookie_agent () {
	if (hasRequiredHttps_cookie_agent) return https_cookie_agent;
	hasRequiredHttps_cookie_agent = 1;

	Object.defineProperty(https_cookie_agent, "__esModule", {
	  value: true
	});
	https_cookie_agent.HttpsCookieAgent = void 0;
	var _nodeHttps = _interopRequireDefault(require$$0$3);
	var _create_cookie_agent = requireCreate_cookie_agent();
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	https_cookie_agent.HttpsCookieAgent = (0, _create_cookie_agent.createCookieAgent)(_nodeHttps.default.Agent);
	return https_cookie_agent;
}

var mixed_cookie_agent = {};

var dist = {};

var helpers = {};

var hasRequiredHelpers;

function requireHelpers () {
	if (hasRequiredHelpers) return helpers;
	hasRequiredHelpers = 1;
	var __createBinding = (helpers && helpers.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (helpers && helpers.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (helpers && helpers.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(helpers, "__esModule", { value: true });
	helpers.req = helpers.json = helpers.toBuffer = void 0;
	const http = __importStar(require$$0$4);
	const https$1 = __importStar(https);
	async function toBuffer(stream) {
	    let length = 0;
	    const chunks = [];
	    for await (const chunk of stream) {
	        length += chunk.length;
	        chunks.push(chunk);
	    }
	    return Buffer.concat(chunks, length);
	}
	helpers.toBuffer = toBuffer;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function json(stream) {
	    const buf = await toBuffer(stream);
	    const str = buf.toString('utf8');
	    try {
	        return JSON.parse(str);
	    }
	    catch (_err) {
	        const err = _err;
	        err.message += ` (input: ${str})`;
	        throw err;
	    }
	}
	helpers.json = json;
	function req(url, opts = {}) {
	    const href = typeof url === 'string' ? url : url.href;
	    const req = (href.startsWith('https:') ? https$1 : http).request(url, opts);
	    const promise = new Promise((resolve, reject) => {
	        req
	            .once('response', resolve)
	            .once('error', reject)
	            .end();
	    });
	    req.then = promise.then.bind(promise);
	    return req;
	}
	helpers.req = req;
	
	return helpers;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports) {
		var __createBinding = (dist && dist.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (dist && dist.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (dist && dist.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		var __exportStar = (dist && dist.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.Agent = void 0;
		const net = __importStar(require$$0$5);
		const http = __importStar(require$$0$4);
		const https_1 = https;
		__exportStar(requireHelpers(), exports);
		const INTERNAL = Symbol('AgentBaseInternalState');
		class Agent extends http.Agent {
		    constructor(opts) {
		        super(opts);
		        this[INTERNAL] = {};
		    }
		    /**
		     * Determine whether this is an `http` or `https` request.
		     */
		    isSecureEndpoint(options) {
		        if (options) {
		            // First check the `secureEndpoint` property explicitly, since this
		            // means that a parent `Agent` is "passing through" to this instance.
		            // eslint-disable-next-line @typescript-eslint/no-explicit-any
		            if (typeof options.secureEndpoint === 'boolean') {
		                return options.secureEndpoint;
		            }
		            // If no explicit `secure` endpoint, check if `protocol` property is
		            // set. This will usually be the case since using a full string URL
		            // or `URL` instance should be the most common usage.
		            if (typeof options.protocol === 'string') {
		                return options.protocol === 'https:';
		            }
		        }
		        // Finally, if no `protocol` property was set, then fall back to
		        // checking the stack trace of the current call stack, and try to
		        // detect the "https" module.
		        const { stack } = new Error();
		        if (typeof stack !== 'string')
		            return false;
		        return stack
		            .split('\n')
		            .some((l) => l.indexOf('(https.js:') !== -1 ||
		            l.indexOf('node:https:') !== -1);
		    }
		    // In order to support async signatures in `connect()` and Node's native
		    // connection pooling in `http.Agent`, the array of sockets for each origin
		    // has to be updated synchronously. This is so the length of the array is
		    // accurate when `addRequest()` is next called. We achieve this by creating a
		    // fake socket and adding it to `sockets[origin]` and incrementing
		    // `totalSocketCount`.
		    incrementSockets(name) {
		        // If `maxSockets` and `maxTotalSockets` are both Infinity then there is no
		        // need to create a fake socket because Node.js native connection pooling
		        // will never be invoked.
		        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
		            return null;
		        }
		        // All instances of `sockets` are expected TypeScript errors. The
		        // alternative is to add it as a private property of this class but that
		        // will break TypeScript subclassing.
		        if (!this.sockets[name]) {
		            // @ts-expect-error `sockets` is readonly in `@types/node`
		            this.sockets[name] = [];
		        }
		        const fakeSocket = new net.Socket({ writable: false });
		        this.sockets[name].push(fakeSocket);
		        // @ts-expect-error `totalSocketCount` isn't defined in `@types/node`
		        this.totalSocketCount++;
		        return fakeSocket;
		    }
		    decrementSockets(name, socket) {
		        if (!this.sockets[name] || socket === null) {
		            return;
		        }
		        const sockets = this.sockets[name];
		        const index = sockets.indexOf(socket);
		        if (index !== -1) {
		            sockets.splice(index, 1);
		            // @ts-expect-error  `totalSocketCount` isn't defined in `@types/node`
		            this.totalSocketCount--;
		            if (sockets.length === 0) {
		                // @ts-expect-error `sockets` is readonly in `@types/node`
		                delete this.sockets[name];
		            }
		        }
		    }
		    // In order to properly update the socket pool, we need to call `getName()` on
		    // the core `https.Agent` if it is a secureEndpoint.
		    getName(options) {
		        const secureEndpoint = this.isSecureEndpoint(options);
		        if (secureEndpoint) {
		            // @ts-expect-error `getName()` isn't defined in `@types/node`
		            return https_1.Agent.prototype.getName.call(this, options);
		        }
		        // @ts-expect-error `getName()` isn't defined in `@types/node`
		        return super.getName(options);
		    }
		    createSocket(req, options, cb) {
		        const connectOpts = {
		            ...options,
		            secureEndpoint: this.isSecureEndpoint(options),
		        };
		        const name = this.getName(connectOpts);
		        const fakeSocket = this.incrementSockets(name);
		        Promise.resolve()
		            .then(() => this.connect(req, connectOpts))
		            .then((socket) => {
		            this.decrementSockets(name, fakeSocket);
		            if (socket instanceof http.Agent) {
		                try {
		                    // @ts-expect-error `addRequest()` isn't defined in `@types/node`
		                    return socket.addRequest(req, connectOpts);
		                }
		                catch (err) {
		                    return cb(err);
		                }
		            }
		            this[INTERNAL].currentSocket = socket;
		            // @ts-expect-error `createSocket()` isn't defined in `@types/node`
		            super.createSocket(req, options, cb);
		        }, (err) => {
		            this.decrementSockets(name, fakeSocket);
		            cb(err);
		        });
		    }
		    createConnection() {
		        const socket = this[INTERNAL].currentSocket;
		        this[INTERNAL].currentSocket = undefined;
		        if (!socket) {
		            throw new Error('No socket was returned in the `connect()` function');
		        }
		        return socket;
		    }
		    get defaultPort() {
		        return (this[INTERNAL].defaultPort ??
		            (this.protocol === 'https:' ? 443 : 80));
		    }
		    set defaultPort(v) {
		        if (this[INTERNAL]) {
		            this[INTERNAL].defaultPort = v;
		        }
		    }
		    get protocol() {
		        return (this[INTERNAL].protocol ??
		            (this.isSecureEndpoint() ? 'https:' : 'http:'));
		    }
		    set protocol(v) {
		        if (this[INTERNAL]) {
		            this[INTERNAL].protocol = v;
		        }
		    }
		}
		exports.Agent = Agent;
		
	} (dist));
	return dist;
}

var hasRequiredMixed_cookie_agent;

function requireMixed_cookie_agent () {
	if (hasRequiredMixed_cookie_agent) return mixed_cookie_agent;
	hasRequiredMixed_cookie_agent = 1;

	Object.defineProperty(mixed_cookie_agent, "__esModule", {
	  value: true
	});
	mixed_cookie_agent.MixedCookieAgent = void 0;
	var _agentBase = requireDist();
	var _http_cookie_agent = requireHttp_cookie_agent();
	var _https_cookie_agent = requireHttps_cookie_agent();
	class MixedCookieAgent extends _agentBase.Agent {
	  constructor(options) {
	    super();
	    this._httpAgent = new _http_cookie_agent.HttpCookieAgent(options);
	    this._httpsAgent = new _https_cookie_agent.HttpsCookieAgent(options);
	  }
	  connect(_req, options) {
	    return options.secureEndpoint ? this._httpsAgent : this._httpAgent;
	  }
	}
	mixed_cookie_agent.MixedCookieAgent = MixedCookieAgent;
	return mixed_cookie_agent;
}

var hasRequiredHttp$1;

function requireHttp$1 () {
	if (hasRequiredHttp$1) return http$1;
	hasRequiredHttp$1 = 1;
	(function (exports) {

		Object.defineProperty(exports, "__esModule", {
		  value: true
		});
		Object.defineProperty(exports, "HttpCookieAgent", {
		  enumerable: true,
		  get: function () {
		    return _http_cookie_agent.HttpCookieAgent;
		  }
		});
		Object.defineProperty(exports, "HttpsCookieAgent", {
		  enumerable: true,
		  get: function () {
		    return _https_cookie_agent.HttpsCookieAgent;
		  }
		});
		Object.defineProperty(exports, "MixedCookieAgent", {
		  enumerable: true,
		  get: function () {
		    return _mixed_cookie_agent.MixedCookieAgent;
		  }
		});
		Object.defineProperty(exports, "createCookieAgent", {
		  enumerable: true,
		  get: function () {
		    return _create_cookie_agent.createCookieAgent;
		  }
		});
		var _create_cookie_agent = requireCreate_cookie_agent();
		var _http_cookie_agent = requireHttp_cookie_agent();
		var _https_cookie_agent = requireHttps_cookie_agent();
		var _mixed_cookie_agent = requireMixed_cookie_agent(); 
	} (http$1));
	return http$1;
}

var http;
var hasRequiredHttp;

function requireHttp () {
	if (hasRequiredHttp) return http;
	hasRequiredHttp = 1;
	http = requireHttp$1();
	return http;
}

var httpExports = requireHttp();

class GMAuth {
    constructor(config) {
        var _a;
        this.browser = null;
        this.context = null;
        this.currentPage = null;
        this.capturedAuthCode = null;
        this.currentGMAPIToken = null;
        this.debugMode = true; // Default to visible mode for reliability
        this.xvfb = null; // Xvfb instance for Linux virtual display
        this.xvfbDisplay = null; // Store the DISPLAY value for Xvfb
        this.cleanupInProgress = false; // Flag to prevent concurrent cleanup
        this.XvfbCtor = null; // Lazy-loaded Xvfb constructor on Linux
        this.config = config;
        this.config.tokenLocation = (_a = this.config.tokenLocation) !== null && _a !== void 0 ? _a : "./";
        this.MSTokenPath = path.join(this.config.tokenLocation, "microsoft_tokens.json");
        this.GMTokenPath = path.join(this.config.tokenLocation, "gm_tokens.json");
        this.oidc = {
            Issuer: openidClient__namespace.Issuer,
            generators: openidClient__namespace.generators,
        };
        // Define modern cipher suites similar to browsers
        const modernCiphers = [
            "TLS_AES_128_GCM_SHA256",
            "TLS_AES_256_GCM_SHA384",
            "TLS_CHACHA20_POLY1305_SHA256",
            "ECDHE-ECDSA-AES128-GCM-SHA256",
            "ECDHE-RSA-AES128-GCM-SHA256",
            "ECDHE-ECDSA-AES256-GCM-SHA384",
            "ECDHE-RSA-AES256-GCM-SHA384",
            "ECDHE-ECDSA-CHACHA20_POLY1305",
            "ECDHE-RSA-CHACHA20_POLY1305",
            "ECDHE-RSA-AES128-SHA",
            "ECDHE-RSA-AES256-SHA",
            "AES128-GCM-SHA256",
            "AES256-GCM-SHA384",
            "AES128-SHA",
            "AES256-SHA",
        ].join(":");
        // Configure Node.js global HTTPS agent for openid-client
        https.globalAgent.options.ciphers = modernCiphers;
        https.globalAgent.options.minVersion = "TLSv1.2";
        // Create cookie jar with more permissive settings
        this.jar = new require$$0.CookieJar(undefined, {
            looseMode: true,
            rejectPublicSuffixes: false,
            allowSpecialUseDomain: true,
        });
        this.axiosClient = axios.create({
            httpAgent: new httpExports.HttpCookieAgent({ cookies: { jar: this.jar } }),
            httpsAgent: new httpExports.HttpsCookieAgent({
                cookies: { jar: this.jar },
                ciphers: modernCiphers,
                minVersion: "TLSv1.2",
                keepAlive: true,
            }),
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
        });
        this.csrfToken = null;
        this.transId = null;
        // Load the current GM API token
        this.loadCurrentGMAPIToken();
    }
    // Helper function to wait for authorization code
    waitForAuthCode() {
        return __awaiter(this, arguments, void 0, function* (timeoutMs = 10000, intervalMs = 500) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeoutMs) {
                if (this.capturedAuthCode) {
                    console.log(`🪝 [waitForAuthCode] Auth code captured: ${this.capturedAuthCode.substring(0, 20)}${this.capturedAuthCode.length > 20 ? "..." : ""}`);
                    return true;
                }
                // if (this.debugMode) console.log(`[waitForAuthCode] Waiting for auth code... ${(Date.now() - startTime) / 1000}s elapsed`);
                yield new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
            // if (this.debugMode) console.log(`[waitForAuthCode] Timeout waiting for auth code after ${timeoutMs / 1000}s`);
            return false;
        });
    }
    // Browser management methods
    initBrowser() {
        return __awaiter(this, arguments, void 0, function* (useRandomFingerprint = false) {
            var _a;
            // Detect platform early to check display state
            const isLinux = process.platform === "linux";
            // Check if browser and context are actually usable, not just that references exist
            let browserUsable = false;
            // First check: Do we have both browser and context?
            console.log(`🔍 Browser check: browser=${!!this.browser}, context=${!!this.context}`);
            if (this.context) {
                // We have a context, check if it's still usable
                try {
                    const pages = this.context.pages();
                    console.log(`🔍 Context usability: pages=${pages ? pages.length : "null"}`);
                    // Check if context is still usable by testing pages access
                    if (pages !== null && pages !== undefined) {
                        // Context is usable, try to get browser reference (but don't require it)
                        if (!this.browser) {
                            this.browser = this.context.browser();
                            console.log(`🔍 Trying to get browser from context: ${!!this.browser}`);
                        }
                        // For persistent contexts, we can work with just the context
                        // Browser reference may be null in containerized environments
                        if (this.browser) {
                            try {
                                const isConnected = this.browser.isConnected();
                                console.log(`🔍 Browser connection status: ${isConnected}`);
                                browserUsable = isConnected;
                            }
                            catch (error) {
                                console.log("🔍 Browser reference exists but not connected:", error);
                                browserUsable = true; // Context is still usable even if browser ref fails
                            }
                        }
                        else {
                            console.log("� Browser reference is null, but context appears usable");
                            browserUsable = true; // Context can work without browser reference
                        }
                        if (browserUsable) {
                            console.log("🌐 Reusing existing browser context");
                            return; // Early return - don't continue with initialization
                        }
                    }
                    else {
                        console.log("🔄 Context exists but pages access failed, reinitializing...");
                    }
                }
                catch (error) {
                    console.log("🔄 Context exists but not usable, reinitializing...", error);
                }
                // If we reach here, context exists but is not usable
                browserUsable = false;
            }
            else if (this.browser) {
                // We have a browser but no context - this shouldn't happen with persistent contexts
                console.log(`🔄 Browser exists without context (unexpected state), reinitializing...`);
                browserUsable = false;
            }
            else {
                // No existing browser or context
                console.log("🔍 No existing browser state, initializing fresh...");
                browserUsable = false;
            }
            // Clear stale references if browser is not usable
            if (!browserUsable) {
                // Remember if we had an existing context before clearing references
                this.context !== null;
                this.browser = null;
                this.context = null;
                this.currentPage = null;
                const profilePath = path.resolve("./temp-browser-profile");
                if (fs.existsSync(profilePath)) {
                    fs.rmSync(profilePath, { recursive: true, force: true });
                    console.log("🗑️ Deleted existing temp browser profile (fresh start)");
                }
            }
            // Generate random fingerprint if requested
            const fingerprint = useRandomFingerprint
                ? this.generateRandomFingerprint()
                : {
                    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1",
                    viewport: { width: 430, height: 932 },
                    deviceType: "iPhone (default)",
                };
            if (useRandomFingerprint) {
                console.log(`🎭 Using randomized fingerprint (${fingerprint.deviceType}): ${fingerprint.userAgent.substring(0, 80)}...`);
                console.log(`🎭 Using randomized viewport: ${fingerprint.viewport.width}x${fingerprint.viewport.height}`);
            }
            else {
                console.log(`🎭 Using default fingerprint (${fingerprint.deviceType}): ${fingerprint.userAgent.substring(0, 80)}...`);
                console.log(`🎭 Using default viewport: ${fingerprint.viewport.width}x${fingerprint.viewport.height}`);
            }
            // Detect platform (isLinux and hasNaturalDisplay already declared above)
            const isWindows = process.platform === "win32";
            // On Linux, always verify we have a working display
            if (isLinux) {
                console.log("🖥️ Linux detected, verifying display availability...");
                let displayWorking = false;
                // First, test if the current DISPLAY is working (if set)
                if (process.env.DISPLAY) {
                    try {
                        // Try to connect to the X display using native commands that are always available
                        // We'll try multiple approaches in order of preference
                        let testPassed = false;
                        // Method 1: Try to list X server info using xset (usually available)
                        try {
                            child_process.execSync("xset q >/dev/null 2>&1", {
                                stdio: "ignore",
                                timeout: 3000,
                            });
                            testPassed = true;
                        }
                        catch (e) {
                            // xset failed, try next method
                        }
                        // Method 2: Try to get display info using xwininfo on root window
                        if (!testPassed) {
                            try {
                                child_process.execSync("xwininfo -root >/dev/null 2>&1", {
                                    stdio: "ignore",
                                    timeout: 3000,
                                });
                                testPassed = true;
                            }
                            catch (e) {
                                // xwininfo failed, try next method
                            }
                        }
                        // Method 3: Try to test the display using xlsclients (list X clients)
                        if (!testPassed) {
                            try {
                                child_process.execSync("xlsclients >/dev/null 2>&1", {
                                    stdio: "ignore",
                                    timeout: 3000,
                                });
                                testPassed = true;
                            }
                            catch (e) {
                                // xlsclients failed, try final method
                            }
                        }
                        // Method 4: Try a basic X11 connection test using xhost
                        if (!testPassed) {
                            try {
                                child_process.execSync("xhost >/dev/null 2>&1", {
                                    stdio: "ignore",
                                    timeout: 3000,
                                });
                                testPassed = true;
                            }
                            catch (e) {
                                // All X11 tests failed
                            }
                        }
                        if (testPassed) {
                            console.log(`🖥️ Existing display ${process.env.DISPLAY} is working`);
                            displayWorking = true;
                        }
                        else {
                            console.warn(`⚠️ Display ${process.env.DISPLAY} is set but not accessible (no X11 tools responded)`);
                        }
                    }
                    catch (e) {
                        console.warn(`⚠️ Display ${process.env.DISPLAY} is not working or accessible`);
                    }
                }
                else {
                    console.log("🖥️ No DISPLAY environment variable set");
                }
                // If we don't have a working display, check if we need to start/restart Xvfb
                if (!displayWorking) {
                    console.log("🖥️ No working display found, checking Xvfb status...");
                    // First, check if we have an existing Xvfb reference and verify it's still running
                    if (this.xvfb && this.xvfbDisplay) {
                        console.log("🖥️ Checking existing Xvfb instance...");
                        try {
                            // Check if the Xvfb process is still alive
                            const displayNum = this.xvfbDisplay.replace(":", "");
                            child_process.execSync(`pgrep -f "Xvfb.*:${displayNum}"`, { stdio: "ignore" });
                            console.log(`🖥️ Verified Xvfb process is running on display ${this.xvfbDisplay}`);
                            // Xvfb library manages DISPLAY internally, no need to set it manually
                            displayWorking = true;
                        }
                        catch (e) {
                            console.warn(`⚠️ Xvfb process not found for display ${this.xvfbDisplay}, will restart it`);
                            this.xvfb = null;
                            this.xvfbDisplay = null;
                        }
                    }
                }
                // If we still don't have a working display, start Xvfb
                if (!displayWorking) {
                    console.log("🖥️ Starting Xvfb for virtual display...");
                    try {
                        // First check if Xvfb binary is available
                        try {
                            child_process.execSync("which Xvfb", { stdio: "ignore" });
                        }
                        catch (e) {
                            console.error("❌ Xvfb binary not found in PATH");
                            throw new Error("Xvfb is not installed. Please install it with: sudo apt-get install xvfb");
                        }
                        // Also check for xvfb-run as a secondary check
                        try {
                            child_process.execSync("which xvfb-run", { stdio: "ignore" });
                        }
                        catch (e) {
                            console.warn("⚠️ xvfb-run not found, but Xvfb binary is available");
                        }
                        // Kill any existing Xvfb processes that might be stuck
                        try {
                            child_process.execSync('pkill -f "Xvfb.*:99"', { stdio: "ignore" });
                            console.log("🧹 Cleaned up any existing Xvfb processes");
                        }
                        catch (e) {
                            // Ignore errors - no existing processes to clean up
                        }
                        // Try multiple display numbers to find an available one
                        const maxAttempts = 5;
                        let displayNum = 99;
                        let xvfbStarted = false;
                        // Lazy-load Xvfb constructor only on Linux to avoid ESM require issues
                        if (!this.XvfbCtor) {
                            try {
                                const mod = yield import('xvfb');
                                this.XvfbCtor = (_a = mod === null || mod === void 0 ? void 0 : mod.default) !== null && _a !== void 0 ? _a : mod;
                            }
                            catch (e) {
                                console.error("❌ Failed to load xvfb module:", e);
                                throw new Error("Failed to load xvfb module. Ensure it's installed.");
                            }
                        }
                        for (let attempt = 0; attempt < maxAttempts; attempt++) {
                            try {
                                console.log(`🖥️ Attempting to start Xvfb on display :${displayNum}...`);
                                this.xvfb = new this.XvfbCtor({
                                    silent: true,
                                    displayNum: displayNum,
                                    reuse: false,
                                    timeout: 10000, // Increased timeout to 10 seconds
                                    xvfb_args: [
                                        "-screen",
                                        "0",
                                        "1280x720x24",
                                        "-ac",
                                        "+extension",
                                        "GLX",
                                        "-nolisten",
                                        "tcp",
                                        "-dpi",
                                        "96",
                                        "-noreset",
                                        "+extension",
                                        "RANDR",
                                    ],
                                });
                                this.xvfb.startSync();
                                xvfbStarted = true;
                                this.xvfbDisplay = process.env.DISPLAY || null; // Store the DISPLAY value
                                console.log(`🖥️ Xvfb started successfully on display :${displayNum} (${process.env.DISPLAY})`);
                                break;
                            }
                            catch (displayError) {
                                console.warn(`⚠️ Failed to start Xvfb on display :${displayNum}: ${displayError.message}`);
                                displayNum++;
                                // Clean up the failed xvfb instance
                                if (this.xvfb) {
                                    try {
                                        this.xvfb.stopSync();
                                    }
                                    catch (cleanupError) {
                                        // Ignore cleanup errors
                                    }
                                    this.xvfb = null;
                                }
                                if (attempt === maxAttempts - 1) {
                                    throw displayError;
                                }
                            }
                        }
                        if (!xvfbStarted) {
                            throw new Error(`Failed to start Xvfb after ${maxAttempts} attempts`);
                        }
                    }
                    catch (error) {
                        console.error("❌ Failed to start Xvfb:", error);
                        console.error("💡 To fix this issue, either:");
                        console.error("   1. Install Xvfb: sudo apt-get install xvfb");
                        console.error("   2. Run with xvfb-run: xvfb-run -a node your-app.js");
                        console.error("   3. Set a DISPLAY environment variable if you have a GUI");
                        console.error("   4. Try running in a container with proper display setup");
                        console.error("   5. Ensure no other Xvfb processes are running: pkill Xvfb");
                        throw new Error("Cannot run browser automation on Linux without a display server. Xvfb is required for headful operation - headless mode is not supported.");
                    }
                }
            }
            // Prepare browser arguments based on platform - simplified for better reliability
            const browserArgs = [
                // Core stealth arguments (minimal set)
                "--disable-blink-features=AutomationControlled",
                "--disable-automation",
                "--no-first-run",
                // Essential compatibility
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                // Minimal stealth
                "--disable-password-manager",
                "--disable-save-password",
                "--disable-sync",
                "--disable-translate",
                // Performance
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--max_old_space_size=4096",
                "--enable-low-end-device-mode",
                // Windows stability
                "--disable-hang-monitor",
                "--process-per-tab",
            ];
            // Add platform-specific args
            if (isWindows) {
                // On Windows, add start minimized and Windows-specific flags
                browserArgs.push("--disable-features=msSmartScreenProtection");
            }
            else if (isLinux) {
                // On Linux with virtual display, add GPU-related args
                browserArgs.push("--use-gl=swiftshader");
            }
            // Use absolute path for better reliability on Windows
            const profilePath = path.resolve("./temp-browser-profile");
            // Ensure profile directory exists and is clean
            if (fs.existsSync(profilePath)) {
                try {
                    // Wait a moment for processes to fully terminate
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                    // Remove the profile directory
                    fs.rmSync(profilePath, { recursive: true, force: true });
                    console.log("🧹 Cleaned existing browser profile for fresh start");
                }
                catch (cleanupError) {
                    console.warn("⚠️ Warning: Could not clean existing profile:", cleanupError);
                }
            }
            // Use persistent context instead of launch + newContext for more realistic browser behavior
            console.log("🌐 Launching persistent context with simplified args:", browserArgs.length, "arguments");
            console.log("📁 Profile path:", profilePath);
            try {
                this.context = yield patchright.chromium.launchPersistentContext(profilePath, {
                    channel: "chromium", // Use chromium
                    headless: false, // Always headful for better compatibility
                    hasTouch: true, // Simulate touch support
                    isMobile: true, // Simulate mobile device
                    userAgent: fingerprint.userAgent,
                    viewport: fingerprint.viewport,
                    args: browserArgs,
                    timeout: 90000, // Increased to 90 second timeout for browser launch
                    // Add extra stealth options
                    locale: "en-US",
                    timezoneId: "America/New_York",
                    colorScheme: "light",
                    reducedMotion: "no-preference",
                    forcedColors: "none",
                    extraHTTPHeaders: {
                        "Accept-Language": "en-US,en;q=0.9",
                        "Accept-Encoding": "gzip, deflate, br",
                        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                        "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                        "sec-ch-ua-mobile": fingerprint.userAgent.includes("Mobile")
                            ? "?1"
                            : "?0",
                        "sec-ch-ua-platform": fingerprint.userAgent.includes("iPhone")
                            ? '"iOS"'
                            : '"Android"',
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-User": "?1",
                        "Upgrade-Insecure-Requests": "1",
                    },
                });
                // Try to get the browser reference from the persistent context
                // Note: In some containerized environments, context.browser() may return null
                // even when the context is working perfectly fine
                if (!this.browser) {
                    this.browser = this.context.browser();
                }
                // Wait a moment for browser to fully initialize
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                // Log browser reference status but don't fail if it's null
                // The persistent context can work fine without an explicit browser reference
                if (!this.browser) {
                    console.warn("⚠️ Browser reference is null, but persistent context is working");
                    console.log("Context details:", {
                        contextExists: !!this.context,
                        contextPages: this.context ? this.context.pages().length : "N/A",
                    });
                    console.log("✅ Continuing with null browser reference (persistent context handles browser lifecycle)");
                }
                else {
                    console.log("✅ Browser instance obtained successfully");
                }
                // Minimal stealth - only hide the most obvious automation indicators
                yield this.context.addInitScript((fingerprint) => {
                    // Remove all webdriver traces
                    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
                    delete window.webdriver;
                    delete window.navigator.webdriver;
                    // Spoof platform and languages
                    const ua = fingerprint.userAgent.toLowerCase();
                    let platform = "iPhone"; // Default
                    if (ua.includes("iphone")) {
                        platform = "iPhone";
                    }
                    else if (ua.includes("ipad")) {
                        platform = "iPad";
                    }
                    else if (ua.includes("android")) {
                        platform = "Linux armv8l";
                    }
                    else if (ua.includes("win")) {
                        platform = "Win32";
                    }
                    Object.defineProperty(navigator, "platform", { get: () => platform });
                    Object.defineProperty(navigator, "languages", {
                        get: () => ["en-US", "en"],
                    });
                    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
                    // Additional stealth properties
                    Object.defineProperty(navigator, "hardwareConcurrency", {
                        get: () => 4,
                    });
                    Object.defineProperty(navigator, "maxTouchPoints", {
                        get: () => ua.includes("iphone") ||
                            ua.includes("ipad") ||
                            ua.includes("android")
                            ? 5
                            : 0,
                    });
                    // Enhanced automation hiding
                    Object.defineProperty(navigator, "connection", {
                        get: () => ({
                            effectiveType: "4g",
                            rtt: 100 + Math.random() * 50,
                            downlink: 10 + Math.random() * 5,
                            saveData: false,
                            onchange: null,
                            addEventListener: () => { },
                            removeEventListener: () => { },
                            dispatchEvent: () => true,
                        }),
                        configurable: false,
                    });
                    // Override Object.getOwnPropertyDescriptor to hide our spoofing
                    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
                    Object.getOwnPropertyDescriptor = function (obj, prop) {
                        if (obj === navigator &&
                            typeof prop === "string" &&
                            [
                                "webdriver",
                                "platform",
                                "languages",
                                "deviceMemory",
                                "hardwareConcurrency",
                                "maxTouchPoints",
                                "connection",
                            ].includes(prop)) {
                            return undefined; // Hide our modifications
                        }
                        return originalGetOwnPropertyDescriptor.call(this, obj, prop);
                    };
                    // Override Object.getOwnPropertyNames to hide automation properties
                    const originalGetOwnPropertyNames = Object.getOwnPropertyNames;
                    Object.getOwnPropertyNames = function (obj) {
                        const props = originalGetOwnPropertyNames.call(this, obj);
                        if (obj === navigator) {
                            return props.filter((prop) => ![
                                "webdriver",
                                "__webdriver_script_fn",
                                "__driver_evaluate",
                                "__webdriver_evaluate",
                                "__selenium_evaluate",
                                "__fxdriver_id",
                                "__fxdriver_unwrapped",
                                "__webdriver_script_func",
                                "__webdriver_script_function",
                                "__webdriver_unwrapped",
                            ].includes(prop));
                        }
                        return props;
                    };
                    // Hide automation indicators
                    try {
                        delete window.navigator.webdriver;
                    }
                    catch (e) {
                        // Ignore if property can't be deleted
                    }
                    // More convincing Chrome object
                    Object.defineProperty(window, "chrome", {
                        get: () => ({
                            runtime: {
                                onConnect: null,
                                onMessage: null,
                                connect: function () { },
                                sendMessage: function () { },
                            },
                            loadTimes: function () {
                                return {
                                    commitLoadTime: Date.now() / 1000 - Math.random() * 10,
                                    connectionInfo: "h2",
                                    finishDocumentLoadTime: Date.now() / 1000 - Math.random() * 5,
                                    finishLoadTime: Date.now() / 1000 - Math.random() * 3,
                                    firstPaintAfterLoadTime: Date.now() / 1000 - Math.random() * 2,
                                    firstPaintTime: Date.now() / 1000 - Math.random() * 7,
                                    navigationType: "Navigation",
                                    npnNegotiatedProtocol: "h2",
                                    requestTime: Date.now() / 1000 - Math.random() * 15,
                                    startLoadTime: Date.now() / 1000 - Math.random() * 12,
                                    wasAlternateProtocolAvailable: false,
                                    wasFetchedViaSpdy: true,
                                    wasNpnNegotiated: true,
                                };
                            },
                            csi: function () {
                                return {
                                    pageT: Date.now() - Math.random() * 1000,
                                    startE: Date.now() - Math.random() * 2000,
                                    tran: 15,
                                };
                            },
                            app: {
                                isInstalled: false,
                                InstallState: {
                                    DISABLED: "disabled",
                                    INSTALLED: "installed",
                                    NOT_INSTALLED: "not_installed",
                                },
                                RunningState: {
                                    CANNOT_RUN: "cannot_run",
                                    READY_TO_RUN: "ready_to_run",
                                    RUNNING: "running",
                                },
                            },
                        }),
                    });
                    // Spoof screen properties to match viewport
                    const screenWidth = fingerprint.viewport.width;
                    const screenHeight = fingerprint.viewport.height;
                    Object.defineProperty(screen, "width", { get: () => screenWidth });
                    Object.defineProperty(screen, "height", { get: () => screenHeight });
                    Object.defineProperty(screen, "availWidth", { get: () => screenWidth });
                    Object.defineProperty(screen, "availHeight", {
                        get: () => screenHeight,
                    });
                    Object.defineProperty(screen, "colorDepth", { get: () => 24 });
                    Object.defineProperty(screen, "pixelDepth", { get: () => 24 });
                    // Spoof plugins with more realistic data
                    const plugins = [
                        {
                            name: "Chrome PDF Plugin",
                            filename: "internal-pdf-viewer",
                            description: "Portable Document Format",
                            length: 1,
                        },
                        {
                            name: "Chrome PDF Viewer",
                            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                            description: "",
                            length: 1,
                        },
                        {
                            name: "Native Client",
                            filename: "internal-nacl-plugin",
                            description: "",
                            length: 1,
                        },
                    ];
                    Object.defineProperty(navigator, "plugins", {
                        get: () => (Object.assign(Object.assign({}, plugins), { length: plugins.length, item: (index) => plugins[index] || null, namedItem: (name) => plugins.find((p) => p.name === name) || null, refresh: () => { } })),
                    });
                    // Spoof WebGL vendor and renderer with more realistic mobile GPU info
                    try {
                        const getParameter = WebGLRenderingContext.prototype.getParameter;
                        WebGLRenderingContext.prototype.getParameter = function (parameter) {
                            if (parameter === 37445) {
                                // UNMASKED_VENDOR_WEBGL
                                if (ua.includes("iphone") || ua.includes("ipad")) {
                                    return "Apple Inc.";
                                }
                                else if (ua.includes("android")) {
                                    return "Qualcomm";
                                }
                                return "Apple Inc.";
                            }
                            if (parameter === 37446) {
                                // UNMASKED_RENDERER_WEBGL
                                if (ua.includes("iphone") || ua.includes("ipad")) {
                                    return "Apple A17 Pro GPU";
                                }
                                else if (ua.includes("android")) {
                                    return "Adreno (TM) 740";
                                }
                                return "Apple A17 Pro GPU";
                            }
                            return getParameter.call(this, parameter);
                        };
                        // Also spoof WebGL2 if available
                        if (typeof WebGL2RenderingContext !== "undefined") {
                            const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
                            WebGL2RenderingContext.prototype.getParameter = function (parameter) {
                                if (parameter === 37445) {
                                    if (ua.includes("iphone") || ua.includes("ipad")) {
                                        return "Apple Inc.";
                                    }
                                    else if (ua.includes("android")) {
                                        return "Qualcomm";
                                    }
                                    return "Apple Inc.";
                                }
                                if (parameter === 37446) {
                                    if (ua.includes("iphone") || ua.includes("ipad")) {
                                        return "Apple A17 Pro GPU";
                                    }
                                    else if (ua.includes("android")) {
                                        return "Adreno (TM) 740";
                                    }
                                    return "Apple A17 Pro GPU";
                                }
                                return getParameter2.call(this, parameter);
                            };
                        }
                    }
                    catch (e) {
                        console.warn("Failed to spoof WebGL:", e);
                    }
                    // Spoof permissions with more realistic responses
                    try {
                        const originalQuery = navigator.permissions.query;
                        navigator.permissions.query = function (parameters) {
                            const permission = parameters.name;
                            let state = "prompt";
                            // Set realistic permission states for mobile devices
                            if (permission === "notifications") {
                                state = "granted";
                            }
                            else if (permission === "geolocation") {
                                state = "prompt";
                            }
                            else if (permission === "camera") {
                                state = "prompt";
                            }
                            else if (permission === "microphone") {
                                state = "prompt";
                            }
                            else if (permission === "push") {
                                state = "prompt";
                            }
                            return Promise.resolve({
                                state: state,
                                name: permission,
                                onchange: null,
                                addEventListener: () => { },
                                removeEventListener: () => { },
                                dispatchEvent: () => true,
                            });
                        };
                    }
                    catch (e) {
                        console.warn("Failed to spoof permissions:", e);
                    }
                    // Spoof battery API for mobile realism
                    if (ua.includes("mobile") ||
                        ua.includes("iphone") ||
                        ua.includes("android")) {
                        Object.defineProperty(navigator, "getBattery", {
                            get: () => () => Promise.resolve({
                                charging: Math.random() > 0.5,
                                chargingTime: Infinity,
                                dischargingTime: Math.random() * 20000 + 3600,
                                level: Math.random() * 0.5 + 0.5, // 50-100%
                                addEventListener: () => { },
                                removeEventListener: () => { },
                                dispatchEvent: () => true,
                            }),
                        });
                    }
                    // Remove automation detection properties
                    const propsToDelete = [
                        "webdriver",
                        "__webdriver_script_fn",
                        "__webdriver_script_func",
                        "__webdriver_script_function",
                        "__fxdriver_id",
                        "__fxdriver_unwrapped",
                        "__driver_evaluate",
                        "__webdriver_evaluate",
                        "__selenium_evaluate",
                        "__webdriver_script_fn",
                        "__nightwatch_elem",
                        "__playwright",
                    ];
                    propsToDelete.forEach((prop) => {
                        try {
                            delete window[prop];
                            delete document[prop];
                            delete navigator[prop];
                        }
                        catch (e) {
                            // Ignore deletion errors
                        }
                    });
                    // Override console methods to hide automation traces
                    const originalConsole = Object.assign({}, console);
                    ["debug", "log", "warn", "error"].forEach((method) => {
                        console[method] = function (...args) {
                            const message = args.join(" ");
                            if (message.includes("webdriver") ||
                                message.includes("playwright") ||
                                message.includes("automation") ||
                                message.includes("HeadlessChrome")) {
                                return; // Suppress automation-related logs
                            }
                            originalConsole[method].apply(console, args);
                        };
                    });
                    // Spoof media devices for mobile realism
                    if (navigator.mediaDevices) {
                        const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
                        navigator.mediaDevices.enumerateDevices = function () {
                            return Promise.resolve([
                                {
                                    deviceId: "default",
                                    kind: "audioinput",
                                    label: "Default - Built-in Microphone",
                                    groupId: "group1",
                                },
                                {
                                    deviceId: "communications",
                                    kind: "audioinput",
                                    label: "Communications - Built-in Microphone",
                                    groupId: "group1",
                                },
                                {
                                    deviceId: "camera1",
                                    kind: "videoinput",
                                    label: "Built-in Camera",
                                    groupId: "group2",
                                },
                                {
                                    deviceId: "speaker1",
                                    kind: "audiooutput",
                                    label: "Built-in Speaker",
                                    groupId: "group3",
                                },
                            ]);
                        };
                    }
                    // Add realistic timing jitter to Date.now()
                    const originalDateNow = Date.now;
                    let timeOffset = 0;
                    Date.now = function () {
                        // Add small random jitter to timing
                        timeOffset += Math.random() * 2 - 1; // ±1ms jitter
                        return originalDateNow() + Math.floor(timeOffset);
                    };
                    // Spoof performance.now() with realistic timing
                    const originalPerformanceNow = performance.now;
                    let performanceOffset = 0;
                    performance.now = function () {
                        performanceOffset += Math.random() * 0.1 - 0.05; // ±0.05ms jitter
                        return originalPerformanceNow() + performanceOffset;
                    };
                }, fingerprint);
                const displayMode = isWindows
                    ? "headful (minimized)"
                    : isLinux
                        ? this.xvfbDisplay
                            ? "headful (Xvfb virtual display)"
                            : "headful (natural display)"
                        : "headful";
                console.log(`🌐 Browser initialized with persistent context (${displayMode})`);
            }
            catch (error) {
                console.error("❌ Failed to launch browser context:", error);
                console.error("🔍 Browser arguments used:", browserArgs);
                console.error("📁 Profile path:", profilePath);
                // Provide helpful troubleshooting information
                if (isWindows) {
                    console.error("💡 Windows troubleshooting tips:");
                    console.error("   1. Ensure Windows Defender/antivirus isn't blocking Chromium");
                    console.error("   2. Try running as administrator");
                    console.error("   3. Close all Chrome/Chromium instances manually");
                    console.error("   4. Check if profile directory is write-accessible");
                }
                // Clean up any partially created resources
                if (this.context) {
                    try {
                        yield this.context.close();
                    }
                    catch (closeError) {
                        console.warn("Warning: Failed to close context during error cleanup:", closeError);
                    }
                    this.context = null;
                }
                this.browser = null;
                this.currentPage = null;
                throw new Error(`Browser launch failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    closeBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.currentPage) {
                    yield this.currentPage.close();
                    this.currentPage = null;
                }
            }
            catch (error) {
                console.warn("Warning: Failed to close current page:", error);
                this.currentPage = null;
            }
            try {
                if (this.context) {
                    yield this.context.close();
                    this.context = null;
                }
            }
            catch (error) {
                console.warn("Warning: Failed to close browser context:", error);
                this.context = null;
            }
            try {
                if (this.browser) {
                    yield this.browser.close();
                    this.browser = null;
                }
            }
            catch (error) {
                console.warn("Warning: Failed to close browser:", error);
                this.browser = null;
            }
            // DON'T stop Xvfb here - we want to reuse it for retries
            // Xvfb will be stopped by internalCleanup when authentication is complete
            // Reset captured auth code when closing browser
            this.capturedAuthCode = null;
        });
    }
    // Stop Xvfb when completely done (success or final failure)
    stopXvfb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.xvfb) {
                const currentDisplay = this.xvfbDisplay; // Store current display before clearing
                try {
                    console.log("🖥️ Stopping Xvfb...");
                    this.xvfb.stopSync();
                    console.log("🖥️ Xvfb stopped successfully");
                }
                catch (error) {
                    console.warn("⚠️ Failed to stop Xvfb gracefully:", error);
                    // Try to force kill if graceful stop fails
                    if (currentDisplay) {
                        try {
                            const displayNum = currentDisplay.replace(":", "");
                            child_process.execSync(`pkill -f "Xvfb.*:${displayNum}"`, { stdio: "ignore" });
                            console.log("🖥️ Force killed Xvfb process");
                        }
                        catch (killError) {
                            console.warn("⚠️ Failed to force kill Xvfb:", killError);
                        }
                    }
                }
                finally {
                    this.xvfb = null;
                    this.xvfbDisplay = null; // Clear stored display value
                    // Don't modify process.env.DISPLAY - let the system handle it
                }
            }
        });
    }
    // Enable debug mode to show browser and detailed logging
    enableDebugMode() {
        this.debugMode = true;
    }
    disableDebugMode() {
        this.debugMode = false;
    }
    // Private cleanup method for internal use
    internalCleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cleanupInProgress) {
                return; // Prevent concurrent cleanup
            }
            this.cleanupInProgress = true;
            try {
                yield this.closeBrowser();
                yield this.stopXvfb();
            }
            catch (error) {
                console.warn("Warning: Internal cleanup failed:", error);
            }
            finally {
                this.cleanupInProgress = false;
            }
        });
    }
    authenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let loadedTokenSet = yield this.loadMSToken();
                if (loadedTokenSet !== false) {
                    // console.log("Using existing MS tokens");
                    return yield this.getGMAPIToken(loadedTokenSet);
                }
                // console.log("Performing full authentication");
                yield this.doFullAuthSequence();
                loadedTokenSet = yield this.loadMSToken();
                if (!loadedTokenSet)
                    throw new Error("Failed to load MS token set and could not generate a new one");
                return yield this.getGMAPIToken(loadedTokenSet);
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    this.handleRequestError(error);
                }
                else {
                    console.error("Authentication failed:", error);
                }
                // Ensure cleanup happens on any authentication error
                try {
                    yield this.internalCleanup();
                }
                catch (cleanupError) {
                    console.warn("Warning: Cleanup failed in authenticate error handler:", cleanupError);
                }
                throw error;
            }
        });
    }
    doFullAuthSequence() {
        return __awaiter(this, void 0, void 0, function* () {
            const maxRetries = 4; // Increased from 2 to 4 (5 total attempts)
            let lastError = null;
            let useRandomFingerprint = true; // Always use randomized fingerprint for better evasion
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    if (attempt > 0) {
                        console.log(`🔄 Authentication attempt ${attempt + 1}/${maxRetries + 1} (retry ${attempt})`);
                        // More sophisticated backoff with human-like patterns
                        const baseDelayMs = lastError && lastError.message.includes("Access Denied")
                            ? 20000 + Math.random() * 10000 // 20-30 seconds for access denied with randomization
                            : 8000 + Math.random() * 4000; // 8-12 seconds for other errors
                        const exponentialDelay = baseDelayMs * Math.pow(1.5, attempt - 1); // Reduced exponential factor
                        const jitter = Math.random() * 0.5 * exponentialDelay; // 50% jitter for unpredictability
                        const delayMs = Math.floor(exponentialDelay + jitter);
                        const delaySeconds = (delayMs / 1000).toFixed(1);
                        console.log(`⏳ Will retry authentication in ${delaySeconds} seconds...`);
                        yield new Promise((resolve) => setTimeout(resolve, delayMs));
                    }
                    // Reset any previously captured authorization code
                    this.capturedAuthCode = null;
                    const { authorizationUrl, code_verifier } = yield this.startMSAuthorizationFlow();
                    // Use browser automation with randomized fingerprint for better evasion
                    if (attempt === 0) {
                        console.log("🎭 Using randomized browser fingerprint for authentication");
                    }
                    yield this.submitCredentials(authorizationUrl, useRandomFingerprint);
                    // Only call handleMFA if the auth code wasn't captured by submitCredentials
                    if (!this.capturedAuthCode) {
                        yield this.handleMFA();
                    }
                    const authCode = yield this.getAuthorizationCode();
                    if (!authCode) {
                        throw new Error("🚫 Failed to get authorization code after all attempts. Possible incorrect credentials, MFA issue, or unexpected page flow.");
                    }
                    const tokenSet = yield this.getMSToken(authCode, code_verifier);
                    yield this.saveTokens(tokenSet);
                    if (attempt > 0) {
                        console.log(`✅ Authentication succeeded on attempt ${attempt + 1}`);
                    }
                    // Always clean up browser resources after successful authentication
                    try {
                        yield this.internalCleanup();
                    }
                    catch (cleanupError) {
                        console.warn("Warning: Browser cleanup failed after success:", cleanupError);
                    }
                    return tokenSet;
                }
                catch (error) {
                    lastError = error;
                    console.error(`❌ Authentication attempt ${attempt + 1} failed:`, error);
                    // Always clean up browser resources after each attempt
                    try {
                        yield this.closeBrowser();
                    }
                    catch (cleanupError) {
                        console.warn("Warning: Browser cleanup failed:", cleanupError);
                    }
                    // If this is not the last attempt, continue to retry
                    if (attempt < maxRetries) {
                        const isAccessDenied = lastError.message.includes("Access Denied");
                        const nextDelaySeconds = isAccessDenied
                            ? `${((12000 * Math.pow(2, attempt)) / 1000).toFixed(1)}-${((12000 * Math.pow(2, attempt) * 1.4) / 1000).toFixed(1)}`
                            : `${((5000 * Math.pow(2, attempt)) / 1000).toFixed(1)}-${((5000 * Math.pow(2, attempt) * 1.4) / 1000).toFixed(1)}`;
                        console.log(`⏳ Will retry authentication in ~${nextDelaySeconds} seconds...`);
                        continue;
                    }
                }
            }
            // If we get here, all retries failed
            console.error(`🚫 Authentication failed after ${maxRetries + 1} attempts`);
            // Clean up on final failure
            try {
                yield this.internalCleanup();
            }
            catch (cleanupError) {
                console.warn("Warning: Cleanup failed after final failure:", cleanupError);
            }
            throw (lastError || new Error("Authentication failed after all retry attempts"));
        });
    }
    saveTokens(tokenSet) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Saving MS tokens to ", this.MSTokenPath);
            fs.writeFileSync(this.MSTokenPath, JSON.stringify(tokenSet));
            // Save the GM API token as well
            if (this.currentGMAPIToken) {
                const tokenFilePath = this.GMTokenPath; // Define the path for the token file
                // console.log("Saving GM tokens to ", this.GMTokenPath);
                fs.writeFileSync(tokenFilePath, JSON.stringify(this.currentGMAPIToken));
                // console.log("Saved current GM API token to ", tokenFilePath);
            }
        });
    }
    getAuthorizationCode() {
        return __awaiter(this, void 0, void 0, function* () {
            // Return the authorization code captured during the browser flow
            if (this.capturedAuthCode) {
                console.log("Using authorization code captured from browser redirect");
                return this.capturedAuthCode;
            }
            else {
                return null;
            }
        });
    }
    handleMFA() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔐 Initiating multi-factor authentication (MFA) via browser automation");
            if (!this.context || !this.currentPage) {
                throw new Error("Browser context and page not initialized - call submitCredentials first");
            }
            const page = this.currentPage;
            console.log("📄 Current MFA page title:", yield page.title());
            try {
                // Wait for MFA page to load
                yield page.waitForLoadState("networkidle");
                console.log("🔍 Scanning for multi-factor authentication (MFA) input elements...");
                // Look for MFA elements
                yield page.waitForSelector('input[name="otpCode"], input[name="emailMfa"], input[name="strongAuthenticationPhoneNumber"]', { timeout: 60000 });
                console.log("✅ MFA elements found - analyzing authentication method type");
                const pageContent = yield page.content();
                // Determine MFA type
                let mfaType = null;
                if ((yield page.locator('input[name="otpCode"]').count()) > 0 ||
                    pageContent.includes("otpCode")) {
                    mfaType = "TOTP";
                }
                else if ((yield page.locator('input[name="emailMfa"]').count()) > 0 ||
                    pageContent.includes("emailMfa")) {
                    mfaType = "EMAIL";
                }
                else if ((yield page
                    .locator('input[name="strongAuthenticationPhoneNumber"]')
                    .count()) > 0 ||
                    pageContent.includes("strongAuthenticationPhoneNumber")) {
                    mfaType = "SMS";
                }
                if (mfaType == null) {
                    throw new Error("Could not determine MFA Type. Bad email or password?");
                }
                if (mfaType != "TOTP") {
                    throw new Error(`Only TOTP via "Third-Party Authenticator" is currently supported by this implementation. Please update your OnStar account to use this method, if possible.`);
                }
                // Generate TOTP code
                var totp_secret = this.config.totpKey.trim();
                // Handle instances where users blindly copy the TOTP link. We can just extract the key.
                if (totp_secret.includes("secret=")) {
                    const match = this.getRegexMatch(totp_secret, "secret=(.*?)&");
                    totp_secret = match !== null && match !== void 0 ? match : totp_secret;
                }
                if (totp_secret.length != 16) {
                    throw new Error("Provided TOTP Key does not meet expected key length. Key should be 16 alphanumeric characters.");
                }
                const { otp } = totpGenerator.TOTP.generate(totp_secret, {
                    digits: 6,
                    algorithm: "SHA-1",
                    period: 30,
                });
                console.log("📱 Entering TOTP authentication code:", otp); // Fill in the OTP code
                const otpField = yield page
                    .locator('input[name="otpCode"], [aria-label*="One-Time Passcode"i], [aria-label*="OTP"i]')
                    .first();
                yield otpField.click({ delay: Math.random() * 200 + 50 });
                yield otpField.type(otp, { delay: Math.random() * 150 + 50 });
                yield page.waitForTimeout(500 + Math.random() * 500); // Pause before clicking
                console.log("✅ TOTP code entered - preparing to submit MFA form");
                // Enable CDP Network domain for low-level network monitoring
                const client = yield page.context().newCDPSession(page);
                yield client.send("Network.enable");
                // Set up CDP network listener to catch everything that appears in DevTools
                client.on("Network.requestWillBeSent", (params) => {
                    const requestUrl = params.request.url;
                    // if (this.debugMode) {
                    //   console.log(
                    //     `[DEBUG handleMFA CDP requestWillBeSent] Request to: ${requestUrl}`,
                    //   );
                    // }
                    if (requestUrl
                        .toLowerCase()
                        .startsWith("msauth.com.gm.mychevrolet://auth")) {
                        console.log(`[SUCCESS handleMFA CDP requestWillBeSent] Captured msauth redirect via CDP. URL: ${requestUrl}`);
                        this.capturedAuthCode = this.getRegexMatch(requestUrl, `[?&]code=([^&]*)`);
                        if (this.capturedAuthCode) {
                            console.log(`[SUCCESS handleMFA CDP requestWillBeSent] Extracted authorization code: ${this.capturedAuthCode}`);
                        }
                        else {
                            console.error(`[ERROR handleMFA CDP requestWillBeSent] msauth redirect found, but FAILED to extract code from: ${requestUrl}`);
                        }
                    }
                });
                // // Also listen for redirects at CDP level
                // client.on("Network.responseReceived", (params: any) => {
                //   const response = params.response;
                //   if (
                //     (response.status === 301 || response.status === 302) &&
                //     response.headers &&
                //     response.headers.location
                //   ) {
                //     const location = response.headers.location;
                //     if (this.debugMode) {
                //       console.log(
                //         `[DEBUG handleMFA CDP responseReceived] Redirect from ${response.url} to: ${location}`,
                //       );
                //     }
                //     if (
                //       location
                //         .toLowerCase()
                //         .startsWith("msauth.com.gm.mychevrolet://auth")
                //     ) {
                //       console.log(
                //         `[SUCCESS handleMFA CDP responseReceived] Captured msauth redirect via CDP response. Location: ${location}`,
                //       );
                //       this.capturedAuthCode = this.getRegexMatch(
                //         location,
                //         `[?&]code=([^&]*)`,
                //       );
                //       if (this.capturedAuthCode) {
                //         console.log(
                //           `[SUCCESS handleMFA CDP responseReceived] Extracted authorization code: ${this.capturedAuthCode}`,
                //         );
                //       } else {
                //         console.error(
                //           `[ERROR handleMFA CDP responseReceived] msauth redirect found, but FAILED to extract code from: ${location}`,
                //         );
                //       }
                //     }
                //   }
                // });
                // Submit the MFA form
                const submitMfaButton = yield page // Renamed variable to avoid conflict
                    .locator('button[type="submit"], input[type="submit"], button:has-text("Verify"), button:has-text("Continue"), button:has-text("Submit"), [role="button"][aria-label*="Verify"i], [role="button"][aria-label*="Continue"i], [role="button"][aria-label*="Submit"i]')
                    .first();
                yield submitMfaButton.waitFor({ timeout: 60000 });
                console.log("✅ MFA submit button found - clicking to complete authentication");
                yield submitMfaButton.click();
                if (this.debugMode)
                    console.log("⌛ Waiting for redirect after MFA submission...");
                yield page.waitForLoadState("networkidle", { timeout: 60000 }); // Wait for potential redirects or network activity
                try {
                    // Wait for the auth code to be captured by CDP listeners
                    if (this.debugMode)
                        console.log("⌛ Monitoring for authorization code capture after MFA submission...");
                    const captured = yield this.waitForAuthCode(60000); // Use the new helper
                    if (!captured && this.debugMode) {
                        console.log("🚫 [handleMFA] Did not capture auth code after submit within timeout.");
                    }
                }
                catch (e) {
                    console.error("🚫 [handleMFA] Error during waitForAuthCode:", e);
                }
                try {
                    yield client.detach();
                }
                catch (e) {
                    // CDP session might already be detached
                }
                if (this.debugMode)
                    console.log("⌛ Waiting for page navigation and redirect completion after MFA...");
                yield page.waitForLoadState("networkidle");
                if (this.capturedAuthCode) {
                    console.log("Successfully captured authorization code");
                }
                else {
                    console.log("Failed to capture authorization code from browser redirect");
                }
            }
            catch (error) {
                console.error("Error in handleMFA:", error);
                throw error;
            }
        });
    }
    syncCookiesFromBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.context)
                return;
            // Get all cookies from the browser context
            const cookies = yield this.context.cookies();
            // Add each cookie to the tough-cookie jar
            for (const cookie of cookies) {
                const cookieString = `${cookie.name}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}`;
                try {
                    yield this.jar.setCookie(cookieString, `https://${cookie.domain}`);
                }
                catch (error) {
                    // Skip cookies that can't be set (e.g., invalid format)
                    console.warn(`Failed to sync cookie ${cookie.name}:`, error);
                }
            }
        });
    }
    // Generate randomized browser fingerprint to avoid detection
    generateRandomFingerprint() {
        const deviceProfiles = [
            // iPhones
            {
                type: "iPhone",
                osVersions: [
                    "15_8_3",
                    "16_0",
                    "16_1",
                    "16_2",
                    "16_3",
                    "16_4",
                    "16_5",
                    "16_6",
                    "16_7",
                    "17_0",
                    "17_1",
                    "17_2",
                    "17_3",
                    "17_4",
                    "17_5",
                    "17_6",
                    "18_0",
                    "18_1",
                    "18_2",
                    "18_3",
                ],
                safariVersions: [
                    "604.1",
                    "605.1.15",
                    "606.1.36",
                    "607.1.56",
                    "608.1.49",
                    "609.1.20",
                    "610.4.3",
                    "611.2.7",
                ],
                webkitVersions: [
                    "605.1.15",
                    "606.4.10",
                    "607.3.10",
                    "608.4.9",
                    "609.4.1",
                    "610.1.28",
                    "611.3.10",
                    "612.1.6",
                ],
                viewports: [
                    { width: 430, height: 932 }, // iPhone 15 Pro Max
                    { width: 393, height: 852 }, // iPhone 15 Pro
                    { width: 390, height: 844 }, // iPhone 15/15 Plus
                    { width: 428, height: 926 }, // iPhone 14 Pro Max
                    { width: 393, height: 852 }, // iPhone 14 Pro
                    { width: 390, height: 844 }, // iPhone 14/14 Plus
                    { width: 428, height: 926 }, // iPhone 13 Pro Max
                    { width: 390, height: 844 }, // iPhone 13/13 Pro/13 Mini
                    { width: 375, height: 812 }, // iPhone 12/12 Pro/12 Mini
                    { width: 414, height: 896 }, // iPhone 11/11 Pro Max/XR/XS Max
                    { width: 375, height: 812 }, // iPhone X/XS/11 Pro
                    { width: 414, height: 736 }, // iPhone 8 Plus/7 Plus/6s Plus
                    { width: 375, height: 667 }, // iPhone 8/7/6s/6/SE
                ],
                getUserAgent: (p) => `Mozilla/5.0 (iPhone; CPU iPhone OS ${this.getRandom(p.osVersions)} like Mac OS X) AppleWebKit/${this.getRandom(p.webkitVersions)} (KHTML, like Gecko) Version/${this.getRandom(p.safariVersions)} Mobile/15E148 Safari/${this.getRandom(p.safariVersions)}`,
            },
            // iPads
            {
                type: "iPad",
                osVersions: [
                    "15_8_3",
                    "16_0",
                    "16_1",
                    "16_2",
                    "16_3",
                    "16_4",
                    "16_5",
                    "16_6",
                    "16_7",
                    "17_0",
                    "17_1",
                    "17_2",
                    "17_3",
                    "17_4",
                    "17_5",
                    "17_6",
                    "18_0",
                    "18_1",
                ],
                safariVersions: [
                    "604.1",
                    "605.1.15",
                    "606.1.36",
                    "607.1.56",
                    "608.1.49",
                    "609.1.20",
                ],
                webkitVersions: [
                    "605.1.15",
                    "606.4.10",
                    "607.3.10",
                    "608.4.9",
                    "609.4.1",
                    "610.1.28",
                ],
                viewports: [
                    { width: 1024, height: 1366 }, // iPad Pro 12.9"
                    { width: 834, height: 1194 }, // iPad Pro 11"
                    { width: 820, height: 1180 }, // iPad Air
                    { width: 768, height: 1024 }, // iPad Mini/9.7"
                ],
                getUserAgent: (p) => `Mozilla/5.0 (iPad; CPU OS ${this.getRandom(p.osVersions)} like Mac OS X) AppleWebKit/${this.getRandom(p.webkitVersions)} (KHTML, like Gecko) Version/${this.getRandom(p.safariVersions)} Mobile/15E148 Safari/${this.getRandom(p.safariVersions)}`,
            },
            // Samsung Phones (Android)
            {
                type: "Samsung Phone",
                androidVersions: ["13", "14", "15"],
                chromeVersions: ["124.0.6367.113", "125.0.6422.112", "126.0.6478.71"],
                models: [
                    "SM-S928B", // Galaxy S24 Ultra
                    "SM-S918U", // Galaxy S23 Ultra
                    "SM-G998B", // Galaxy S21 Ultra
                    "SM-F946B", // Galaxy Z Fold 5
                ],
                viewports: [
                    { width: 412, height: 915 },
                    { width: 384, height: 854 },
                    { width: 360, height: 740 },
                ],
                getUserAgent: (p) => `Mozilla/5.0 (Linux; Android ${this.getRandom(p.androidVersions)}; ${this.getRandom(p.models)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.getRandom(p.chromeVersions)} Mobile Safari/537.36`,
            },
            // Google Pixel Phones (Android)
            {
                type: "Google Pixel",
                androidVersions: ["12", "13", "14", "15"],
                chromeVersions: [
                    "122.0.6261.119",
                    "123.0.6312.99",
                    "124.0.6367.113",
                    "125.0.6422.112",
                    "126.0.6478.71",
                    "127.0.6533.64",
                ],
                models: [
                    "Pixel 9 Pro XL",
                    "Pixel 9 Pro",
                    "Pixel 9",
                    "Pixel 8a",
                    "Pixel 8 Pro",
                    "Pixel 8",
                    "Pixel 7a",
                    "Pixel 7 Pro",
                    "Pixel 7",
                    "Pixel 6a",
                    "Pixel 6 Pro",
                    "Pixel 6",
                    "Pixel 5a",
                    "Pixel 5",
                    "Pixel 4a",
                    "Pixel 4",
                ],
                viewports: [
                    { width: 412, height: 915 }, // Pixel 9 Pro XL
                    { width: 384, height: 854 }, // Pixel 9 Pro
                    { width: 393, height: 851 }, // Pixel 9/8/7
                    { width: 412, height: 892 }, // Pixel 8a/7a/6a
                    { width: 412, height: 869 }, // Pixel 6 Pro
                    { width: 393, height: 786 }, // Pixel 5a/5
                    { width: 393, height: 851 }, // Pixel 4a/4
                ],
                getUserAgent: (p) => `Mozilla/5.0 (Linux; Android ${this.getRandom(p.androidVersions)}; ${this.getRandom(p.models)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.getRandom(p.chromeVersions)} Mobile Safari/537.36`,
            },
            // Microsoft Surface (Windows Tablet)
            {
                type: "Microsoft Surface",
                edgeVersions: ["124.0.2478.80", "125.0.2535.51", "126.0.2592.56"],
                chromeVersions: ["124.0.6367.113", "125.0.6422.112", "126.0.6478.71"],
                viewports: [
                    { width: 915, height: 1368 }, // Surface Pro
                    { width: 810, height: 1080 }, // Surface Go
                ],
                getUserAgent: (p) => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.getRandom(p.chromeVersions)} Safari/537.36 Edg/${this.getRandom(p.edgeVersions)}`,
            },
        ];
        // Select a random device profile
        const profile = this.getRandom(deviceProfiles);
        // Generate user agent and viewport from the selected profile
        const userAgent = profile.getUserAgent(profile);
        const viewport = this.getRandom(profile.viewports);
        return { userAgent, viewport, deviceType: profile.type };
    }
    // Helper to get a random element from an array
    getRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    submitCredentials(authorizationUrl_1) {
        return __awaiter(this, arguments, void 0, function* (authorizationUrl, useRandomFingerprint = false) {
            console.log("🌐 Launching browser automation for Microsoft authentication");
            // Initialize browser if not already done
            yield this.initBrowser(useRandomFingerprint);
            if (!this.context) {
                throw new Error("Browser context not initialized");
            }
            const page = yield this.context.newPage();
            this.currentPage = page;
            try {
                // Navigate to the authorization URL
                console.log("Navigating to auth URL...");
                let attempts = 0;
                const maxAttempts = 3;
                let navigationSuccessful = false;
                while (attempts < maxAttempts && !navigationSuccessful) {
                    try {
                        yield page.goto(authorizationUrl, {
                            waitUntil: "load", // Changed from domcontentloaded
                            timeout: 60000, // Increased timeout
                        });
                        navigationSuccessful = true;
                    }
                    catch (e) {
                        attempts++;
                        console.warn(`Navigation attempt ${attempts} failed: ${e.message}`);
                        if (attempts >= maxAttempts) {
                            throw e; // Re-throw the error after max attempts
                        }
                        yield page.waitForTimeout(2000 * attempts); // Exponential backoff
                    }
                }
                yield page.waitForLoadState("networkidle", { timeout: 60000 }); // Keep this for after successful goto
                console.log("📄 Authentication page loaded successfully. URL:", page.url());
                console.log("📄 Current page title:", yield page.title());
                // Simulate human browsing behavior - scroll and mouse movement
                yield page.waitForTimeout(1000 + Math.random() * 2000);
                // Random mouse movements to simulate reading
                const viewport = page.viewportSize();
                if (viewport) {
                    for (let i = 0; i < 3; i++) {
                        yield page.mouse.move(Math.random() * viewport.width, Math.random() * viewport.height, { steps: Math.floor(Math.random() * 10) + 5 });
                        yield page.waitForTimeout(500 + Math.random() * 1000);
                    }
                }
                // Simulate slight scrolling (like humans checking the page)
                if (Math.random() > 0.3) {
                    yield page.mouse.wheel(0, Math.random() * 200 + 50);
                    yield page.waitForTimeout(300 + Math.random() * 500);
                    yield page.mouse.wheel(0, -(Math.random() * 100 + 25)); // Scroll back up a bit
                    yield page.waitForTimeout(200 + Math.random() * 400);
                }
                // Check if we're stuck on a loading page
                const title = yield page.title();
                if (title.includes("Loading") ||
                    title.trim() === "" ||
                    title.includes("...")) {
                    console.log("Detected loading page, attempting to recover...");
                    // await page.screenshot({
                    //   path: "debug-loading-page.png",
                    //   fullPage: true,
                    // });
                    // console.log("Screenshot saved as debug-loading-page.png");
                    // Try refreshing the page
                    console.log("🔄 Attempting page refresh to reload authentication form...");
                    yield page.reload({ waitUntil: "domcontentloaded" });
                    yield page.waitForLoadState("networkidle");
                    const newTitle = yield page.title();
                    console.log("📄 Page refreshed successfully. New title:", newTitle);
                }
                console.log("🔍 Locating Microsoft email input field on login page...");
                // Find and fill email field
                const emailField = page
                    .locator('input[type="email"], input[name="logonIdentifier"], input#logonIdentifier, [aria-label*="Email"i], [placeholder*="Email"i]')
                    .first();
                yield emailField.waitFor({ timeout: 60000 });
                console.log("✅ Email field found - clicking and entering email address");
                // Simulate realistic human behavior - pause to "read" the page
                yield page.waitForTimeout(2000 + Math.random() * 3000);
                // Simulate mouse movement before clicking email field
                const emailBox = yield emailField.boundingBox();
                if (emailBox) {
                    // Move mouse to a random point near the email field first
                    yield page.mouse.move(emailBox.x +
                        emailBox.width * 0.1 +
                        Math.random() * (emailBox.width * 0.3), emailBox.y +
                        emailBox.height * 0.1 +
                        Math.random() * (emailBox.height * 0.3), { steps: Math.floor(Math.random() * 10) + 5 });
                    yield page.waitForTimeout(200 + Math.random() * 500);
                }
                yield emailField.click({ delay: Math.random() * 200 + 50 });
                // Simulate realistic typing with occasional pauses (like humans do)
                const email = this.config.username;
                for (let i = 0; i < email.length; i++) {
                    yield page.keyboard.type(email[i], { delay: Math.random() * 150 + 50 });
                    // Occasionally pause while typing (like humans thinking)
                    if (Math.random() < 0.1) {
                        yield page.waitForTimeout(300 + Math.random() * 800);
                    }
                }
                console.log("🔍 Searching for Continue button to proceed to password page...");
                yield page.waitForTimeout(800 + Math.random() * 1200); // Human hesitation before proceeding
                // Click continue button with realistic mouse movement
                const continueButton = page
                    .locator('button#continue[data-dtm="sign in"][aria-label="Continue"], button:has-text("Continue")[data-dtm="sign in"], [role="button"][aria-label*="Continue"i]')
                    .first();
                yield continueButton.waitFor({ timeout: 60000 });
                console.log("✅ Continue button found - clicking to proceed to password entry");
                // Hover before clicking (human-like behavior)
                yield continueButton.hover();
                yield page.waitForTimeout(200 + Math.random() * 400);
                // Move mouse slightly before final click
                const continueBox = yield continueButton.boundingBox();
                if (continueBox) {
                    yield page.mouse.move(continueBox.x + continueBox.width * (0.3 + Math.random() * 0.4), continueBox.y + continueBox.height * (0.3 + Math.random() * 0.4), { steps: 3 });
                    yield page.waitForTimeout(100 + Math.random() * 200);
                }
                yield continueButton.click({ delay: Math.random() * 200 + 50 });
                console.log("🔍 Looking for password input field on authentication page...");
                // Wait for password page and fill password
                yield page.waitForLoadState("networkidle", { timeout: 60000 });
                const passwordField = page
                    .locator('input[type="password"], input[name="password"], [aria-label*="Password"i], [placeholder*="Password"i]')
                    .first();
                yield passwordField.waitFor({ timeout: 60000 });
                console.log("✅ Password field found - clicking and entering password");
                // Simulate human behavior - pause to see the new page
                yield page.waitForTimeout(1500 + Math.random() * 2500);
                // Simulate mouse movement before password field interaction
                const passwordBox = yield passwordField.boundingBox();
                if (passwordBox) {
                    // Move to password field area with realistic movement
                    yield page.mouse.move(passwordBox.x +
                        passwordBox.width * 0.2 +
                        Math.random() * (passwordBox.width * 0.3), passwordBox.y +
                        passwordBox.height * 0.2 +
                        Math.random() * (passwordBox.height * 0.3), { steps: Math.floor(Math.random() * 8) + 4 });
                    yield page.waitForTimeout(150 + Math.random() * 300);
                }
                yield passwordField.click({ delay: Math.random() * 200 + 50 });
                // Type password with human-like patterns
                const password = this.config.password;
                for (let i = 0; i < password.length; i++) {
                    yield page.keyboard.type(password[i], {
                        delay: Math.random() * 120 + 40,
                    });
                    // Occasional hesitation while typing password
                    if (Math.random() < 0.08) {
                        yield page.waitForTimeout(200 + Math.random() * 600);
                    }
                }
                console.log("🔍 Locating Sign In button and preparing network monitoring for authentication redirect...");
                yield page.waitForTimeout(500 + Math.random() * 500); // Pause before clicking
                // Enable CDP Network domain for low-level network monitoring
                const client = yield page.context().newCDPSession(page);
                yield client.send("Network.enable");
                // Flag to track if access is denied
                let accessDenied = false;
                // Set up CDP network listener to catch everything that appears in DevTools
                client.on("Network.requestWillBeSent", (params) => {
                    const requestUrl = params.request.url;
                    if (this.debugMode) {
                        // console.log(
                        //   `[DEBUG CDP requestWillBeSent] Request to: ${requestUrl}`,
                        // );
                    }
                    if (requestUrl
                        .toLowerCase()
                        .startsWith("msauth.com.gm.mychevrolet://auth")) {
                        console.log(`[SUCCESS CDP requestWillBeSent] Captured msauth redirect via CDP. URL: ${requestUrl}`);
                        this.capturedAuthCode = this.getRegexMatch(requestUrl, `[?&]code=([^&]*)`);
                        if (this.capturedAuthCode) {
                            console.log(`[SUCCESS CDP requestWillBeSent] Extracted authorization code: ${this.capturedAuthCode}`);
                        }
                        else {
                            console.error(`[ERROR CDP requestWillBeSent] msauth redirect found, but FAILED to extract code from: ${requestUrl}`);
                        }
                    }
                });
                // Listen for responses to check for Access Denied
                client.on("Network.responseReceived", (params) => __awaiter(this, void 0, void 0, function* () {
                    const response = params.response;
                    try {
                        // Get the response body to check for access denied
                        const responseBody = yield client.send("Network.getResponseBody", {
                            requestId: params.requestId,
                        });
                        if (responseBody.body &&
                            responseBody.body.includes("<TITLE>Access Denied</TITLE>")) {
                            console.log(`[ACCESS DENIED] Detected access denied response from: ${response.url}`);
                            accessDenied = true;
                        }
                    }
                    catch (error) {
                        // Ignore errors when getting response body (some responses may not be available)
                    }
                    // Also check redirects at CDP level for auth codes
                    if ((response.status === 301 || response.status === 302) &&
                        response.headers &&
                        response.headers.location) {
                        const location = response.headers.location;
                        if (this.debugMode) {
                            console.log(`[DEBUG CDP responseReceived] Redirect from ${response.url} to: ${location}`);
                        }
                        if (location
                            .toLowerCase()
                            .startsWith("msauth.com.gm.mychevrolet://auth")) {
                            console.log(`[SUCCESS CDP responseReceived] Captured msauth redirect via CDP response. Location: ${location}`);
                            this.capturedAuthCode = this.getRegexMatch(location, `[?&]code=([^&]*)`);
                            if (this.capturedAuthCode) {
                                console.log(`[SUCCESS CDP responseReceived] Extracted authorization code: ${this.capturedAuthCode}`);
                            }
                            else {
                                console.error(`[ERROR CDP responseReceived] msauth redirect found, but FAILED to extract code from: ${location}`);
                            }
                        }
                    }
                }));
                // Click the sign-in button
                const submitButton = page
                    .locator('button#continue[data-dtm="sign in"][aria-label="Sign in"], button:has-text("Log In")[data-dtm="sign in"], button:has-text("Sign in")[data-dtm="sign in"], [role="button"][aria-label*="Sign in"i], [role="button"][aria-label*="Log In"i]')
                    .first();
                yield submitButton.waitFor({ timeout: 60000 });
                console.log("✅ Sign In button found - clicking to submit authentication credentials");
                yield submitButton.hover();
                yield page.waitForTimeout(100 + Math.random() * 200);
                yield submitButton.click({ delay: Math.random() * 200 + 50 });
                // Wait a bit for the redirect to potentially happen
                yield page.waitForTimeout(3000);
                var postSubmitTitle = yield page.title();
                // Check for access denied response detected by CDP
                if (accessDenied) {
                    let retryCount = 0;
                    const maxRetries = 2;
                    while (accessDenied && retryCount < maxRetries) {
                        retryCount++;
                        console.log(`🔄 Access denied detected. Retrying credential submission (attempt ${retryCount}/${maxRetries})...`);
                        // Reset the access denied flag for this retry
                        accessDenied = false;
                        // Human-like wait before retrying - simulate user thinking and trying again
                        const retryDelay = 2000 + Math.random() * 3000 + retryCount * 1000; // Progressive delay
                        console.log(`⏳ Waiting ${(retryDelay / 1000).toFixed(1)}s before retry (simulating human behavior)...`);
                        yield page.waitForTimeout(retryDelay);
                        try {
                            // Refresh the page to start over with credential submission
                            console.log("🔄 Refreshing authentication page for retry...");
                            yield page.reload({ waitUntil: "networkidle", timeout: 60000 });
                            // Simulate human pause after page reload to read/assess the page
                            yield page.waitForTimeout(1500 + Math.random() * 2500);
                            // Re-enter email with human-like behavior
                            console.log("🔍 Re-locating email input field after page refresh...");
                            const retryEmailField = page
                                .locator('input[type="email"], input[name="logonIdentifier"], input#logonIdentifier, [aria-label*="Email"i], [placeholder*="Email"i]')
                                .first();
                            yield retryEmailField.waitFor({ timeout: 60000 });
                            console.log("✅ Email field found - entering email address");
                            // Simulate human mouse movement before clicking
                            const emailBox = yield retryEmailField.boundingBox();
                            if (emailBox) {
                                yield page.mouse.move(emailBox.x + emailBox.width * (0.2 + Math.random() * 0.6), emailBox.y + emailBox.height * (0.2 + Math.random() * 0.6), { steps: Math.floor(Math.random() * 8) + 3 });
                                yield page.waitForTimeout(150 + Math.random() * 300);
                            }
                            yield retryEmailField.click({ delay: Math.random() * 200 + 50 });
                            // Type email with human-like timing
                            const email = this.config.username;
                            for (let i = 0; i < email.length; i++) {
                                yield page.keyboard.type(email[i], {
                                    delay: Math.random() * 120 + 40,
                                });
                                // Occasional hesitation during typing
                                if (Math.random() < 0.08) {
                                    yield page.waitForTimeout(200 + Math.random() * 500);
                                }
                            }
                            // Human pause before clicking continue
                            yield page.waitForTimeout(800 + Math.random() * 1200);
                            // Click continue button
                            console.log("🔍 Locating Continue button...");
                            const retryContinueButton = page
                                .locator('button#continue[data-dtm="sign in"][aria-label="Continue"], button:has-text("Continue")[data-dtm="sign in"], [role="button"][aria-label*="Continue"i]')
                                .first();
                            yield retryContinueButton.waitFor({ timeout: 60000 });
                            console.log("✅ Continue button found - clicking to proceed to password entry");
                            // Hover before clicking (human-like)
                            yield retryContinueButton.hover();
                            yield page.waitForTimeout(200 + Math.random() * 400);
                            yield retryContinueButton.click({
                                delay: Math.random() * 200 + 50,
                            });
                            // Wait for password page
                            console.log("⏳ Waiting for password page to load...");
                            yield page.waitForLoadState("networkidle", { timeout: 60000 });
                            // Human pause to assess password page
                            yield page.waitForTimeout(1200 + Math.random() * 2000);
                            // Re-enter password with human-like behavior
                            console.log("🔍 Re-locating password input field...");
                            const retryPasswordField = page
                                .locator('input[type="password"], input[name="password"], [aria-label*="Password"i], [placeholder*="Password"i]')
                                .first();
                            yield retryPasswordField.waitFor({ timeout: 60000 });
                            console.log("✅ Password field found - entering password");
                            // Simulate mouse movement before password field
                            const passwordBox = yield retryPasswordField.boundingBox();
                            if (passwordBox) {
                                yield page.mouse.move(passwordBox.x + passwordBox.width * (0.2 + Math.random() * 0.6), passwordBox.y +
                                    passwordBox.height * (0.2 + Math.random() * 0.6), { steps: Math.floor(Math.random() * 8) + 4 });
                                yield page.waitForTimeout(150 + Math.random() * 300);
                            }
                            yield retryPasswordField.click({ delay: Math.random() * 200 + 50 });
                            // Type password with human-like timing
                            const password = this.config.password;
                            for (let i = 0; i < password.length; i++) {
                                yield page.keyboard.type(password[i], {
                                    delay: Math.random() * 100 + 50,
                                });
                                // Occasional hesitation during password typing
                                if (Math.random() < 0.06) {
                                    yield page.waitForTimeout(150 + Math.random() * 400);
                                }
                            }
                            // Human pause before final submission
                            yield page.waitForTimeout(600 + Math.random() * 800);
                            // Re-submit credentials
                            console.log("🔍 Locating Sign In button for retry submission...");
                            const retrySubmitButton = page
                                .locator('button#continue[data-dtm="sign in"][aria-label="Sign in"], button:has-text("Log In")[data-dtm="sign in"], button:has-text("Sign in")[data-dtm="sign in"], [role="button"][aria-label*="Sign in"i], [role="button"][aria-label*="Log In"i]')
                                .first();
                            yield retrySubmitButton.waitFor({ timeout: 60000 });
                            console.log("✅ Sign In button found - clicking to submit credentials again");
                            // Hover before final click
                            yield retrySubmitButton.hover();
                            yield page.waitForTimeout(100 + Math.random() * 200);
                            yield retrySubmitButton.click({ delay: Math.random() * 200 + 50 }); // Wait for response
                            console.log("⏳ Waiting for authentication response after retry...");
                            yield page.waitForTimeout(3000);
                            yield page.waitForLoadState("networkidle", { timeout: 60000 });
                            console.log(`✅ Retry attempt ${retryCount} completed`);
                        }
                        catch (retryError) {
                            console.error(`❌ Retry attempt ${retryCount} failed:`, retryError);
                            // Continue to next retry or exit loop if max retries reached
                        }
                    }
                    // If still access denied after all retries, throw the error
                    if (accessDenied) {
                        throw new Error(`🚫 Access Denied: Authentication blocked after ${maxRetries} retries. This could be due to rate limiting, IP blocking, or security restrictions. Please wait before retrying or check if your IP is blocked.`);
                    }
                }
                // Wait for network to be idle in case other things are happening,
                // or if MFA is indeed the next step.
                console.log("⏳ Monitoring network activity and waiting for authentication response...");
                yield page.waitForLoadState("networkidle", { timeout: 60000 });
                // Wait a bit for the redirect to potentially happen
                yield page.waitForTimeout(3000);
                postSubmitTitle = yield page.title();
                yield page.waitForLoadState("networkidle", { timeout: 60000 });
                postSubmitTitle = yield page.title();
                // Check if we're still on the sign-in page (credential submission failed)
                if (postSubmitTitle.toLowerCase().includes("sign in")) {
                    console.log(`⚠️ Still on sign-in page after credential submission: "${postSubmitTitle}". This suggests credentials weren't accepted properly.`);
                    // // Check for any error messages on the page
                    // const errorMessages = await page
                    //   .locator(
                    //     '[role="alert"], .error, .alert, [class*="error"], [class*="alert"]',
                    //   )
                    //   .allTextContents();
                    // if (errorMessages.length > 0) {
                    //   console.log("Found error messages on page:", errorMessages);
                    //   throw new Error(
                    //     `Authentication failed with errors: ${errorMessages.join(", ")}`,
                    //   );
                    // }
                    // Try refreshing and re-submitting credentials once more
                    console.log("🔄 Attempting to refresh page and retry credential submission...");
                    // Human-like delay before retry - simulate user thinking about what went wrong
                    const retryThinkingDelay = 3000 + Math.random() * 4000;
                    console.log(`⏳ Pausing ${(retryThinkingDelay / 1000).toFixed(1)}s before retry (simulating human assessment)...`);
                    yield page.waitForTimeout(retryThinkingDelay);
                    yield page.reload({ waitUntil: "networkidle" });
                    // Simulate human pause after reload to read the page
                    yield page.waitForTimeout(2000 + Math.random() * 3000);
                    // Re-find and fill email field with human-like behavior
                    const retryEmailField = page
                        .locator('input[type="email"], input[name="logonIdentifier"], input#logonIdentifier, [aria-label*="Email"i], [placeholder*="Email"i]')
                        .first();
                    yield retryEmailField.waitFor({ timeout: 30000 });
                    // Simulate mouse movement to email field
                    const emailBox = yield retryEmailField.boundingBox();
                    if (emailBox) {
                        yield page.mouse.move(emailBox.x + emailBox.width * (0.1 + Math.random() * 0.8), emailBox.y + emailBox.height * (0.1 + Math.random() * 0.8), { steps: Math.floor(Math.random() * 12) + 5 });
                        yield page.waitForTimeout(300 + Math.random() * 600);
                    }
                    yield retryEmailField.click({ delay: Math.random() * 250 + 100 });
                    // Type email character by character with human-like timing
                    const email = this.config.username;
                    for (let i = 0; i < email.length; i++) {
                        yield page.keyboard.type(email[i], {
                            delay: Math.random() * 140 + 60,
                        });
                        // Occasional longer pause during typing
                        if (Math.random() < 0.12) {
                            yield page.waitForTimeout(250 + Math.random() * 700);
                        }
                    }
                    // Human pause before clicking continue
                    yield page.waitForTimeout(1000 + Math.random() * 1500);
                    // Click continue button again with human-like behavior
                    const retryContinueButton = page
                        .locator('button#continue[data-dtm="sign in"][aria-label="Continue"], button:has-text("Continue")[data-dtm="sign in"], [role="button"][aria-label*="Continue"i]')
                        .first();
                    // Hover before clicking
                    yield retryContinueButton.hover();
                    yield page.waitForTimeout(200 + Math.random() * 500);
                    yield retryContinueButton.click({ delay: Math.random() * 180 + 80 });
                    // Wait for password page
                    yield page.waitForLoadState("networkidle", { timeout: 30000 });
                    // Human pause to assess password page
                    yield page.waitForTimeout(1500 + Math.random() * 2500);
                    // Re-find and fill password field with human-like behavior
                    const retryPasswordField = page
                        .locator('input[type="password"], input[name="password"], [aria-label*="Password"i], [placeholder*="Password"i]')
                        .first();
                    yield retryPasswordField.waitFor({ timeout: 30000 });
                    // Simulate mouse movement to password field
                    const passwordBox = yield retryPasswordField.boundingBox();
                    if (passwordBox) {
                        yield page.mouse.move(passwordBox.x + passwordBox.width * (0.2 + Math.random() * 0.6), passwordBox.y + passwordBox.height * (0.2 + Math.random() * 0.6), { steps: Math.floor(Math.random() * 10) + 4 });
                        yield page.waitForTimeout(200 + Math.random() * 400);
                    }
                    yield retryPasswordField.click({ delay: Math.random() * 220 + 90 });
                    // Type password character by character with human-like timing
                    const password = this.config.password;
                    for (let i = 0; i < password.length; i++) {
                        yield page.keyboard.type(password[i], {
                            delay: Math.random() * 110 + 60,
                        });
                        // Occasional hesitation during password typing
                        if (Math.random() < 0.08) {
                            yield page.waitForTimeout(180 + Math.random() * 450);
                        }
                    }
                    // Human pause before final submission
                    yield page.waitForTimeout(800 + Math.random() * 1200);
                    // Click the sign-in button again with human-like behavior
                    const retrySubmitButton = page
                        .locator('button#continue[data-dtm="sign in"][aria-label="Sign in"], button:has-text("Log In")[data-dtm="sign in"], button:has-text("Sign in")[data-dtm="sign in"], [role="button"][aria-label*="Sign in"i], [role="button"][aria-label*="Log In"i]')
                        .first();
                    yield retrySubmitButton.waitFor({ timeout: 30000 });
                    // Hover before final click
                    yield retrySubmitButton.hover();
                    yield page.waitForTimeout(150 + Math.random() * 350);
                    yield retrySubmitButton.click({ delay: Math.random() * 200 + 100 });
                    // Wait for response after retry
                    yield page.waitForTimeout(3000);
                    yield page.waitForLoadState("networkidle", { timeout: 60000 });
                    const retryTitle = yield page.title();
                    console.log(`Page title after retry: "${retryTitle}"`);
                    // // If still stuck on sign-in page after retry, something is seriously wrong
                    // if (retryTitle.toLowerCase().includes("sign in")) {
                    //   // Save a screenshot
                    //   await page.screenshot({
                    //     path: "debug-retry-failed.png",
                    //     fullPage: true,
                    //   });
                    //   throw new Error(
                    //     `Credentials repeatedly rejected. Page title after retry: "${retryTitle}". Please check your username and password.`,
                    //   );
                    // }
                    // Update postSubmitTitle for subsequent checks
                    postSubmitTitle = retryTitle;
                }
                // if the current page title contains "Verify" or "MFA" or "Authentication" or "Security" or "Challenge", we have moved to MFA step
                if (postSubmitTitle.includes("Verify") ||
                    postSubmitTitle.includes("MFA") ||
                    postSubmitTitle.includes("Authentication") ||
                    postSubmitTitle.includes("Security") ||
                    postSubmitTitle.includes("Challenge")) {
                    console.log("Detected MFA challenge page based on title, proceeding to handleMFA step.");
                }
                else {
                    console.log(`Post-submit page title does not indicate MFA "${postSubmitTitle}", continuing to check for auth code.`);
                    try {
                        // Wait for the auth code to be captured by CDP listeners
                        if (this.debugMode)
                            console.log("⌛ Monitoring for authorization code capture after credential submission...");
                        const captured = yield this.waitForAuthCode(15000); // Use the new helper
                        if (!captured && this.debugMode) {
                            console.log("🚫 [submitCredentials] Did not capture auth code after submit within timeout. This is probably OK.");
                        }
                    }
                    catch (e) {
                        console.error("🚫 [submitCredentials] Error during waitForAuthCode:", e);
                    }
                }
                // Clean up CDP session
                try {
                    yield client.detach();
                }
                catch (e) {
                    // CDP session might already be detached
                }
                console.log("✅ Credentials submitted successfully (or redirect captured). Current URL:", page.url());
                console.log("📄 Final page title:", yield page.title());
            }
            catch (error) {
                console.error("Error in submitCredentials:", error);
                throw error;
            }
        });
    }
    static GMAuthTokenIsValid(authToken) {
        return authToken.expires_at > Date.now() + 5 * 60 * 1000;
    }
    loadCurrentGMAPIToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Loading existing GM API token, if it exists.");
            const tokenFilePath = this.GMTokenPath; // Define the path for the token file
            if (fs.existsSync(tokenFilePath)) {
                try {
                    const storedToken = JSON.parse(fs.readFileSync(tokenFilePath, "utf-8"));
                    // Decode the JWT payload
                    const decodedPayload = jwt.decode(storedToken.access_token);
                    // Check if the stored token is for this user's account
                    if (!decodedPayload ||
                        decodedPayload.uid.toUpperCase() !==
                            this.config.username.toUpperCase()) {
                        console.log("Stored GM API token was for different user, getting new token");
                    }
                    else {
                        const now = Math.floor(Date.now() / 1000);
                        // Check if the token is still valid
                        if (storedToken.expires_at && storedToken.expires_at > now + 5 * 60) {
                            // console.log("GM expires at: ", storedToken.expires_at, " now: ", now);
                            // console.log("Loaded existing GM API token");
                            this.currentGMAPIToken = storedToken;
                        }
                        else {
                            // console.log("Existing GM API token has expired");
                        }
                    }
                }
                catch (err) {
                    console.log("Stored GM API token was not parseable, getting new token");
                }
            }
        });
    }
    getGMAPIToken(tokenSet) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if we already have a valid token
            const now = Math.floor(Date.now() / 1000);
            if (this.currentGMAPIToken &&
                this.currentGMAPIToken.expires_at > now + 5 * 60) {
                // console.log("Returning existing GM API token");
                // Clean up any browser resources since we're using existing tokens
                try {
                    yield this.closeBrowser(); // Only close browser, keep Xvfb for potential future use
                }
                catch (cleanupError) {
                    console.warn("Warning: Browser cleanup failed when returning existing token:", cleanupError);
                }
                return this.currentGMAPIToken;
            }
            // console.log("Requesting GM API Token using MS Access Token");
            const url = "https://na-mobile-api.gm.com/sec/authz/v3/oauth/token";
            try {
                const response = yield this.axiosClient.post(url, {
                    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
                    subject_token: tokenSet.access_token,
                    subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
                    scope: "onstar gmoc user_trailer user msso priv",
                    device_id: this.config.deviceId,
                }, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        accept: "application/json",
                    },
                });
                // Decode the JWT payload
                const decodedPayload = jwt.decode(response.data.access_token);
                if (!(decodedPayload === null || decodedPayload === void 0 ? void 0 : decodedPayload.vehs)) {
                    // Delete the tokens and start over
                    console.log("Returned GM API token was missing vehicle information. Deleting existing tokens for reauth.");
                    if (fs.existsSync(this.MSTokenPath)) {
                        fs.renameSync(this.MSTokenPath, `${this.MSTokenPath}.old`);
                    }
                    if (fs.existsSync(this.GMTokenPath)) {
                        fs.renameSync(this.GMTokenPath, `${this.GMTokenPath}.old`);
                    }
                    // Clear current token in memory and recursively call authenticate()
                    this.currentGMAPIToken = null;
                    return yield this.authenticate();
                }
                const expires_at = Math.floor(Date.now() / 1000) +
                    parseInt(response.data.expires_in.toString());
                response.data.expires_in = parseInt(response.data.expires_in.toString());
                response.data.expires_at = expires_at;
                // console.log(JSON.stringify(response.data));
                // console.log("GM Says we expire in ", response.data.expires_in);
                // console.log("Set GM Token expiration to ", expires_at);
                // Store the new token
                this.currentGMAPIToken = response.data;
                this.saveTokens(tokenSet);
                // Clean up browser resources after successful token retrieval
                try {
                    yield this.closeBrowser(); // Only close browser, keep Xvfb for potential future use
                }
                catch (cleanupError) {
                    console.warn("Warning: Browser cleanup failed after new token retrieval:", cleanupError);
                }
                return response.data;
            }
            catch (error) {
                if (error.response) {
                    console.error(`GM API Token Error ${error.response.status}: ${error.response.statusText}`);
                    console.error("Error details:", error.response.data);
                    if (error.response.status === 401) {
                        console.error("Token exchange failed. MS Access token may be invalid.");
                    }
                }
                else if (error.request) {
                    console.error("No response received from GM API");
                    console.error(error.request);
                }
                else {
                    console.error("Request Error:", error.message);
                }
                throw error;
            }
        });
    }
    // Add this method to manually extract and add cookies from response headers
    processCookieHeaders(response, url) {
        const setCookieHeaders = response.headers["set-cookie"];
        if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
            setCookieHeaders.forEach((cookieString) => {
                const parsedUrl = new URL(url);
                try {
                    // Use setCookieSync to handle each Set-Cookie header
                    this.jar.setCookieSync(cookieString, parsedUrl.origin);
                    if (this.debugMode) {
                        console.log(`Added cookie: ${cookieString.split(";")[0]}`);
                    }
                }
                catch (error) {
                    console.error(`Failed to add cookie: ${error}`);
                }
            });
        }
    }
    getRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get cookies for this URL before the request
                const cookieStringBefore = yield this.jar.getCookieString(url);
                if (this.debugMode) {
                    console.log("Cookies before GET:", cookieStringBefore);
                    console.log("GET URL:", url);
                }
                const response = yield this.axiosClient.get(url, {
                    withCredentials: true,
                    maxRedirects: 0,
                    headers: Object.assign({ Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "en-US,en;q=0.9", Connection: "keep-alive", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1" }, (cookieStringBefore && { Cookie: cookieStringBefore })),
                });
                // Process and store cookies from the response
                this.processCookieHeaders(response, url);
                if (this.debugMode) {
                    console.log("Set-Cookie headers after GET:", response.headers["set-cookie"]);
                    console.log("Current cookies after GET:", yield this.jar.getCookieString(url));
                    // Also check for cookies for the domain
                    const domain = new URL(url).hostname;
                    console.log(`Cookies for domain ${domain}:`, yield this.jar.getCookieString(`https://${domain}/`));
                }
                return response;
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    this.handleRequestError(error);
                }
                else {
                    console.error("GET Request failed:", error);
                }
                return error.response;
            }
        });
    }
    postRequest(url, postData, csrfToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Properly serialize form data
                const formData = new URLSearchParams();
                for (const [key, value] of Object.entries(postData)) {
                    formData.append(key, value);
                }
                // Get cookies for the specific URL and also for the base domain
                const urlObj = new URL(url);
                const domain = urlObj.hostname;
                // Try to get cookies from both URL path and root path
                const cookieString = yield this.jar.getCookieString(url);
                const domainCookieString = yield this.jar.getCookieString(`https://${domain}/`);
                // Combine cookie strings if they're different
                const combinedCookies = cookieString !== domainCookieString
                    ? `${cookieString}; ${domainCookieString}`.replace(/;\s+;/g, "; ")
                    : cookieString;
                if (this.debugMode) {
                    console.log("POST URL:", url);
                    console.log("Cookies before POST (URL):", cookieString);
                    console.log("Cookies before POST (domain):", domainCookieString);
                    console.log("Combined cookies:", combinedCookies);
                    console.log("POST data:", postData);
                }
                const response = yield this.axiosClient.post(url, formData.toString(), {
                    withCredentials: true,
                    headers: Object.assign({ "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", Accept: "application/json, text/javascript, */*; q=0.01", "Accept-Language": "en-US,en;q=0.9", Origin: "https://custlogin.gm.com", "x-csrf-token": csrfToken, "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1", "X-Requested-With": "XMLHttpRequest", "Accept-Encoding": "gzip, deflate, br", Connection: "keep-alive" }, (combinedCookies && { Cookie: combinedCookies })),
                });
                // Process and store cookies from the response
                this.processCookieHeaders(response, url);
                if (this.debugMode) {
                    console.log("Set-Cookie headers after POST:", response.headers["set-cookie"]);
                    console.log("Current cookies after POST:", yield this.jar.getCookieString(url));
                }
                return response;
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    this.handleRequestError(error);
                }
                else {
                    console.error("POST Request failed:", error);
                }
                return error.response;
            }
        });
    }
    handleRequestError(error) {
        console.log("reqer");
        if (error.response) {
            console.error(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
            console.debug("Response data:", error.response.data);
            if (error.response.status === 401) {
                console.error("Authentication failed. Please check your credentials.");
            }
        }
        else if (error.request) {
            console.error("No response received from server");
            console.debug(error.request);
        }
        else {
            console.error("Request Error:", error.message);
        }
    }
    getRegexMatch(haystack, regexString) {
        const re = new RegExp(regexString);
        const r = haystack.match(re);
        return r ? r[1] : null;
    }
    captureRedirectLocation(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get cookies for this URL before the request
                const cookieStringBefore = yield this.jar.getCookieString(url);
                if (this.debugMode) {
                    console.log("Cookies before redirect capture:", cookieStringBefore);
                    console.log("Redirect capture URL:", url);
                }
                const response = yield this.axiosClient.get(url, {
                    maxRedirects: 0,
                    validateStatus: (status) => status >= 200 && status < 400,
                    headers: Object.assign({ Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "en-US,en;q=0.9", Connection: "keep-alive", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1" }, (cookieStringBefore && { Cookie: cookieStringBefore })),
                });
                // Process and store cookies from the response
                this.processCookieHeaders(response, url);
                if (this.debugMode) {
                    console.log("Set-Cookie headers after redirect capture:", response.headers["set-cookie"]);
                    console.log("Current cookies after redirect capture:", yield this.jar.getCookieString(url));
                    // Check for domain cookies too
                    const domain = new URL(url).hostname;
                    console.log(`Cookies for domain ${domain}:`, yield this.jar.getCookieString(`https://${domain}/`));
                }
                if (response.status === 302) {
                    const redirectLocation = response.headers["location"];
                    if (!redirectLocation) {
                        throw new Error("No redirect location found in response headers");
                    }
                    return redirectLocation;
                }
                throw new Error(`Unexpected response status: ${response.status}`);
            }
            catch (error) {
                this.handleRequestError(error);
                throw error;
            }
        });
    }
    setupOpenIDClient() {
        return __awaiter(this, void 0, void 0, function* () {
            // Hard-coded fallback configuration with required endpoints
            const fallbackConfig = {
                issuer: "https://custlogin.gm.com/gmb2cprod.onmicrosoft.com/b2c_1a_seamless_mobile_signuporsignin/v2.0/",
                authorization_endpoint: "https://custlogin.gm.com/gmb2cprod.onmicrosoft.com/b2c_1a_seamless_mobile_signuporsignin/v2.0/authorize",
                token_endpoint: "https://custlogin.gm.com/gmb2cprod.onmicrosoft.com/b2c_1a_seamless_mobile_signuporsignin/v2.0/token",
                jwks_uri: "https://custlogin.gm.com/gmb2cprod.onmicrosoft.com/b2c_1a_seamless_mobile_signuporsignin/discovery/v2.0/keys",
                response_types_supported: ["code", "id_token", "code id_token"],
                response_modes_supported: ["query", "fragment", "form_post"],
                grant_types_supported: [
                    "authorization_code",
                    "implicit",
                    "refresh_token",
                ],
                subject_types_supported: ["pairwise"],
                id_token_signing_alg_values_supported: ["RS256"],
                scopes_supported: ["openid"],
            };
            let issuer = null;
            try {
                // Try direct discovery first
                const discoveryUrl = "https://custlogin.gm.com/gmb2cprod.onmicrosoft.com/b2c_1a_seamless_mobile_signuporsignin/v2.0/.well-known/openid-configuration";
                if (this.debugMode) {
                    console.log("Attempting OpenID discovery from:", discoveryUrl);
                }
                const response = yield axios.get(discoveryUrl, {
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1",
                    },
                    timeout: 60000,
                });
                // Use the discovery data but merge with fallback to ensure required fields
                const discoveredConfig = response.data;
                // Track which endpoints are using fallback values
                const fallbacksUsed = [];
                const finalAuthEndpoint = discoveredConfig.authorization_endpoint ||
                    fallbackConfig.authorization_endpoint;
                const finalTokenEndpoint = discoveredConfig.token_endpoint || fallbackConfig.token_endpoint;
                const finalJwksUri = discoveredConfig.jwks_uri || fallbackConfig.jwks_uri;
                if (!discoveredConfig.authorization_endpoint) {
                    fallbacksUsed.push("authorization_endpoint");
                }
                if (!discoveredConfig.token_endpoint) {
                    fallbacksUsed.push("token_endpoint");
                }
                if (!discoveredConfig.jwks_uri) {
                    fallbacksUsed.push("jwks_uri");
                }
                // Create issuer with combined configuration
                issuer = new this.oidc.Issuer(Object.assign(Object.assign(Object.assign({}, fallbackConfig), discoveredConfig), { 
                    // Ensure these critical endpoints are defined
                    authorization_endpoint: finalAuthEndpoint, token_endpoint: finalTokenEndpoint, jwks_uri: finalJwksUri }));
                if (this.debugMode) {
                    console.log("Successfully created issuer with discovery data");
                    if (fallbacksUsed.length > 0) {
                        console.log(`🔧 Using fallback values for: ${fallbacksUsed.join(", ")}`);
                    }
                    else {
                        console.log("✅ All endpoints retrieved from discovery, no fallbacks needed");
                    }
                }
            }
            catch (error) {
                console.warn("OpenID discovery failed, using fallback configuration", error);
                // Create issuer using fallback configuration
                issuer = new this.oidc.Issuer(fallbackConfig);
                if (this.debugMode) {
                    console.log("Created issuer with fallback configuration");
                }
                console.log("🔧 Using complete fallback configuration for all OpenID endpoints");
            }
            if (!issuer) {
                throw new Error("Failed to create OpenID issuer");
            }
            // Verify the critical endpoint is available
            if (!issuer.authorization_endpoint) {
                throw new Error("Issuer missing authorization_endpoint even after fallback");
            }
            // Create client
            const client = new issuer.Client({
                client_id: "3ff30506-d242-4bed-835b-422bf992622e",
                redirect_uris: ["msauth.com.gm.myChevrolet://auth"],
                response_types: ["code"],
                token_endpoint_auth_method: "none",
            });
            client[openidClient.custom.clock_tolerance] = 5; // to allow a 5 second skew
            return client;
        });
    }
    startMSAuthorizationFlow() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Starting PKCE auth");
            const client = yield this.setupOpenIDClient();
            const code_verifier = this.oidc.generators.codeVerifier();
            const code_challenge = this.oidc.generators.codeChallenge(code_verifier);
            const state = this.oidc.generators.nonce();
            // const nonce = this.oidc.generators.nonce();
            const authorizationUrl = client.authorizationUrl({
                scope: "https://gmb2cprod.onmicrosoft.com/3ff30506-d242-4bed-835b-422bf992622e/Test.Read openid profile offline_access",
                code_challenge,
                code_challenge_method: "S256",
                bundleID: "com.gm.myChevrolet",
                client_id: "3ff30506-d242-4bed-835b-422bf992622e",
                mode: "dark",
                evar25: "mobile_mychevrolet_chevrolet_us_app_launcher_sign_in_or_create_account",
                channel: "lightreg",
                ui_locales: "en-US",
                brand: "chevrolet",
                // nonce,
                state,
            });
            return { authorizationUrl, code_verifier };
        });
    }
    getMSToken(code, code_verifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.setupOpenIDClient();
            try {
                const openIdTokenSet = yield client.callback("msauth.com.gm.myChevrolet://auth", { code }, { code_verifier });
                // Validate that we received the required tokens
                if (!openIdTokenSet.access_token) {
                    throw new Error("No access token received from authentication provider");
                }
                // Convert the openid-client TokenSet to our TokenSet format
                const tokenSet = Object.assign(Object.assign(Object.assign(Object.assign({ access_token: openIdTokenSet.access_token }, (openIdTokenSet.id_token && { id_token: openIdTokenSet.id_token })), (openIdTokenSet.refresh_token && {
                    refresh_token: openIdTokenSet.refresh_token,
                })), (openIdTokenSet.expires_at && {
                    expires_at: openIdTokenSet.expires_at,
                })), (openIdTokenSet.expires_in && {
                    expires_in: openIdTokenSet.expires_in,
                }));
                // console.log("Access Token:", tokenSet.access_token);
                // console.log("ID Token:", tokenSet.id_token);
                return tokenSet;
            }
            catch (err) {
                console.error("Failed to obtain access token:", err);
                throw err;
            }
        });
    }
    loadMSToken() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Loading existing MS tokens, if they exist.");
            let tokenSet;
            if (fs.existsSync(this.MSTokenPath)) {
                let storedTokens = null;
                try {
                    storedTokens = JSON.parse(fs.readFileSync(this.MSTokenPath, "utf-8"));
                }
                catch (err) {
                    console.log("Stored MS token was not parseable, getting new token");
                    return false;
                }
                // Decode the JWT payload
                const decodedPayload = jwt.decode(storedTokens.access_token);
                if (!decodedPayload ||
                    (decodedPayload.name.toUpperCase() !==
                        this.config.username.toUpperCase() &&
                        decodedPayload.email.toUpperCase() !==
                            this.config.username.toUpperCase())) {
                    console.log("Stored MS token was for different user, getting new token");
                    return false;
                }
                const now = Math.floor(Date.now() / 1000);
                if (storedTokens.expires_at && storedTokens.expires_at > now + 5 * 60) {
                    // console.log("MS Access token is still valid");
                    // console.log("MS expires at: ", storedTokens.expires_at, " now: ", now);
                    tokenSet = storedTokens;
                }
                else if (storedTokens.refresh_token) {
                    // console.log("Refreshing MS access token");
                    const client = yield this.setupOpenIDClient();
                    const refreshedTokens = yield client.refresh(storedTokens.refresh_token);
                    // Verify that the refreshed tokens contain the required access_token
                    if (!refreshedTokens.access_token) {
                        throw new Error("Refresh token response missing access_token");
                    }
                    // Create a valid TokenSet object
                    tokenSet = {
                        access_token: refreshedTokens.access_token,
                        refresh_token: refreshedTokens.refresh_token,
                        id_token: refreshedTokens.id_token,
                        expires_in: refreshedTokens.expires_in,
                        expires_at: refreshedTokens.expires_at,
                    };
                    // console.log("Saving current MS tokens to ", this.MSTokenPath);
                    fs.writeFileSync(this.MSTokenPath, JSON.stringify(tokenSet));
                }
                else {
                    throw new Error("Token expired and no refresh token available.");
                }
                return tokenSet;
            }
            return false;
        });
    }
}
function getGMAPIJWT(config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!config.username ||
            !config.password ||
            !config.deviceId ||
            !config.totpKey) {
            throw new Error("Missing required configuration parameters");
        }
        config.tokenLocation = (_a = config.tokenLocation) !== null && _a !== void 0 ? _a : "./";
        const auth = new GMAuth(config);
        const token = yield auth.authenticate();
        // Decode the JWT payload
        const decodedPayload = jwt.decode(token.access_token);
        return {
            token,
            auth,
            decodedPayload,
        };
    });
}

var OnStarApiCommand;
(function (OnStarApiCommand) {
    OnStarApiCommand["LockDoor"] = "lock";
    OnStarApiCommand["UnlockDoor"] = "unlock";
    OnStarApiCommand["Alert"] = "alert";
    OnStarApiCommand["CancelAlert"] = "cancelAlert";
    OnStarApiCommand["Start"] = "start";
    OnStarApiCommand["CancelStart"] = "cancelStart";
    OnStarApiCommand["LockTrunk"] = "lockTrunk";
    OnStarApiCommand["UnlockTrunk"] = "unlockTrunk";
    // ChargeOverride = "chargeOverride",
    // GetChargingProfile = "getChargingProfile",
    // SetChargingProfile = "setChargingProfile",
})(OnStarApiCommand || (OnStarApiCommand = {}));
class RequestService {
    constructor(config, client) {
        var _a, _b, _c, _d;
        this.client = client;
        this.config = Object.assign(Object.assign({}, config), { vin: config.vin.toUpperCase() });
        this.gmAuthConfig = {
            username: this.config.username,
            password: this.config.password,
            deviceId: this.config.deviceId,
            totpKey: this.config.onStarTOTP,
            tokenLocation: (_a = this.config.tokenLocation) !== null && _a !== void 0 ? _a : "./",
        };
        this.checkRequestStatus = (_b = this.config.checkRequestStatus) !== null && _b !== void 0 ? _b : true;
        this.requestPollingTimeoutSeconds =
            (_c = config.requestPollingTimeoutSeconds) !== null && _c !== void 0 ? _c : 90;
        this.requestPollingIntervalSeconds =
            (_d = config.requestPollingIntervalSeconds) !== null && _d !== void 0 ? _d : 6;
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
    start(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.Start);
            if (options && typeof options.cabinTemperature === "number") {
                // EV/Remote start can accept an optional cabin temperature (Celsius)
                const temp = Math.round(options.cabinTemperature);
                request.setBody({ cabinTemperature: temp });
            }
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
                alertRequest: Object.assign({ action: [exports.AlertRequestAction.Honk, exports.AlertRequestAction.Flash], delay: 0, duration: 1, override: [
                        exports.AlertRequestOverride.DoorOpen,
                        exports.AlertRequestOverride.IgnitionOn,
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
    flashLights() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const request = this.getCommandRequest(OnStarApiCommand.Alert).setBody({
                alertRequest: Object.assign({ action: [exports.AlertRequestAction.Flash], delay: 0, duration: 1, override: [
                        exports.AlertRequestOverride.DoorOpen,
                        exports.AlertRequestOverride.IgnitionOn,
                    ] }, options),
            });
            return this.sendRequest(request);
        });
    }
    stopLights() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = this.getCommandRequest(OnStarApiCommand.CancelAlert);
            return this.sendRequest(request);
        });
    }
    // Charging-related APIs are temporarily disabled pending new API implementation
    // async chargeOverride(options: ChargeOverrideOptions = {}): Promise<Result> { /* ... */ }
    // async getChargingProfile(): Promise<Result> { /* ... */ }
    // async setChargingProfile(options: SetChargingProfileRequestOptions = {}): Promise<Result> { /* ... */ }
    /**
     * EV: Set the target charge level percentage (tcl)
     * Always fetches a fresh short-lived EV session token before issuing the command.
     */
    setChargeLevelTarget(tcl, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (tcl < 1 || tcl > 100 || !Number.isFinite(tcl)) {
                throw new Error("tcl must be a number between 1 and 100");
            }
            const gmMobileToken = (yield this.getAuthToken()).access_token;
            const { token: evToken, vehicleId: sessionVehicleId } = yield this.initEVSessionToken(gmMobileToken);
            const vehicleId = sessionVehicleId; // must come from initSession metrics
            const baseUrl = `https://eve-vcn.ext.gm.com/api/gmone/v1/vehicle/performSetChargingSettings`;
            const clientVersion = (_a = opts === null || opts === void 0 ? void 0 : opts.clientVersion) !== null && _a !== void 0 ? _a : "7.18.0.8006";
            const os = (_b = opts === null || opts === void 0 ? void 0 : opts.os) !== null && _b !== void 0 ? _b : "A"; // default Android metadata
            const query = new URLSearchParams({
                vehicleVin: this.config.vin,
                clientVersion,
                clientType: "bev-myowner",
                buildType: "r",
                clientLocale: "en-US",
                deviceId: this.config.deviceId,
                os,
                ts: String(Date.now()),
                varch: "globalb",
                sid: this.randomHex(8).toUpperCase(),
                pid: this.randomHex(8).toUpperCase(),
            });
            const bodyParams = new URLSearchParams({
                tcl: String(Math.round(tcl)),
                vehicleId,
                noMetricsRefresh: String((_c = opts === null || opts === void 0 ? void 0 : opts.noMetricsRefresh) !== null && _c !== void 0 ? _c : false),
                clientRequestId: (_d = opts === null || opts === void 0 ? void 0 : opts.clientRequestId) !== null && _d !== void 0 ? _d : uuid.v4(),
            });
            // VehicleId is derived exclusively from initSession metrics
            const req = new Request(`${baseUrl}?${query.toString()}`)
                .setMethod(RequestMethod.Post)
                .setAuthRequired(false)
                .setContentType("application/x-www-form-urlencoded")
                .setHeaders({
                accept: "*/*",
                "x-gm-mobiletoken": gmMobileToken,
                "x-gm-token": evToken,
            })
                .setBody(bodyParams.toString())
                .setCheckRequestStatus(false); // EV API responds synchronously
            return this.sendRequest(req);
        });
    }
    /**
     * EV: Stop charging session
     * Always initializes a fresh short-lived EV session token (like setChargeLevelTarget)
     * so we derive the correct vehicleId from metrics. API responds synchronously.
     */
    stopCharging(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const gmMobileToken = (yield this.getAuthToken()).access_token;
            const { token: evToken, vehicleId: sessionVehicleId } = yield this.initEVSessionToken(gmMobileToken);
            const vehicleId = sessionVehicleId;
            const baseUrl = `https://eve-vcn.ext.gm.com/api/gmone/v1/vehicle/performStopCharging`;
            const clientVersion = (_a = opts === null || opts === void 0 ? void 0 : opts.clientVersion) !== null && _a !== void 0 ? _a : "7.18.0.8006";
            const os = (_b = opts === null || opts === void 0 ? void 0 : opts.os) !== null && _b !== void 0 ? _b : "A";
            const query = new URLSearchParams({
                vehicleVin: this.config.vin,
                clientVersion,
                clientType: "bev-myowner",
                buildType: "r",
                clientLocale: "en-US",
                deviceId: this.config.deviceId,
                os,
                ts: String(Date.now()),
                varch: "globalb",
                sid: this.randomHex(8).toUpperCase(),
                pid: this.randomHex(8).toUpperCase(),
            });
            const bodyParams = new URLSearchParams({
                vehicleId,
                noMetricsRefresh: String((_c = opts === null || opts === void 0 ? void 0 : opts.noMetricsRefresh) !== null && _c !== void 0 ? _c : false),
                clientRequestId: (_d = opts === null || opts === void 0 ? void 0 : opts.clientRequestId) !== null && _d !== void 0 ? _d : uuid.v4(),
            });
            const req = new Request(`${baseUrl}?${query.toString()}`)
                .setMethod(RequestMethod.Post)
                .setAuthRequired(false)
                .setContentType("application/x-www-form-urlencoded")
                .setHeaders({
                accept: "*/*",
                "x-gm-mobiletoken": gmMobileToken,
                "x-gm-token": evToken,
            })
                .setBody(bodyParams.toString())
                .setCheckRequestStatus(false); // EV API responds synchronously
            return this.sendRequest(req);
        });
    }
    diagnostics() {
        return __awaiter(this, void 0, void 0, function* () {
            // vehicle health status API
            const url = `${onStarAppConfig.serviceUrl}/api/v1/vh/vehiclehealth/v1/healthstatus/${this.config.vin}`;
            const request = new Request(url)
                .setMethod(RequestMethod.Get)
                .setContentType("application/json")
                .setCheckRequestStatus(false);
            return this.sendRequest(request);
        });
    }
    getAccountVehicles() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // v3 GraphQL garage API per captured data
            const url = `${onStarAppConfig.serviceUrl}/mbff/garage/v1`;
            const graphQL = "query getVehiclesMBFF {" +
                "vehicles {" +
                "vin vehicleId make model nickName year imageUrl onstarCapable vehicleType roleCode onstarStatusCode onstarAccountNumber preDelivery orderNum orderStatus" +
                "}" +
                "}";
            const request = new Request(url)
                .setMethod(RequestMethod.Post)
                .setContentType("text/plain; charset=utf-8")
                .setBody(graphQL)
                .setCheckRequestStatus(false);
            const result = yield this.sendRequest(request);
            const payload = (_a = result.response) === null || _a === void 0 ? void 0 : _a.data;
            if (result.status !== exports.CommandResponseStatus.success) {
                console.error("getAccountVehicles failed", {
                    status: result.status,
                    data: payload,
                });
                throw new Error("getAccountVehicles request did not succeed");
            }
            if (payload && Array.isArray(payload.errors) && payload.errors.length) {
                console.error("getAccountVehicles GraphQL errors", {
                    errors: payload.errors,
                });
                throw new Error("getAccountVehicles GraphQL errors present");
            }
            return payload;
        });
    }
    location() {
        return __awaiter(this, void 0, void 0, function* () {
            const base = `${onStarAppConfig.serviceUrl}/veh/datadelivery/digitaltwin/v1/vehicles/${this.config.vin}`;
            const makeReq = (sms) => new Request(`${base}?sms=${sms ? "true" : "false"}&region=na`)
                .setMethod(RequestMethod.Get)
                .setContentType("application/json")
                .setCheckRequestStatus(false);
            // Kick off a fresh location update
            let result = yield this.sendRequest(makeReq(true));
            const timeoutMs = this.requestPollingTimeoutSeconds * 1000;
            const intervalMs = this.requestPollingIntervalSeconds * 1000;
            const startTs = Date.now();
            // Try to poll until updatePending != PENDING
            const getPending = (r) => {
                var _a, _b, _c, _d;
                const data = (_a = r.response) === null || _a === void 0 ? void 0 : _a.data;
                return (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.telemetry) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.session) === null || _d === void 0 ? void 0 : _d.updatePending;
            };
            let pending = getPending(result);
            if (pending === "PENDING") {
                while (Date.now() - startTs < timeoutMs) {
                    yield this.delay(intervalMs);
                    result = yield this.sendRequest(makeReq(false));
                    pending = getPending(result);
                    if (pending && pending !== "PENDING")
                        break;
                }
            }
            return result;
        });
    }
    getCommandRequest(command) {
        return new Request(this.getCommandUrl(command));
    }
    // Legacy init helpers removed (readGMAccessToken, buildInitQueryParams, randomHex)
    getApiUrlForPath(path) {
        return `${onStarAppConfig.serviceUrl}/veh/cmd/v3/${path}`;
    }
    getCommandUrl(command) {
        return this.getApiUrlForPath(`${command}/${this.config.vin}`);
    }
    getHeaders(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                accept: "application/json",
                "accept-encoding": "gzip",
                "accept-language": "en-US",
                appversion: "myOwner-chevrolet-android-7.17.0-0",
                locale: "en-US",
                "content-type": request.getContentType(),
                "user-agent": onStarAppConfig.userAgent,
            };
            if (request.isAuthRequired()) {
                const authToken = yield this.getAuthToken();
                headers["Authorization"] = `Bearer ${authToken.access_token}`;
            }
            return headers;
        });
    }
    getAuthToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, auth, decodedPayload } = yield getGMAPIJWT(this.gmAuthConfig);
            this.authToken = token;
            const authorizedVins = [];
            decodedPayload.vehs.forEach((veh) => {
                authorizedVins.push(veh.vin);
            });
            if (!authorizedVins.includes(this.config.vin)) {
                throw new Error(`Provided VIN does not appear to be an authorized VIN for this OnStar account. ${this.config.vin} not in ${authorizedVins}`);
            }
            return this.authToken;
        });
    }
    sendRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const max429Retries = (_a = this.config.max429Retries) !== null && _a !== void 0 ? _a : 3;
            const retryPost = (_b = this.config.retryOn429ForPost) !== null && _b !== void 0 ? _b : false;
            const baseDelay = (_c = this.config.initial429DelayMs) !== null && _c !== void 0 ? _c : 1000;
            const backoff = (_d = this.config.backoffFactor) !== null && _d !== void 0 ? _d : 2;
            const jitter = (_e = this.config.jitterMs) !== null && _e !== void 0 ? _e : 250;
            const maxDelay = (_f = this.config.max429DelayMs) !== null && _f !== void 0 ? _f : 30000;
            let attempt = 0;
            while (true) {
                try {
                    const response = yield this.makeClientRequest(request);
                    const { data } = response;
                    const checkRequestStatus = (_g = request.getCheckRequestStatus()) !== null && _g !== void 0 ? _g : this.checkRequestStatus;
                    if (checkRequestStatus && typeof data === "object") {
                        // Support both legacy shape with { commandResponse } and v3 top-level shape
                        // Example v3 initial response:
                        // { requestId, requestTime, status: "IN_PROGRESS", url, error }
                        let status;
                        let url;
                        let type;
                        let requestTime;
                        let requestId;
                        const anyData = data;
                        if (anyData.commandResponse) {
                            const { requestTime: rt, status: st, url: u, type: t, } = anyData.commandResponse;
                            status = st;
                            url = u;
                            type = t;
                            requestTime = rt;
                            requestId = anyData.commandResponse.requestId;
                        }
                        else if (anyData.requestId &&
                            anyData.requestTime &&
                            anyData.status &&
                            anyData.url) {
                            // Normalize uppercase statuses to our enum
                            status = this.mapCommandStatus(anyData.status);
                            url = anyData.url;
                            type = anyData.type; // might be undefined
                            requestTime = anyData.requestTime;
                            requestId = anyData.requestId;
                        }
                        if (status) {
                            const requestTimestamp = new Date(requestTime).getTime();
                            if (status === exports.CommandResponseStatus.failure) {
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
                            if (status === exports.CommandResponseStatus.inProgress &&
                                type !== "connect") {
                                // Log only for the initial POST; skip logs for subsequent polling GETs
                                if (request.getMethod() === RequestMethod.Post) {
                                    try {
                                        console.log("info: Command accepted; polling for completion", {
                                            timestamp: new Date()
                                                .toISOString()
                                                .replace("T", " ")
                                                .slice(0, 19),
                                            requestId,
                                            url,
                                        });
                                    }
                                    catch (_) {
                                        // no-op logging safety
                                    }
                                }
                                yield this.checkRequestPause();
                                const pollReq = new Request(url)
                                    .setMethod(RequestMethod.Get)
                                    .setUpgradeRequired(false)
                                    .setCheckRequestStatus(checkRequestStatus);
                                return this.sendRequest(pollReq);
                            }
                            return new RequestResult(status).setResponse(response).getResult();
                        }
                    }
                    return new RequestResult(exports.CommandResponseStatus.success)
                        .setResponse(response)
                        .getResult();
                }
                catch (error) {
                    // If we received a 429 and we can/should retry, apply backoff and retry
                    const isAxios = axios.isAxiosError(error);
                    const status = isAxios ? (_h = error.response) === null || _h === void 0 ? void 0 : _h.status : undefined;
                    const method = request.getMethod();
                    const methodStr = method === RequestMethod.Get ? "GET" : "POST";
                    if (status === 429 &&
                        (method === RequestMethod.Get || retryPost) &&
                        attempt < max429Retries) {
                        attempt++;
                        // Determine delay: prefer Retry-After header if present
                        let delayMs = baseDelay * Math.pow(backoff, attempt - 1);
                        let retryAfter = undefined;
                        let usedRetryAfter = false;
                        if (isAxios) {
                            retryAfter =
                                (_l = (_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.headers) === null || _k === void 0 ? void 0 : _k["retry-after"]) !== null && _l !== void 0 ? _l : (_o = (_m = error.response) === null || _m === void 0 ? void 0 : _m.headers) === null || _o === void 0 ? void 0 : _o["Retry-After"];
                            const parsed = this.parseRetryAfter(retryAfter);
                            if (parsed !== null) {
                                delayMs = parsed;
                                usedRetryAfter = true;
                            }
                        }
                        // Cap and add small jitter
                        delayMs =
                            Math.min(delayMs, maxDelay) + Math.floor(Math.random() * jitter);
                        console.warn("[throttle] 429 received; scheduling retry", {
                            url: request.getUrl(),
                            method: methodStr,
                            attempt,
                            maxRetries: max429Retries,
                            retryAfter,
                            usedRetryAfter,
                            delayMs,
                        });
                        yield this.delay(delayMs);
                        // loop and retry
                        continue;
                    }
                    if (status === 429) {
                        let reason = "not-eligible";
                        if (!(method === RequestMethod.Get || retryPost)) {
                            reason = "post-retry-disabled";
                        }
                        else if (attempt >= max429Retries) {
                            reason = "max-retries-exceeded";
                        }
                        console.warn("[throttle] 429 received; not retrying", {
                            url: request.getUrl(),
                            method: methodStr,
                            attempt,
                            maxRetries: max429Retries,
                            reason,
                        });
                    }
                    if (error instanceof RequestError) {
                        throw error;
                    }
                    let errorObj = new RequestError();
                    if (isAxios) {
                        if (error.response) {
                            errorObj.message = `Request Failed with status ${error.response.status} - ${error.response.statusText}`;
                            errorObj.setResponse({ data: error.response.data });
                            // Attach our logical Request, not axios' raw request, to avoid circular refs
                            errorObj.setRequest(request);
                        }
                        else if (error.request) {
                            errorObj.message = "No response";
                            errorObj.setRequest(request);
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
            }
        });
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // ===== EV API helpers =====
    initEVSessionToken(gmMobileToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            // Build URL with required metadata
            const baseUrl = `https://eve-vcn.ext.gm.com/api/gmone/v1/admin/initSession`;
            const clientVersion = "7.18.0.8006";
            const query = new URLSearchParams({
                vehicleVin: this.config.vin,
                clientVersion,
                clientType: "bev-myowner",
                buildType: "r",
                clientLocale: "en-US",
                deviceId: this.config.deviceId,
                os: "I", // emulate iOS like captured traffic (works with either)
                ts: String(Date.now()),
                sid: this.randomHex(8).toUpperCase(),
                pid: this.randomHex(8).toUpperCase(),
            });
            // Form body requires the GM mobile token
            const bodyParams = new URLSearchParams({
                token: gmMobileToken,
                vehicleVIN: this.config.vin, // observed in captures
            });
            const req = new Request(`${baseUrl}?${query.toString()}`)
                .setMethod(RequestMethod.Post)
                .setAuthRequired(false)
                .setContentType("application/x-www-form-urlencoded")
                .setHeaders({
                accept: "*/*",
            })
                .setBody(bodyParams.toString())
                .setCheckRequestStatus(false);
            const result = yield this.sendRequest(req);
            const data = (_a = result.response) === null || _a === void 0 ? void 0 : _a.data;
            const token = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.results) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.loginResponse) === null || _d === void 0 ? void 0 : _d.token;
            const vehicleId = (_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.results) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.getVehicleChargingMetricsResponse) === null || _g === void 0 ? void 0 : _g.vehicleId;
            if (!token) {
                throw new Error("Failed to initialize EV session token");
            }
            if (!vehicleId) {
                throw new Error("EV vehicleId not found in initSession metrics; cannot proceed");
            }
            this.cachedVehicleId = vehicleId;
            return { token, vehicleId };
        });
    }
    ensureVehicleIdFromGarage(vin) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.cachedVehicleId)
                return this.cachedVehicleId;
            try {
                const garage = yield this.getAccountVehicles();
                const list = (_b = (_a = garage === null || garage === void 0 ? void 0 : garage.data) === null || _a === void 0 ? void 0 : _a.vehicles) !== null && _b !== void 0 ? _b : [];
                const match = list.find((v) => { var _a; return ((_a = v.vin) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === vin; });
                if (match === null || match === void 0 ? void 0 : match.vehicleId) {
                    this.cachedVehicleId = match.vehicleId;
                    return this.cachedVehicleId;
                }
            }
            catch (_) {
                // ignore and return undefined to allow caller to throw a clearer error
            }
            return undefined;
        });
    }
    randomHex(len) {
        const bytes = new Uint8Array(len / 2 + (len % 2));
        for (let i = 0; i < bytes.length; i++)
            bytes[i] = Math.floor(Math.random() * 256);
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, len);
    }
    // Parses Retry-After header which can be seconds (number) or http-date.
    parseRetryAfter(retryAfter) {
        if (!retryAfter)
            return null;
        if (typeof retryAfter === "number") {
            return retryAfter * 1000;
        }
        const asNum = Number(retryAfter);
        if (!Number.isNaN(asNum)) {
            return asNum * 1000;
        }
        const date = new Date(retryAfter);
        const ts = date.getTime();
        if (!Number.isNaN(ts)) {
            const diff = ts - Date.now();
            return diff > 0 ? diff : 0;
        }
        return null;
    }
    makeClientRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = yield this.getHeaders(request);
            let requestOptions = {
                headers: Object.assign(Object.assign({}, headers), request.getHeaders()),
            };
            if (request.getMethod() === RequestMethod.Post) {
                const axiosResp = yield this.client.post(request.getUrl(), request.getBody(), requestOptions);
                return { data: axiosResp.data };
            }
            else {
                const axiosResp = yield this.client.get(request.getUrl(), requestOptions);
                return { data: axiosResp.data };
            }
        });
    }
    checkRequestPause() {
        return new Promise((resolve) => setTimeout(resolve, this.requestPollingIntervalSeconds * 1000));
    }
    // Normalize API status strings to CommandResponseStatus
    mapCommandStatus(status) {
        if (!status)
            return exports.CommandResponseStatus.inProgress;
        const s = String(status).toLowerCase();
        if (s === "success" || s === "completed" || s === "complete") {
            return exports.CommandResponseStatus.success;
        }
        if (s === "failure" || s === "failed" || s === "error") {
            return exports.CommandResponseStatus.failure;
        }
        // Many v3 responses use IN_PROGRESS in caps
        return exports.CommandResponseStatus.inProgress;
    }
}

class OnStar {
    constructor(requestService) {
        this.requestService = requestService;
    }
    static create(config) {
        const requestService = new RequestService(config, axios);
        return new OnStar(requestService);
    }
    getAccountVehicles() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.getAccountVehicles();
        });
    }
    start(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.start(options);
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
    flashLights(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.flashLights(options || {});
        });
    }
    stopLights() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.stopLights();
        });
    }
    // async chargeOverride(options?: ChargeOverrideOptions): Promise<Result> {
    //   return this.requestService.chargeOverride(options);
    // }
    // async getChargingProfile(): Promise<Result> {
    //   return this.requestService.getChargingProfile();
    // }
    // async setChargingProfile(
    //   options?: SetChargingProfileRequestOptions,
    // ): Promise<Result> {
    //   return this.requestService.setChargingProfile(options);
    // }
    diagnostics() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.diagnostics();
        });
    }
    location() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.location();
        });
    }
    // EV: Set target charge level percentage
    setChargeLevelTarget(tcl, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.setChargeLevelTarget(tcl, opts);
        });
    }
    // EV: Stop charging session
    stopCharging(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.requestService.stopCharging(opts);
        });
    }
    setCheckRequestStatus(checkStatus) {
        this.requestService.setCheckRequestStatus(checkStatus);
    }
}

module.exports = OnStar;
