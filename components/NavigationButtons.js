import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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
        <View style={styles.container}>
            <Text style={styles.goalTitle}>
                {targetData.location_name}
            </Text>

            <View style={styles.row}>
                <Pressable
                    onPress={() => setPrevLoc(type, allLocations, currentLoc, setTargetData)}
                    disabled={!canPrev}
                    style={[
                        styles.navButton,
                        !canPrev && styles.disabledButton
                    ]}
                >
                    <Text style={styles.navButtonText}>PREV</Text>
                </Pressable>
                <Pressable
                    onPress={() => setNextLoc(type, allLocations, currentLoc, setTargetData)}
                    disabled={!canNext}
                    style={[
                        styles.navButton,
                        !canNext && styles.disabledButton
                    ]}
                >
                    <Text style={styles.navButtonText}>NEXT</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 20,
        alignItems: "center",
    },
    goalTitle: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 10,
        fontFamily: "Poppins-Bold",
    },
    row: {
        flexDirection: "row",
        gap: 20,
        marginTop: 10,
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 26,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "black",
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "black",
        fontFamily: "Poppins-Bold",
    },
    disabledButton: {
        borderColor: "#bfbfbf",
        opacity: 0.4,
    }
});

export default NavigationButtons;
