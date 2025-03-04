# Instructions and Usage Notes for MQTT Home Assistant Integration

## Sensor and Button Location in HA

When everything is setup correctly, all available sensors and buttons are created automatically (_please review this entire document for specific caveats_) and can be seen in HA under:

- `Settings --> Devices & services --> MQTT`
  - They will be grouped under a MQTT device with the name of your vehicle

## Dynamically Change Polling Frequency Using MQTT

- Uses the value from `ONSTAR_REFRESH` on initial startup
- Change the value dynamically by publishing the new refresh value in milliseconds (ms) as an INT to: `homeassistant/YOUR_CAR_VIN/refresh_interval`
- Retained topic of `homeassistant/YOUR_CAR_VIN/refresh_interval_current_val` can be used to monitor current refresh value set via MQTT

### Example Script YAML

```yaml
alias: Set MyCar Data Refresh to 1 Hour
sequence:
  - service: mqtt.publish
    data:
      qos: "0"
      payload: "3600000"
      topic: homeassistant/MY_CAR_VIN/refresh_interval
mode: single
```

## Commands

### Example Script YAML for Running Commands

**MQTT button auto discovery is enabled starting at v1.14.0 which sends/triggers the defaults of each command.**

- > Buttons are added disabled by default because it's easy to accidentally press the wrong button and trigger an action at an inopportune time.
  - > Enable at your own risk and you assume all responsibility for your actions.
- All available buttons for all vehicles are included for now, so only enable the buttons you need and/or work for your vehicle.

#### The following isn't strictly necessary starting at v1.14.0, but still available if needed or for sending customized commands

```yaml
alias: Car - Start Vehicle
sequence:
  - service: mqtt.publish
    data:
      topic: homeassistant/YOUR_CAR_VIN/command
      payload: '{"command": "startVehicle"}'
mode: single
icon: "mdi:car-electric"
```

#### Format for sending command options in the payload

- Diagnostics:
  - `{"command": "diagnostics","options": "OIL LIFE,VEHICLE RANGE"}`
- Set Charging Profile
  - `{"command": "setChargingProfile","options": {"chargeMode": "RATE_BASED","rateType": "OFFPEAK"}}`
- Alert
  - `{"command": "alert","options": {"action": "Flash"}}`

### Trigger Precondition via Calendar

```yaml
alias: Car Precondition
description: Precondition if group.family is home (ie, at least one person).
trigger:
  - platform: state
    entity_id: calendar.YOUR_CAL_NAME
    from: "off"
    to: "on"
condition:
  - condition: state
    entity_id: group.family
    state: home
  - condition: state
    entity_id: calendar.YOUR_CAL_NAME
    state: Bolt Start
    attribute: message
action:
  - service: script.car_start_vehicle
    data: {}
mode: single
```

### Location

**MQTT `device_tracker` auto discovery capability is enabled starting at v1.12.0 and _requires_ running the `getLocation` command for initial setup of the `device_tracker` entity via auto discovery.**

- The `device_tracker` auto discovery config is published to: `homeassistant/device_tracker/YOUR_CAR_VIN/config`
- The GPS coordinates are still read from the original topic automatically at: `homeassistant/device_tracker/YOUR_CAR_VIN/getlocation/state`
- The `device_tracker` can be found in HA by going to: `Settings --> Devices & services --> Entities`

~~Unfortunately, the MQTT Device tracker uses a home/not_home state and the MQTT Json device tracker does not support
the discovery schema so a manual entity configuration is required.~~

~~Device Tracker YAML:~~

```yaml
<!-- The following YAML configuration is no longer required starting at v1.12.0 -->
#device_tracker:
#  - platform: mqtt_json
#    devices:
#      your_car_name: homeassistant/device_tracker/YOUR_CAR_VIN/getlocation/state
```

#### Script YAML

**MQTT button auto discovery is enabled starting at v1.14.0, so the following isn't strictly necessary, but still available if needed.**

```yaml
alias: Car - Location
sequence:
  - service: mqtt.publish
    data:
      topic: homeassistant/YOUR_CAR_VIN/command
      payload: '{"command": "getLocation"}'
mode: single
icon: "mdi:map-marker"
```

### MQTT Polling Status Success Monitor (T/F)

- **MQTT Auto-Discovery for Polling Status Sensors for HA Added Starting at v1.16.0**
  - Polling Status Message, Timestamp and True/False Sensor from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.
  - Set `MQTT_LIST_ALL_SENSORS_TOGETHER="true"` to group all the sensors under one MQTT device starting at v1.17.0.
    - Default is `"false"`.

#### To Manually Add MQTT Polling Status Success Monitor if Wanted

Create a MQTT binary sensor in Home Assistant

```yaml
mqtt:
  binary_sensor:
    - name: "<Vehicle_Name> OnStar Polling Status Successful"
      unique_id: <vehicle_name>_onstar_polling_status_successful
      availability_topic: homeassistant/YOUR_CAR_VIN/available
      payload_available: "false"
      payload_not_available: "true"
      state_topic: "YOUR_POLLING_STATUS_TOPIC/lastpollsuccessful"
      # NOTE: If "MQTT_ONSTAR_POLLING_STATUS_TOPIC" is not explicitly set,
      #       "YOUR_POLLING_STATUS_TOPIC" defaults to "homeassistant/YOUR_CAR_VIN/polling_status/".
      #       If set, provide whatever value you set it to in this field.
      payload_on: "false"
      payload_off: "true"
      device_class: problem
```

### MQTT Polling Status Success Timestamp Monitor

- **MQTT Auto-Discovery for Polling Status Sensors for HA Added Starting at v1.16.0**
  - Polling Status Message, Timestamp and True/False Sensor from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.
  - Set `MQTT_LIST_ALL_SENSORS_TOGETHER="true"` to group all the sensors under one MQTT device starting at v1.17.0.
    - Default is `"false"`.

#### To Manually Add MQTT Polling Status Success Timestamp Monitor if Wanted

Create a MQTT sensor in Home Assistant

```yaml
mqtt:
  sensor:
    - name: "<Vehicle_Name> OnStar Last Polling Status Timestamp"
      unique_id: <vehicle_name>_last_polling_status_timestamp
      availability_topic: homeassistant/YOUR_CAR_VIN/available
      payload_available: "false"
      payload_not_available: "true"
      state_topic: "YOUR_POLLING_STATUS_TOPIC/state"
      # NOTE: If "MQTT_ONSTAR_POLLING_STATUS_TOPIC" is not explicitly set,
      #       "YOUR_POLLING_STATUS_TOPIC" defaults to "homeassistant/YOUR_CAR_VIN/polling_status/".
      #       If set, provide whatever value you set it to in this field.
      value_template: "{{ value_json.completionTimestamp }}"
      icon: mdi:calendar-clock
      device_class: timestamp
```

### MQTT Command Status Monitor

- **MQTT Auto-Discovery for Command Status Sensors for HA Added Starting at v1.15.0**
  - Command Status and Timestamp from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.
  - > **Important Note:**
    - > _Command needs to be run at least once before the sensor is visible in HA._
  - Set `MQTT_LIST_ALL_SENSORS_TOGETHER="true"` to group all the sensors under one MQTT device starting at v1.17.0.
    - Default is `"false"`.

#### To Manually Add MQTT Command Status Monitor if Wanted

Create a MQTT sensor in Home Assistant for each command status you want to monitor. Below is an example for the getLocation command and other commands follow a similar format.

```yaml
mqtt:
  sensor:
    - name: "Vehicle1 Location Command Status Message"
      unique_id: vehicle1_location_command_status_message
      availability_topic: homeassistant/YOUR_CAR_VIN/available
      payload_available: "false"
      payload_not_available: "true"
      state_topic: "homeassistant/YOUR_VEHICLE_VIN/command/getLocation/state"
      value_template: "{{ value_json.command.error.message }}"
      icon: mdi:message-alert
```

### MQTT Command Status Timestamp Monitor

- **MQTT Auto-Discovery for Command Status Sensors for HA Added Starting at v1.15.0**
  - Command Status and Timestamp from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.
  - > **Important Note:**
    - > _Command needs to be run at least once before the sensor is visible in HA._
  - Set `MQTT_LIST_ALL_SENSORS_TOGETHER="true"` to group all the sensors under one MQTT device starting at v1.17.0.
    - Default is `"false"`.

#### To Manually Add MQTT Command Status Timestamp Monitor if Wanted

Create a MQTT sensor in Home Assistant for each command timestamp you want to monitor. Below is an example for the getLocation command and other commands follow a similar format.

```yaml
mqtt:
  sensor:
    - name: "Vehicle1 Location Command Status Timestamp"
      unique_id: vehicle1_location_command_status_timestamp
      availability_topic: homeassistant/YOUR_CAR_VIN/available
      payload_available: "false"
      payload_not_available: "true"
      state_topic: "homeassistant/YOUR_VEHICLE_VIN/command/getLocation/state"
      value_template: "{{ value_json.completionTimestamp}}"
      icon: mdi:calendar-clock
      device_class: timestamp
```

### Automation

Create an automation to update the location whenever the odometer changes, instead of on a time interval.

```yaml
alias: Update EV Location
description: ""
trigger:
  - platform: state
    entity_id:
      - sensor.odometer_mi
condition: []
action:
  - service: script.locate_bolt_ev
    data: {}
mode: single
```

### Available Commands

[OnStarJS Command Docs](https://github.com/samrum/OnStarJS#commands)

Commands Implemented in this Program:

1. `getAccountVehicles`
2. `startVehicle`
3. `cancelStartVehicle`
4. `alert`
5. `cancelAlert`
6. `lockDoor`
7. `unlockDoor`
8. `lockTrunk` (only available on some vehicles)
9. `unlockTrunk` (only available on some vehicles)
10. `getChargingProfile`
11. `setChargingProfile`
12. `chargeOverride`
13. `cancelChargeOverride`
14. `getLocation`
15. `alertFlash`
16. `alertHonk`
17. `diagnostics`
18. `enginerpm`

### Lovelace Dashboard

- This is just an example and is meant to show some possible usage modes.
- The sensors shown in this example may not exist in your vehicle.
- It is not all-inclusive and is not intended to be for the purpose of copy-and-use-as-is.
- Please modify as necessary for your specific needs.

Create a new dashboard, or use the cards in your own view. The `mdi:car-electric` icon works well here.

![lovelace screenshot](https://github.com/BigThunderSR/onstar2mqtt/raw/main/images/lovelace.png)

#### Example Dashboard YAML

```yaml
views:
  - badges: []
    cards:
      - type: gauge
        entity: sensor.<vehicle_name>_ev_battery_level
        min: 0
        max: 100
        name: Battery
        severity:
          green: 60
          yellow: 40
          red: 15
      - type: gauge
        entity: sensor.<vehicle_name>_ev_range
        min: 0
        max: 420
        name: Range
        severity:
          green: 250
          yellow: 150
          red: 75
      - type: glance
        entities:
          - entity: sensor.<vehicle_name>_tire_pressure_left_front
            name: Left Front
            icon: "mdi:car-tire-alert"
          - entity: sensor.<vehicle_name>_tire_pressure_right_front
            name: Right Front
            icon: "mdi:car-tire-alert"
          - entity: sensor.<vehicle_name>_tire_pressure_left_rear
            name: Left Rear
            icon: "mdi:car-tire-alert"
          - entity: sensor.<vehicle_name>_tire_pressure_right_rear
            name: Right Rear
            icon: "mdi:car-tire-alert"
        columns: 2
        title: Tires
      - type: entities
        title: Mileage
        entities:
          - entity: sensor.<vehicle_name>_lifetime_mpge
          - entity: sensor.<vehicle_name>_lifetime_efficiency
          - entity: sensor.<vehicle_name>_electric_economy
        state_color: true
        footer:
          type: "custom:mini-graph-card"
          entities:
            - entity: sensor.<vehicle_name>_odometer
            - entity: sensor.<vehicle_name>_lifetime_energy_used
              y_axis: secondary
              show_state: true
          hours_to_show: 672
          group_by: date
          decimals: 0
          show:
            graph: bar
            name: false
            icon: false
      - type: entities
        entities:
          - entity: binary_sensor.<vehicle_name>_ev_plug_state
            secondary_info: last-changed
          - entity: binary_sensor.<vehicle_name>_ev_charge_state
            secondary_info: last-changed
          - entity: binary_sensor.<vehicle_name>_priority_charge_indicator
          - entity: binary_sensor.<vehicle_name>_priority_charge_status
          - entity: sensor.<vehicle_name>_ev_plug_voltage
          - entity: sensor.<vehicle_name>_interm_volt_batt_volt
          - entity: sensor.<vehicle_name>_charger_power_level
        title: Charging
        state_color: true
      - type: "custom:mini-graph-card"
        entities:
          - entity: sensor.<vehicle_name>_last_trip_total_distance
          - entity: sensor.<vehicle_name>_last_trip_electric_econ
            y_axis: secondary
            show_state: true
        name: Last Trip
        hours_to_show: 672
        group_by: date
        aggregate_func: null
        show:
          graph: bar
          icon: false
      - type: "custom:mini-graph-card"
        entities:
          - entity: sensor.<vehicle_name>_ambient_air_temperature
            name: Ambient
          - entity: sensor.<vehicle_name>_hybrid_battery_minimum_temperature
            name: Battery
          - entity: sensor.kewr_daynight_temperature
            name: Outdoor
        name: Temperature
        hours_to_show: 24
        points_per_hour: 1
        line_width: 2
      - type: grid
        cards:
          - type: button
            tap_action:
              action: toggle
            entity: button.<vehicle_name>_command_start ## If you want to use the auto-created button
            #entity: script.car_start_vehicle ## If you want to use a script instead of the auto-created button
            name: Start
            show_state: false
          - type: button
            tap_action:
              action: toggle
            entity: button.<vehicle_name>_command_cancelstart ## If you want to use the auto-created button
            #entity: script.car_cancel_start_vehicle ## If you want to use a script instead of the auto-created button
            name: Cancel Start
            show_state: false
            icon: "mdi:car-off"
          - type: button
            tap_action:
              action: toggle
            entity: button.<vehicle_name>_command_lockdoor ## If you want to use the auto-created button
            #entity: script.car_lock_doors ## If you want to use a script instead of the auto-created button
            name: Lock
            show_state: false
            icon: "mdi:car-door-lock"
          - type: button
            tap_action:
              action: toggle
            entity: button.<vehicle_name>_command_unlockdoor ## If you want to use the auto-created button
            #entity: script.car_unlock_doors ## If you want to use a script instead of the auto-created button
            name: Unlock
            show_state: false
            icon: "mdi:car-door"
        columns: 2
title: Bolt EV
```
