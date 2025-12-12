// reik styliu perdaryt, reik viska pagrazint
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, TextInput } from "react-native";
import { useAppContext } from "../../../../AppContext";

const RouteManager = () => {
    const {
        maps,
        addMapFromPhone,
        removeCustomMap,
        reloadMaps,
        clearCustomMaps,
        resetMapsToDefaults,
        pruneDefaults,
    } = useAppContext();

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

    return(
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
                        <Text style={styles.btnText}>CLEAR CUSTOM</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleReset}
                        style={({ pressed }) => [styles.btnAlt, pressed && styles.btnPressed]}
                    >
                        <Text style={styles.btnText}>RESET DEFAULTS</Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={handlePrune}
                    style={({ pressed }) => [styles.btnAltFull, pressed && styles.btnPressed]}
                >
                    <Text style={styles.btnText}>PRUNE OLD DEFAULTS</Text>
                </Pressable>
            </View>

            <View style={styles.block}>
                <Text style={styles.blockTitle}>ROUTES ({Object.keys(maps || {}).length})</Text>

                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search route..."
                    placeholderTextColor="#666"
                    style={styles.input}
                />

                {routeNames.length === 0 ? (
                    <Text style={styles.empty}>No routes found.</Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    content: {
        padding: 14,
        paddingBottom: 40,
    },
    title: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 12,
    },
    block: {
        backgroundColor: "#0b0b0b",
        borderWidth: 1,
        borderColor: "#222",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    blockTitle: {
        color: "#bbb",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 10,
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
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#333",
        alignItems: "center",
    },
    btnAlt: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#090909",
        borderWidth: 1,
        borderColor: "#333",
        alignItems: "center",
    },
    btnAltFull: {
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#090909",
        borderWidth: 1,
        borderColor: "#333",
        alignItems: "center",
    },
    btnPressed: {
        opacity: 0.7,
    },
    btnText: {
        color: "#fff",
        fontWeight: "800",
        letterSpacing: 1,
        fontSize: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#fff",
        backgroundColor: "#050505",
        marginBottom: 10,
    },
    routeRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222",
        backgroundColor: "#050505",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    routeLeft: {
        flex: 1,
        paddingRight: 10,
    },
    routeName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 1,
    },
    routeMeta: {
        color: "#888",
        marginTop: 4,
        fontSize: 12,
    },
    removeBtn: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#3a1f1f",
        backgroundColor: "#120606",
    },
    removeBtnText: {
        color: "#ffb3b3",
        fontWeight: "900",
        letterSpacing: 1,
        fontSize: 12,
    },
    empty: {
        color: "#777",
        paddingVertical: 10,
    },
});

export default RouteManager;
