import { createStackNavigator } from '@react-navigation/stack';
import SettingsMenu from "./subTab/SettingsMenu";
import RouteManager from "./subTab/subMenu/RouteManager";
import BluetoothDashboard from "./subTab/subMenu/BluetoothDashboard";
import Debug from "./subTab/subMenu/Debug";

const Stack = createStackNavigator();

const SettingsTab = () => {
    return(
        <Stack.Navigator initialRouteName="SettingsMenu" >
            <Stack.Screen name="SettingsMenu" component={ SettingsMenu } options={{ headerShown: false }} />
            <Stack.Screen name="RouteManager" component={ RouteManager } options={{ headerShown: false }} />
            <Stack.Screen name="BluetoothDashboard" component={ BluetoothDashboard } options={{ headerShown: false }} />
            <Stack.Screen name="Debug" component={ Debug } options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
export default SettingsTab;