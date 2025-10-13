import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

export default function CurrentCompassData({ onHeadingChange }) {
    const [heading, setHeading] = useState(null);
    const smoothedHeading = useRef(null);

    // smooth movement — alpha closer to 1 = more responsive, lower = smoother
    const smooth = (prev, next, alpha = 0.2) =>
        prev == null ? next : (1 - alpha) * prev + alpha * next;

    useEffect(() => {
        let subscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permission to access location was denied");
                return;
            }

            subscription = await Location.watchHeadingAsync((h) => {
                const raw =
                    typeof h.trueHeading === "number" && !isNaN(h.trueHeading)
                        ? h.trueHeading
                        : h.magHeading;

                // handle wrap-around 359° → 0° gracefully
                let prev = smoothedHeading.current;
                let next = raw;
                if (prev != null) {
                    const delta = ((next - prev + 540) % 360) - 180; // minimal rotation path
                    next = prev + delta;
                }

                const filtered = smooth(smoothedHeading.current, next, 0.15); // smoother motion
                const normalized = ((filtered % 360) + 360) % 360;

                smoothedHeading.current = normalized;
                setHeading(normalized);
                onHeadingChange?.(normalized);
            });
        })();

        return () => subscription?.remove?.();
    }, []);

    const getArrow = (deg) => {
        if (deg == null || isNaN(deg)) return "...";
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
        <View style={styles.box}>
            <Text style={styles.title}>Current Compass Data</Text>
            <Text style={styles.text}>
                Heading: {heading != null ? heading.toFixed(1) + "°" : "Loading..."}
                {"\n"}Direction: {getArrow(heading)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: "#f0fff4",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        width: "90%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
});
