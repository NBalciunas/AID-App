import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import DirectionPointer from "../../components/DirectionPointer";
import shop from "../../assets/maps/shop.json";

const MainTab = () => {
    const [coords, setCoords] = useState(null);
    const [heading, setHeading] = useState(null);
    const [targetData, setTargetData] = useState({
        lat: 52.50469,
        lon: 6.11236,
        bearing: 0,
    });

    const smoothedHeading = useRef(null);

    const smooth = (prev, next, alpha = 0.15) =>
        prev == null ? next : (1 - alpha) * prev + alpha * next;

    useEffect(() => {
        let timer;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("GPS permission denied");
                return;
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 0.5,
                },
                (loc) => {
                    setCoords(loc.coords);
                }
            );
        })();

        timer = setInterval(() => {}, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let subscription;
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Compass permission denied");
                return;
            }

            subscription = await Location.watchHeadingAsync((h) => {
                const raw =
                    typeof h.trueHeading === "number" && !isNaN(h.trueHeading)
                        ? h.trueHeading
                        : h.magHeading;

                let prev = smoothedHeading.current;
                let next = raw;
                if (prev != null) {
                    const delta = ((next - prev + 540) % 360) - 180;
                    next = prev + delta;
                }

                const filtered = smooth(smoothedHeading.current, next, 0.15);
                const normalized = ((filtered % 360) + 360) % 360;

                smoothedHeading.current = normalized;
                setHeading(normalized);
            });
        })();

        return () => subscription?.remove?.();
    }, []);

    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    let targetAngle = 0;
    let distance = 0;

    if (coords && heading && targetData) {
        const Phi1 = toRad(coords.latitude);
        const Phi2 = toRad(targetData.lat);
        const DeltaLambda = toRad(targetData.lon - coords.longitude);

        const y = Math.sin(DeltaLambda) * Math.cos(Phi2);
        const x =
            Math.cos(Phi1) * Math.sin(Phi2) -
            Math.sin(Phi1) * Math.cos(Phi2) * Math.cos(DeltaLambda);
        const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;

        targetData.bearing = brng;
        targetAngle = (brng - heading + 360) % 360;

        const R = 6371e3;
        const DeltaPhi = toRad(targetData.lat - coords.latitude);
        const a =
            Math.sin(DeltaPhi / 2) ** 2 +
            Math.cos(Phi1) * Math.cos(Phi2) * Math.sin(DeltaLambda / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
    }

    const getDir = (deg) => {
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Debug</Text>
            {coords ? (
                <Text style={styles.text}>
                    Latitude: {coords.latitude.toFixed(6)}{"\n"}
                    Longitude: {coords.longitude.toFixed(6)}{"\n"}
                    Speed: {(coords.speed * 3.6 || 0).toFixed(2)} km/h{"\n"}
                    Accuracy: ±{coords.accuracy?.toFixed(2)} m
                </Text>
            ) : (
                <Text>Waiting for GPS...</Text>
            )}

            <Text style={styles.text}>
                Heading: {heading ? heading.toFixed(1) : "?"}° ({getDir(heading)})
            </Text>

            {targetData && coords && (
                <Text style={styles.text}>
                    Target Latitude: {targetData.lat}{"\n"}
                    Target Longitude: {targetData.lon}{"\n"}
                    Bearing to target: {targetData.bearing?.toFixed(1)}°{"\n"}
                    Relative angle: {targetAngle.toFixed(1)}°{"\n"}
                    Distance: {(distance).toFixed(3)} m
                </Text>
            )}
            <DirectionPointer angle={parseInt(targetAngle.toFixed(1))} />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10,
    },
});

export default MainTab;