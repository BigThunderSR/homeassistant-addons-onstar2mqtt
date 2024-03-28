
class Commands {
    static CONSTANTS = {
        ALERT_ACTION: {
            FLASH: 'Flash',
            HONK: 'Honk',
        },
        ALERT_OVERRIDE: {
            DOOR_OPEN: 'DoorOpen',
            IGNITION_ON: 'IgnitionOn'
        },
        CHARGE_OVERRIDE: {
            CHARGE_NOW: 'CHARGE_NOW',
            CANCEL_OVERRIDE: 'CANCEL_OVERRIDE'
        },
        CHARGING_PROFILE_MODE: {
            DEFAULT_IMMEDIATE: 'DEFAULT_IMMEDIATE',
            IMMEDIATE: 'IMMEDIATE',
            DEPARTURE_BASED: 'DEPARTURE_BASED',
            RATE_BASED: 'RATE_BASED',
            PHEV_AFTER_MIDNIGHT: 'PHEV_AFTER_MIDNIGHT'
        },
        CHARGING_PROFILE_RATE: {
            OFFPEAK: 'OFFPEAK',
            MIDPEAK: 'MIDPEAK',
            PEAK: 'PEAK'
        },
        DIAGNOSTICS: {
            AMBIENT_AIR_TEMPERATURE: 'AMBIENT AIR TEMPERATURE',
            ENGINE_AIR_FILTER_MONITOR_STATUS: 'ENGINE AIR FILTER MONITOR STATUS',
            ENGINE_COOLANT_TEMP: 'ENGINE COOLANT TEMP',
            ENGINE_RPM: 'ENGINE RPM',
            ENERGY_EFFICIENCY: 'ENERGY EFFICIENCY',
            EV_BATTERY_LEVEL: 'EV BATTERY LEVEL',
            EV_CHARGE_STATE: 'EV CHARGE STATE',
            EV_ESTIMATED_CHARGE_END: 'EV ESTIMATED CHARGE END',
            EV_PLUG_STATE: 'EV PLUG STATE',
            EV_PLUG_VOLTAGE: 'EV PLUG VOLTAGE',
            EV_SCHEDULED_CHARGE_START: 'EV SCHEDULED CHARGE START',
            FUEL_TANK_INFO: 'FUEL TANK INFO',
            GET_CHARGE_MODE: 'GET CHARGE MODE',
            GET_COMMUTE_SCHEDULE: 'GET COMMUTE SCHEDULE',
            HANDS_FREE_CALLING: 'HANDS FREE CALLING',
            HOTSPOT_CONFIG: 'HOTSPOT CONFIG',
            HOTSPOT_STATUS: 'HOTSPOT STATUS',
            INTERM_VOLT_BATT_VOLT: 'INTERM VOLT BATT VOLT',
            LAST_TRIP_DISTANCE: 'LAST TRIP DISTANCE',
            LAST_TRIP_FUEL_ECONOMY: 'LAST TRIP FUEL ECONOMY',
            LIFETIME_EV_ODOMETER: 'LIFETIME EV ODOMETER',
            LIFETIME_FUEL_ECON: 'LIFETIME FUEL ECON',
            LIFETIME_FUEL_USED: 'LIFETIME FUEL USED',
            ODOMETER: 'ODOMETER',
            OIL_LIFE: 'OIL LIFE',
            TIRE_PRESSURE: 'TIRE PRESSURE',
            VEHICLE_RANGE: 'VEHICLE RANGE',
        }
    }

    constructor(onstar) {
        this.onstar = onstar;
    }

    async getAccountVehicles() {
        return this.onstar.getAccountVehicles();
    }

    async startVehicle() {
        return this.onstar.start();
    }

    async cancelStartVehicle() {
        return this.onstar.cancelStart();
    }

    //async alert({action = [Commands.CONSTANTS.ALERT_ACTION.FLASH],
    //             delay = 0, duration = 1, override = []}) {
    //    return this.onstar.alert({
    //        action,
    //        delay,
    //        duration,
    //        override
    //    });
    //}

    async alert(request) {
        return this.onstar.alert(request);
    }

    async alertFlash({ action = [Commands.CONSTANTS.ALERT_ACTION.FLASH] }) {
        return this.onstar.alert({ action });
    }

    async alertHonk({ action = [Commands.CONSTANTS.ALERT_ACTION.HONK] }) {
        return this.onstar.alert({ action });
    }

    async cancelAlert() {
        return this.onstar.cancelAlert();
    }

    async lockDoor({ delay = 0 }) {
        return this.onstar.lockDoor({ delay });
    }

    async unlockDoor({ delay = 0 }) {
        return this.onstar.unlockDoor({ delay });
    }

    async lockTrunk({ delay = 0 }) {
        return this.onstar.lockTrunk({ delay });
    }

    async unlockTrunk({ delay = 0 }) {
        return this.onstar.unlockTrunk({ delay });
    }

    async chargeOverride({ mode = Commands.CONSTANTS.CHARGE_OVERRIDE.CHARGE_NOW }) {
        return this.onstar.chargeOverride({ mode });
    }

    async cancelChargeOverride({ mode = Commands.CONSTANTS.CHARGE_OVERRIDE.CANCEL_OVERRIDE }) {
        return this.onstar.chargeOverride({ mode });
    }

    async getChargingProfile() {
        return this.onstar.getChargingProfile();
    }

    async setChargingProfile(request) {
        return this.onstar.setChargingProfile(request);
    }

    async getLocation() {
        return this.onstar.location();
    }

    async diagnostics({ diagnosticItem = [
        Commands.CONSTANTS.DIAGNOSTICS.AMBIENT_AIR_TEMPERATURE,
        Commands.CONSTANTS.DIAGNOSTICS.LAST_TRIP_DISTANCE,
        Commands.CONSTANTS.DIAGNOSTICS.ODOMETER,
        Commands.CONSTANTS.DIAGNOSTICS.TIRE_PRESSURE,
    ] }) {
        return this.onstar.diagnostics({ diagnosticItem });
    }

    async enginerpm({ diagnosticItem = [
        Commands.CONSTANTS.DIAGNOSTICS.ENGINE_RPM,
    ] }) {
        return this.onstar.diagnostics({ diagnosticItem });
    }

}

module.exports = Commands;
