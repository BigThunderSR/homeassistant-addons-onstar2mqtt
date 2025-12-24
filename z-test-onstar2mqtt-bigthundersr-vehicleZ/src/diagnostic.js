const fs = require('fs');
const path = require('path');

const Measurement = require('./measurement');
const logger = require('./logger');

// Unit cache to handle v3 API instability where units intermittently become null
// Maps diagnostic element name to last known valid unit
const unitCache = new Map();

// State cache to handle v3 API instability where partial data is returned
// Maps MQTT topic -> last known complete state object
// Enable with: ONSTAR_STATE_CACHE=true
const stateCache = new Map();
const STATE_CACHE_ENABLED = (process.env.ONSTAR_STATE_CACHE || 'false').toLowerCase() === 'true';

// Cache file location - supports custom path via environment variable for Docker volumes
// Include VIN in filename to avoid collisions when running multiple instances
// Fallback to TOKEN_LOCATION for HA Add-on users (keeps cache with tokens)
const CACHE_DIR = process.env.UNIT_CACHE_DIR || process.env.TOKEN_LOCATION || process.cwd();
const VIN = process.env.ONSTAR_VIN || 'default';
const CACHE_FILE = path.join(CACHE_DIR, `.unit_cache_${VIN}.json`);
const STATE_CACHE_FILE = path.join(CACHE_DIR, `.state_cache_${VIN}.json`);

// Load cache from disk on module initialization
function loadCacheFromDisk() {
    try {
        // Ensure cache directory exists
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        
        // Load unit cache
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            const cached = JSON.parse(data);
            Object.entries(cached).forEach(([key, value]) => {
                unitCache.set(key, value);
            });
            logger.info(`Loaded ${unitCache.size} cached units from disk (${CACHE_FILE})`);
        }
        
        // Load state cache (if enabled)
        if (STATE_CACHE_ENABLED && fs.existsSync(STATE_CACHE_FILE)) {
            const data = fs.readFileSync(STATE_CACHE_FILE, 'utf8');
            const cached = JSON.parse(data);
            Object.entries(cached).forEach(([topic, state]) => {
                stateCache.set(topic, state);
            });
            logger.info(`State cache: Loaded ${stateCache.size} cached topics from disk (${STATE_CACHE_FILE})`);
        } else if (STATE_CACHE_ENABLED) {
            logger.info('State cache: No existing cache file found, starting fresh');
        } else {
            logger.debug('State cache is disabled (ONSTAR_STATE_CACHE=false)');
        }
    } catch (error) {
        logger.warn(`Failed to load cache from disk:`, error.message);
    }
}

// Save unit cache to disk immediately
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

// Save state cache to disk
function saveStateCacheToDisk() {
    if (!STATE_CACHE_ENABLED) {
        return;
    }
    try {
        const data = {};
        stateCache.forEach((state, topic) => {
            data[topic] = state;
        });
        fs.writeFileSync(STATE_CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
        logger.debug(`State cache: Saved ${stateCache.size} topics to disk`);
    } catch (error) {
        logger.warn(`State cache: Failed to save to disk (${STATE_CACHE_FILE}):`, error.message);
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
        const elements = diagResponse.diagnosticElements || diagResponse.diagnosticElement || [];
        // API CHANGE: New API v3 includes fields without units (like percentages, status codes)
        // Include elements that have a value, even if they don't have a unit
        const validEle = elements.filter(
            d => 'value' in d  // Just check if value exists
        );
        this.diagnosticElements = validEle.map(e => new DiagnosticElement(e));
        const converted = this.diagnosticElements.filter(e => e.isConvertible)
            .map(e => DiagnosticElement.convert(e));
        this.diagnosticElements.push(...converted);
    }

    hasElements() {
        return this.diagnosticElements.length >= 1;
    }

    toString() {
        let elements = '';
        this.diagnosticElements.forEach(e => elements += `  ${e.toString()}\n`)
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
        return `${name} ${unit.toUpperCase().replace(/\W/g, '')}`;
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
        this.diagnosticSystems = (advDiagResponse.diagnosticSystems || []).map(
            s => new DiagnosticSystem(s));
    }

    hasSystems() {
        return this.diagnosticSystems.length >= 1;
    }

    toString() {
        let systems = '';
        this.diagnosticSystems.forEach(s => systems += `  ${s.toString()}\n`)
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
        this.subsystems = subSystems.map(s => ({
            name: s.subSystemName,
            label: s.subSystemLabel,
            description: s.subSystemDescription,
            status: s.subSystemStatus,
            status_color: s.subSystemStatusColor,
            dtc_count: (s.dtcList || []).length
        }));
        
        // Keep track of subsystems with issues for backward compatibility
        this.subsystemsWithIssues = subSystems.filter(
            s => s.subSystemStatus !== 'NO_ACTION_REQUIRED' && s.subSystemStatus !== 'NO ACTION REQUIRED');
        
        // Count total DTCs across all subsystems
        this.dtcCount = subSystems.reduce((sum, s) => sum + (s.dtcList || []).length, 0);
        
        // Store all DTCs for detailed info
        this.dtcs = subSystems.flatMap(s => 
            (s.dtcList || []).map(dtc => ({
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

// ============================================================================
// State Cache Functions
// ============================================================================

/**
 * Merge new state with cached state for a given topic.
 * New values overwrite cached values, but missing fields are preserved from cache.
 * 
 * @param {string} topic - The MQTT topic for this state
 * @param {object} newState - The new state payload from the API
 * @returns {object} - The merged state with all known fields
 */
function mergeState(topic, newState) {
    if (!STATE_CACHE_ENABLED) {
        // Cache disabled - return new state as-is
        return newState;
    }
    
    const cachedState = stateCache.get(topic) || {};
    
    // Merge: cached values are preserved, new values overwrite
    // This ensures we keep fields from previous updates that aren't in current update
    const mergedState = { ...cachedState, ...newState };
    
    // Track merge metadata
    mergedState._cache_last_merge = new Date().toISOString();
    
    // Count how many fields came from cache vs new
    const cachedFields = Object.keys(cachedState).filter(k => !k.startsWith('_cache_'));
    const newFields = Object.keys(newState).filter(k => !k.startsWith('_cache_'));
    const preservedCount = cachedFields.filter(k => !newFields.includes(k)).length;
    
    if (preservedCount > 0) {
        logger.info(`State cache: Topic ${topic} - merged ${newFields.length} new fields, preserved ${preservedCount} cached fields`);
    }
    
    // Update cache
    stateCache.set(topic, mergedState);
    
    // Persist to disk
    saveStateCacheToDisk();
    
    return mergedState;
}

/**
 * Get the current cached state for a topic (for debugging/inspection)
 * 
 * @param {string} topic - The MQTT topic
 * @returns {object|undefined} - The cached state or undefined
 */
function getCachedState(topic) {
    return stateCache.get(topic);
}

/**
 * Clear the state cache (useful for testing or manual reset)
 * @param {boolean} deleteDiskCache - Whether to also delete the disk cache file
 */
function clearStateCache(deleteDiskCache = true) {
    stateCache.clear();
    if (STATE_CACHE_ENABLED && deleteDiskCache) {
        try {
            if (fs.existsSync(STATE_CACHE_FILE)) {
                fs.unlinkSync(STATE_CACHE_FILE);
                logger.info('State cache: Cleared cache and removed cache file');
            }
        } catch (error) {
            logger.warn('State cache: Failed to remove cache file:', error.message);
        }
    }
}

/**
 * Check if state caching is enabled
 * @returns {boolean}
 */
function isStateCacheEnabled() {
    return STATE_CACHE_ENABLED;
}

/**
 * Get state cache statistics (for debugging)
 * @returns {object}
 */
function getStateCacheStats() {
    return {
        enabled: STATE_CACHE_ENABLED,
        topicCount: stateCache.size,
        cacheFile: STATE_CACHE_FILE,
        topics: Array.from(stateCache.keys())
    };
}

module.exports = { 
    Diagnostic, 
    DiagnosticElement, 
    AdvancedDiagnostic, 
    DiagnosticSystem,
    getUnitCacheStats,
    clearUnitCache,
    // State cache exports
    mergeState,
    getCachedState,
    clearStateCache,
    isStateCacheEnabled,
    getStateCacheStats
};