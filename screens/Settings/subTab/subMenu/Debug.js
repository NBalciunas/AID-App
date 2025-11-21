import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";

const Debug = () => {
    const {targetData, coords, bearingToTarget, relativeAngle, distanceMeters, heading, headingLabel} = useAppContext();

    return(
        <ScrollView style={styles.container}>
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
                <Text style={styles.blockTitle}>HEADING</Text>

                <Text style={styles.code}>
                    Compass: {heading != null ? `${heading.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                    Label: {headingLabel || "[NO INFO]"}
                </Text>
            </View>

            {targetData?.location && coords ? (
                <View style={styles.block}>
                    <Text style={styles.blockTitle}>TARGET</Text>

                    <Text style={styles.code}>
                        Name: {targetData.location_name || "[NO INFO]"}{"\n"}
                        Lat: {targetData.location?.lat ?? "[NO INFO]"}{"\n"}
                        Lon: {targetData.location?.lon ?? "[NO INFO]"}{"\n"}
                        Bearing: {bearingToTarget != null ? `${bearingToTarget.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                        Relative: {relativeAngle != null ? `${relativeAngle.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                        Distance: {distanceMeters != null ? `${distanceMeters.toFixed(3)} m` : "[NO INFO]"}
                    </Text>
                </View>
            ) : (
                <View style={styles.block}>
                    <Text style={styles.blockTitle}>TARGET</Text>
                    <Text style={styles.code}>[NO TARGET SELECTED]</Text>
                </View>
            )}

            <StatusBar style="auto" />
        </ScrollView>
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
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        fontFamily: 'Poppins-Bold',
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