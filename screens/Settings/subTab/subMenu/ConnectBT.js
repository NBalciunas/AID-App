import React, { useEffect, useState } from "react";
import { View, Text, Button, PermissionsAndroid, Platform, ScrollView, StyleSheet } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

const manager = new BleManager();

const ConnectBT = () => {
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => {
        setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} → ${msg}`]);
    };

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            addLog("Requesting Android BT permissions…");
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
            addLog("Permissions granted!");
        }
    };

    const scanForESP32 = async () => {
        await requestPermissions();

        addLog("Scanning for ESP32…");

        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                addLog(`Scan error: ${error.message}`);
                return;
            }

            if (scannedDevice?.name?.includes("ESP32")) {
                addLog(`Found ESP32: ${scannedDevice.name}`);
                manager.stopDeviceScan();
                connectDevice(scannedDevice);
            }
        });
    };

    const connectDevice = async (dev) => {
        try {
            addLog("Connecting to ESP32…");
            const d = await dev.connect();
            await d.discoverAllServicesAndCharacteristics();
            setDevice(d);
            setIsConnected(true);
            addLog("Connected!");
        } catch (error) {
            addLog(`Connection error: ${error.message}`);
        }
    };

    const sendToESP32 = async (text) => {
        if (!device) return;

        const data = Buffer.from(text).toString("base64");
        addLog(`Sending: '${text}' (base64: ${data})`);

        try {
            await device.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                data
            );
            addLog(`Sent '${text}' successfully`);
        } catch (e) {
            addLog(`Write error: ${e.message}`);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 22, marginBottom: 10 }}>BLE – ESP32 Debug</Text>

            {!isConnected && (
                <Button title="Scan & Connect to ESP32" onPress={scanForESP32} />
            )}

            {isConnected && (
                <>
                    <Text style={{ marginTop: 10, marginBottom: 5 }}>
                        Connected to {device?.name || "Unknown"}
                    </Text>

                    <Button title="Send A" onPress={() => sendToESP32("A")} color="green" />
                    <Button title="Send B" onPress={() => sendToESP32("B")} color="blue" />
                </>
            )}

            <Text style={{ marginTop: 20, fontWeight: "bold" }}>Logs:</Text>

            <ScrollView style={styles.logArea}>
                {logs.map((l, i) => (
                    <Text key={i} style={styles.logText}>
                        {l}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    logArea: {
        marginTop: 10,
        padding: 10,
        height: 250,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: "#f4f4f4",
    },
    logText: {
        fontSize: 12,
        marginBottom: 4,
    },
});

export default ConnectBT;
