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
import isOffCourse from "../../helpers/isOffCourse";

const MainTab = () => {
    const { targetData, relativeAngle, distanceMeters, coords, maps, setTargetData, heading, bearingToTarget, proximitySensitivity } = useAppContext();

    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, proximitySensitivity);
    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;
    const allLocations = maps?.[type] || [];

    const prevLocIdRef = React.useRef(null);

    // REACHED TARGET -> go to next point
    React.useEffect(() => {
        if(!onTarget || !currentLoc || !allLocations.length){
            return;
        }

        if(!type){
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
            // msg to esp32 here
        }
        else if(nextLocDir === "L"){
            alert("Turn Left!");
            // msg to esp32 here
        }
        else if(nextLocDir === "A"){
            alert("Move Ahead!");
        }
    }, [onTarget]);

    React.useEffect(() => {
        if(!currentLoc || !coords || !allLocations.length){
            return;
        }

        const { offCourse, snappedNode } = isOffCourse(
            allLocations,
            currentLoc.id,
            coords,
            heading,
            proximitySensitivity,
            prevLocIdRef.current
        );

        if(!offCourse || !snappedNode || snappedNode.id === currentLoc.id){
            return;
        }

        prevLocIdRef.current = currentLoc.id;

        setTargetData((prev) => ({
            ...prev,
            location: snappedNode,
        }));

        alert("You left the planned path. Snapping to nearest point.");
    }, [coords, heading, currentLoc, allLocations, proximitySensitivity]);

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
        padding: 12,
    },
});

export default MainTab;
