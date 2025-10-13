import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

export default function DirectionPointer({ angle = 0, radius = 80 }) {
    const rad = ((angle) * Math.PI) / 180;

    const cx = 100;
    const cy = 100;

    const x2 = cx + radius * Math.sin(rad);
    const y2 = cy - radius * Math.cos(rad);

    return (
        <View>
            <Svg height="200" width="200">
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
