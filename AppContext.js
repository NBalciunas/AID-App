import React, { useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import * as Location from "expo-location";
import example from "./assets/maps/example.json"
import shop from "./assets/maps/shop.json"

const AppContext = createContext(null);

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;
const smoothLerp = (prev, next, alpha = 0.15) => prev == null ? next : (1 - alpha) * prev + alpha * next;

const dirStr = (deg) => {
    if (deg == null) return "...";
    if (deg >= 337.5 || deg < 22.5) return "N";
    if (deg < 67.5) return "NE";
    if (deg < 112.5) return "E";
    if (deg < 157.5) return "SE";
    if (deg < 202.5) return "S";
    if (deg < 247.5) return "SW";
    if (deg < 292.5) return "W";
    return "NW";
};

export const AppProvider = ({ children }) => {
    const [maps, setMaps] = useState({});
    const [targetData, setTargetData] = useState({ lat: 52.50469, lon: 6.11236 });
    const [coords, setCoords] = useState(null);
    const [heading, setHeading] = useState(null);
    const smoothedHeading = useRef(null);
    const [permissionStatus, setPermissionStatus] = useState("unknown"); // granted/denied/undetermined
    const [lastFixAt, setLastFixAt] = useState(null);
    const posSubRef = useRef(null);
    const headSubRef = useRef(null);

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

        setMaps({example, shop});

        (
            async () => {
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
                    if (!mounted) return;
                    const c = loc.coords;
                    setCoords((prev) => {
                        if(
                            prev &&
                            prev.latitude === c.latitude &&
                            prev.longitude === c.longitude &&
                            prev.accuracy === c.accuracy &&
                            prev.speed === c.speed &&
                            prev.heading === c.heading
                        )
                        {
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

    const { bearingToTarget, relativeAngle, distanceMeters, headingLabel } =
        useMemo(() => {
            if (!coords || heading == null || !targetData) {
                return {
                    bearingToTarget: null,
                    relativeAngle: 0,
                    distanceMeters: null,
                    headingLabel: dirStr(null),
                };
            }

            const { latitude, longitude } = coords;
            const Phi1 = toRad(latitude);
            const Phi2 = toRad(targetData.lat);
            const dLambda = toRad(targetData.lon - longitude);

            const y = Math.sin(dLambda) * Math.cos(Phi2);
            const x = Math.cos(Phi1) * Math.sin(Phi2) - Math.sin(Phi1) * Math.cos(Phi2) * Math.cos(dLambda);
            const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
            const rel = (brng - heading + 360) % 360;
            const R = 6371e3;
            const dPhi = toRad(targetData.lat - latitude);
            const a = Math.sin(dPhi / 2) ** 2 + Math.cos(Phi1) * Math.cos(Phi2) * Math.sin(dLambda / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            return {
                bearingToTarget: brng,
                relativeAngle: rel,
                distanceMeters: dist,
                headingLabel: dirStr(heading),
            };
        }, [coords, heading, targetData]);

    return(
        <AppContext.Provider
            value={{
                // inputs
                targetData, setTargetData, coords, heading,

                // sensors control (left exposed in case you feed custom data)
                setCoords, updateHeading,

                // derived
                bearingToTarget, relativeAngle, distanceMeters, headingLabel,

                // meta
                permissionStatus, lastFixAt,

                // map data
                maps, setMaps,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
