import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { useAppContext } from "../../../../AppContext";

const BluetoothDashboard = () => {
    const { bleConnected, bleDevice, bleLogs, connectESP32, sendBleMessage } = useAppContext();
    const [message, setMessage] = useState("");

    const handleConnectPress = () => {
        if(!bleConnected){
            connectESP32();
        }
    };

    const handleSendPress = async () => {
        const trimmed = message.trim();
        if(!trimmed){
            return;
        }
        await sendBleMessage(trimmed);
        setMessage("");
    };

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.title}>BLUETOOTH DASHBOARD</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>CONNECT</Text>

                <Pressable
                    onPress={handleConnectPress}
                    style={[
                        styles.connectBtn,
                        bleConnected && styles.connectBtnActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            bleConnected && styles.connectBtnTextActive,
                        ]}
                    >
                        {bleConnected ? "CONNECTED" : "CONNECT BT"}
                    </Text>
                </Pressable>

                {bleConnected && (
                    <Text style={styles.code}>
                        Connected to: {bleDevice?.name || "Unknown"}
                    </Text>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE</Text>

                {!bleConnected ? (
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

                        <Pressable style={styles.sendBtn} onPress={handleSendPress}>
                            <Text style={styles.sendBtnText}>SEND</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>LOGS</Text>

                <View style={styles.logArea}>
                    {bleLogs.map((l, i) => (
                        <Text key={i} style={styles.code}>
                            {l}
                        </Text>
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
