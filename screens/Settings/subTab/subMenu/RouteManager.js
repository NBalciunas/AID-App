import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppContext } from "../../../../AppContext";

const RouteManager = () => {
    const { maps, addMapFromPhone, removeCustomMap, reloadMaps, clearCustomMaps, resetMapsToDefaults, pruneDefaults } = useAppContext();

    const [query, setQuery] = useState("");

    const routeNames = useMemo(() => {
        const names = Object.keys(maps || {}).sort((a, b) => a.localeCompare(b));
        const q = query.trim().toLowerCase();
        if(!q){
            return names;
        }
        return names.filter((n) => n.toLowerCase().includes(q));
    }, [maps, query]);

    const getRouteInfo = (name) => {
        const data = maps?.[name];
        if(Array.isArray(data)){
            return `${data.length} nodes`;
        }
        if(data && typeof data === "object"){
            if(Array.isArray(data.nodes)){
                return `${data.nodes.length} nodes`;
            }
            return "object";
        }
        return "unknown";
    };

    const handleImport = async () => {
        try{
            await addMapFromPhone();
        }
        catch(e){
            Alert.alert("Import failed", e?.message || String(e));
        }
    };

    const handleRemove = (name) => {
        Alert.alert(
            "Remove route?",
            `"${name}" will be removed (if it is a custom/imported route).`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try{
                            await removeCustomMap(name);
                        }
                        catch(e){
                            Alert.alert("Remove failed", e?.message || String(e));
                        }
                    },
                },
            ]
        );
    };

    const handleClearCustom = () => {
        Alert.alert(
            "Clear custom routes?",
            "This will delete all imported routes.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try{
                            await clearCustomMaps();
                        }
                        catch(e){
                            Alert.alert("Clear failed", e?.message || String(e));
                        }
                    },
                },
            ]
        );
    };

    const handleReset = () => {
        Alert.alert(
            "Reset routes to defaults?",
            "This will remove all cached routes and restore only the defaults shipped with the app.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try{
                            await resetMapsToDefaults();
                        }
                        catch(e){
                            Alert.alert("Reset failed", e?.message || String(e));
                        }
                    },
                },
            ]
        );
    };

    const handlePrune = async () => {
        try{
            await pruneDefaults();
        }
        catch(e){
            Alert.alert("Prune failed", e?.message || String(e));
        }
    };

    const handleReload = async () => {
        try{
            await reloadMaps();
        }
        catch(e){
            Alert.alert("Reload failed", e?.message || String(e));
        }
    };

    const totalRoutes = Object.keys(maps || {}).length;

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.title}>ROUTE MANAGER</Text>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>ACTIONS</Text>

                <View style={styles.row}>
                    <Pressable
                        onPress={handleImport}
                        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                    >
                        <Text style={styles.btnText}>IMPORT JSON</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleReload}
                        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                    >
                        <Text style={styles.btnText}>RELOAD</Text>
                    </Pressable>
                </View>

                <View style={styles.row}>
                    <Pressable
                        onPress={handleClearCustom}
                        style={({ pressed }) => [styles.btnAlt, pressed && styles.btnPressed]}
                    >
                        <Text style={styles.btnAltText}>CLEAR CUSTOM</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleReset}
                        style={({ pressed }) => [styles.btnAlt, pressed && styles.btnPressed]}
                    >
                        <Text style={styles.btnAltText}>RESET DEFAULTS</Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={handlePrune}
                    style={({ pressed }) => [styles.btnAltFull, pressed && styles.btnPressed]}
                >
                    <Text style={styles.btnAltText}>PRUNE OLD DEFAULTS</Text>
                </Pressable>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>ROUTES</Text>
                <Text style={styles.subheader}>TOTAL: {totalRoutes}</Text>

                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search route..."
                    placeholderTextColor="#777"
                    style={styles.input}
                />

                {routeNames.length === 0 ? (
                    <Text style={styles.code}>No routes found.</Text>
                ) : (
                    routeNames.map((name) => (
                        <View key={name} style={styles.routeRow}>
                            <View style={styles.routeLeft}>
                                <Text style={styles.routeName}>{name}</Text>
                                <Text style={styles.routeMeta}>{getRouteInfo(name)}</Text>
                            </View>

                            <Pressable
                                onPress={() => handleRemove(name)}
                                style={({ pressed }) => [styles.removeBtn, pressed && styles.btnPressed]}
                            >
                                <Text style={styles.removeBtnText}>REMOVE</Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </View>

            <StatusBar style="auto" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 24,
        backgroundColor: "#ffffff",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        fontFamily: "Poppins-Bold",
        color: "#000000",
    },
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
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
        color: "#000000",
    },
    subheader: {
        fontSize: 14,
        marginBottom: 10,
        fontFamily: "monospace",
        color: "#000000",
    },
    code: {
        fontSize: 14,
        fontFamily: "monospace",
        lineHeight: 20,
        color: "#000000",
    },
    row: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        borderWidth: 1.5,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    btnAlt: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#fafafa",
        borderWidth: 1.5,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    btnAltFull: {
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#fafafa",
        borderWidth: 1.5,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    btnPressed: {
        backgroundColor: "#eaeaea",
    },
    btnText: {
        color: "#000000",
        fontWeight: "700",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
        fontSize: 12,
        textTransform: "uppercase",
    },
    btnAltText: {
        color: "#000000",
        fontWeight: "700",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
        fontSize: 12,
        textTransform: "uppercase",
    },
    input: {
        borderWidth: 1.5,
        borderColor: "#000000",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#000000",
        backgroundColor: "#ffffff",
        marginBottom: 12,
        fontFamily: "monospace",
    },
    routeRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#000000",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    routeLeft: {
        flex: 1,
        paddingRight: 10,
    },
    routeName: {
        color: "#000000",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.2,
        fontFamily: "Poppins-Bold",
    },
    routeMeta: {
        color: "#000000",
        marginTop: 4,
        fontSize: 12,
        fontFamily: "monospace",
    },
    removeBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#000000",
        backgroundColor: "#fafafa",
        alignItems: "center",
        justifyContent: "center",
    },
    removeBtnText: {
        color: "#000000",
        fontWeight: "700",
        letterSpacing: 0.5,
        fontFamily: "Poppins-Bold",
        fontSize: 12,
        textTransform: "uppercase",
    },
});

export default RouteManager;
