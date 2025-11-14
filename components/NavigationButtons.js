import React, { useMemo } from "react";
import {View, Text, Pressable} from "react-native";
import { useAppContext } from "../AppContext";

const NavigationButtons = () => {
    const { targetData, setTargetData, maps } = useAppContext();

    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;

    const allLocations = maps?.[type] || [];

    const { index, prevLoc, nextLoc } = useMemo(() => {
        const i = allLocations.findIndex(l => l.id === currentLoc?.id);

        return{
            index: i,
            prevLoc: i > 0 ? allLocations[i - 1] : null,
            nextLoc: i >= 0 && i < allLocations.length - 1 ? allLocations[i + 1] : null
        };
    }, [allLocations, currentLoc]);

    const setLoc = (loc) => {
        setTargetData({
            location_name: `${type} – ${loc.id}`,
            location: { ...loc }
        });
    };

    if(!currentLoc){
        return null;
    }

    return (
        <View style={{ padding: 16, gap: 12, alignItems: "center" }}>

            <Text style={{ fontSize: 18, textAlign: "center", fontWeight: "600" }}>
                Current goal: {targetData.location_name}
            </Text>

            <Text style={{ fontSize: 16, textAlign: "center" }}>
                {nextLoc ? `Next goal:  ${type} – ${nextLoc.id}` : "End"}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 10 }}>

                <Pressable
                    onPress={() => prevLoc && setLoc(prevLoc)}
                    disabled={!prevLoc}
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 6,
                        backgroundColor: prevLoc ? "#006103" : "#80a380", // disabled = greyed green
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16 }}>PREV</Text>
                </Pressable>

                <Pressable
                    onPress={() => nextLoc && setLoc(nextLoc)}
                    disabled={!nextLoc}
                    style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 6,
                        backgroundColor: nextLoc ? "#006103" : "#80a380",
                    }}
                >
                    <Text style={{ color: "white", fontSize: 16 }}>NEXT</Text>
                </Pressable>

            </View>

        </View>
    );
};

export default NavigationButtons;
