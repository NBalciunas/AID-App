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

const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

const computeBearing = (fromCoords, toLoc) => {
    if(!fromCoords || !toLoc){
        return null;
    }

    const Phi1 = toRad(fromCoords.latitude);
    const Phi2 = toRad(toLoc.lat);
    const dLambda = toRad(toLoc.lon - fromCoords.longitude);

    const y = Math.sin(dLambda) * Math.cos(Phi2);
    const x = Math.cos(Phi1) * Math.sin(Phi2) - Math.sin(Phi1) * Math.cos(Phi2) * Math.cos(dLambda);

    const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
    return brng;
};

const MainTab = () => {
    const { targetData, relativeAngle, distanceMeters, coords, maps, setTargetData, heading, bearingToTarget, proximitySensitivity, leftBleConnected, rightBleConnected, sendLeftBleMessage, sendRightBleMessage } = useAppContext();

    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, proximitySensitivity);
    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;
    const allLocations = maps?.[type] || [];

    const prevLocIdRef = React.useRef(null);

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
            (async () => {
                try{
                    await Promise.all([
                        leftBleConnected ? sendLeftBleMessage("L") : Promise.resolve(),
                        rightBleConnected ? sendRightBleMessage("R") : Promise.resolve(),
                    ]);
                }
                catch(e){}
            })();

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

        if(!coords || heading == null){
            return;
        }

        const nextBearing = computeBearing(coords, nextPoint);
        const nextLocDir = determineLocDir(heading, nextBearing, 5);

        if(nextLocDir === "R"){
            if(rightBleConnected){
                sendRightBleMessage("R");
            }
            else{
                alert("Turn RIGHT (Right bracelet not connected)")
            }
        }
        else if(nextLocDir === "L"){
            if(leftBleConnected){
                sendLeftBleMessage("L");
            }
            else{
                alert("Turn LEFT (Left bracelet not connected)")
            }
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
