# Changelog

## 1.18.2

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.18.2](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.18.2)
- Update embedded OnStarJS version
- Throw errors when invalid VIN format and/or invalid PIN (not 4 digits) are provided

## 1.18.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.18.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.18.1)
- Fixes button name to command mismatch and adds checks for this condition to avoid recurrence in the future
- Also addresses issue Start vehicle button issue #166

## 1.18.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.18.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.18.0)
- Added icons to buttons published via MQTT auto-discovery
- Updated Tests
- Did some code cleanup

## 1.17.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.17.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.17.1)
- Add unique_id to device_tracker auto-discovery config
- Fix polling refresh interval sensor not publishing
- Tweak tire pressure message sensor names
- Logging update
- Add tests

## 1.17.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.17.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.17.0)
- Added an option to group all numeric/component sensors and command status sensors in the same MQTT device if desired. The default which carries over from the previous version is to group them separately.
- Added Oil Life and Tire Pressure status messages to MQTT auto-discovery topics.
- Added additional tests

## 1.16.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.16.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.16.1)
- Fixed a regression from the previous release which caused some failed functionality

## 1.16.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.16.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.16.0)
- Add OnStar polling status sensors to MQTT auto-discovery
  - At this point, pretty much every available sensor, button and status is published to MQTT auto-discovery topics
- Add additional tests
- Add command buttons to Command Status Monitors Sensors section in addition to the main vehicle sensors MQTT device
- Fix regression from previous release
- Move some code out of index
- Logging updates

## 1.15.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.15.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.15.0)
- Command Status and Timestamp from last command run are published to MQTT auto-discovery topics and are grouped in a MQTT device grouping for all 
command status sensors for the same vehicle
- Fix a bug in the alert function command handling
- Add suggested area for sensor groupings

## 1.14.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.14.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.14.1)
- Improve logic for button publish
- Fix some sensor state_class/device_class mappings based on discussion in PR #158
- Standardize case for command topic payload fields
- Minor logging change
- Fix minor logging issue
- Code formatting updates

## 1.14.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.14.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.14.0)
- Buttons are added disabled by default because it's easy to accidentally press the wrong button and trigger an action at an inopportune time. 
Enable at your own risk and you assume all responsibility for your actions.
- All available buttons for all vehicles are included for now, so only enable the buttons you need and/or work for your vehicle.
- Changed the model displayed in the MQTT device in HA from "Model Year" to "Model Year + Model Name".

## 1.13.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.13.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.13.1)
- Fix minor regression from v1.12.0

## 1.13.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.13.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.13.0)
- Changed the dependency on OnStarJS to embedded to enable easier key rotation updates
- Added Trunk Open/Close commands based on PR 248 in [OnStarJS ](https://github.com/samrum/OnStarJS)and added delay option
- Added additional packages to base install due to change of embedded dependency
- Modifications to allow sending all commands with options using MQTT

## 1.12.5

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.5](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.5)
- Improve diagnostic response handling for manually run command
- Minor updates to command state message

## 1.12.4

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.4](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.4)
- Fix typo missed in previous release

## 1.12.3

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.3](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.3)
- Fix minor regression from v1.12.0
- Add "completionTimestamp" field for uniformity to every MQTT topic that publishes a command or polling status

## 1.12.2

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.2](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.2)
- Fix minor bug introduced in v1.12.1
- Documentation updates

## 1.12.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.1)
- Add completionTimestamp JSON field to pollingStatusTopicState per BigThunderSR/homeassistant-addons-onstar2mqtt#410

## 1.12.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.12.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.12.0)

- Added device_tracker auto discovery by @BigThunderSR in https://github.com/BigThunderSR/onstar2mqtt/pull/143
  - The device_tracker auto discovery config is published to: "homeassistant/device_tracker/(VIN)/config" and the GPS coordinates are still read from the original topic automatically at: "homeassistant/device_tracker/(VIN)/getlocation/state".
  - Also added GPS based speed and direction to the device_tracker attributes

- Added new retained topic of "homeassistant/(VIN)/refresh_interval_current_val" to monitor current refresh value set via MQTT

## 1.11.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.11.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.11.0)
- New env options for securing connectivity for MQTTS using TLS:
  - MQTT_REJECT_UNAUTHORIZED (Default: "true", set to "false" only for testing.)
  - MQTT_CA_FILE
  - MQTT_CERT_FILE
  - MQTT_KEY_FILE

- Automatic creation of pollingStatusTopic
  - No longer need to specify MQTT_ONSTAR_POLLING_STATUS_TOPIC as this is now created automatically
    - Format is "homeassistant/(VIN)/polling_status/"
  - If it is explicitly specified, will use the specified value, so does not break backwards compatibility

- Ability to dynamically change polling frequency using MQTT
  - Uses the value from "ONSTAR_REFRESH" on initial startup
  - Change the value dynamically by publishing the new refresh value in milliseconds (ms) as an INT to: "homeassistant/(VIN)/refresh_interval"

- Additional logging enhancements

## 1.10.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.10.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.10.0)
- Logs descriptive errors to console when required properties such as OnStar VIN/username/password/PIN and/or MQTT username/password/polling status topic are not provided at run time.
- OnStar password/PIN and MQTT password are now masked in the console log output by default.

## 1.9.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.9.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.9.0)
- Implement manual diagnostic command response handling
- Update polling status message handling

## 1.8.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.8.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.8.1)

## 1.8.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.8.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.8.0)
- Add diagnostic element messages as attributes to applicable sensors and update tests to account for the changes
- Publish all diagnostic element messages to same MQTT topic as each sensor for easy retrieval when needed
- Update example in mqtt.js to include changes in v1.7.0
- Update example in mqtt.js to include changes in v1.8.0

## 1.7.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.7.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.7.0)
- Add state_class of measurement to all non-binary sensors to enable long-term statistics saving in HA
- Add device_class for several additional sensors
- Change "lit" to "L" which is the correct unit for Liters in HA
- Change occurrences of "l" to "L" which is the correct unit for Liters

## 1.6.3

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.6.3](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.6.3)

## 1.6.2

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.6.2](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.6.2)

## 1.6.1

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.6.1](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.6.1)

## 1.6.0

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.6.0](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.6.0)
- Added ability to provide MQTT topic for Onstar Data Polling Status to monitor success/failure when OnStar is polled for data - Details in [README](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt#)
- Command Response Status is now published to MQTT topics - Details in [README](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt#)

## 1.4.3

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.30](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.30)

## 1.4.2

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.29](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.29)

## 1.4.1

- Added detailed descriptions for all required data fields

## 1.4.0

- Exposed additional parameters available in the program to the add-on.

## 1.3.28

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.28](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.28)

## 1.3.27 - **WARNING!!! - BREAKING CHANGE!!! - MANUAL STEPS REQUIRED TO UPGRADE**

- Before upgrading, please copy/save your add-on config, uninstall the existing add-on, install this new version of the add-on, re-add the previously saved configuration, save the config and re-start Home Assistant before using the add-on.
- Reason: Changed slug name to use "_" instead of "-" due to breaking change in HA Core 2023.9

## 1.2.27

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.27](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.27)

## 1.2.26

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.26](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.26)

## 1.2.25

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.25](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.25)

## 1.2.24

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.24](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.24)

## 1.2.23

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.23](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.23)

## 1.2.22

- Pickup latest upstream updates in [BigThunderSR/onstar2mqtt v1.5.22](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.22)

## 1.2.21

- Change add-on to use pre-built image instead of building locally

## 1.1.21

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.21](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.21)

## 1.1.20

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.20](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.20)

## 1.1.19

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.19](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.19)

## 1.1.18

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.18](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.18)

## 1.1.17

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.17](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.17)

## 1.1.16

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.16](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.16)

## 1.1.15

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.15](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.15)

## 1.1.14

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.14](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.14)

## 1.1.13

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.13](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.13)

## 1.1.12

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.12](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.12)

## 1.1.11

- Pickup latest upstream fixes in [BigThunderSR/onstar2mqtt v1.5.11](https://github.com/BigThunderSR/onstar2mqtt/releases/tag/v1.5.11)

## 1.1.10

- Pickup latest upstream fixes

## 1.1.9

- Pickup latest upstream updates - Fixed

## 1.1.8

- Pickup latest upstream updates

## 1.1.7

- Resolve image issue

## 1.1.6

- Signed Assets with CAS

## 1.1.5

- Added logo and icon files

## 1.1.4

- Rebased BigThunderSR/onstar2mqtt submodule to v1.5.10 to pickup log colorization and timestamp additions from upstream

## 1.1.3

- Added option to provide a name for the vehicle using this integration

## 1.1.2

- Made some minor optimizations to the Dockerfile

## 1.1.1

- Created submodules structure to simplify maintenance and added ability to choose either BigThunderSR or michaelwoods build of onstar2mqtt

## 1.0.14

- Code Cleanup

## 1.0.13

- Added Ability to Run Two Independent Instances for Two Vehicles

## 1.0.12

- Further updates

## 1.0.11

- Major updates

## 1.0.8

- Major updates

## 1.0.7

- Further testing

## 1.0.6

- Test process

## 1.0.0

- Initial Test
