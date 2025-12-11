import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { useAppContext } from "../../../../AppContext";

const BluetoothDashboard = () => {
    const { bleLogs, leftBleDevice, rightBleDevice, leftBleConnected, rightBleConnected, connectLeftESP32, connectRightESP32, sendLeftBleMessage, sendRightBleMessage } = useAppContext();

    const [leftMessage, setLeftMessage] = useState("");
    const [rightMessage, setRightMessage] = useState("");
    const [leftConnecting, setLeftConnecting] = useState(false);
    const [rightConnecting, setRightConnecting] = useState(false);

    const handleConnectLeftPress = async () => {
        if(leftBleConnected || leftConnecting){
            return;
        }
        try {
            setLeftConnecting(true);
            await connectLeftESP32();
        }
        finally{
            setLeftConnecting(false);
        }
    };

    const handleConnectRightPress = async () => {
        if(rightBleConnected || rightConnecting){
            return;
        }
        try{
            setRightConnecting(true);
            await connectRightESP32();
        }
        finally{
            setRightConnecting(false);
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

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>BLUETOOTH DASHBOARD</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>CONNECT</Text>

                <Pressable
                    onPress={handleConnectLeftPress}
                    style={({ pressed }) => [
                        styles.connectBtn,
                        leftBleConnected && styles.connectBtnActive,
                        leftConnecting && styles.connectBtnConnecting,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            leftBleConnected && styles.connectBtnTextActive,
                            leftConnecting && styles.connectBtnTextConnecting,
                        ]}
                    >
                        {leftConnecting ? "CONNECTING..." : leftBleConnected ? "LEFT CONNECTED" : "CONNECT LEFT"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleConnectRightPress}
                    style={({ pressed }) => [
                        styles.connectBtn,
                        rightBleConnected && styles.connectBtnActive,
                        rightConnecting && styles.connectBtnConnecting,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            rightBleConnected && styles.connectBtnTextActive,
                            rightConnecting && styles.connectBtnTextConnecting,
                        ]}
                    >
                        {rightConnecting ? "CONNECTING..." : rightBleConnected ? "RIGHT CONNECTED" : "CONNECT RIGHT"}
                    </Text>
                </Pressable>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE</Text>

                <View style={styles.sendBox}>
                    <Text style={styles.sendBoxTitle}>LEFT</Text>
                    {!leftBleConnected ? (
                        <Text style={styles.code}>[NOT CONNECTED]</Text>
                    ) : (
                        <View style={styles.sendRow}>
                            <TextInput
                                value={leftMessage}
                                onChangeText={setLeftMessage}
                                placeholder="Type message to LEFT..."
                                style={styles.input}
                                placeholderTextColor="#555"
                            />
                            <Pressable
                                style={({ pressed }) => [
                                    styles.sendBtn,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleSendLeftPress}
                            >
                                <Text style={styles.sendBtnText}>SEND LEFT</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.sendBox}>
                    <Text style={styles.sendBoxTitle}>RIGHT</Text>
                    {!rightBleConnected ? (
                        <Text style={styles.code}>[NOT CONNECTED]</Text>
                    ) : (
                        <View style={styles.sendRow}>
                            <TextInput
                                value={rightMessage}
                                onChangeText={setRightMessage}
                                placeholder="Type message to RIGHT..."
                                style={styles.input}
                                placeholderTextColor="#555"
                            />
                            <Pressable
                                style={({ pressed }) => [
                                    styles.sendBtn,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleSendRightPress}
                            >
                                <Text style={styles.sendBtnText}>SEND RIGHT</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
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
        backgroundColor: "#d4f8d4",
        borderColor: "#2b8a3e",
    },
    connectBtnConnecting: {
        backgroundColor: "#fff4cc",
        borderColor: "#f59f00",
    },
    connectBtnText: {
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
        color: "#000",
        textTransform: "uppercase",
    },
    connectBtnTextActive: {
        color: "#2b8a3e",
    },
    connectBtnTextConnecting: {
        color: "#f59f00",
    },
    sendBox: {
        marginTop: 4,
        marginBottom: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    sendBoxTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 6,
        textTransform: "uppercase",
        fontFamily: "Poppins-Bold",
        color: "#000",
    },
    sendRow: {
        flexDirection: "column",
        gap: 10,
        marginTop: 4,
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
        marginTop: 8,
        alignItems: "center",
    },
    sendBtnText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Poppins-Bold",
    },
    buttonPressed: {
        backgroundColor: "#e0e0e0",
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
