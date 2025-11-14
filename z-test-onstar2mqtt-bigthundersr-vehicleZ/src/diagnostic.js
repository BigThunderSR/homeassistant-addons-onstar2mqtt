const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Measurement = require('./measurement');
const logger = require('./logger');

// Unit cache to handle v3 API instability where units intermittently become null
// Maps diagnostic element name to last known valid unit
const unitCache = new Map();

// Cache file location - supports custom path via environment variable for Docker volumes
// Include VIN in filename to avoid collisions when running multiple instances
// Fallback to TOKEN_LOCATION for HA Add-on users (keeps cache with tokens)
const CACHE_DIR = process.env.UNIT_CACHE_DIR || process.env.TOKEN_LOCATION || process.cwd();
const VIN = process.env.ONSTAR_VIN || 'default';
const CACHE_FILE = path.join(CACHE_DIR, `.unit_cache_${VIN}.json`);

// Load cache from disk on module initialization
function loadCacheFromDisk() {
    try {
        // Ensure cache directory exists
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            const cached = JSON.parse(data);
            Object.entries(cached).forEach(([key, value]) => {
                unitCache.set(key, value);
            });
            logger.info(`Loaded ${unitCache.size} cached units from disk (${CACHE_FILE})`);
        }
    } catch (error) {
        logger.warn(`Failed to load unit cache from disk (${CACHE_FILE}):`, error.message);
    }
}

// Save cache to disk immediately
function saveCacheToDisk() {
    try {
        const data = {};
        unitCache.forEach((value, key) => {
            data[key] = value;
        });
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
        logger.debug(`Saved ${unitCache.size} cached units to disk (${CACHE_FILE})`);
    } catch (error) {
        logger.warn(`Failed to save unit cache to disk (${CACHE_FILE}):`, error.message);
    }
}

// Initialize cache from disk
loadCacheFromDisk();

class Diagnostic {
    constructor(diagResponse) {
        this.name = diagResponse.name;
        // API CHANGE: New API v3 includes group-level status information
        this.displayName = diagResponse.displayName;
        this.status = diagResponse.status;
        this.statusColor = diagResponse.statusColor;
        this.cts = diagResponse.cts;  // Group-level timestamp
        // API CHANGE: New API format changes field names
        // Old: diagnosticElement (singular), unit
        // New: diagnosticElements (plural), uom (unit of measure)
        // Try new format first, fallback to old format for backward compatibility
        const elements = diagResponse.diagnosticElements || diagResponse.diagnosticElement;
        // API CHANGE: New API v3 includes fields without units (like percentages, status codes)
        // Include elements that have a value, even if they don't have a unit
        const validEle = _.filter(
            elements,
            d => _.has(d, 'value')  // Just check if value exists
        );
        this.diagnosticElements = _.map(validEle, e => new DiagnosticElement(e));
        const converted = _.map(_.filter(this.diagnosticElements, e => e.isConvertible),
            e => DiagnosticElement.convert(e));
        this.diagnosticElements.push(...converted);
    }

    hasElements() {
        return this.diagnosticElements.length >= 1;
    }

    toString() {
        let elements = '';
        _.forEach(this.diagnosticElements, e => elements += `  ${e.toString()}\n`)
        return `${this.name}:\n` + elements;
    }
}

class DiagnosticElement {
    /**
     *
     * @param {DiagnosticElement} element
     */
    static convert(element) {
        const { name, message, unit, value, status, statusColor, cts } = element;
        const convertedUnit = Measurement.convertUnit(unit);
        return new DiagnosticElement({
            name: DiagnosticElement.convertName(name, convertedUnit),
            message: message,
            unit: convertedUnit,
            value: Measurement.convertValue(value, unit),
            status: status,
            statusColor: statusColor,
            cts: cts
        })
    }

    static convertName(name, unit) {
        return `${name} ${_.replace(_.toUpper(unit), /\W/g, '')}`;
    }

    /**
     * @param {string} ele.name
     * @param {string|number} ele.value
     * @param {string} ele.unit (old API) or ele.uom (new API)
     * @param {string} ele.status (API v3)
     * @param {string} ele.statusColor (API v3)
     * @param {string} ele.cts (API v3) - timestamp
     */
    constructor(ele) {
        this._name = ele.name;
        this._message = ele.message;
        // API CHANGE: Support both 'uom' (new API) and 'unit' (old API) for backward compatibility
        let unitValue = ele.uom || ele.unit;
        
        // WORKAROUND: v3 API sometimes returns null units intermittently
        // Use cached unit if current unit is null/undefined and we have a valid cache
        const cacheKey = ele.name;
        if (!unitValue || unitValue === 'null' || unitValue === 'N/A') {
            const cachedUnit = unitCache.get(cacheKey);
            if (cachedUnit) {
                logger.info(`Using cached unit for ${ele.name}: ${cachedUnit} (API returned: ${ele.uom || ele.unit || 'null'})`);
                unitValue = cachedUnit;
            }
        } else {
            // Cache valid units for future use (excluding 'N/A' which is not a real unit)
            if (unitValue !== 'N/A') {
                unitCache.set(cacheKey, unitValue);
                logger.debug(`Cached unit for ${ele.name}: ${unitValue}`);
                // Persist cache to disk for future restarts
                saveCacheToDisk();
            }
        }
        
        this.measurement = new Measurement(ele.value, unitValue);
        // API CHANGE: Capture element-level status and statusColor from API v3
        this.status = ele.status;
        this.statusColor = ele.statusColor;
        // API CHANGE: Capture element-level cts (timestamp) from API v3
        this.cts = ele.cts;
    }

    get name() {
        return this._name;
    }

    get message() {
        return this._message;
    }

    get value() {
        return this.measurement.value;
    }

    get unit() {
        return this.measurement.unit;
    }

    get isConvertible() {
        return this.measurement.isConvertible;
    }

    toString() {
        return `${this.name}: ${this.measurement.toString()}`;
    }
}

class AdvancedDiagnostic {
    constructor(advDiagResponse) {
        this.advDiagnosticsStatus = advDiagResponse.advDiagnosticsStatus;
        this.advDiagnosticsStatusColor = advDiagResponse.advDiagnosticsStatusColor;
        this.recommendedAction = advDiagResponse.recommendedAction;
        this.cts = advDiagResponse.cts;
        this.diagnosticSystems = _.map(advDiagResponse.diagnosticSystems || [], 
            s => new DiagnosticSystem(s));
    }

    hasSystems() {
        return this.diagnosticSystems.length >= 1;
    }

    toString() {
        let systems = '';
        _.forEach(this.diagnosticSystems, s => systems += `  ${s.toString()}\n`)
        return `Advanced Diagnostics (${this.advDiagnosticsStatus}):\n` + systems;
    }
}

class DiagnosticSystem {
    constructor(systemResponse) {
        this.systemId = systemResponse.systemId;
        this.systemName = systemResponse.systemName;
        this.systemLabel = systemResponse.systemLabel;
        this.systemDescription = systemResponse.systemDescription;
        this.systemStatus = systemResponse.systemStatus;
        this.systemStatusColor = systemResponse.systemStatusColor;
        
        // Store all subsystems with their full info
        const subSystems = systemResponse.subSystems || [];
        this.subsystems = _.map(subSystems, s => ({
            name: s.subSystemName,
            label: s.subSystemLabel,
            description: s.subSystemDescription,
            status: s.subSystemStatus,
            status_color: s.subSystemStatusColor,
            dtc_count: (s.dtcList || []).length
        }));
        
        // Keep track of subsystems with issues for backward compatibility
        this.subsystemsWithIssues = _.filter(subSystems, 
            s => s.subSystemStatus !== 'NO_ACTION_REQUIRED' && s.subSystemStatus !== 'NO ACTION REQUIRED');
        
        // Count total DTCs across all subsystems
        this.dtcCount = _.sumBy(subSystems, s => (s.dtcList || []).length);
        
        // Store all DTCs for detailed info
        this.dtcs = _.flatMap(subSystems, s => 
            _.map(s.dtcList || [], dtc => ({
                subsystem: s.subSystemName,
                ...dtc
            }))
        );
    }

    toString() {
        let issues = this.subsystemsWithIssues.length > 0 
            ? ` (${this.subsystemsWithIssues.length} subsystem issues)` 
            : '';
        let dtcs = this.dtcCount > 0 ? ` [${this.dtcCount} DTCs]` : '';
        return `${this.systemName}: ${this.systemStatus}${issues}${dtcs}`;
    }
}

/**
 * Get unit cache statistics for debugging
 * @returns {Object} Cache statistics including size and all cached units
 */
function getUnitCacheStats() {
    const stats = {
        size: unitCache.size,
        cachedUnits: {}
    };
    unitCache.forEach((unit, name) => {
        stats.cachedUnits[name] = unit;
    });
    return stats;
}

/**
 * Clear the unit cache (useful for testing or reset scenarios)
 * @param {boolean} deleteDiskCache - Whether to also delete the disk cache file
 */
function clearUnitCache(deleteDiskCache = false) {
    unitCache.clear();
    logger.info('Unit cache cleared');
    if (deleteDiskCache) {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                fs.unlinkSync(CACHE_FILE);
                logger.info(`Disk cache file deleted (${CACHE_FILE})`);
            }
        } catch (error) {
            logger.warn(`Failed to delete disk cache file (${CACHE_FILE}):`, error.message);
        }
    }
}

module.exports = { 
    Diagnostic, 
    DiagnosticElement, 
    AdvancedDiagnostic, 
    DiagnosticSystem,
    getUnitCacheStats,
    clearUnitCache
};