import React from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { AppProvider } from "./AppContext";
import { createStackNavigator } from "@react-navigation/stack";
import MainTab from "./screens/Main/MainTab";

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

const App = () => {
    return(
        <AppProvider>
            <MainTab/>
        </AppProvider>
    );
}

export default App;