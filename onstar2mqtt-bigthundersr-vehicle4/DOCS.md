# Instructions and Usage Notes for MQTT Home Assistant Integration

## Sensor and Button Location in HA

When everything is setup correctly, all available sensors and buttons are created automatically (_please review this entire document for specific caveats_) and can be seen in HA under:

- `Settings --> Devices & services --> MQTT`
  - They will be grouped under a MQTT device with the name of your vehicle

## Advanced Diagnostics Sensors (OnStar API v3)

### MQTT Auto-Discovery for Advanced Diagnostics Sensors Added

Starting with the API v3 implementation, the application now provides detailed diagnostic system monitoring through 7 comprehensive diagnostic system sensors. Each sensor provides system-level status, diagnostic trouble codes (DTCs), and detailed subsystem information.

### Diagnostic Systems Available

1. **Engine & Transmission** (11 subsystems)

   - Sensor: `sensor.<vehicle_name>_adv_diag_engine_transmission`
   - Icon: `mdi:engine`
   - Subsystems: displacement_on_demand, fuel_management, transmission, ignition, emissions, cooling, fuel_injection, fuel_system_air_induction, starting_charging, engine_controls_feedback, exhaust_system

2. **Antilock Braking System** (3 subsystems)

   - Sensor: `sensor.<vehicle_name>_adv_diag_antilock_braking_system`
   - Icon: `mdi:car-brake-abs`
   - Subsystems: abs, traction_control_system, electronic_brake_control_module

3. **StabiliTrak** (1 subsystem)

   - Sensor: `sensor.<vehicle_name>_adv_diag_stabilitrak`
   - Icon: `mdi:car-esp`
   - Subsystems: electronic_stability_control

4. **Air Bag** (4 subsystems)

   - Sensor: `sensor.<vehicle_name>_adv_diag_air_bag`
   - Icon: `mdi:airbag`
   - Subsystems: occupant_restraints, sensing_diagnostic_module, side_air_bag, front_air_bag

5. **Emissions System** (2 subsystems)

   - Sensor: `sensor.<vehicle_name>_adv_diag_emissions_system`
   - Icon: `mdi:weather-fog`
   - Subsystems: exhaust_gas_recirculation, evaporative_emissions

6. **OnStar System** (3 subsystems)

   - Sensor: `sensor.<vehicle_name>_adv_diag_onstar_system`
   - Icon: `mdi:car-connected`
   - Subsystems: onstar, network_communication, body_control_module

7. **Electric Lamp System** (1 subsystem)
   - Sensor: `sensor.<vehicle_name>_adv_diag_electric_lamp_system`
   - Icon: `mdi:lightbulb-auto`
   - Subsystems: lighting

### Sensor Attributes

Each advanced diagnostics sensor includes the following attributes:

- **status_color**: Color-coded status indicator (GREEN, YELLOW, RED)
- **last_updated**: Timestamp of the last diagnostic update
- **dtc_count**: Number of diagnostic trouble codes detected
- **description**: Detailed description of the diagnostic system
- **Individual Subsystem Attributes**: Each subsystem appears as a separate attribute (e.g., `displacement_on_demand_subsystem`, `fuel_management_subsystem`, etc.) containing:
  - `name`: Internal subsystem identifier
  - `label`: Human-readable subsystem name
  - `description`: Detailed subsystem description
  - `status`: Current status (OK, CHECK, etc.)
  - `status_color`: Color-coded status (GREEN, YELLOW, RED)
  - `dtc_count`: Number of DTCs for this subsystem
- **subsystems_with_issues**: Array of subsystems that have detected problems (for quick issue identification)
- **dtcs**: Array of diagnostic trouble codes with details (code, description, severity)

### MQTT Topic

All advanced diagnostics sensors publish their state to: `homeassistant/{VIN}/adv_diag/state`

### Accessing Subsystem Data in Templates

You can access specific subsystem information in Home Assistant templates:

```yaml
# Check if a specific subsystem has issues
{{ state_attr('sensor.my_car_adv_diag_engine_transmission', 'fuel_management_subsystem').status }}

# Get the status color of a subsystem
{{ state_attr('sensor.my_car_adv_diag_engine_transmission', 'fuel_management_subsystem').status_color }}

# Check if any subsystems have issues
{{ state_attr('sensor.my_car_adv_diag_engine_transmission', 'subsystems_with_issues') | length > 0 }}

# Get total DTC count
{{ state_attr('sensor.my_car_adv_diag_engine_transmission', 'dtc_count') }}
```

### Example Lovelace Cards for Advanced Diagnostics

#### Entity Card Showing All Diagnostic Systems

```yaml
type: entities
title: Vehicle Diagnostic Systems
entities:
  - entity: sensor.<vehicle_name>_adv_diag_engine_transmission
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_antilock_braking_system
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_stabilitrak
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_air_bag
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_emissions_system
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_onstar_system
    secondary_info: last-changed
  - entity: sensor.<vehicle_name>_adv_diag_electric_lamp_system
    secondary_info: last-changed
state_color: true
```

#### Conditional Card - Show Only Systems with Issues

```yaml
type: conditional
conditions:
  - condition: template
    value_template: >-
      {{ state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', 'subsystems_with_issues') | length > 0 }}
card:
  type: markdown
  content: >-
    ## ⚠️ Engine & Transmission Issues Detected

    **Systems with Problems:**
    {% for subsystem in state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', 'subsystems_with_issues') %}
    - {{ subsystem.label }}: {{ subsystem.status }}
    {% endfor %}

    **DTC Count:** {{ state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', 'dtc_count') }}
```

#### Glance Card - Quick Status Overview

```yaml
type: glance
title: Diagnostic Systems Status
entities:
  - entity: sensor.<vehicle_name>_adv_diag_engine_transmission
    name: Engine
  - entity: sensor.<vehicle_name>_adv_diag_antilock_braking_system
    name: ABS
  - entity: sensor.<vehicle_name>_adv_diag_stabilitrak
    name: StabiliTrak
  - entity: sensor.<vehicle_name>_adv_diag_air_bag
    name: Air Bag
  - entity: sensor.<vehicle_name>_adv_diag_emissions_system
    name: Emissions
  - entity: sensor.<vehicle_name>_adv_diag_onstar_system
    name: OnStar
  - entity: sensor.<vehicle_name>_adv_diag_electric_lamp_system
    name: Lights
columns: 4
state_color: true
```

#### Detailed System Card with Subsystem Breakdown

```yaml
type: markdown
title: Engine & Transmission Diagnostics
content: >-
  **Status:** {{ states('sensor.<vehicle_name>_adv_diag_engine_transmission') }}

  **Last Updated:** {{ state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', 'last_updated') | timestamp_custom('%b %d, %Y %I:%M %p') }}

  **Total DTCs:** {{ state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', 'dtc_count') }}

  ---

  ### Subsystems:
  {% set subsystems = ['displacement_on_demand_subsystem', 'fuel_management_subsystem', 'transmission_subsystem', 'ignition_subsystem', 'emissions_subsystem', 'cooling_subsystem', 'fuel_injection_subsystem', 'fuel_system_air_induction_subsystem', 'starting_charging_subsystem', 'engine_controls_feedback_subsystem', 'exhaust_system_subsystem'] %}
  {% for subsystem_key in subsystems %}
  {% set subsystem = state_attr('sensor.<vehicle_name>_adv_diag_engine_transmission', subsystem_key) %}
  - **{{ subsystem.label }}**: {{ subsystem.status }} {% if subsystem.status_color == 'GREEN' %}✅{% elif subsystem.status_color == 'YELLOW' %}⚠️{% else %}❌{% endif %}
  {% endfor %}
```

### Automation Example - Alert on Diagnostic Issues

```yaml
alias: Alert on Vehicle Diagnostic Issues
description: Send notification when any diagnostic system detects problems
trigger:
  - platform: state
    entity_id:
      - sensor.<vehicle_name>_adv_diag_engine_transmission
      - sensor.<vehicle_name>_adv_diag_antilock_braking_system
      - sensor.<vehicle_name>_adv_diag_stabilitrak
      - sensor.<vehicle_name>_adv_diag_air_bag
      - sensor.<vehicle_name>_adv_diag_emissions_system
      - sensor.<vehicle_name>_adv_diag_onstar_system
      - sensor.<vehicle_name>_adv_diag_electric_lamp_system
    to: "CHECK"
condition: []
action:
  - service: notify.mobile_app
    data:
      title: "Vehicle Diagnostic Alert"
      message: >-
        {{ trigger.to_state.attributes.description }} requires attention.
        DTCs detected: {{ trigger.to_state.attributes.dtc_count }}
mode: queued
max: 10
```

## Vehicle Recall Sensor

The application automatically creates a **recall sensor** that displays vehicle recall information from the manufacturer.

- **Entity**: `sensor.<vehicle_name>_vehicle_recalls`
- **Icon**: `mdi:alert-octagon`
- **State**: Total number of recalls
- **Update Frequency**: Checked on startup and every 7 days (configurable via `ONSTAR_RECALL_REFRESH`)
- **Manual Check**: Use the "Get Vehicle Recall Info" button

### Attributes

The sensor includes detailed recall information as attributes:

- `recall_count`: Total number of recalls
- `active_recalls_count`: Number of active recalls
- `incomplete_repairs_count`: Number of incomplete repairs
- `has_active_recalls`: Boolean indicating if active recalls exist
- `last_updated`: Timestamp of last check
- `recalls`: Array of recall objects with details (ID, title, description, status, etc.)

### Example Lovelace Card

```yaml
type: entities
title: Vehicle Recalls
entities:
  - entity: sensor.matts_blazer_vehicle_recalls
    type: attribute
    attribute: recalls
    name: Recall Details
```

## Vehicle Image Entity

The application automatically creates an **image entity** displaying your vehicle's photo from the manufacturer.

- **Entity**: `image.<vehicle_name>_vehicle_image`
- **Icon**: `mdi:car`
- **Data**: Base64-encoded image (cached locally, works offline)
- **Update**: Downloads once on startup, fallback to URL if download fails

### Example Lovelace Cards Using Vehicle Image

```yaml
# Simple picture card
type: picture
image_entity: image.matts_blazer_vehicle_image
```

```yaml
# Vehicle dashboard with image
type: vertical-stack
cards:
  - type: picture
    image_entity: image.matts_blazer_vehicle_image
  - type: entities
    entities:
      - sensor.matts_blazer_odometer
      - sensor.matts_blazer_fuel_level
      - sensor.matts_blazer_vehicle_recalls
```

**Note**: Images are ~50-200KB when base64-encoded. Ensure your MQTT broker supports larger message sizes if you encounter issues.

## EV Charging Metrics Sensors (EV Vehicles Only)

For **electric vehicles**, pressing the **Get EV Charging Metrics** or **Refresh EV Charging Metrics** button creates 10 specialized sensors with detailed charging and battery information:

**Button Differences:**

- **Get EV Charging Metrics** - Returns cached charging data (faster)
- **Refresh EV Charging Metrics** - Forces vehicle to generate fresh telemetry before returning (more current, slightly slower)

### Sensors Created

1. **EV Target Charge Level** (`sensor.<vehicle_name>_ev_target_charge_level`)

   - **Unit**: `%` (percentage)
   - **Icon**: `mdi:battery-charging-80`
   - **Description**: User's configured charge limit setting (e.g., 80%)
   - **Device Class**: Battery

2. **EV Battery Capacity** (`sensor.<vehicle_name>_ev_battery_capacity`)

   - **Unit**: `kWh` (kilowatt-hours)
   - **Icon**: `mdi:battery-high`
   - **Description**: Actual usable battery capacity
   - **Device Class**: Energy Storage

3. **EV Trip Odometer** (`sensor.<vehicle_name>_ev_trip_odometer`)

   - **Unit**: `km` (kilometers)
   - **Icon**: `mdi:map-marker-distance`
   - **Description**: Current trip distance
   - **Device Class**: Distance
   - **State Class**: Total Increasing

4. **EV Trip Consumption** (`sensor.<vehicle_name>_ev_trip_consumption`)

   - **Unit**: `kWh/100km`
   - **Icon**: `mdi:speedometer`
   - **Description**: Energy efficiency for current trip
   - **State Class**: Measurement

5. **EV Lifetime Consumption** (`sensor.<vehicle_name>_ev_lifetime_consumption`)

   - **Unit**: `kWh/100km`
   - **Icon**: `mdi:chart-line`
   - **Description**: Average lifetime energy efficiency
   - **State Class**: Measurement

6. **EV Charge Mode** (`sensor.<vehicle_name>_ev_charge_mode`)

   - **Icon**: `mdi:ev-station`
   - **Description**: Current charging mode (e.g., "immediate")
   - **Values**: `immediate`, `departure`, etc.

7. **EV Charge Location Set** (`binary_sensor.<vehicle_name>_ev_charge_location_set`)

   - **Icon**: `mdi:map-marker-check`
   - **Description**: Whether home charging location is configured
   - **Values**: `on` (set), `off` (not set)

8. **EV At Charge Location** (`binary_sensor.<vehicle_name>_ev_at_charge_location`)

   - **Icon**: `mdi:map-marker`
   - **Description**: Whether vehicle is currently at the configured charging location
   - **Values**: `on` (at location), `off` (away)

9. **EV Discharge Enabled** (`binary_sensor.<vehicle_name>_ev_discharge_enabled`)

   - **Icon**: `mdi:transmission-tower-export`
   - **Description**: Whether vehicle-to-grid discharge is enabled
   - **Values**: `on` (enabled), `off` (disabled)

10. **EV Discharge Minimum SoC** (`sensor.<vehicle_name>_ev_discharge_min_soc`)
    - **Unit**: `%` (percentage)
    - **Icon**: `mdi:battery-low`
    - **Description**: Minimum battery percentage for discharge operations
    - **Device Class**: Battery

### Update Frequency

- **On-Demand**: These sensors are created/updated when you press either the **Get EV Charging Metrics** or **Refresh EV Charging Metrics** button
- **Complementary**: These provide additional metrics not available in the automatic diagnostics (which refresh every 30 minutes)
- **Persistent**: Sensor values remain until the next button press

### Example Lovelace Cards

```yaml
# EV Charging Status Card
type: entities
title: EV Charging Info
entities:
  - sensor.my_blazer_ev_target_charge_level
  - sensor.my_blazer_ev_battery_capacity
  - sensor.my_blazer_ev_charge_mode
  - binary_sensor.my_blazer_ev_at_charge_location
  - binary_sensor.my_blazer_ev_charge_location_set
```

```yaml
# EV Efficiency Dashboard
type: vertical-stack
cards:
  - type: gauge
    entity: sensor.my_blazer_ev_target_charge_level
    name: Target Charge Level
    min: 0
    max: 100
  - type: entities
    title: Energy Consumption
    entities:
      - sensor.my_blazer_ev_trip_consumption
      - sensor.my_blazer_ev_lifetime_consumption
      - sensor.my_blazer_ev_trip_odometer
```

```yaml
# Vehicle-to-Grid Card
type: entities
title: V2G Discharge Settings
entities:
  - binary_sensor.my_blazer_ev_discharge_enabled
  - sensor.my_blazer_ev_discharge_min_soc
```

**Note**: These sensors are only available for electric vehicles. The Get EV Charging Metrics and Refresh EV Charging Metrics buttons will not create sensors for ICE (Internal Combustion Engine) vehicles.

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

### How to Enable Auto-Discovered Buttons

**MQTT button auto discovery is enabled starting at v1.14.0 which sends/triggers the defaults of each command.**

**⚠️ IMPORTANT DISCLAIMER:**

Buttons are added **disabled by default** because it's easy to accidentally press the wrong button and trigger an action at an inopportune time. **Enable at your own risk and you assume all responsibility for your actions.** Only enable the buttons you need and/or that work for your specific vehicle.

**Steps to Enable Buttons:**

1. Navigate to **Settings → Devices & Services → MQTT** in Home Assistant
2. Find and click on your **vehicle device** in the list
3. Scroll down to the **Controls** section where you'll see all the auto-discovered buttons (they will show as "Disabled")
4. Click on any **button entity** you want to enable
5. Click the **gear icon** (⚙️) in the top right corner to open entity settings
6. Toggle the **"Enabled"** switch to ON
7. Click **"Update"** to save
8. Repeat for each button you want to enable

**Note:** All available buttons for all vehicle types are included, so only enable the buttons that are compatible with your specific vehicle model.

### Example Script YAML for Running Commands

#### How to Enable Auto-Discovered Buttons in Home Assistant

Since the buttons are created but disabled by default, follow these steps to enable the ones you want to use:

1. **Navigate to MQTT Integration:**

   - Go to `Settings` → `Devices & Services` → `MQTT`

2. **Find Your Vehicle Device:**

   - Look for your vehicle device in the MQTT device list (it will be named with your vehicle name)
   - Click on the device to view all entities

3. **Enable Desired Buttons:**

   - Scroll through the list of entities to find the buttons (they will have a button icon)
   - Click on each button entity you want to enable
   - Click the settings/gear icon in the entity details
   - Toggle the "Enabled" switch to ON
   - Click "Update"

4. **Add Enabled Buttons to Dashboard:**
   - Once enabled, you can add the buttons to your Lovelace dashboard
   - Use button cards or entity cards to display and use them

**Available Buttons Include:**

- Start Vehicle
- Cancel Start Vehicle
- Lock Door
- Unlock Door
- Lock Trunk / Unlock Trunk (if supported by vehicle)
- Alert / Cancel Alert
- Flash Lights / Stop Lights (new in OnStarJS 2.12.0)
- ~~Charge Override / Cancel Charge Override~~ (deprecated - use Set Charge Level Target / Stop Charging instead)
- Set Charge Level Target (new in OnStarJS 2.12.0 - for EVs)
- Stop Charging (new in OnStarJS 2.12.0 - for EVs)
- ~~Get Charging Profile~~ (deprecated - use Get EV Charging Metrics instead)
- ~~Set Charging Profile~~ (deprecated - use Set Charge Level Target instead)
- Get Location
- Get Diagnostics
- **Get Vehicle Details** (new in OnStarJS 2.12.0)
- **Get OnStar Plan** (new in OnStarJS 2.12.0)
- **Get EV Charging Metrics** (new in OnStarJS 2.12.0)
- **Refresh EV Charging Metrics** (new in OnStarJS 2.14.0 - live data)
- **Get Vehicle Recall Info** (new in OnStarJS 2.12.0)

**⚠️ Warning:** Only enable buttons you need and understand. Accidentally pressing the wrong button could trigger unwanted actions on your vehicle.

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

```yaml
alias: Car - Start Vehicle with Cabin Temperature
sequence:
  - service: mqtt.publish
    data:
      topic: homeassistant/YOUR_CAR_VIN/command
      payload: '{"command": "startVehicle","options": {"cabinTemperature": 21}}'
mode: single
icon: "mdi:car-electric"
```

#### Format for sending command options in the payload

- Start Vehicle with Cabin Temperature (for EVs with preconditioning)
  - `{"command": "startVehicle","options": {"cabinTemperature": 21}}` (temperature in Celsius)
  - Note: Temperature is rounded to whole number; feature requires vehicle support
- ~~Set Charging Profile~~ (deprecated)
  - ~~`{"command": "setChargingProfile","options": {"chargeMode": "RATE_BASED","rateType": "OFFPEAK"}}`~~
- Set Charge Level Target (set target charge percentage)
  - `{"command": "setChargeLevelTarget","options": 80}` (sets target to 80%)
  - Alternative formats also supported:
    - `{"command": "setChargeLevelTarget","options": {"targetChargeLevel": 80}}`
    - `{"command": "setChargeLevelTarget","options": {"tcl": 80}}`
- Stop Charging (stop active charging session)
  - `{"command": "stopCharging"}`
- Get EV Charging Metrics (get cached charging data)
  - `{"command": "getEVChargingMetrics"}`
- Refresh EV Charging Metrics (force fresh charging telemetry from vehicle)
  - `{"command": "refreshEVChargingMetrics"}`
- Get Diagnostics (retrieve all diagnostic data - API v3 returns comprehensive data automatically)
  - `{"command": "diagnostics"}`
- Alert (flash or honk)
  - `{"command": "alert","options": {"action": "Flash"}}` (deprecated - use `flashLights` instead)
  - `{"command": "alert","options": {"action": "Honk"}}` (deprecated - use vehicle honk if available)
- Flash Lights / Stop Lights
  - `{"command": "flashLights"}`
  - `{"command": "stopLights"}`

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

### Set EV Charge Level Target

This example shows how to set the target charge level to 80% for your electric vehicle:

```yaml
alias: Set EV Charge to 80%
description: Set target charge level to 80%
trigger:
  - platform: time
    at: "22:00:00"
action:
  - service: mqtt.publish
    data:
      topic: homeassistant/YOUR_CAR_VIN/command
      payload: '{"command": "setChargeLevelTarget","options": 80}'
mode: single
icon: "mdi:battery-charging-80"
```

You can also create an input number slider to dynamically set the charge level:

```yaml
# In configuration.yaml
input_number:
  ev_charge_target:
    name: EV Charge Target
    min: 50
    max: 100
    step: 5
    unit_of_measurement: "%"
    icon: mdi:battery-charging

# Automation to set charge level from slider
alias: Set EV Charge Level from Slider
description: Set EV charge target based on input slider
trigger:
  - platform: state
    entity_id: input_number.ev_charge_target
action:
  - service: mqtt.publish
    data:
      topic: homeassistant/YOUR_CAR_VIN/command
      payload: >
        {"command": "setChargeLevelTarget","options": {{ states('input_number.ev_charge_target') | int }}}
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
2. `startVehicle` (supports optional `cabinTemperature` in Celsius for EVs with preconditioning)
3. `cancelStartVehicle`
4. `alert`
5. `cancelAlert`
6. `lockDoor`
7. `unlockDoor`
8. `lockTrunk` (only available on some vehicles)
9. `unlockTrunk` (only available on some vehicles)
10. ~~`getChargingProfile`~~ (deprecated - use `getEVChargingMetrics` instead)
11. ~~`setChargingProfile`~~ (deprecated - use `setChargeLevelTarget` instead)
12. ~~`chargeOverride`~~ (deprecated - use `setChargeLevelTarget` or `stopCharging` instead)
13. ~~`cancelChargeOverride`~~ (deprecated - use `setChargeLevelTarget` or `stopCharging` instead)
14. `getLocation`
15. `alertFlash` (convenience wrapper for `alert` with Flash action - use `flashLights` for API v3)
16. `alertHonk` (convenience wrapper for `alert` with Honk action)
17. `flashLights` (uses OnStar API v3 - flash vehicle lights, recommended over alertFlash)
18. `stopLights` (uses OnStar API v3 - stop flashing vehicle lights)
19. `diagnostics` (uses OnStar API v3 - retrieves comprehensive diagnostic data for all vehicle systems. Can be requested on-demand but diagnostic data is not real-time and reflects the last cached state from the API. Runs automatically during polling. See "Advanced Diagnostics Sensors" section above for details on the 7 diagnostic system sensors automatically created)
20. `setChargeLevelTarget` (EV only - set target charge level percentage and options)
21. `stopCharging` (EV only - stop active charging session)
22. `getVehicleDetails` (get comprehensive vehicle information including specifications)
23. `getOnstarPlan` (get OnStar service plan details and status)
24. `getEVChargingMetrics` (EV only - get cached charging metrics including battery SOC, range, consumption)
25. `refreshEVChargingMetrics` (EV only - force vehicle to generate fresh charging telemetry and return live data)
26. `getVehicleRecallInfo` (get active vehicle recall information)

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

## Troubleshooting

### Template Variable Warnings in Home Assistant

If you see warnings in your Home Assistant logs like:

```text
Template variable warning: 'dict object' has no attribute 'lifetime_fuel_economy' when rendering '{{ value_json.lifetime_fuel_economy }}'
```

or errors like:

```text
TypeError: Object of type LoggingUndefined is not JSON serializable rendering template for entity...
```

This is caused by the OnStar API v3 returning **partial data** on some refresh cycles - not all sensor fields are included in every API response.

#### Solution: Enable State Caching

Add the following environment variable to your configuration:

```shell
ONSTAR_STATE_CACHE=true
```

This enables a state cache that:

- Merges new API responses with previously cached data
- Preserves sensor values from previous updates when the API doesn't include them
- Persists the cache to disk so it survives restarts

**Note:** When first enabling the state cache (or after clearing cache files), you may still see these warnings for a few refresh cycles until the cache builds up with complete data from the API.
