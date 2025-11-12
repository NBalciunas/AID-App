import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MainTab from "./Main/MainTab";
import SettingsTab from "./Settings/SettingsTab";

const Tab = createBottomTabNavigator();

export default function NavigationTab() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Main"
                component={MainTab}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsTab}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
