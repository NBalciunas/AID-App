import React, { useMemo, useState, useEffect } from "react";
import { View, Text } from "react-native";
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
        if (!maps || mapTypes.length === 0) return;

        if (selectedType && selectedId) return;

        let typeToUse = mapTypes[0];
        let idToUse = "";

        if (targetData?.location) {
            outer: for (const t of mapTypes) {
                const locs = maps[t] || [];
                for (const loc of locs) {
                    if (
                        Math.abs(loc.lat - targetData.location.lat) < 1e-6 &&
                        Math.abs(loc.lon - targetData.location.lon) < 1e-6
                    ) {
                        typeToUse = t;
                        idToUse = String(loc.id);
                        break outer;
                    }
                }
            }
        }

        setSelectedType(typeToUse);

        if (idToUse) {
            setSelectedId(idToUse);
        } else {
            const locs = maps[typeToUse] || [];
            if (locs.length) setSelectedId(String(locs[0].id));
        }
    }, [maps, mapTypes, targetData, selectedType, selectedId]);

    useEffect(() => {
        if (!selectedType || !selectedId) return;

        const loc = maps?.[selectedType]?.find(
            (l) => String(l.id) === String(selectedId)
        );

        if (loc) {
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

    if (!maps || mapTypes.length === 0) {
        return (
            <View style={{ padding: 12 }}>
                <Text>No maps loaded.</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "600", fontSize: 16 }}>Set Target</Text>

            <Text style={{ marginTop: 8 }}>Category</Text>
            <Picker
                selectedValue={selectedType}
                onValueChange={(val) => {
                    setSelectedType(val);
                    const locs = maps?.[val] || [];
                    setSelectedId(locs.length ? String(locs[0].id) : "");
                }}
            >
                {mapTypes.map((t) => (
                    <Picker.Item key={t} label={t} value={t} />
                ))}
            </Picker>

            <Text>Location</Text>
            <Picker
                selectedValue={selectedId}
                onValueChange={(val) => setSelectedId(String(val))}
                enabled={locations.length > 0}
            >
                {locations.map((l) => (
                    <Picker.Item
                        key={`${selectedType}-${l.id}`}
                        label={`#${l.id} (${l.lat.toFixed(5)}, ${l.lon.toFixed(5)})`}
                        value={String(l.id)}
                    />
                ))}
            </Picker>
        </View>
    );
};

export default SetTarget;
