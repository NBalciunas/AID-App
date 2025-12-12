import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import defaults from "../assets/maps";

const ROOT = FileSystem.documentDirectory + "maps/";
const DEFAULT_DIR = ROOT + "default/";
const CUSTOM_DIR = ROOT + "custom/";

const ensureDir = async (dir) => {
    const info = await FileSystem.getInfoAsync(dir);
    if(!info.exists){
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
}

const safeBaseName = (name) => {
    return String(name || "map").replace(/\.json$/i, "").replace(/[^a-zA-Z0-9._ -]/g, "_").trim().slice(0, 80) || "map";
}

const loadDir = async (dir) => {
    const info = await FileSystem.getInfoAsync(dir);
    if(!info.exists){
        return {};
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    const out = {};

    for(const f of files){
        if(!f.endsWith(".json")){
            continue;
        }
        try{
            const raw = await FileSystem.readAsStringAsync(dir + f);
            out[f.replace(/\.json$/i, "")] = JSON.parse(raw);
        }
        catch{
            // skip broken json
        }
    }

    return out;
}

const initMapsStorage = async () => {
    await ensureDir(DEFAULT_DIR);
    await ensureDir(CUSTOM_DIR);

    for(const m of defaults){
        const path = DEFAULT_DIR + m.name + ".json";
        const info = await FileSystem.getInfoAsync(path);
        if(!info.exists){
            await FileSystem.writeAsStringAsync(path, JSON.stringify(m.data));
        }
    }
}

const loadAllMaps = async () => {
    await initMapsStorage();
    const def = await loadDir(DEFAULT_DIR);
    const cus = await loadDir(CUSTOM_DIR);
    return { ...def, ...cus };
}

const importCustomMap = async () => {
    await initMapsStorage();

    const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
        multiple: false,
    });

    if(res.canceled){
        return null;
    }

    const file = res.assets[0];
    const raw = await FileSystem.readAsStringAsync(file.uri);
    JSON.parse(raw);

    const base = safeBaseName(file.name);
    await FileSystem.writeAsStringAsync(CUSTOM_DIR + base + ".json", raw);
    return base;
}

const deleteCustomMap = async (name) => {
    await initMapsStorage();
    const base = safeBaseName(name);
    await FileSystem.deleteAsync(CUSTOM_DIR + base + ".json", { idempotent: true });
}

const clearAllCustomMaps = async () => {
    await FileSystem.deleteAsync(CUSTOM_DIR, { idempotent: true });
    await ensureDir(CUSTOM_DIR);
}

const resetToDefaults = async () => {
    await FileSystem.deleteAsync(ROOT, { idempotent: true });
    await initMapsStorage();
}

const pruneOldDefaults = async () => {
    await initMapsStorage();
    const keep = new Set(defaults.map((m) => m.name + ".json"));
    const files = await FileSystem.readDirectoryAsync(DEFAULT_DIR);

    for (const f of files) {
        if (f.endsWith(".json") && !keep.has(f)) {
            await FileSystem.deleteAsync(DEFAULT_DIR + f, { idempotent: true });
        }
    }
};

export { initMapsStorage, loadAllMaps, importCustomMap, deleteCustomMap, clearAllCustomMaps, resetToDefaults, pruneOldDefaults }