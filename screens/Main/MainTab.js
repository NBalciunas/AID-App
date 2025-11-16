import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../AppContext";
import TargetButtons from "../../components/TargetButtons";
import DirectionPointer from "../../components/DirectionPointer";
import NavigationButtons from "../../components/NavigationButtons";

const MainTab = () => {
    const { targetData, relativeAngle } = useAppContext();

    return(
        <View style={styles.container}>
            {/* NAVIGATION OFF */}
            {!targetData.location ? <TargetButtons /> : null}

            {/* NAVIGATION ON */}
            {targetData.location ? <DirectionPointer angle={ Math.round(relativeAngle || 0) } /> : null}
            {targetData.location ? <NavigationButtons /> : null}
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
