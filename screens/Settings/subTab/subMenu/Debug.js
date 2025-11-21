import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";

const Debug = () => {
    const {targetData, coords, bearingToTarget, relativeAngle, distanceMeters, heading, headingLabel} = useAppContext();

    return(
        <View style={styles.container}>
            <Text style={styles.title}>DEBUG</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>GPS</Text>

                {coords ? (
                    <Text style={styles.code}>
                        Lat: {coords.latitude.toFixed(6)}{"\n"}
                        Lon: {coords.longitude.toFixed(6)}{"\n"}
                        Speed: {(coords.speed * 3.6 || 0).toFixed(2)} km/h{"\n"}
                        Accuracy: ±{coords.accuracy?.toFixed(2)} m
                    </Text>
                ) : (
                    <Text style={styles.code}>Waiting for GPS...</Text>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>Heading</Text>

                <Text style={styles.code}>
                    Compass: {heading != null ? heading.toFixed(1) : "?"}°{"\n"}
                    Label: {headingLabel}
                </Text>
            </View>

            {targetData?.location && coords && (
                <View style={styles.block}>
                    <Text style={styles.blockTitle}>Target</Text>

                    <Text style={styles.code}>
                        Name: {targetData.location_name}{"\n"}
                        Lat: {targetData.location.lat}{"\n"}
                        Lon: {targetData.location.lon}{"\n"}
                        Bearing: {bearingToTarget?.toFixed(1)}°{"\n"}
                        Relative: {relativeAngle?.toFixed(1)}°{"\n"}
                        Distance: {distanceMeters?.toFixed(3)} m
                    </Text>
                </View>
            )}

            <StatusBar style="auto" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 24,
        letterSpacing: 1.2,
    },
    block: {
        marginBottom: 24,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#000",
        borderRadius: 12,
        backgroundColor: "#fafafa",
    },
    blockTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontFamily: 'Poppins-Bold',
    },
    code: {
        fontSize: 15,
        fontFamily: "monospace",
        lineHeight: 22,
    },
});

export default Debug;