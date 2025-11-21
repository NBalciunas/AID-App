import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppContext } from "../../../../AppContext";
import DirectionPointer from "../../../../components/DirectionPointer";

const Compass = () => {
    const { heading, headingLabel } = useAppContext();

    const hasInfo = heading != null && headingLabel;

    return(
        <View style={styles.container}>
            <Text style={styles.headingText}>
                {hasInfo ? `Heading: ${heading.toFixed(1)}° (${headingLabel})` : "Heading: [NO INFO]"}
            </Text>

            <DirectionPointer angle={hasInfo ? Math.round(heading) : 0}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    headingText: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 18,
        textAlign: "center",
    },
});

export default Compass;