import React, { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
                location: null
            });
        }

        setProgress(0);
    };

    return(
        <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={{
                width: 220,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: "#b30000",
                overflow: "hidden",
                marginTop: 20,
            }}
        >
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progress * 100}%`,
                    backgroundColor: progress >= 1 ? "#00aa00" : "#ff4444",
                }}
            />

            <Text
                style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                }}
            >
                {progress >= 1 ? "RELEASE TO STOP" : "HOLD TO STOP"}
            </Text>
        </Pressable>
    );
};

export default StopButton;
