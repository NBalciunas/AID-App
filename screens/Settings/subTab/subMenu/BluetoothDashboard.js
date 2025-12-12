import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { useAppContext } from "../../../../AppContext";

const BluetoothDashboard = () => {
    const { bleLogs, leftBleConnected, rightBleConnected, connectLeftESP32, connectRightESP32, sendLeftBleMessage, sendRightBleMessage } = useAppContext();

    const [leftMessage, setLeftMessage] = useState("");
    const [rightMessage, setRightMessage] = useState("");
    const [leftConnecting, setLeftConnecting] = useState(false);
    const [rightConnecting, setRightConnecting] = useState(false);

    const [leftJustDisconnected, setLeftJustDisconnected] = useState(false);
    const [rightJustDisconnected, setRightJustDisconnected] = useState(false);

    const [leftReconnectingUI, setLeftReconnectingUI] = useState(false);
    const [rightReconnectingUI, setRightReconnectingUI] = useState(false);

    const prevLeftConnected = useRef(leftBleConnected);
    const prevRightConnected = useRef(rightBleConnected);

    const leftEverConnectedRef = useRef(false);
    const rightEverConnectedRef = useRef(false);

    useEffect(() => {
        if(leftBleConnected){
            leftEverConnectedRef.current = true;
        }
    }, [leftBleConnected]);

    useEffect(() => {
        if(rightBleConnected){
            rightEverConnectedRef.current = true;
        }
    }, [rightBleConnected]);

    useEffect(() => {
        if(leftBleConnected){
            setLeftJustDisconnected(false);
            setLeftReconnectingUI(false);
        }

        if(prevLeftConnected.current && !leftBleConnected){
            setLeftJustDisconnected(true);
            setLeftReconnectingUI(false);
        }

        prevLeftConnected.current = leftBleConnected;
    }, [leftBleConnected]);

    useEffect(() => {
        if(rightBleConnected){
            setRightJustDisconnected(false);
            setRightReconnectingUI(false);
        }

        if(prevRightConnected.current && !rightBleConnected){
            setRightJustDisconnected(true);
            setRightReconnectingUI(false);
        }

        prevRightConnected.current = rightBleConnected;
    }, [rightBleConnected]);

    const getLastSideLog = (side) => {
        for(let i = bleLogs.length - 1; i >= 0; i--){
            const l = bleLogs[i];
            if(l.includes(`${side}:`)){
                return l;
            }
        }
        return null;
    };

    useEffect(() => {
        if(leftBleConnected){
            return;
        }

        if(!leftEverConnectedRef.current){
            setLeftJustDisconnected(false);
            setLeftReconnectingUI(false);
            return;
        }

        const lastLeft = getLastSideLog("LEFT");
        if(!lastLeft){
            return;
        }

        if(!leftConnecting && lastLeft.includes("LEFT: Starting ESP32 scan")){
            setLeftReconnectingUI(true);
            setLeftJustDisconnected(false);
        }

        if(leftReconnectingUI && lastLeft.includes("LEFT: Connection error")){
            setLeftReconnectingUI(false);
            setLeftJustDisconnected(false);
        }

        if(leftReconnectingUI && lastLeft.includes("LEFT: Auto-reconnect disabled")){
            setLeftReconnectingUI(false);
            setLeftJustDisconnected(false);
        }
    }, [bleLogs, leftBleConnected, leftConnecting, leftReconnectingUI]);

    useEffect(() => {
        if(rightBleConnected){
            return;
        }

        if(!rightEverConnectedRef.current){
            setRightJustDisconnected(false);
            setRightReconnectingUI(false);
            return;
        }

        const lastRight = getLastSideLog("RIGHT");
        if(!lastRight){
            return;
        }

        if(!rightConnecting && lastRight.includes("RIGHT: Starting ESP32 scan")){
            setRightReconnectingUI(true);
            setRightJustDisconnected(false);
        }

        if(rightReconnectingUI && lastRight.includes("RIGHT: Connection error")){
            setRightReconnectingUI(false);
            setRightJustDisconnected(false);
        }

        if(rightReconnectingUI && lastRight.includes("RIGHT: Auto-reconnect disabled")){
            setRightReconnectingUI(false);
            setRightJustDisconnected(false);
        }
    }, [bleLogs, rightBleConnected, rightConnecting, rightReconnectingUI]);

    const handleConnectLeftPress = async () => {
        if(leftBleConnected || leftConnecting || leftReconnectingUI){
            return;
        }
        try{
            setLeftConnecting(true);
            await connectLeftESP32();
        }
        finally{
            setLeftConnecting(false);
        }
    };

    const handleConnectRightPress = async () => {
        if(rightBleConnected || rightConnecting || rightReconnectingUI){
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

    const handleSendLeftQuickLPress = async () => {
        if(!leftBleConnected){
            return;
        }
        await sendLeftBleMessage("L");
    };

    const handleSendRightQuickRPress = async () => {
        if (!rightBleConnected){
            return;
        }
        await sendRightBleMessage("R");
    };

    const leftBusy = leftConnecting || leftReconnectingUI;
    const rightBusy = rightConnecting || rightReconnectingUI;

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
                        leftBusy && styles.connectBtnConnecting,
                        leftJustDisconnected && !leftBleConnected && !leftBusy && styles.connectBtnDisconnected,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            leftBleConnected && styles.connectBtnTextActive,
                            leftBusy && styles.connectBtnTextConnecting,
                            leftJustDisconnected && !leftBleConnected && !leftBusy && styles.connectBtnTextDisconnected,
                        ]}
                    >
                        {leftConnecting ? "LEFT CONNECTING..." : leftBleConnected ? "LEFT CONNECTED" : leftReconnectingUI ? "LEFT RECONNECTING..." : leftJustDisconnected ? "LEFT DISCONNECTED" : "CONNECT LEFT"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleConnectRightPress}
                    style={({ pressed }) => [
                        styles.connectBtn,
                        rightBleConnected && styles.connectBtnActive,
                        rightBusy && styles.connectBtnConnecting,
                        rightJustDisconnected && !rightBleConnected && !rightBusy && styles.connectBtnDisconnected,
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.connectBtnText,
                            rightBleConnected && styles.connectBtnTextActive,
                            rightBusy && styles.connectBtnTextConnecting,
                            rightJustDisconnected && !rightBleConnected && !rightBusy && styles.connectBtnTextDisconnected,
                        ]}
                    >
                        {rightConnecting ? "RIGHT CONNECTING..." : rightBleConnected ? "RIGHT CONNECTED" : rightReconnectingUI ? "RIGHT RECONNECTING..." : rightJustDisconnected ? "RIGHT DISCONNECTED" : "CONNECT RIGHT"}
                    </Text>
                </Pressable>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE (LEFT)</Text>

                <View style={styles.sendBox}>
                    {!leftBleConnected ? (
                        <Text style={styles.code}>[NOT CONNECTED]</Text>
                    ) : (
                        <View style={styles.sendRow}>
                            <TextInput
                                value={leftMessage}
                                onChangeText={setLeftMessage}
                                placeholder="Type message..."
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
                                <Text style={styles.sendBtnText}>SEND MESSAGE</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.quickBtn,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleSendLeftQuickLPress}
                            >
                                <Text style={styles.quickBtnText}>VIBRATE</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>SEND MESSAGE (RIGHT)</Text>

                <View style={styles.sendBox}>
                    {!rightBleConnected ? (
                        <Text style={styles.code}>[NOT CONNECTED]</Text>
                    ) : (
                        <View style={styles.sendRow}>
                            <TextInput
                                value={rightMessage}
                                onChangeText={setRightMessage}
                                placeholder="Type message..."
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
                                <Text style={styles.sendBtnText}>SEND MESSAGE</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.quickBtn,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleSendRightQuickRPress}
                            >
                                <Text style={styles.quickBtnText}>VIBRATE</Text>
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
    connectBtnDisconnected: {
        backgroundColor: "#ffe3e3",
        borderColor: "#c92a2a",
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
    connectBtnTextDisconnected: {
        color: "#c92a2a",
    },
    sendBox: {
        marginTop: 4,
        marginBottom: 10,
        paddingVertical: 4,
        paddingHorizontal: 0,
        borderWidth: 0,
        borderColor: "transparent",
        borderRadius: 0,
        backgroundColor: "transparent",
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
    quickBtn: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#000",
        marginTop: 6,
        alignItems: "center",
    },
    quickBtnText: {
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
