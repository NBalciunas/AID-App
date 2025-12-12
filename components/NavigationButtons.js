import React, {useState} from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAppContext } from "../AppContext";
import getNextPoint from "../helpers/getNextPoint";

const distanceSq = (lat1, lon1, lat2, lon2) => {
    const dLat = lat1 - lat2;
    const dLon = lon1 - lon2;
    return dLat * dLat + dLon * dLon;
};

const getPrevPoint = (nodes, currentId) => {
    if(!nodes?.length || currentId == null){
        return null;
    }

    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const current = nodeById.get(currentId);
    const first = nodes[0];
    if(!current || !first){
        return null;
    }

    if(current.id === first.id){
        return null;
    }

    let neighbors = (current.connected_to || []).map(id => nodeById.get(id)).filter(Boolean);

    let bestNeighborId = null;
    let bestDist = Infinity;

    for(const neighbor of neighbors){
        const d = distanceSq(neighbor.lat, neighbor.lon, first.lat, first.lon);
        if(d < bestDist){
            bestDist = d;
            bestNeighborId = neighbor.id;
        }
    }

    return bestNeighborId;
};

const NavigationButtons = () => {
    const { targetData, setTargetData, maps } = useAppContext();

    const type = targetData?.location_name?.split(" – ")?.[0];
    const currentLoc = targetData?.location;
    const allLocations = maps?.[type] || [];

    const nextIdForState = currentLoc ? getNextPoint(allLocations, currentLoc.id) : null;
    const prevIdForState = currentLoc ? getPrevPoint(allLocations, currentLoc.id) : null;

    const canPrev = !!prevIdForState;
    const canNext = !!nextIdForState;

    const [prevPressed, setPrevPressed] = useState(false);
    const [nextPressed, setNextPressed] = useState(false);

    const handlePrev = () => {
        if(!currentLoc || !prevIdForState){
            return;
        }
        const prevPoint = allLocations.find(n => n.id === prevIdForState);
        if(!prevPoint){
            return;
        }
        setTargetData((prev) => ({
            ...prev,
            location: prevPoint,
        }));
    };

    const handleNext = () => {
        if(!currentLoc || !nextIdForState){
            return;
        }
        const nextPoint = allLocations.find(n => n.id === nextIdForState);
        if(!nextPoint){
            return;
        }
        setTargetData((prev) => ({
            ...prev,
            location: nextPoint,
        }));
    };

    return(
        <View style={styles.container}>
            <Text style={styles.goalTitle}>
                {type && currentLoc?.id != null ? `${type} – ${currentLoc.id}` : targetData.location_name}
            </Text>


            <View style={styles.row}>
                <Pressable
                    onPress={handlePrev}
                    onPressIn={() => setPrevPressed(true)}
                    onPressOut={() => setPrevPressed(false)}
                    disabled={!canPrev}
                    style={[
                        styles.navButton,
                        prevPressed && styles.buttonPressed,
                        !canPrev && styles.disabledButton
                    ]}
                >
                    <Text style={styles.navButtonText}>PREV</Text>
                </Pressable>
                <Pressable
                    onPress={handleNext}
                    onPressIn={() => setNextPressed(true)}
                    onPressOut={() => setNextPressed(false)}
                    disabled={!canNext}
                    style={[
                        styles.navButton,
                        nextPressed && styles.buttonPressed,
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
        color: "#000000",
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
    },
    buttonPressed: {
        backgroundColor: "#e0e0e0",
    },
});

export default NavigationButtons;
