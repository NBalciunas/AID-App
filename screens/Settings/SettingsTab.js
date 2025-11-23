import { createStackNavigator } from '@react-navigation/stack';
import SettingsMenu from "./subTab/SettingsMenu";
import ConnectBT from "./subTab/subMenu/ConnectBT";
import Debug from "./subTab/subMenu/Debug";
import Compass from "./subTab/subMenu/Compass";

const Stack = createStackNavigator();

const SettingsTab = () => {
    return(
        <Stack.Navigator initialRouteName="SettingsMenu" >
            <Stack.Screen name="SettingsMenu" component={ SettingsMenu } options={{ headerShown: false }} />
            <Stack.Screen name="ConnectBT" component={ ConnectBT } options={{ headerShown: false }} />
            <Stack.Screen name="Debug" component={ Debug } options={{ headerShown: false }} />
            <Stack.Screen name="Compass" component={ Compass } options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
export default SettingsTab;