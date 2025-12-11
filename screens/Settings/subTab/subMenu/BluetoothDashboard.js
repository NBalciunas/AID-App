import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { useAppContext } from "../../../../AppContext";

const BluetoothDashboard = () => {
    const { bleLogs, leftBleDevice, rightBleDevice, leftBleConnected, rightBleConnected, connectLeftESP32, connectRightESP32, sendLeftBleMessage, sendRightBleMessage } = useAppContext();

    const [leftMessage, setLeftMessage] = useState("");
    const [rightMessage, setRightMessage] = useState("");

    const handleConnectLeftPress = () => {
        if(!leftBleConnected){
            connectLeftESP32();
        }
    };

    const handleConnectRightPress = () => {
        if(!rightBleConnected){
            connectRightESP32();
        }
    };

    const handleSendLeftPress = async () => {
        const trimmed = leftMessage.trim();
        if(!trimmed){
            return;
        }
        await sendLeftBleMessage(trimmed);
        setLeftMessage("");
    };

    const handleSendRightPress = async () => {
        const trimmed = rightMessage.trim();
        if(!trimmed){
            return;
        }
        await sendRightBleMessage(trimmed);
        setRightMessage("");
    };

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.title}>BLUETOOTH DASHBOARD</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>CONNECT</Text>

                <Pressable
                    onPress={handleConnectLeftPress}
                    style={[
                        styles.connectBtn,
                        leftBleConnected && styles.connectBtnActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            leftBleConnected && styles.connectBtnTextActive,
                        ]}
                    >
                        {leftBleConnected ? "LEFT CONNECTED" : "CONNECT LEFT"}
                    </Text>
                </Pressable>

                {leftBleConnected && (
                    <Text style={styles.code}>
                        Left: {leftBleDevice?.name || "Unknown"}
                    </Text>
                )}

                <Pressable
                    onPress={handleConnectRightPress}
                    style={[
                        styles.connectBtn,
                        rightBleConnected && styles.connectBtnActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            rightBleConnected && styles.connectBtnTextActive,
                        ]}
                    >
                        {rightBleConnected ? "RIGHT CONNECTED" : "CONNECT RIGHT"}
                    </Text>
                </Pressable>

                {rightBleConnected && (
                    <Text style={styles.code}>
                        Right: {rightBleDevice?.name || "Unknown"}
                    </Text>
                )}
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE</Text>

                {!leftBleConnected ? (
                    <Text style={styles.code}>[LEFT NOT CONNECTED]</Text>
                ) : (
                    <View style={styles.sendRow}>
                        <TextInput
                            value={leftMessage}
                            onChangeText={setLeftMessage}
                            placeholder="Type message to LEFT..."
                            style={styles.input}
                            placeholderTextColor="#555"
                        />

                        <Pressable style={styles.sendBtn} onPress={handleSendLeftPress}>
                            <Text style={styles.sendBtnText}>SEND LEFT</Text>
                        </Pressable>
                    </View>
                )}

                {!rightBleConnected ? (
                    <Text style={styles.code}>[RIGHT NOT CONNECTED]</Text>
                ) : (
                    <View style={styles.sendRow}>
                        <TextInput
                            value={rightMessage}
                            onChangeText={setRightMessage}
                            placeholder="Type message to RIGHT..."
                            style={styles.input}
                            placeholderTextColor="#555"
                        />

                        <Pressable style={styles.sendBtn} onPress={handleSendRightPress}>
                            <Text style={styles.sendBtnText}>SEND RIGHT</Text>
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
