const convert = require('convert-units');

// Helper function to round to specified decimals
function round(num, decimals = 0) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

class Measurement {
    static CONVERTIBLE_UNITS = [
        '°C',
        'km',
        'kPa',
        'km/L(e)',
        'km/L',
        // API CHANGE: New API may use L/100km format
        'L/100km',
        // Helps with conversion to Gallons. 
        'L',
        // API CHANGE: New API may provide PSI directly
        'psi'
    ];

    constructor(value, unit) {
        this.value = value;
        this.unit = Measurement.correctUnitName(unit);
        this.isConvertible = Measurement.CONVERTIBLE_UNITS.includes(this.unit);
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
            // API CHANGE: New API may use different case for kPa
            case 'KPa':
            case 'kPa':
                return 'kPa';
            case 'kmple':
                return 'km/L(e)';
            case 'kmpl':
                return 'km/L';
            // API CHANGE: New API uses different fuel economy formats
            case 'L/100KM':
                return 'L/100km';
            case 'KM/L':
                return 'km/L';
            // API CHANGE: New API may use PSI directly
            case 'PSI':
                return 'psi';
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
                value = round(convert(value).from('C').to('F'));
                break;
            case 'km':
                value = round(convert(value).from('km').to('mi'), 1);
                break;
            case 'kPa':
                value = round(convert(value).from('kPa').to('psi'), 1);
                break;
            case 'km/L(e)':
                // km/L =  (1.609344 / 3.785411784) * MPG
                value = round(value / (1.609344 / 3.785411784), 1);
                break;
            case 'km/L':
                // km/L =  (1.609344 / 3.785411784) * MPG
                value = round(value / (1.609344 / 3.785411784), 1);
                break;
            // API CHANGE: New API may use L/100km - convert to MPG
            case 'L/100km':
                // L/100km to MPG = 235.214583 / L/100km
                value = round(235.214583 / value, 1);
                break;
            case 'L':
                value = round(value / 3.785411784, 1);
                //case 'lit':
                //    value = round(value / 3.785411784, 1);

                break;
            // API CHANGE: PSI is already in target unit, no conversion needed
            case 'psi':
                value = round(value, 1);
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
            // API CHANGE: New API may use L/100km - convert to MPG
            case 'L/100km':
                return 'mpg';
            case 'L':
                return 'gal';
            // API CHANGE: PSI is already in target unit
            case 'psi':
                return 'psi';
            default:
                return unit;
        }
    }

    toString() {
        return `${this.value}${this.unit}`;
    }
}

module.exports = Measurement;
