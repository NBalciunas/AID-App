import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../AppContext";
import TargetButtons from "../../components/TargetButtons";
import DirectionPointer from "../../components/DirectionPointer";
import NavigationButtons from "../../components/NavigationButtons";
import StopButton from "../../components/StopButton";
import isOnTarget from "../../helpers/isOnTarget";
import { hasNext, setNextLoc } from "../../helpers/setPrevNextLoc"

const MainTab = () => {
    const { targetData, relativeAngle, distanceMeters, coords } = useAppContext();

    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, 5);
    React.useEffect(() => {
        if(onTarget){
            alert("Reached target!");
            if(hasNext){
                setNextLoc();
                // determine next target direction (left or right)
                // send message to esp32
            }
            else{
                alert("Reached the end!");
            }
        }
    }, [onTarget]);

    return(
        <View style={styles.container}>
            {/* NAVIGATION OFF */}
            {!targetData.location ? <TargetButtons /> : null}

            {/* NAVIGATION ON */}
            {targetData.location ? <DirectionPointer angle={ Math.round(relativeAngle || 0) } /> : null}
            {targetData.location ? <NavigationButtons /> : null}
            {targetData.location ? <StopButton /> : null}
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
