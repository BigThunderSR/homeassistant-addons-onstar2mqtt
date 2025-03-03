const _ = require('lodash');
const convert = require('convert-units');

class Measurement {
    static CONVERTABLE_UNITS = [
        '°C',
        'km',
        'kPa',
        'km/L(e)',
        'km/L',
        // Helps with conversion to Gallons. 
        'L'
    ];

    constructor(value, unit) {
        this.value = value;
        this.unit = Measurement.correctUnitName(unit);
        this.isConvertible = _.includes(Measurement.CONVERTABLE_UNITS, this.unit);
    }

    /**
     * Would be nice if GM used sane unit labels.
     * @param {string} unit
     * @returns {string}
     */
    static correctUnitName(unit) {
        switch (unit) {
            case 'Cel':
                return '°C';
            case 'kwh':
                return 'kWh';
            case 'KM':
                return 'km';
            case 'KPa':
                return 'kPa';
            case 'kmple':
                return 'km/L(e)';
            case 'kmpl':
                return 'km/L';
            case 'volts':
            case 'Volts':
                return 'V';
            case 'l':
                return 'L';
            case 'L':
                return 'L';
            //case 'l':
            //return 'lit';
            //case 'L':
            //    return 'lit';
            // these are states
            case 'Stat':
            case 'N/A':
                return undefined;

            default:
                return unit;
        }
    }

    /**
     *
     * @param {string|number} value
     * @param {string} unit
     * @returns {string|number}
     */
    static convertValue(value, unit) {
        switch (unit) {
            case '°C':
                value = _.round(convert(value).from('C').to('F'));
                break;
            case 'km':
                value = _.round(convert(value).from('km').to('mi'), 1);
                break;
            case 'kPa':
                value = _.round(convert(value).from('kPa').to('psi'), 1);
                break;
            case 'km/L(e)':
                // km/L =  (1.609344 / 3.785411784) * MPG
                value = _.round(value / (1.609344 / 3.785411784), 1);
                break;
            case 'km/L':
                // km/L =  (1.609344 / 3.785411784) * MPG
                value = _.round(value / (1.609344 / 3.785411784), 1);
                break;
            case 'L':
                value = _.round(value / 3.785411784, 1);
                //case 'lit':
                //    value = _.round(value / 3.785411784, 1);

                break;
        }
        return value;
    }

    /**
     *
     * @param {string} unit
     * @returns {string}
     */
    static convertUnit(unit) {
        switch (unit) {
            case '°C':
                return '°F';
            case 'km':
                return 'mi';
            case 'kPa':
                return 'psi';
            case 'km/L(e)':
                return 'mpg(e)';
            case 'km/L':
                return 'mpg';
            case 'L':
                return 'gal';
            default:
                return unit;
        }
    }

    toString() {
        return `${this.value}${this.unit}`;
    }
}

module.exports = Measurement;
