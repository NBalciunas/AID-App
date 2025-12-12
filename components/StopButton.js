import React, { useRef, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useAppContext } from "../AppContext";

const HOLD_TIME = 1000;

const StopButton = () => {
    const { setTargetData } = useAppContext();

    const timer = useRef(null);
    const isReady = useRef(false);
    const [progress, setProgress] = useState(0);

    const clearTimer = () => {
        if(timer.current){
            clearInterval(timer.current);
            timer.current = null;
        }
    };

    const onPressIn = () => {
        clearTimer();
        setProgress(0);
        isReady.current = false;

        const start = Date.now();

        timer.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const p = Math.min(elapsed / HOLD_TIME, 1);
            setProgress(p);

            if(p >= 1){
                isReady.current = true;
            }
        }, 16);
    };

    const onPressOut = () => {
        clearTimer();
        if(isReady.current){
            setTargetData({
                location_name: "",
                location: null,
            });
        }
        setProgress(0);
    };

    return(
        <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={styles.button}
        >
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${progress * 100}%`,
                        backgroundColor: progress >= 1 ? "#a40000" : "#ff6666",
                    },
                ]}
            />
            <Text style={styles.buttonText}>
                {progress >= 1 ? "RELEASE TO STOP" : "HOLD TO STOP"}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 230,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#cc0000",
        backgroundColor: "#ffe5e5",
        overflow: "hidden",
        marginTop: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    progressFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#660000",
        textAlign: "center",
        fontFamily: "Poppins-Bold",
    },
});

export default StopButton;