import { PermissionsAndroid, Platform } from "react-native";

const connectBLE = async ({manager, onLog, deviceNameFilter = "ESP32", scanTimeoutMs = 10000,}) => {
    if(!manager){
        throw new Error("BleManager instance is required");
    }

    const log = (msg) => {
        if(typeof onLog === "function"){
            onLog(msg);
        }
    };

    if(Platform.OS === "android"){
        log("Requesting Android BT permissions…");
        try{
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
            log("Permissions requested");
        }
        catch(e){
            log(`Permission error: ${e.message}`);
        }
    }

    log(`Scanning for device containing '${deviceNameFilter}'…`);

    return new Promise((resolve, reject) => {
        let finished = false;

        const finishWithError = (err) => {
            if (finished) return;
            finished = true;
            manager.stopDeviceScan();
            reject(err);
        };

        manager.startDeviceScan(null, null, async (error, scannedDevice) => {
            if(error){
                log(`Scan error: ${error.message}`);
                return finishWithError(error);
            }

            if(scannedDevice?.name && scannedDevice.name.includes(deviceNameFilter)){
                log(`Found device: ${scannedDevice.name}`);
                manager.stopDeviceScan();

                try{
                    log("Connecting to device…");
                    const connectedDevice = await scannedDevice.connect();
                    await connectedDevice.discoverAllServicesAndCharacteristics();
                    log("Connected!");
                    if (!finished) {
                        finished = true;
                        resolve(connectedDevice);
                    }
                }
                catch(e){
                    log(`Connection error: ${e.message}`);
                    finishWithError(e);
                }
            }
        });

        setTimeout(() => {
            if(!finished){
                finishWithError(new Error("Scan timed out"));
            }
        }, scanTimeoutMs);
    });
};

export default connectBLE;