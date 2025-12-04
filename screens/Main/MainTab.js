import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../AppContext";
import TargetButtons from "../../components/TargetButtons";
import DirectionPointer from "../../components/DirectionPointer";
import NavigationButtons from "../../components/NavigationButtons";
import StopButton from "../../components/StopButton";
import isOnTarget from "../../helpers/isOnTarget";
import { hasNext, setNextLoc } from "../../helpers/setPrevNextLoc"
import determineNextLocDir from "../../helpers/determineNextLocDir";

const MainTab = () => {
    const { targetData, relativeAngle, distanceMeters, coords, maps, setTargetData, heading, bearing } = useAppContext();

    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, 5);
    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;
    const allLocations = maps?.[type] || [];

    React.useEffect(() => {
        if(!onTarget || !targetData?.location){
            return;
        }

        if(!type || !allLocations.length){
            console.warn("Current location not found in maps");
            return;
        }

        alert("Reached target!");
        if(hasNext(allLocations, currentLoc)){
            setNextLoc(type, allLocations, currentLoc, setTargetData);
            const nextLocDir = determineNextLocDir(heading, bearing);
            alert(`Next Target Dir: ${nextLocDir}`);
            // send message to esp32
        }
        else{
            alert("Reached the end!");
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
