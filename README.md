# AID App
*(AI + Dementia) App*

AID App is a guidance app built with React Native that connects over BLE to an ESP32-based bracelet(s) and guides the user along predefined routes using live GPS position and device heading.

## Features
- Live tracking using the device GPS position
- Turn guidance using the device compass heading
- Designed to work fully offline once routes are loaded
- Lightweight UI focused on repeatable everyday routes
- Support for multiple saved routes
- Predefined routes built from JSON node graphs
- BLE connection to two ESP32-based bracelets
- Haptic cues delivered via the left/right ESP32-based bracelets, signalling when to turn left or right
- Off-route alerts when the user strays too far from the path
- Debug view with distance, accuracy, bearing, target status, and more

## Build (without Google Play)

```bash
npx eas build -p android --profile preview
```

## Extras

Code for the ESP32-powered bracelet(s) and the route generation script is available in the `extras/` folder.

## Next steps

- Load maps from external files instead of hardcoded JSON
- Improve off-route detection logic and make reconnection to the route more reliable
- Improve the Python route graph generation script
- Add optional ESP32 bracelet screen and speaker support for status and guidance cues

## Licence

This project is licensed under the MIT License.
Copyright © 2025 Nojus Balčiūnas