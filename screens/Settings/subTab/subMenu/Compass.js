import React from "react";
import { View, Text } from "react-native";
import { useAppContext } from "../../../../AppContext";
import DirectionPointer from "../../../../components/DirectionPointer";

const Compass = () => {
    const { heading, headingLabel } = useAppContext();

    return(
        <View>
            <Text>
                Heading: {heading != null ? heading.toFixed(1) : "?"}° ({headingLabel})
            </Text>
            <DirectionPointer angle={ Math.round(heading || 0) } />
        </View>
    )
}

export default Compass;