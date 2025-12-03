import { Buffer } from "buffer";

if (typeof global !== "undefined") {
    global.Buffer = global.Buffer || Buffer;
}

const sendMessageBLE = async ({device, message, serviceUUID, characteristicUUID, onLog}) => {
    const log = (msg) => {
        if(typeof onLog === "function"){
            onLog(msg);
        }
    };

    if(!device){
        throw new Error("No connected device");
    }

    const trimmed = (message || "").trim();
    if(!trimmed){
        throw new Error("Message is empty");
    }

    const base64 = Buffer.from(trimmed, "utf8").toString("base64");
    log(`Sending '${trimmed}' (base64: ${base64})`);

    try{
        await device.writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, base64);
        log(`Sent '${trimmed}' successfully`);
    }
    catch(e){
        log(`Write error: ${e.message}`);
        throw e;
    }
};

export default sendMessageBLE;