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
[![Notarize Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_notarize.yml)
[![Authenticate Assets with CAS](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml/badge.svg)](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/actions/workflows/cas_authenticate.yml)

Home Assistant Add-on combining my fork of [michaelwoods/onstar2mqtt](https://github.com/michaelwoods/onstar2mqtt) at [BigThunderSR/onstar2mqtt](https://github.com/BigThunderSR/onstar2mqtt) and modifications to [dannysporea/onstar2mqtt-addon](https://github.com/dannysporea/onstar2mqtt-addon)'s HA add-on config which provides the ability to run two independent instances if you have two vehicles that you would like to connect to.

<!--Add-on documentation: <https://developers.home-assistant.io/docs/add-ons> -->

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt)

## Add-ons

This repository contains the following add-ons

- [OnStar2MQTT for Vehicle 1 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle1)

- [OnStar2MQTT for Vehicle 2 Using BigThunderSR/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-bigthundersr-vehicle2)

  Which have these new commands which were not originally available in the OG build of onstar2mqtt, but have been added since v1.5.5:
  - `alertFlash`
  - `alertHonk`

  As well as some additional customizations such as log colorization which are also not available in the OG build.

If you prefer to use the OG build of onstar2mqtt 😎

- [OnStar2MQTT for Vehicle 1 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle1)

- [OnStar2MQTT for Vehicle 2 Using michaelwoods/onstar2mqtt Build](https://github.com/BigThunderSR/homeassistant-addons-onstar2mqtt/tree/main/onstar2mqtt-michaelwoods-vehicle2)

## Running

Collect the following information:

1. [Generate](https://www.uuidgenerator.net/version4) a v4 uuid for the device ID
1. OnStar login: username, password, PIN
1. Your car's VIN. Easily found in the monthly OnStar diagnostic emails.
1. MQTT server information: hostname, username, password

## Helpful Usage Notes

- The OnStar API has rate limiting, so they will block excessive requests over a short period of time.
- The OnStar API can be very temparamental, so you may see numerous errors every now and then where you cannot get any data from your vehicle. These tend to be very sporadic and usually go away on their own.
- After your engine is turned off, the vehicle will respond to about 4 - 5 requests before going into a type of hibernation mode and will not respond to requests until the engine is started up again. If your engine has been off for a while, you may still not be able to get any data from the vehicle even if it is your first attempt at trying to pull data from your vehicle after the engine was turned off.
  - **Note:** You will see an error of *"Unable to establish packet session to the vehicle"* when this occurrs.

## My other related project which provides additional capabilities through Node-RED

[https://github.com/BigThunderSR/node-red-contrib-onstar2](https://github.com/BigThunderSR/node-red-contrib-onstar2)

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
