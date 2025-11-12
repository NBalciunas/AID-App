import { View, Text } from "react-native";
import { useAppContext } from "../../../../AppContext";

const LocationList = () => {
    const { maps } = useAppContext();

    return(
        <View style={{ padding: 10 }}>
            {Object.entries(maps).map(([type, locations]) => (
                <View key={type} style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                        {type.toUpperCase()}
                    </Text>

                    {locations.map((loc) => (
                        <Text key={`${type}-${loc.id}`}>
                            {loc.id}: ({loc.lat}, {loc.lon}) → {loc.connected_to.join(", ")}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    )
}

export default LocationList;