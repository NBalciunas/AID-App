import React, { useEffect, useRef, useState, createContext, useContext} from "react";
import * as Location from "expo-location";
import { BleManager } from "react-native-ble-plx";
import mapsIndex from "./assets/maps";
import connectBLE from "./helpers/connectBLE";
import sendMessageBLE from "./helpers/sendMessageBLE";

const AppContext = createContext(null);

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;
const smoothLerp = (prev, next, alpha = 0.15) => prev == null ? next : (1 - alpha) * prev + alpha * next;

const dirStr = (deg) => {
    if (deg == null) return null;
    if (deg >= 337.5 || deg < 22.5) return "N";
    if (deg < 67.5) return "NE";
    if (deg < 112.5) return "E";
    if (deg < 157.5) return "SE";
    if (deg < 202.5) return "S";
    if (deg < 247.5) return "SW";
    if (deg < 292.5) return "W";
    return "NW";
};

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";
const bleManager = new BleManager();

export const AppProvider = ({ children }) => {
    const [maps, setMaps] = useState({});
    const [targetData, setTargetData] = useState({
        location_name: "",
        location: null,
    });
    const [coords, setCoords] = useState(null);
    const [heading, setHeading] = useState(null);
    const smoothedHeading = useRef(null);
    const [permissionStatus, setPermissionStatus] = useState("unknown"); // granted/denied/undetermined
    const [lastFixAt, setLastFixAt] = useState(null);
    const posSubRef = useRef(null);
    const headSubRef = useRef(null);

    const [proximitySensitivity, setProximitySensitivity] = useState(15);

    const [bleDevice, setBleDevice] = useState(null);
    const [bleConnected, setBleConnected] = useState(false);
    const [bleLogs, setBleLogs] = useState([]);

    const addBleLog = (msg) => {
        setBleLogs((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()} → ${msg}`,
        ]);
    };

    const connectESP32 = async () => {
        try{
            const d = await connectBLE({
                manager: bleManager,
                onLog: addBleLog,
                deviceNameFilter: "ESP32",
            });
            setBleDevice(d);
            setBleConnected(true);
        }
        catch(e){
            addBleLog(`Connection error: ${e.message}`);
            setBleConnected(false);
        }
    };

    const sendBleMessage = async (message) => {
        if(!bleDevice){
            addBleLog("No BLE device connected");
            return;
        }

        try{
            await sendMessageBLE({
                device: bleDevice,
                message,
                serviceUUID: SERVICE_UUID,
                characteristicUUID: CHARACTERISTIC_UUID,
                onLog: addBleLog,
            });
        }
        catch(e){
            // already logged in helper
        }
    };

    const updateHeading = (raw) => {
        if (typeof raw !== "number" || Number.isNaN(raw)) return;
        let prev = smoothedHeading.current;
        let next = raw;
        if(prev != null){
            const delta = ((next - prev + 540) % 360) - 180;
            next = prev + delta;
        }
        const filtered = smoothLerp(smoothedHeading.current, next, 0.15);
        const normalized = ((filtered % 360) + 360) % 360;
        smoothedHeading.current = normalized;
        setHeading(normalized);
    };

    useEffect(() => {
        let mounted = true;

        setMaps(mapsIndex);

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status === "granted" ? "granted" : "denied");
            if(status !== "granted"){
                console.warn("Location/heading permission denied");
                return;
            }

            posSubRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 0.5,
                },
                (loc) => {
                    if(!mounted){
                        return;
                    }
                    const c = loc.coords;
                    setCoords((prev) => {
                        if(prev && prev.latitude === c.latitude && prev.longitude === c.longitude && prev.accuracy === c.accuracy && prev.speed === c.speed && prev.heading === c.heading){
                            return prev;
                        }
                        return c;
                    });
                    setLastFixAt(Date.now());
                }
            );

            headSubRef.current = await Location.watchHeadingAsync((h) => {
                if(!mounted){
                    return;
                }
                const raw = typeof h.trueHeading === "number" && !isNaN(h.trueHeading) ? h.trueHeading : h.magHeading;
                updateHeading(raw);
            });
        })();

        return () => {
            mounted = false;
            posSubRef.current?.remove?.();
            headSubRef.current?.remove?.();
            posSubRef.current = null;
            headSubRef.current = null;
        };
    }, []);

    const headingLabel = dirStr(heading);

    const { bearingToTarget, relativeAngle, distanceMeters } = React.useMemo(
        () => {
            if(!coords || heading == null || !targetData?.location){
                return{
                    bearingToTarget: null,
                    relativeAngle: null,
                    distanceMeters: null,
                };
            }

            const { latitude, longitude } = coords;
            const { lat: targetLat, lon: targetLon } = targetData.location;

            const Phi1 = toRad(latitude);
            const Phi2 = toRad(targetLat);
            const dLambda = toRad(targetLon - longitude);

            const y = Math.sin(dLambda) * Math.cos(Phi2);
            const x = Math.cos(Phi1) * Math.sin(Phi2) - Math.sin(Phi1) * Math.cos(Phi2) * Math.cos(dLambda);

            const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
            const rel = (brng - heading + 360) % 360;

            const R = 6371e3; // meters
            const dPhi = toRad(targetLat - latitude);
            const a = Math.sin(dPhi / 2) ** 2 + Math.cos(Phi1) * Math.cos(Phi2) * Math.sin(dLambda / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            return { bearingToTarget: brng, relativeAngle: rel, distanceMeters: dist };
        },
        [coords, heading, targetData]
    );

    return (
        <AppContext.Provider
            value={{
                // inputs
                targetData,
                setTargetData,
                coords,
                heading,

                // sensors control (left exposed)
                setCoords,
                updateHeading,

                // derived
                bearingToTarget,
                relativeAngle,
                distanceMeters,
                headingLabel,

                // meta
                permissionStatus,
                lastFixAt,

                // map data
                maps,
                setMaps,

                // sensitivity control
                proximitySensitivity,
                setProximitySensitivity,

                // BLE
                bleDevice,
                bleConnected,
                bleLogs,
                addBleLog,
                connectESP32,
                sendBleMessage,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
