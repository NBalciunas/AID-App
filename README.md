# AID App
*(AI + Dementia) App*

AID App is a guidance app built with React Native that connects over BLE to an ESP32-based bracelet(s) and guides the user along predefined routes using live GPS position and device heading.

## Features
- BLE connection to an ESP32-based bracelet(s)
- Live GPS position tracking
- Device heading for guidance on when to turn
- Haptic cues on the corresponding arm signalling when to turn left or right
- Predefined routes built from JSON node graphs
- Debug view with distance, accuracy, bearing, and target status
- Lightweight UI focused on repeatable everyday routes

### Build (without Google Play)

```bash
npx eas build -p android --profile preview
```

## Next steps

- Load maps from external files instead of hardcoded JSON

## Licence

This project is licensed under the MIT License.
Copyright © 2025 Nojus Balčiūnas