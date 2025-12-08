import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../AppContext";
import TargetButtons from "../../components/TargetButtons";
import DirectionPointer from "../../components/DirectionPointer";
import DistanceToTarget from "../../components/DistanceToTarget";
import NavigationButtons from "../../components/NavigationButtons";
import StopButton from "../../components/StopButton";
import isOnTarget from "../../helpers/isOnTarget";
import determineLocDir from "../../helpers/determineLocDir";
import getNextPoint from "../../helpers/getNextPoint";

const MainTab = () => {
    const { targetData, relativeAngle, distanceMeters, coords, maps, setTargetData, heading, bearingToTarget, proximitySensitivity } = useAppContext();

    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, proximitySensitivity);
    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;
    const allLocations = maps?.[type] || [];

    const prevLocIdRef = React.useRef(null);

    React.useEffect(() => {
        if(!onTarget || !currentLoc){
            return;
        }

        if(!type || !allLocations.length){
            console.warn("Current location not found in maps");
            return;
        }

        const nextId = getNextPoint(allLocations, currentLoc.id, prevLocIdRef.current);
        if(!nextId){
            alert("Reached the end!");
            return;
        }

        const nextPoint = allLocations.find((n) => n.id === nextId);
        if(!nextPoint){
            console.warn("Next point not found in map");
            return;
        }

        prevLocIdRef.current = currentLoc.id;

        setTargetData((prev) => ({
            ...prev,
            location: nextPoint,
        }));

        const nextLocDir = determineLocDir(heading, bearingToTarget, 5);
        if(nextLocDir === "R"){
            alert("Turn Right!");
        }
        else if(nextLocDir === "L"){
            alert("Turn Left!");
        }
        else if(nextLocDir === "A"){
            alert("Move Ahead!")
        }
    }, [onTarget]);

    return(
        <View style={styles.container}>
            {!targetData.location ? <TargetButtons /> : null}
            {targetData.location ? <DirectionPointer angle={ Math.round(relativeAngle || 0) } /> : null}
            {targetData.location ? <DistanceToTarget distanceMeters={ distanceMeters } /> : null}
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
