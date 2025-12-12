import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";
import setTarget from "../../../../helpers/setTarget";
import isOnTarget from "../../../../helpers/isOnTarget";
import determineLocDir from "../../../../helpers/determineLocDir";
import DirectionPointer from "../../../../components/DirectionPointer";

const Debug = () => {
    const { maps, targetData, setTargetData, coords, bearingToTarget, relativeAngle, distanceMeters, heading, headingLabel, proximitySensitivity, setProximitySensitivity } = useAppContext();
    const types = Object.keys(maps || {});
    const [type, setTypeState] = React.useState(types[0] || "");
    const [locId, setLocId] = React.useState("");
    const locations = Array.isArray(maps?.[type]) ? maps[type] : [];
    const hasInfo = heading != null && headingLabel;
    const onTarget = isOnTarget(distanceMeters, coords?.accuracy, proximitySensitivity);
    const SENSITIVITY_OPTIONS = [3, 5, 10, 15, 20, 30, 40, 50];
    const locDir = determineLocDir(heading, bearingToTarget, 5);

    const locationsEmpty = types.length === 0 || Object.entries(maps || {}).length === 0;

    React.useEffect(() => {
        if(!types.length){
            setTypeState("");
            setLocId("");
            return;
        }

        let chosenType = types[0];
        let chosenId = "";

        if(targetData?.location){
            for(const t of types){
                const arr = Array.isArray(maps?.[t]) ? maps[t] : [];
                const match = arr.find(
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

        const firstArr = Array.isArray(maps?.[chosenType]) ? maps[chosenType] : [];
        if(!chosenId && firstArr.length){
            chosenId = String(firstArr[0].id);
        }

        setTypeState(chosenType);
        setLocId(chosenId);

        if(chosenId){
            setTarget(maps, chosenType, chosenId, setTargetData);
        }
    }, [maps]);

    const onChangeType = (t) => {
        const arr = Array.isArray(maps?.[t]) ? maps[t] : [];
        setTypeState(t);

        if(!arr.length){
            setLocId("");
            return;
        }

        const first = arr[0];
        setLocId(String(first.id));
        setTarget(maps, t, first.id, setTargetData);
    };

    const onChangeLocation = (id) => {
        setLocId(String(id));

        if(!type || !id){
            return;
        }

        const arr = Array.isArray(maps?.[type]) ? maps[type] : [];
        if(!arr.length){
            return;
        }

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

            {/* ---------------------- COMPASS ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>COMPASS</Text>
                <Text style={styles.code}>
                    Heading: {heading != null ? `${heading.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                    Label: {headingLabel || "[NO INFO]"}
                </Text>
            </View>

            {/* ---------------------- POINTER ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>DIRECTION POINTER</Text>
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
                        Bearing: {bearingToTarget != null ? `${bearingToTarget.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                        Relative: {relativeAngle != null ? `${relativeAngle.toFixed(1)}°` : "[NO INFO]"}{"\n"}
                        Distance: {distanceMeters != null ? `${distanceMeters.toFixed(1)} m` : "[NO INFO]"}
                    </Text>
                ) : (
                    <Text style={styles.code}>[NO TARGET SELECTED]</Text>
                )}
            </View>

            {/* ---------------------- ON TARGET? ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>ON TARGET?</Text>
                <Text style={styles.code}>
                    {onTarget ? "YES (inside target radius)" : "NO (outside target radius)"}
                </Text>
            </View>

            {/* ---------------------- SENSITIVITY ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>SET SENSITIVITY</Text>
                <View style={styles.frameBox}>
                    <Picker
                        selectedValue={proximitySensitivity}
                        onValueChange={setProximitySensitivity}
                        style={styles.picker}
                        dropdownIconColor="#000000"
                    >
                        {SENSITIVITY_OPTIONS.map((v) => (
                            <Picker.Item key={v} label={`${v} m`} value={v} />
                        ))}
                    </Picker>
                </View>
            </View>


            {/* ---------------------- LOCATION DIRECTION ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>LOCATION DIRECTION</Text>
                <Text style={styles.code}>
                    Direction : {locDir === "A" ? "Ahead" : locDir === "R" ? "Right" : locDir === "L" ? "Left" : locDir}
                </Text>
            </View>

            {/* ---------------------- LOCATION LIST ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>LOCATION LIST</Text>

                {locationsEmpty ? (
                    <Text style={styles.code}>[EMPTY]</Text>
                ) : (
                    Object.entries(maps || {}).map(([t, locs]) => (
                        <View key={t} style={{ marginBottom: 12 }}>
                            <Text style={styles.subheader}>{t.toUpperCase()}</Text>
                            {(Array.isArray(locs) ? locs : []).map((l) => (
                                <Text key={`${t}-${l.id}`} style={styles.code}>
                                    {l.id}: ({l.lat}, {l.lon}) -> {l.connected_to.join(", ")}
                                </Text>
                            ))}
                        </View>
                    ))
                )}
            </View>

            {/* ---------------------- SET TARGET ---------------------- */}
            <View style={styles.block}>
                <Text style={styles.blockTitle}>SET TARGET</Text>

                {locationsEmpty ? (
                    <Text style={styles.code}>[EMPTY]</Text>
                ) : (
                    <>
                        <Text style={styles.subheader}>CATEGORY</Text>
                        <View style={styles.frameBox}>
                            <Picker
                                selectedValue={type}
                                onValueChange={onChangeType}
                                style={styles.picker}
                                dropdownIconColor="#000000"
                            >
                                {types.map((t) => (
                                    <Picker.Item key={t} label={t} value={t} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.subheader}>LOCATION</Text>
                        <View style={styles.frameBox}>
                            <Picker
                                selectedValue={locId}
                                onValueChange={onChangeLocation}
                                style={styles.picker}
                                dropdownIconColor="#000000"
                                enabled={locations.length > 0}
                            >
                                {locations.map((l) => (
                                    <Picker.Item
                                        key={`${type}-${l.id}`}
                                        label={`#${l.id} (${l.lat.toFixed(5)}, ${l.lon.toFixed(5)})`}
                                        value={String(l.id)}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </>
                )}
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
        borderColor: "#000000",
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
        color: "#000000",
    },
    code: {
        fontSize: 14,
        fontFamily: "monospace",
        lineHeight: 20,
        color: "#000000",
    },
    compassWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 24,
        backgroundColor: "#ffffff",
    },
    frameBox: {
        borderWidth: 1.5,
        borderColor: "#000000",
        borderRadius: 10,
        backgroundColor: "#ffffff",
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
        color: "#000000",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        fontFamily: "Poppins-Bold",
        color: "#000000",
    },
});

export default Debug;
