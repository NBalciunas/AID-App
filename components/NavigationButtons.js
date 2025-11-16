import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAppContext } from "../AppContext";
import { hasPrev, hasNext, setPrevLoc, setNextLoc } from "../helpers/setPrevNextLoc";

const NavigationButtons = () => {
    const { targetData, setTargetData, maps } = useAppContext();

    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;

    const allLocations = maps?.[type] || [];

    const canPrev = hasPrev(allLocations, currentLoc);
    const canNext = hasNext(allLocations, currentLoc);

    return (
        <View style={{ padding: 16, gap: 12, alignItems: "center" }}>

            <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>
                Current goal: {targetData.location_name}
            </Text>

            <Text style={{ fontSize: 16, textAlign: "center" }}>
                {canNext ? `Next goal available` : "End"}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 10 }}>

                <Pressable
                    onPress={() => setPrevLoc(type, allLocations, currentLoc, setTargetData)}
                    disabled={!canPrev}
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 6,
                        backgroundColor: canPrev ? "#006103" : "#80a380",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16 }}>PREV</Text>
                </Pressable>

                <Pressable
                    onPress={() => setNextLoc(type, allLocations, currentLoc, setTargetData)}
                    disabled={!canNext}
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 6,
                        backgroundColor: canNext ? "#006103" : "#80a380",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16 }}>NEXT</Text>
                </Pressable>

            </View>

        </View>
    );
};

export default NavigationButtons;
