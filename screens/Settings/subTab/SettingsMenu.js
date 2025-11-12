import {View, Text, Settings} from "react-native";
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SettingItem from "../../../components/SettingItem";

const Debug = () => {
    const navigation = useNavigation();

    return(
        <View>
            <SettingItem onPress={() => navigation.navigate('ConnectBT')} title="Connect Bluetooth" />
            <Divider style={{ backgroundColor: '#fff', height: 2 }}/>
            <SettingItem onPress={() => navigation.navigate('LocationList')} title="Location List" />
            <Divider style={{ backgroundColor: '#fff', height: 2 }}/>
            <SettingItem onPress={() => navigation.navigate('SetTarget')} title="Set Target" />
            <Divider style={{ backgroundColor: '#fff', height: 2 }}/>
            <SettingItem onPress={() => navigation.navigate('Debug')} title="Debug" />
        </View>
    );
}

export default Debug;