import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";

const Debug = () => {
    const { targetData, coords, bearingToTarget, relativeAngle, distanceMeters, heading, headingLabel } = useAppContext();

    return(
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
                Heading: {heading != null ? heading.toFixed(1) : "?"}° ({headingLabel})
            </Text>

            {targetData && coords && (
                <Text style={styles.text}>
                    Target Latitude: {targetData.lat}{"\n"}
                    Target Longitude: {targetData.lon}{"\n"}
                    Bearing to target: {bearingToTarget?.toFixed(1)}°{"\n"}
                    Relative angle: {relativeAngle?.toFixed(1)}°{"\n"}
                    Distance: {distanceMeters != null ? distanceMeters.toFixed(3) : "?"} m
                </Text>
            )}

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
        padding: 20
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12
    },
    text: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10
    },
});

export default Debug;