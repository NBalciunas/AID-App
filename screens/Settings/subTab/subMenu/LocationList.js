import { View, Text, StyleSheet } from "react-native";
import { useAppContext } from "../../../../AppContext";

const LocationList = () => {
    const { maps } = useAppContext();

    return(
        <View style={styles.container}>
            {Object.entries(maps).map(([type, locations]) => (
                <View key={type} style={styles.block}>
                    <Text style={styles.header}>
                        {type.toUpperCase()}
                    </Text>

                    {locations.map((loc) => (
                        <Text key={`${type}-${loc.id}`} style={styles.location}>
                            {loc.id}: ({loc.lat}, {loc.lon}) -> {loc.connected_to.join(", ")}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    block: {
        marginBottom: 16,
    },
    header: {
        fontSize: 16,
        marginBottom: 4,
        fontFamily: "Poppins-Bold",
    },
    location: {
        fontSize: 14,
        marginVertical: 2,
        fontFamily: "Poppins-Regular",
    },
});

export default LocationList;