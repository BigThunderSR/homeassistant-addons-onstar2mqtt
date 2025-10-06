const _ = require('lodash');

class Vehicle {
    constructor(vehicle) {
        this.make = vehicle.make;
        this.model = vehicle.model;
        this.vin = vehicle.vin;
        this.year = vehicle.year;

        // API CHANGE: New API format no longer includes 'commands' object in vehicle data
        // Old API: vehicle.commands.command was an array of supported commands
        // New API: commands object is not present in vehicle response
        // Maintaining backward compatibility by checking if commands exist
        const commands = _.get(vehicle, 'commands.command');
        
        if (commands) {
            // Old API format - extract supported diagnostics from commands
            const diagCmd = _.find(commands, cmd => cmd.name === 'diagnostics');
            this.supportedDiagnostics = _.get(diagCmd,
                'commandData.supportedDiagnostics.supportedDiagnostic');
            this.supportedCommands = commands;
        } else {
            // New API format - commands are handled separately
            // Setting to null for now; may need to be populated from a different API endpoint
            // or assume all diagnostics are supported by default
            this.supportedDiagnostics = null;
            this.supportedCommands = null;
        }
    }

    isSupported(diag) {
        // API CHANGE: Handle null supportedDiagnostics (new API format)
        // If supportedDiagnostics is null, assume all diagnostics are supported
        if (this.supportedDiagnostics === null) {
            return true;
        }
        return _.includes(this.supportedDiagnostics, diag);
    }

    getSupported(diags = []) {
        // API CHANGE: Handle null supportedDiagnostics (new API format)
        // If supportedDiagnostics is null, return requested diags or empty array
        if (this.supportedDiagnostics === null) {
            return diags.length === 0 ? [] : diags;
        }
        
        if (diags.length === 0) {
            return this.supportedDiagnostics;
        }
        return _.intersection(this.supportedDiagnostics, diags);
    }

    toString() {
        return `${this.year} ${this.make} ${this.model}`;
    }

    getSupportedCommands(commandList = []) {
        // API CHANGE: Handle null supportedCommands (new API format)
        // If supportedCommands is null, return empty commandList
        if (this.supportedCommands === null) {
            return commandList;
        }
        
        this.supportedCommands.forEach(command => {
            commandList.push(command.name);
        });
        return commandList;
    }
}

module.exports = Vehicle;