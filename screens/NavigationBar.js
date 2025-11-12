import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainTab from "./Main/MainTab";
import SettingsTab from "./Settings/SettingsTab";

const Tab = createBottomTabNavigator();

const NavigationTab = () => {
    return(
        <Tab.Navigator>
            <Tab.Screen name="Main" component={MainTab} />
            <Tab.Screen name="Settings" component={SettingsTab} />
        </Tab.Navigator>
    );
}

export default NavigationTab;