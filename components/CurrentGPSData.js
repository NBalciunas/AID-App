import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

export default function GpsData({ onLocationUpdate }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

    useEffect(() => {
        let timer;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if(status !== "granted"){
                setErrorMsg("Permission to access location was denied");
                return;
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 0.5,
                },
                (loc) => {
                    setLocation(loc);
                    setSecondsSinceUpdate(0);
                    if(onLocationUpdate){
                        onLocationUpdate(loc.coords)
                    }
                }
            );
        })();

        timer = setInterval(() => setSecondsSinceUpdate((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    if (errorMsg) return (<View style={styles.box}><Text style={styles.text}>{errorMsg}</Text></View>);
    if (!location) return (<View style={styles.box}><Text style={styles.text}>Waiting for GPS...</Text></View>);

    const { latitude, longitude, altitude, accuracy, altitudeAccuracy, speed, heading } = location.coords;

    const timestamp = new Date(location.timestamp).toLocaleTimeString();

    return(
        <View style={styles.box}>
            <Text style={styles.title}>Current GPS Data</Text>
            <Text style={styles.text}>
                Latitude: {latitude.toFixed(7)}{"\n"}
                Longitude: {longitude.toFixed(7)}{"\n"}
                Altitude: {altitude ? altitude.toFixed(2) + " m" : "N/A"}{"\n"}
                Accuracy (horizontal): ±{accuracy?.toFixed(2)} m{"\n"}
                Altitude Accuracy: ±{altitudeAccuracy?.toFixed(2) ?? "?"} m{"\n"}
                Speed: {speed ? (speed * 3.6).toFixed(2) + " km/h" : "0 km/h"}{"\n"}
                Heading: {heading?.toFixed(2)}°{"\n"}
                Timestamp: {timestamp}{"\n"}
                Seconds since last update: {secondsSinceUpdate}s
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        padding: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        elevation: 2,
        width: "90%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
    },
});
