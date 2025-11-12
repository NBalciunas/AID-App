import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

export default function DirectionPointer({ angle = 0, radius = 140 }) {
    const rad = ((angle) * Math.PI) / 180;

    const cx = 200;
    const cy = 200;

    const x2 = cx + radius * Math.sin(rad);
    const y2 = cy - radius * Math.cos(rad);

    return(
        <View>
            <Svg height={2*cx} width={2*cy}>
                <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                />
                <Line
                    x1={cx}
                    y1={cy}
                    x2={x2}
                    y2={y2}
                    stroke="red"
                    strokeWidth="2"
                />
            </Svg>
        </View>
    );
}
