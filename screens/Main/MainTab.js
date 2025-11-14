import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../AppContext";
import DirectionPointer from "../../components/DirectionPointer";
import NavigationButtons from "../../components/NavigationButtons";

const MainTab = () => {
    const { relativeAngle } = useAppContext();
    return(
        <View style={styles.container}>
            <DirectionPointer angle={ Math.round(relativeAngle || 0) } />
            <NavigationButtons />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20 },
});

export default MainTab;
