const winston = require('winston');

// Object keys whose values are always masked, regardless of content.
// Matched case-insensitively against the exact key name.
const SENSITIVE_KEYS = new Set([
    'password', 'pass', 'onstarpin', 'pin', 'onstartotp', 'totp',
    'token', 'tokens', 'accesstoken', 'refreshtoken', 'idtoken',
    'authorization', 'secret',
    'vin', 'deviceid', 'vehicleid',
    'onstaraccountnumber', 'accountnumber',
    'email', 'emailaddress', 'username',
    'firstname', 'lastname', 'middlename',
    'phonenumber', 'phone', 'mobilephone',
    'latitude', 'longitude', 'lat', 'lon', 'lng',
]);

const REDACTED = '<REDACTED>';

// Value-based replacement: only apply to secrets at least this long, so short
// values (e.g. a 4-digit PIN) don't clobber unrelated text like odometer values.
const MIN_SECRET_LENGTH = 6;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/g;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build the list of known secret values (from config) to replace in log output.
 * Short values and the PIN are intentionally excluded from value-replacement;
 * the PIN is still masked structurally via SENSITIVE_KEYS.
 * @param {object} onstarConfig
 * @param {object} [mqttConfig]
 * @returns {Array<{value: string, placeholder: string}>}
 */
function buildSecrets(onstarConfig = {}, mqttConfig = {}) {
    const candidates = [
        { value: onstarConfig.vin, placeholder: '<VIN>' },
        { value: onstarConfig.deviceId, placeholder: '<DEVICEID>' },
        { value: onstarConfig.username, placeholder: '<USERNAME>' },
        { value: onstarConfig.password, placeholder: '<PASSWORD>' },
        { value: onstarConfig.onStarTOTP, placeholder: '<TOTP>' },
        { value: mqttConfig.username, placeholder: '<MQTT_USERNAME>' },
        { value: mqttConfig.password, placeholder: '<MQTT_PASSWORD>' },
    ];
    return candidates
        .filter(s => typeof s.value === 'string' && s.value.length >= MIN_SECRET_LENGTH)
        // Replace longer secrets first to avoid partial overlaps.
        .sort((a, b) => b.value.length - a.value.length);
}

/**
 * Redact known secret values and PII patterns from a string.
 * @param {string} str
 * @param {Array<{value: string, placeholder: string}>} secrets
 * @returns {string}
 */
function redactString(str, secrets = []) {
    let out = str;
    for (const { value, placeholder } of secrets) {
        out = out.replace(new RegExp(escapeRegExp(value), 'g'), placeholder);
    }
    out = out.replace(EMAIL_RE, '<EMAIL>');
    out = out.replace(VIN_RE, '<VIN>');
    return out;
}

const isSensitiveKey = (key) => SENSITIVE_KEYS.has(String(key).toLowerCase());

/**
 * Deep-clone a value with sensitive keys masked, known secret values replaced,
 * and PII patterns scrubbed from strings.
 * @param {*} value
 * @param {Array<{value: string, placeholder: string}>} secrets
 * @param {WeakSet} [seen] - internal cycle guard
 * @returns {*}
 */
function redact(value, secrets = [], seen = new WeakSet()) {
    if (typeof value === 'string') {
        return redactString(value, secrets);
    }
    if (value === null || typeof value !== 'object') {
        return value;
    }
    if (seen.has(value)) {
        return '[Circular]';
    }
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map(v => redact(v, secrets, seen));
    }
    const out = {};
    for (const [key, val] of Object.entries(value)) {
        out[key] = isSensitiveKey(key) ? REDACTED : redact(val, secrets, seen);
    }
    return out;
}

// Secrets are registered after config is built (see setSecrets); the winston
// format closes over this mutable holder so it always sees the current list.
let activeSecrets = [];

/** Register the secret values to scrub once config is known. */
function setSecrets(secrets) {
    activeSecrets = Array.isArray(secrets) ? secrets : [];
}

/** @returns {boolean} whether redaction is enabled via LOG_REDACT. */
function isEnabled() {
    return String(process.env.LOG_REDACT || 'false').toLowerCase() === 'true';
}

/** Redact a value using the registered secrets, but only when LOG_REDACT is on. */
function redactIfEnabled(value) {
    return isEnabled() ? redact(value, activeSecrets) : value;
}

/** Redact a value using the registered secrets unconditionally (e.g. forced button dump). */
function redactAlways(value) {
    return redact(value, activeSecrets);
}

// Winston format that redacts message + metadata when LOG_REDACT is enabled.
const redactFormat = winston.format((info) => {
    if (!isEnabled()) {
        return info;
    }
    const secrets = activeSecrets;
    if (typeof info.message === 'string') {
        info.message = redactString(info.message, secrets);
    } else if (info.message && typeof info.message === 'object') {
        info.message = redact(info.message, secrets);
    }
    for (const key of Object.keys(info)) {
        if (key === 'level' || key === 'message' || key === 'timestamp') continue;
        info[key] = redact(info[key], secrets);
    }
    const splat = info[Symbol.for('splat')];
    if (Array.isArray(splat)) {
        info[Symbol.for('splat')] = splat.map(v => redact(v, secrets));
    }
    return info;
});

module.exports = {
    SENSITIVE_KEYS,
    buildSecrets,
    redact,
    redactString,
    setSecrets,
    isEnabled,
    redactIfEnabled,
    redactAlways,
    redactFormat,
};
