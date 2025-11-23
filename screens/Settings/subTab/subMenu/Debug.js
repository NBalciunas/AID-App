import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";
import setTarget from "../../../../helpers/setTarget";
import DirectionPointer from "../../../../components/DirectionPointer";

const Debug = () => {
    const { maps, targetData, setTargetData, coords, bearingToTarget, relativeAngle, distanceMeters, heading, headingLabel } = useAppContext();
    const types = Object.keys(maps || {});
    const [type, setTypeState] = React.useState(types[0] || "");
    const [locId, setLocId] = React.useState("");
    const [expandType, setExpandType] = React.useState(true);
    const [expandLoc, setExpandLoc] = React.useState(true);
    const locations = maps?.[type] || [];
    const hasInfo = heading != null && headingLabel;

    React.useEffect(() => {
        if(!types.length){
            return;
        }

        let chosenType = types[0];
        let chosenId = "";

        if(targetData?.location){
            for(const t of types){
                const match = maps[t]?.find(
                    (l) =>
                        l.lat === targetData.location.lat &&
                        l.lon === targetData.location.lon
                );
                if(match){
                    chosenType = t;
                    chosenId = String(match.id);
                    break;
                }
            }
        }

        if(!chosenId){
            chosenId = String(maps[chosenType][0].id);
        }

        setTypeState(chosenType);
        setLocId(chosenId);
        setTarget(maps, chosenType, chosenId, setTargetData);
    }, [maps]);

    const onChangeType = (t) => {
        const first = maps[t][0];
        setTypeState(t);
        setLocId(String(first.id));
        setTarget(maps, t, first.id, setTargetData);
    };

    const onChangeLocation = (id) => {
        setLocId(String(id));
        setTarget(maps, type, id, setTargetData);
    };

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.title}>DEBUG</Text>

            {/* ---------------------- GPS ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>GPS</Text>
                {coords ? (
                    <Text style={styles.code}>
                        Lat: {coords.latitude?.toFixed(6)}{"\n"}
                        Lon: {coords.longitude?.toFixed(6)}{"\n"}
                        Speed: {(coords.speed * 3.6 || 0).toFixed(2)} km/h{"\n"}
                        Accuracy: ±{coords.accuracy?.toFixed(2)} m
                    </Text>
                ) : (
                    <Text style={styles.code}>Waiting for GPS...</Text>
                )}
            </View>

            {/* ---------------------- HEADING ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>HEADING</Text>
                <Text style={styles.code}>
                    Compass: {heading != null ? `${heading.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                    Label: {headingLabel || "[NO INFO]"}
                </Text>
            </View>

            {/* ---------------------- COMPASS ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>COMPASS</Text>
                <View style={styles.compassWrapper}>
                    <DirectionPointer angle={hasInfo ? ((360 - Math.round(heading)) % 360) : 0} />
                </View>
            </View>

            {/* ---------------------- TARGET ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>TARGET</Text>
                {targetData?.location ? (
                    <Text style={styles.code}>
                        Name: {targetData.location_name}{"\n"}
                        Lat: {targetData.location.lat}{"\n"}
                        Lon: {targetData.location.lon}{"\n"}
                        Bearing: {bearingToTarget?.toFixed(1)}°{"\n"}
                        Relative: {relativeAngle?.toFixed(1)}°{"\n"}
                        Distance: {distanceMeters?.toFixed(3)} m
                    </Text>
                ) : (
                    <Text style={styles.code}>[NO TARGET SELECTED]</Text>
                )}
            </View>

            {/* ---------------------- LOCATION LIST ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>LOCATIONS</Text>
                {Object.entries(maps).map(([t, locs]) => (
                    <View key={t} style={{ marginBottom: 12 }}>
                        <Text style={styles.subheader}>{t.toUpperCase()}</Text>
                        {locs.map((l) => (
                            <Text key={`${t}-${l.id}`} style={styles.code}>
                                {l.id}: ({l.lat}, {l.lon}) -> {l.connected_to.join(", ")}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>

            {/* ---------------------- SET TARGET ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>SET TARGET</Text>

                {/* CATEGORY */}
                <Text style={styles.blockTitle}>CATEGORY</Text>
                <View style={styles.frameBox}>
                    <Picker
                        selectedValue={type}
                        onValueChange={onChangeType}
                        style={styles.picker}
                    >
                        {types.map((t) => (
                            <Picker.Item key={t} label={t} value={t} color="black" />
                        ))}
                    </Picker>
                </View>

                {/* LOCATION */}
                <Text style={styles.blockTitle}>LOCATION</Text>
                <View style={styles.frameBox}>
                    <Picker
                        selectedValue={locId}
                        onValueChange={onChangeLocation}
                        style={styles.picker}
                    >
                        {locations.map((l) => (
                            <Picker.Item
                                key={`${type}-${l.id}`}
                                label={`#${l.id} (${l.lat.toFixed(5)}, ${l.lon.toFixed(5)})`}
                                value={String(l.id)}
                                color="black"
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <StatusBar style="auto" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    block: {
        marginBottom: 24,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#000",
        borderRadius: 12,
        backgroundColor: "#fafafa",
    },
    blockTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
    },
    code: {
        fontSize: 14,
        fontFamily: "monospace",
        lineHeight: 20,
    },
    compassWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
    },
    frameBox: {
        borderWidth: 1.5,
        borderColor: "#000",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginBottom: 12,
    },
    picker: {
        height: 55,
        fontFamily: "monospace",
        color: "black",
    },
    subheader: {
        fontSize: 14,
        marginBottom: 4,
        fontFamily: "monospace",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        fontFamily: "Poppins-Bold",
    },
});

export default Debug;
