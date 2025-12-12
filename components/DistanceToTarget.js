import React from "react";
import { Text, StyleSheet } from "react-native";

const DistanceToTarget = ({ distanceMeters }) => {
    const text =
        distanceMeters != null ? `Distance to target: ${distanceMeters.toFixed(1)} m` : "Distance to target: [NO INFO]";

    return <Text style={styles.title}>{text}</Text>;
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        fontFamily: "Poppins-Bold",
        color: "#000000",
    },
});

export default DistanceToTarget;
