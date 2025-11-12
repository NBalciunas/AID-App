import React, { useMemo, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAppContext } from "../../../../AppContext";

const SetTarget = () => {
    const { setTargetData, maps } = useAppContext();

    const mapTypes = useMemo(() => Object.keys(maps || {}).sort(), [maps]);
    const [selectedType, setSelectedType] = useState(mapTypes[0] || "");
    const locations = useMemo(() => (selectedType && maps?.[selectedType]) ? maps[selectedType] : [], [maps, selectedType]);
    const [selectedId, setSelectedId] = useState(locations.length ? String(locations[0].id) : "");

    useEffect(() => {
        if(locations.length){
            setSelectedId(String(locations[0].id));
        }
        else{
            setSelectedId("");
        }
    }, [locations]);

    useEffect(() => {
        if (!selectedId) return;
        const loc = locations.find(l => String(l.id) === String(selectedId));
        if(loc){
            setTargetData({ lat: loc.lat, lon: loc.lon });
        }
    }, [selectedId, locations, setTargetData]);

    if(!maps || mapTypes.length === 0){
        return(
            <View style={{ padding: 12 }}>
                <Text>No maps loaded.</Text>
            </View>
        );
    }

    return(
        <View style={{ padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: "600", fontSize: 16 }}>Set Target</Text>

            <Text style={{ marginTop: 8 }}>Category</Text>
            <Picker
                selectedValue={selectedType}
                onValueChange={(val) => setSelectedType(val)}
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