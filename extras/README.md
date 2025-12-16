# Extras

## ESP32 Firmware

Firmware for the left and right bracelets based on the Adafruit HUZZAH32 (ESP32) board.  
Each bracelet drives a small vibration motor connected to GPIO 26 for haptic feedback.

## Route Gen

Python script using [OpenRouteService](https://openrouteservice.org/) to generate routes from point A to point B and export them as JSON (for the app) and KML (for map viewers).

*Requires an OpenRouteService API key to be configured before it can be used.*

Example output files (`route.json`, `route.kml`) are available in the `route-gen/examples` folder.

### KML Preview

The screenshot below shows an example KML output rendered in Google Maps:

![KML Preview](images/kml-preview.png)