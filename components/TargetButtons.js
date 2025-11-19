import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAppContext } from "../AppContext";
import { chooseMap } from "../helpers/chooseMap";

const NavigationButtons = () => {
    const { maps, setTargetData } = useAppContext();

    const mapNames = Object.keys(maps || {});

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                GO TO:
            </Text>

            <View style={styles.buttonsWrapper}>
                {mapNames.map((name) => (
                    <Pressable
                        key={name}
                        onPress={() => chooseMap(maps, setTargetData, name)}
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {name.toUpperCase()}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        alignItems: "center",
        width: "100%",
        gap: 28,
    },
    title: {
        fontSize: 48,
        fontWeight: "800",
        marginBottom: 10,
    },
    buttonsWrapper: {
        width: "85%",
        gap: 26,
    },
    button: {
        width: "100%",
        paddingVertical: 22,
        borderRadius: 18,
        borderWidth: 4,
        borderColor: "black",
        alignItems: "center",
    },
    buttonPressed: {
        backgroundColor: "#e0e0e0",
    },
    buttonText: {
        fontSize: 28,
        fontWeight: "700",
        color: "black",
        letterSpacing: 1,
    },
});

export default NavigationButtons;
