import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppContext } from "../AppContext";
import { chooseMap } from "../helpers/chooseMap";

const NavigationButtons = () => {
    const { maps, setTargetData } = useAppContext();

    const mapNames = Object.keys(maps || {});

    return (
        <View style={{ padding: 20, gap: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
                GO TO:
            </Text>

            {mapNames.map((name) => (
                <Pressable
                    key={name}
                    onPress={() => chooseMap(maps, setTargetData, name)}
                    style={{
                        paddingVertical: 14,
                        paddingHorizontal: 30,
                        borderRadius: 10,
                        backgroundColor: "#006103",
                        width: "80%",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 20, color: "white" }}>
                        {name.toUpperCase()}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

export default NavigationButtons;
