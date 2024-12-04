# OnStar2MQTT Home Assistant Add-on Repository

[![Home Assistant Add-on](https://img.shields.io/badge/home_assistant-add--on-blue.svg?logo=homeassistant&logoColor=white)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)
![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]
[![CodeQL](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/github-code-scanning/codeql)
[![Lint](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/lint.yaml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/lint.yaml)
[![Builder](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/builder.yaml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/builder.yaml)
<!-- [![Notarize Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml)
[![Authenticate Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml) -->

Home Assistant Add-on of [BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt) which provides the ability to run up to four independent instances if you have up to four vehicles that you would like to connect to.

[BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt) was originally based on [michaelwoods/onstar2mqtt](https://github.com/michaelwoods/onstar2mqtt) and this add-on was originally based on modifications to [dannysporea/onstar2mqtt-addon](https://github.com/dannysporea/onstar2mqtt-addon)'s HA add-on config and has since been significantly modified/updated from the originals while adding many new capabilities and features over time.
<!--Add-on documentation: <https://developers.home-assistant.io/docs/add-ons> -->

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)

## Add-ons

This repository contains the following add-ons

- [OnStar2MQTT for Vehicle 1 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle1)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle1%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - ***NOTE:** Breaking Change for Upgrading to Version 1.3.27 and beyond. Please see [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle1/CHANGELOG.md).*

- [OnStar2MQTT for Vehicle 2 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle2)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle2%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - ***NOTE:** Breaking Change for Upgrading to Version 1.3.27 and beyond. Please see [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle2/CHANGELOG.md).*

- [OnStar2MQTT for Vehicle 3 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle3)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle3%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - ***NOTE:** Breaking Change for Upgrading to Version 1.3.27 and beyond. Please see [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle1/CHANGELOG.md).*

- [OnStar2MQTT for Vehicle 4 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle4)
  ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FBigThunderSR%2Fhomeassistant-addons-onstar2mqtt%2Frefs%2Fheads%2Fmain%2Fonstar2mqtt-bigthundersr-vehicle4%2Fconfig.yaml&query=%24.version&style=flat&label=Ver)

  - ***NOTE:** Breaking Change for Upgrading to Version 1.3.27 and beyond. Please see [CHANGELOG](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/blob/main/onstar2mqtt-bigthundersr-vehicle2/CHANGELOG.md).*

  Which have these new commands which were not originally available in the OG build of onstar2mqtt, but have been added since v1.5.5:
  - `alertFlash`
  - `alertHonk`

  As well as many new additional customizations such as log colorization which are also not available in the OG build. Please see detailed list of differences/enhancements below.

~~If you prefer to use the OG build of onstar2mqtt 😎~~ (Retired since this is no longer maintained by the author)

~~- [OnStar2MQTT for Vehicle 1 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle1)~~

~~- [OnStar2MQTT for Vehicle 2 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle2)~~

## Running

Collect the following information:

1. [Generate](https://www.uuidgenerator.net/version4) a v4 uuid for the device ID
1. OnStar login: username, password, PIN, [TOTP Key (Please click link for instructions)](https://github.com/BigThunderSR/OnStarJS?tab=readme-ov-file#new-requirement-as-of-2024-11-19)
1. Your car's VIN. Easily found in the monthly OnStar diagnostic emails.
1. MQTT server information: hostname, username, password

- **NEW! - Provide MQTT topic (MQTT_ONSTAR_POLLING_STATUS_TOPIC) for Onstar Data Polling Status to monitor success/failure when OnStar is polled for data**
  - MQTT_ONSTAR_POLLING_STATUS_TOPIC/lastpollsuccessful - "true" or "false" depending on status of last poll
  - MQTT_ONSTAR_POLLING_STATUS_TOPIC/state - Polling Status and Detailed Error Messages in JSON
  - **NEW! - Automatic creation of pollingStatusTopic starting at v1.11.0**
    - No longer need to specify MQTT_ONSTAR_POLLING_STATUS_TOPIC as this is now created automatically
    - Format is "homeassistant/(VIN)/polling_status/"
    - If it is explicitly specified, will use the specified value, so does not break backwards compatibility

- **NEW - Ability to dynamically change polling frequency using MQTT**
  - Uses the value from "ONSTAR_REFRESH" on initial startup
  - Change the value dynamically by publishing the new refresh value in milliseconds (ms) as an INT to: "homeassistant/(VIN)/refresh_interval"

- **NEW - Command Response Status is now published to MQTT topics!**
  - Topic format: MQTT_PREFIX/{VIN}/command/{commandName}/state
    - Note: Unless defined, default MQTT_PREFIX=homeassistant

- **NEW - Sensor specific messages are now published to MQTT as sensor attributes which are visible in HA**

- **NEW - Most non-binary sensors have a state_class assigned to allow collection of long-term statistics in HA**

- **NEW - Manual diagnostic refresh command and manual engine RPM refresh command are working**

- **NEW - OnStar password/pin and MQTT password are masked by default in the console log output. To see these values in the console log output, set "LOG_LEVEL" to "debug"**

- **NEW - New options for securing connectivity for MQTTS using TLS**
  - MQTT_REJECT_UNAUTHORIZED (Default: "true", set to "false" only for testing.)
  - MQTT_CA_FILE
  - MQTT_CERT_FILE
  - MQTT_KEY_FILE

- **NEW - Ability to send commands with options using MQTT now works**
  - Send commands to the command topic in the format:
    - {"command": "diagnostics","options": "OIL LIFE,VEHICLE RANGE"}
    - {"command": "setChargingProfile","options": {"chargeMode": "RATE_BASED","rateType": "OFFPEAK"}}
    - {"command": "alert","options": {"action": "Flash"}}
   
* **NEW - MQTT Button Auto-Discovery for HA Added Starting at v1.14.0**
    * Buttons are added disabled by default because it's easy to accidentally press the wrong button and trigger an action at an inopportune time. 
Enable at your own risk and you assume all responsibility for your actions.
    * All available buttons for all vehicles are included for now, so only enable the buttons you need and/or work for your vehicle.

## Helpful Usage Notes

- The OnStar API has rate limiting, so they will block excessive requests over a short period of time.
  - Reducing the polling timeout to less than the default set by the add-on (30 minutes/1800000 ms) is likely to get you rate limited (Error 429).
- The OnStar API can be very temperamental, so you may see numerous errors every now and then where you cannot get any data from your vehicle. These tend to be very sporadic and usually go away on their own.
  - A common example of this is: "Request Failed with status 504 - Gateway Timeout"
- After your engine is turned off, the vehicle will respond to about 4 - 5 requests before going into a type of hibernation mode and will not respond to requests or commands until the engine is started up again. If your engine has been off for a while, you may still not be able to get any data from the vehicle or run commands even if it is your first attempt at trying to pull data from your vehicle after the engine was turned off.
  - **Note:** You will see an error of *"Unable to establish packet session to the vehicle"* when this occurs.

## My other related project which provides additional capabilities through Node-RED

- [https://github.com/BigThunderSR/node-red-contrib-onstar2](https://github.com/BigThunderSR/node-red-contrib-onstar2)

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
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
