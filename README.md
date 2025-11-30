# OnStar2MQTT Home Assistant Add-on Repository

[![Home Assistant Add-on](https://img.shields.io/badge/home_assistant-add--on-blue.svg?logo=homeassistant&logoColor=white)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)
![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]

![No Support for armhf Architecture][armhf-shield]
![No Support for armv7 Architecture][armv7-shield]
![No Support for i386 Architecture][i386-shield]

[![CodeQL](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/github-code-scanning/codeql)
[![Lint](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/lint.yaml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/lint.yaml)
[![Builder](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/builder.yaml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/builder.yaml)

<!-- [![Notarize Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml)
[![Authenticate Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml) -->

Home Assistant Add-on of [BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt) which provides the ability to run up to four independent instances if you have up to four vehicles that you would like to connect to. Please note that only US and Canadian OnStar accounts are known to work with this integration.

[BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt) was originally based on [michaelwoods/onstar2mqtt](https://github.com/michaelwoods/onstar2mqtt) and this add-on was originally based on modifications to [dannysporea/onstar2mqtt-addon](https://github.com/dannysporea/onstar2mqtt-addon)'s HA add-on config and has since been significantly modified/updated from the originals while adding many new capabilities and features over time.

<!--Add-on documentation: <https://developers.home-assistant.io/docs/add-ons> -->

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)

## Requirements

- **Active OnStar Subscription:** You must have an active and valid OnStar plan to use this add-on. Different features require different plan tiers:
  - **Remote commands** (start, lock, unlock, etc.) require a plan that includes Remote Access capabilities
  - **Vehicle diagnostics** require a plan that includes Vehicle Diagnostics capabilities
  - You can verify your plan status in the official myChevrolet/myGMC/myCadillac/myBuick app or by running the `getOnstarPlan` command
- **Supported Region:** Only US and Canadian OnStar accounts are known to work with this integration
- **Valid Credentials:** You need your OnStar username, password, PIN, and TOTP key

## Add-ons

This repository contains the following add-ons

- [OnStar2MQTT for Vehicle 1 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle1)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle1%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle1/CHANGELOG.md)

- [OnStar2MQTT for Vehicle 2 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle2)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle2%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle2/CHANGELOG.md)

- [OnStar2MQTT for Vehicle 3 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle3)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle3%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle3/CHANGELOG.md)

- [OnStar2MQTT for Vehicle 4 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle4)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle4%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle4/CHANGELOG.md)

Which have these new commands which were not originally available in the OG build of onstar2mqtt, but have been added since v1.5.5:

- ~~`alertFlash`~~ (deprecated - use `flashLights` instead)
- ~~`alertHonk`~~ (deprecated - no longer available in OnStarJS)

As well as many new additional customizations such as log colorization which are also not available in the OG build. Please see detailed list of differences/enhancements below.

~~If you prefer to use the OG build of onstar2mqtt 😎~~ (Retired since this is no longer maintained by the author)

~~- [OnStar2MQTT for Vehicle 1 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle1)~~

~~- [OnStar2MQTT for Vehicle 2 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle2)~~

## What's New in v2.x

**Important Update:** This version includes OnStar API v3 changes that may affect some sensors.

- As this is a major change, some issues may occur. Please report any problems you encounter by opening an issue on GitHub.
- Most new sensors have been added. Any remaining sensors will be added in future updates. Current ETA is by the end of December 2025.

**New Features:**

- **OnStar API v3 Support** - Updated to OnStarJS 2.14.0+ with full API v3 compatibility
- **Enhanced Reliability** - Improved handling of OnStar API field naming variations
- **Unit Stability Fix** - Automatic caching of sensor units to handle API instability where units intermittently return as null, preventing Home Assistant unit conversion errors
- **New EV Commands** - Added refreshEVChargingMetrics for live charging data, setChargeLevelTarget, stopCharging, and comprehensive EV metrics

**What This Means for You:**

- Some sensors that worked with older OnStar API versions may no longer be available or may have different names
- Sensor entity IDs and names may change in Home Assistant
- You may need to update Home Assistant automations/dashboards that reference changed sensors
- Review your dashboards for any broken sensor references after upgrading

### Important: Manual Sensor Cleanup Required

After upgrading to v2.0.0, you will need to **manually remove deprecated sensors** from both your MQTT broker and Home Assistant:

#### Step 1: Delete Retained MQTT Topics from Broker

First, delete the related retained MQTT topics from your MQTT broker to prevent deprecated sensors from being recreated. **Both config and state topics must be removed:**

- **Using MQTT Explorer or similar tool:**

  - Connect to your MQTT broker
  - Navigate to `homeassistant/sensor/YOUR_VIN/` and `homeassistant/binary_sensor/YOUR_VIN/`
  - For each deprecated sensor, delete **both**:
    - Config topic: `homeassistant/sensor/YOUR_VIN/deprecated_sensor/config`
    - State topic: `homeassistant/sensor/YOUR_VIN/deprecated_sensor/state`

- **Using mosquitto_pub command:**

  ```bash
  # Delete config topic
  mosquitto_pub -h YOUR_MQTT_HOST -u YOUR_MQTT_USER -P YOUR_MQTT_PASS -t "homeassistant/sensor/YOUR_VIN/deprecated_sensor/config" -n -r

  # Delete state topic
  mosquitto_pub -h YOUR_MQTT_HOST -u YOUR_MQTT_USER -P YOUR_MQTT_PASS -t "homeassistant/sensor/YOUR_VIN/deprecated_sensor/state" -n -r
  ```

  (Replace `deprecated_sensor` with each deprecated sensor name, `-n` sends empty payload, `-r` sets retained flag)

#### Step 2: Remove Sensors from Home Assistant

1. **Navigate to Settings → Devices & Services → MQTT**
2. **Find your vehicle device** in the list
3. **Review all sensors** and look for any that show as "Unavailable" or "Unknown"
4. **Delete deprecated sensors** by clicking on each sensor and selecting "Delete"

#### Step 3: Restart Home Assistant

1. **Restart Home Assistant** to ensure all changes take effect

**Why This Cleanup is Necessary:**

- MQTT discovery creates new sensors but doesn't automatically remove old ones
- Deprecated sensors from API v2 may conflict with new API v3 sensors
- Old sensors will remain as "ghost" entities until manually removed
- Retained MQTT topics will cause deleted sensors to be recreated on restart unless also deleted from the broker

**Recommendation:** Test in a sandbox/test environment first if possible, or be prepared to update your Home Assistant configurations after upgrading.

## Running

Collect the following minimum information:

1. [Generate](https://www.uuidgenerator.net/version4) a v4 uuid for the device ID
1. OnStar login: username, password, PIN, [TOTP Key (Please click link for instructions)](https://github.com/BigThunderSR/OnStarJS?tab=readme-ov-file#new-requirement-as-of-2024-11-19)
1. Your vehicle's VIN which is easily found in the monthly OnStar diagnostic emails, in your OnStar account or in the official OnStar apps
1. MQTT server information: hostname, username, password

The default data refresh interval is 30 minutes and can be overridden with `ONSTAR_REFRESH` with values in milliseconds.

**Recall Checking:** Vehicle recall information is automatically checked on startup and every 7 days by default. This can be configured with `ONSTAR_RECALL_REFRESH` (in milliseconds). Recalls can also be checked manually via the "Get Vehicle Recall Info" button in Home Assistant.

**Vehicle Image:** Your vehicle's photo from the manufacturer is automatically downloaded, cached, and published to Home Assistant as an image entity on application startup. The image is base64-encoded for offline viewing and persists even if the manufacturer's URL changes.

**EV Charging Metrics:** For electric vehicles, detailed charging metrics are available on-demand via the "Get EV Charging Metrics" (cached data) or "Refresh EV Charging Metrics" (live data) buttons in Home Assistant. These create 10 specialized sensors including target charge level, battery capacity, trip consumption, charge mode, charge location status, and discharge settings. See Documentation page within the add-on for full sensor details.

> **NOTE**: Please review [this page](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/discussions/1134) if you do not know how to create directories in Home Assistant

### Home Assistant configuration templates

MQTT auto discovery is enabled. For further integrations and screenshots see Documentation page within the add-on.

## Feature Updates of Note

### Polling Status Topic via MQTT

**NEW!** - Provide MQTT topic (MQTT_ONSTAR_POLLING_STATUS_TOPIC) for Onstar Data Polling Status to monitor success/failure when OnStar is polled for data

- MQTT_ONSTAR_POLLING_STATUS_TOPIC/lastpollsuccessful - "true" or "false" depending on status of last poll
- MQTT_ONSTAR_POLLING_STATUS_TOPIC/state - Polling Status and Detailed Error Messages in JSON
- **NEW! - Automatic creation of pollingStatusTopic starting at v1.11.0**
  - No longer need to specify MQTT_ONSTAR_POLLING_STATUS_TOPIC as this is now created automatically
  - Format is "homeassistant/(VIN)/polling_status/"
  - If it is explicitly specified, will use the specified value, so does not break backwards compatibility

### Dynamic Polling Frequency via MQTT

**NEW** - Ability to dynamically change polling frequency using MQTT

- Uses the value from "ONSTAR_REFRESH" on initial startup
- Change the value dynamically by publishing the new refresh value in milliseconds (ms) as an INT to: "homeassistant/(VIN)/refresh_interval"
- Added new retained topic of "homeassistant/(VIN)/refresh_interval_current_val" to monitor current refresh value set via MQTT

### Command Response Status via MQTT

**NEW** - Command Response Status is now published to MQTT topics!

- Topic format: MQTT_PREFIX/{VIN}/command/{commandName}/state
  - Note: Unless defined, default MQTT_PREFIX=homeassistant

### Sensor-Specific Messages as Attributes

**NEW** - Sensor specific messages are now published to MQTT as sensor attributes which are visible in HA

### Long-Term Statistics Support

**NEW** - Most non-binary sensors have a state_class assigned to allow collection of long-term statistics in HA

### Manual Diagnostic Refresh Command

**NEW** - Manual diagnostic refresh command ~~and manual engine RPM refresh command~~ is working

### Password Masking in Logs

**NEW** - OnStar password/pin and MQTT password are masked by default in the console log output. To see these values in the console log output, set "LOG_LEVEL" to "debug"

### MQTTS/TLS Security Options

**NEW** - New env options for securing connectivity for MQTTS using TLS

- MQTT_REJECT_UNAUTHORIZED (Default: "true", set to "false" only for testing.)
- MQTT_CA_FILE
- MQTT_CERT_FILE
- MQTT_KEY_FILE

### Device Tracker Auto-Discovery

**NEW** - Auto discovery for device_tracker has been enabled starting at v1.12.0

- The device_tracker auto discovery config is published to: "homeassistant/(VIN)/device_tracker/config" and the GPS coordinates are read from the original topic automatically at: "homeassistant/device_tracker/(VIN)/getlocation/state"
- Also added GPS based speed and direction to the device_tracker attributes

### Commands with Options via MQTT

**NEW** - Ability to send commands with options using MQTT now works

- Send commands to the command topic in the format:
  - `{"command": "diagnostics"}` (API v3 returns all diagnostic data - no filtering options available)
  - ~~`{"command": "setChargingProfile","options": {"chargeMode": "RATE_BASED","rateType": "OFFPEAK"}}`~~ (deprecated - use `setChargeLevelTarget` instead)
  - `{"command": "setChargeLevelTarget","options": 80}` (set target charge level to 80%)
  - `{"command": "stopCharging"}` (stop active charging session)
  - ~~`{"command": "alert","options": {"action": "Flash"}}`~~ (deprecated - use `flashLights` instead)
  - `{"command": "flashLights"}`
  - `{"command": "stopLights"}`
  - `{"command": "refreshEVChargingMetrics"}` (get live charging data)

### MQTT Button Auto-Discovery

**NEW** - MQTT Button Auto-Discovery for HA Added Starting at v1.14.0

- **⚠️ IMPORTANT DISCLAIMER:** Buttons are added **disabled by default** because it's easy to accidentally press the wrong button and trigger an action at an inopportune time. **Enable at your own risk and you assume all responsibility for your actions.**
- All available buttons for all vehicles are included for now, so only enable the buttons you need and/or work for your vehicle.
- **How to Enable Buttons in Home Assistant:**
  1. Go to `Settings` → `Devices & Services` → `MQTT`
  2. Find your vehicle device and click on it
  3. Scroll to the **Controls** section where buttons are listed (they will show as "Disabled")
  4. Click on each button you want to enable
  5. Click the settings/gear icon (⚙️) and toggle "Enabled" to ON
  6. Click "Update"
- See Documentation page within the add-on for detailed instructions and available button list

### Command Status Sensors Auto-Discovery

**NEW** - MQTT Auto-Discovery for Command Status Sensors for HA Added Starting at v1.15.0

- Command Status and Timestamp from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.

### Polling Status Sensors Auto-Discovery

**NEW** - MQTT Auto-Discovery for Polling Status Sensors for HA Added Starting at v1.16.0

- Polling Status, Timestamp, Error Code (if applicable), Success T/F Sensor from last polling cycle and Polling Refresh Interval Time Sensor are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all command status sensors for the same vehicle.

### Sensor Status Message Sensors Auto-Discovery

**NEW** - MQTT Auto-Discovery for Sensor Status Message Sensors for HA Added Starting at v1.17.0

- At this point, pretty much every available sensor, button and status is published to MQTT auto-discovery topics
- Set `MQTT_LIST_ALL_SENSORS_TOGETHER="true"` to group all the sensors under one MQTT device starting at v1.17.0. Default is `"false"`.

### Advanced Diagnostics Sensors (API v3)

**NEW** - Advanced Diagnostics Sensors from OnStar API v3 Added

- 7 diagnostic system sensors with full subsystem details: Engine & Transmission (11 subsystems), Antilock Braking (3), StabiliTrak (1), Air Bag (4), Emissions (2), OnStar (3), Electric Lamp (1)
- Each sensor includes system status, color-coded status indicators, diagnostic trouble codes (DTCs), and detailed descriptions
- Individual subsystem attributes for granular monitoring (e.g., displacement_on_demand_subsystem, fuel_management_subsystem)
- Quick issue detection with subsystems_with_issues array
- Published to topic: "homeassistant/{VIN}/adv_diag/state"

## Helpful Usage Notes

- The OnStar API has rate limiting, so they will block excessive requests over a short period of time.
  - Reducing the polling timeout to less than the default set by the add-on (30 minutes/1800000 ms) is likely to get you rate limited (Error 429).
- The OnStar API can be very temperamental, so you may see numerous errors every now and then where you cannot get any data from your vehicle. These tend to be very sporadic and usually go away on their own.
  - A common example of this is: "Request Failed with status 504 - Gateway Timeout"
- After your engine is turned off, the vehicle will respond to about 4 - 5 requests before going into a type of hibernation mode and will not respond to requests or commands until the engine is started up again. If your engine has been off for a while, you may still not be able to get any data from the vehicle or run commands even if it is your first attempt at trying to pull data from your vehicle after the engine was turned off.
  - **Note:** You will see an error of `"Unable to establish packet session to the vehicle"` when this occurs.

## My other related project which provides additional capabilities through Node-RED

- [https://github.com/BigThunderSR/node-red-contrib-onstar2](https://github.com/BigThunderSR/node-red-contrib-onstar2)

## Having Issues?

- Please see the following for solutions and responses to common problems and questions:
  - <https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/discussions>
  - <https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/issues>

<!--## Example Lovelace Dashboard Using Example Code in Documentation Tab

![lovelace screenshot](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/raw/main/images/lovelace.png)

<!-- _Example add-on to use as a blueprint for new add-ons._ -->

<!--

Notes to developers after forking or using the github template feature:
- While developing comment out the 'image' key from 'example/config.yaml' to make the supervisor build the addon
  - Remember to put this back when pushing up your changes.
- When you merge to the 'main' branch of your repository a new build will be triggered.
  - Make sure you adjust the 'version' key in 'example/config.yaml' when you do that.
  - Make sure you update 'example/CHANGELOG.md' when you do that.
  - The first time this runs you might need to adjust the image configuration on github container registry to make it public
- Adjust the 'image' key in 'example/config.yaml' so it points to your username instead of 'home-assistant'.
  - This is where the build images will be published to.
- Rename the example directory.
  - The 'slug' key in 'example/config.yaml' should match the directory name.
- Adjust all keys/url's that points to 'home-assistant' to now point to your user/fork.
- Share your repository on the forums https://community.home-assistant.io/c/projects/9
- Do awesome stuff!
 -->

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-no-red.svg
[armv7-shield]: https://img.shields.io/badge/armv7-no-red.svg
[i386-shield]: https://img.shields.io/badge/i386-no-red.svg
