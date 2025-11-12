import React from "react";
import { AppProvider } from "./AppContext";
import { NavigationContainer } from '@react-navigation/native';
import NavigationBar from "./screens/NavigationBar";

const App = () => {
    return(
        <AppProvider>
            <NavigationContainer>
                <NavigationBar/>
            </NavigationContainer>
        </AppProvider>
    );
}

export default App;