import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";

global.Buffer = global.Buffer || Buffer;

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "abcdef01-1234-5678-1234-56789abcdef0";

const manager = new BleManager();

const BluetoothDashboard = () => {
    const [device, setDevice] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [message, setMessage] = useState("");

    const addLog = (msg) => {
        setLogs((p) => [...p, `${new Date().toLocaleTimeString()} → ${msg}`]);
    };

    const requestPermissions = async () => {
        if(Platform.OS === "android"){
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
            if(error){
                return addLog(`Scan error: ${error.message}`);
            }

            if(scannedDevice?.name?.includes("ESP32")){
                addLog(`Found ESP32: ${scannedDevice.name}`);
                manager.stopDeviceScan();
                connectDevice(scannedDevice);
            }
        });
    };

    const connectDevice = async (dev) => {
        try{
            addLog("Connecting to ESP32…");
            const d = await dev.connect();
            await d.discoverAllServicesAndCharacteristics();

            setDevice(d);
            setIsConnected(true);
            addLog("Connected!");
        }
        catch(e){
            addLog(`Connection error: ${e.message}`);
        }
    };

    const sendToESP32 = async () => {
        if(!device || !message.trim()){
            return;
        }

        const base64 = Buffer.from(message).toString("base64");
        addLog(`Sending '${message}' (base64: ${base64})`);

        try{
            await device.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                base64
            );
            addLog(`Sent '${message}' successfully`);
            setMessage("");
        }
        catch(e){
            addLog(`Write error: ${e.message}`);
        }
    };

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.title}>BLUETOOTH DEBUG</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>CONNECT</Text>

                <Pressable
                    onPress={!isConnected ? scanForESP32 : undefined}
                    style={[
                        styles.connectBtn,
                        isConnected && styles.connectBtnActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            isConnected && styles.connectBtnTextActive,
                        ]}
                    >
                        {isConnected ? "CONNECTED" : "CONNECT BT"}
                    </Text>
                </Pressable>

                {isConnected && (
                    <Text style={styles.code}>
                        Connected to: {device?.name || "Unknown"}
                    </Text>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE</Text>

                {!isConnected ? (
                    <Text style={styles.code}>[BT NOT CONNECTED]</Text>
                ) : (
                    <View style={styles.sendRow}>
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type message..."
                            style={styles.input}
                            placeholderTextColor="#555"
                        />

                        <Pressable style={styles.sendBtn} onPress={sendToESP32}>
                            <Text style={styles.sendBtnText}>SEND</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>LOGS</Text>

                <View style={styles.logArea}>
                    {logs.map((l, i) => (
                        <Text key={i} style={styles.code}>{l}</Text>
                    ))}
                </View>
            </View>
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
        fontFamily: "Poppins-Bold",
        color: "#000",
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
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
        color: "#000",
    },
    code: {
        fontSize: 14,
        fontFamily: "monospace",
        lineHeight: 20,
        color: "#000",
    },
    connectBtn: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#000",
        marginBottom: 10,
    },
    connectBtnActive: {
        backgroundColor: "#fff",
    },
    connectBtnText: {
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
        color: "#000",
        textTransform: "uppercase",
    },
    connectBtnTextActive: {
        color: "#000",
    },
    sendRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
        alignItems: "center",
    },
    input: {
        flex: 1,
        padding: 12,
        borderWidth: 1.5,
        borderColor: "#000",
        borderRadius: 10,
        backgroundColor: "#fff",
        fontSize: 16,
        fontFamily: "monospace",
        color: "#000",
    },
    sendBtn: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#000",
    },
    sendBtnText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
    },
    logArea: {
        marginTop: 8,
        borderWidth: 1.5,
        borderColor: "#000",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 8,
    },
});

export default BluetoothDashboard;
