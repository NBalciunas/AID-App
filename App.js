import React, {useState} from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import CurrentGPSData from "./components/CurrentGPSData";
import CurrentCompassData from "./components/CurrentCompassData";
import Navigator from "./components/Navigator"
import DirectionPointer from "./components/DirectionPointer";

export default function App() {
    const [currentCoords, setCurrentCoords] = useState(null);
    const [currentHeading, setCurrentHeading] = useState(null);
    const [targetData, setTargetData] = useState(null);
    let targetAngle = 0

    if(currentCoords && currentHeading && targetData){
        targetAngle = (parseFloat(targetData.bearing.toFixed(1)) - currentHeading + 360) % 360;
        // console.log(targetAngle);
    }

    return(
        <View style={styles.container}>
            <CurrentGPSData onLocationUpdate={setCurrentCoords} />
            <CurrentCompassData onHeadingChange={setCurrentHeading} />
            <Navigator currentCoords={currentCoords} currentHeading={currentHeading} onUpdateTargetData={setTargetData} />
            <DirectionPointer angle={targetAngle} />
            <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
