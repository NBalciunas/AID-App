import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppContext } from "../../../../AppContext";

const SetTarget = () => {
    const { targetData, setTargetData, maps } = useAppContext();

    const mapTypes = useMemo(
        () => Object.keys(maps || {}).sort(),
        [maps]
    );

    const [selectedType, setSelectedType] = useState("");
    const [selectedId, setSelectedId] = useState("");

    const locations = useMemo(
        () => (selectedType && maps?.[selectedType]) ? maps[selectedType] : [],
        [maps, selectedType]
    );

    useEffect(() => {
        if(!maps || mapTypes.length === 0){
            return;
        }
        if(selectedType && selectedId){
            return;
        }

        let typeToUse = mapTypes[0];
        let idToUse = "";

        if(targetData?.location){
            outer: for (const t of mapTypes) {
                const locs = maps[t] || [];
                for(const loc of locs){
                    if(Math.abs(loc.lat - targetData.location.lat) < 1e-6 && Math.abs(loc.lon - targetData.location.lon) < 1e-6){
                        typeToUse = t;
                        idToUse = String(loc.id);
                        break outer;
                    }
                }
            }
        }

        setSelectedType(typeToUse);

        if(idToUse){
            setSelectedId(idToUse);
        }
        else{
            const locs = maps[typeToUse] || [];
            if (locs.length) setSelectedId(String(locs[0].id));
        }
    }, [maps, mapTypes, targetData]);

    useEffect(() => {
        if(!selectedType || !selectedId){
            return;
        }

        const loc = maps?.[selectedType]?.find((l) => String(l.id) === String(selectedId));

        if(loc){
            setTargetData({
                location_name: `${selectedType} – ${loc.id}`,
                location: {
                    id: loc.id,
                    lat: loc.lat,
                    lon: loc.lon,
                    connected_to: loc.connected_to
                }
            });
        }
    }, [selectedType, selectedId, maps, setTargetData]);

    if(!maps || mapTypes.length === 0){
        return(
            <View style={styles.container}>
                <Text>No maps loaded.</Text>
            </View>
        );
    }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Set Target</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerBox}>
                <Picker
                    mode="dropdown"
                    selectedValue={selectedType}
                    onValueChange={(val) => {
                        setSelectedType(val);
                        const locs = maps?.[val] || [];
                        setSelectedId(locs.length ? String(locs[0].id) : "");
                    }}
                    dropdownIconColor="black"
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {mapTypes.map((t) => (
                        <Picker.Item
                            key={t}
                            label={t}
                            value={t}
                            color="black"
                        />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Location</Text>
            <View style={styles.pickerBox}>
                <Picker
                    mode="dropdown"
                    selectedValue={selectedId}
                    onValueChange={(val) => setSelectedId(String(val))}
                    enabled={locations.length > 0}
                    dropdownIconColor="black"
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                >
                    {locations.map((l) => (
                        <Picker.Item
                            key={`${selectedType}-${l.id}`}
                            label={`#${l.id} (${l.lat.toFixed(5)}, ${l.lon.toFixed(5)})`}
                            value={String(l.id)}
                            color="black"
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 18,
        gap: 12,
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 6,
        fontWeight: "500",
    },
    pickerBox: {
        borderWidth: 2,
        borderColor: "black",
        borderRadius: 10,
        overflow: "hidden",
        height: 65,
        justifyContent: "center",
    },
    picker: {
        color: "black",
        height: 65,
        marginTop: -3,
    },
    pickerItem: {
        fontSize: 16,
        color: "black",
        height: 65,
    },
});

export default SetTarget;