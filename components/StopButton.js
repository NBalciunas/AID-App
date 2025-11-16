import React from "react";
import { Pressable, Text } from "react-native";
import { useAppContext } from "../AppContext";

const StopButton = () => {
    const { setTargetData } = useAppContext();

    const stop = () => {
        setTargetData({
            location_name: "",
            location: null
        });
    };

    return (
        <Pressable
            onPress={stop}
            style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: "#b30000",
                alignSelf: "center",
                marginTop: 20
            }}
        >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
                STOP
            </Text>
        </Pressable>
    );
};

export default StopButton;
