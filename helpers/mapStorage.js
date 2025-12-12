import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

const ROOT = FileSystem.documentDirectory + "maps/";

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
    await ensureDir(ROOT);
}

const getUniqueName = async (base) => {
    let name = base;
    let i = 1;

    while(true){
        const info = await FileSystem.getInfoAsync(ROOT + name + ".json");
        if(!info.exists){
            return name;
        }
        name = `${base} (${i})`;
        i++;
    }
}

const loadAllMaps = async () => {
    await initMapsStorage();
    return await loadDir(ROOT);
}

const importCustomMap = async () => {
    await initMapsStorage();

    const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
        multiple: false,
    });

    if(res.canceled || !res.assets || !res.assets[0]){
        return null;
    }

    const file = res.assets[0];
    const raw = await FileSystem.readAsStringAsync(file.uri);
    JSON.parse(raw);

    const base = safeBaseName(file.name);
    const unique = await getUniqueName(base);

    await FileSystem.writeAsStringAsync(ROOT + unique + ".json", raw);
    return unique;
}

const deleteCustomMap = async (name) => {
    await initMapsStorage();
    const base = safeBaseName(name);
    await FileSystem.deleteAsync(ROOT + base + ".json", { idempotent: true });
}

const clearAllCustomMaps = async () => {
    await FileSystem.deleteAsync(ROOT, { idempotent: true });
    await ensureDir(ROOT);
}

export { initMapsStorage, loadAllMaps, importCustomMap, deleteCustomMap, clearAllCustomMaps }
