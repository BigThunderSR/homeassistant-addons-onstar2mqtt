const _ = require('lodash');

const Measurement = require('./measurement');

class Diagnostic {
    constructor(diagResponse) {
        this.name = diagResponse.name;
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
        const { name, message, unit, value } = element;
        const convertedUnit = Measurement.convertUnit(unit);
        return new DiagnosticElement({
            name: DiagnosticElement.convertName(name, convertedUnit),
            message: message,
            unit: convertedUnit,
            value: Measurement.convertValue(value, unit)
        })
    }

    static convertName(name, unit) {
        return `${name} ${_.replace(_.toUpper(unit), /\W/g, '')}`;
    }

    /**
     * @param {string} ele.name
     * @param {string|number} ele.value
     * @param {string} ele.unit (old API) or ele.uom (new API)
     */
    constructor(ele) {
        this._name = ele.name;
        this._message = ele.message;
        // API CHANGE: Support both 'uom' (new API) and 'unit' (old API) for backward compatibility
        const unitValue = ele.uom || ele.unit;
        this.measurement = new Measurement(ele.value, unitValue);
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

module.exports = { Diagnostic, DiagnosticElement };