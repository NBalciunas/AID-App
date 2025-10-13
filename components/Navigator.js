import React, {useEffect} from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Navigator({ currentCoords, currentHeading, onUpdateTargetData }) {

    const objective_lat = 52.50469;
    const objective_lon = 6.11236;

    if(!currentCoords){
        return (
            <View style={styles.box}>
                <Text style={styles.text}>Waiting for GPS...</Text>
            </View>
        );
    }

    const { latitude, longitude, accuracy, speed, altitude } = currentCoords;

    const headingValue = typeof currentHeading === "number" ? currentHeading : parseFloat(currentHeading) || null;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const toRad = (deg) => (deg * Math.PI) / 180;

        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        const a =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    const calculateBearing = (lat1, lon1, lat2, lon2) => {
        const dLon = toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(toRad(lat2));
        const x =
            Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
        return (toDeg(Math.atan2(y, x)) + 360) % 360;
    };

    const distance = getDistance(latitude, longitude, objective_lat, objective_lon);
    const bearingToTarget = calculateBearing(latitude, longitude, objective_lat, objective_lon);

    const getCardinal = (deg) => {
        if (deg === null || isNaN(deg)) return "...";
        if (deg >= 337.5 || deg < 22.5) return "N";
        if (deg < 67.5) return "NE";
        if (deg < 112.5) return "E";
        if (deg < 157.5) return "SE";
        if (deg < 202.5) return "S";
        if (deg < 247.5) return "SW";
        if (deg < 292.5) return "W";
        return "NW";
    };

    const targetData = {
        lat: objective_lat,
        lon: objective_lon,
        distance,
        bearing: bearingToTarget,
        cardinal: getCardinal(bearingToTarget),
    };

    useEffect(() => {
        onUpdateTargetData?.(targetData);
    }, [distance, bearingToTarget]);

    return(
        <View style={styles.box}>
            <Text style={styles.title}>Navigator</Text>
            <Text style={styles.text}>
                Target Lat: {objective_lat}{"\n"}
                Target Lon: {objective_lon}{"\n"}
                Distance to target: {distance.toFixed(1)} m{"\n"}
                Direction to target: {bearingToTarget.toFixed(1)}° ({getCardinal(bearingToTarget)})
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: "#eef6ff",
        borderRadius: 12,
        padding: 16,
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
