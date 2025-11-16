import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppContext } from "../AppContext";

const NavigationButtons = () => {
    const { maps, setTargetData } = useAppContext();

    const mapNames = Object.keys(maps || {});

    const selectMap = (name) => {
        const locs = maps[name];
        if(!locs || locs.length === 0){
            return;
        }

        const first = locs[0];

        setTargetData({
            location_name: `${name} – ${first.id}`,
            location: { ...first }
        });
    };

    return(
        <View style={{ padding: 20, gap: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
                Choose where you want to go
            </Text>

            {mapNames.map((name) => (
                <Pressable
                    key={name}
                    onPress={() => selectMap(name)}
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
