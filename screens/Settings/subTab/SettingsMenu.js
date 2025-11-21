import {View, Text, StyleSheet} from "react-native";
import { Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SettingItem from "../../../components/SettingItem";
import appConfig from '../../../app.json';

const Debug = () => {
    const navigation = useNavigation();

    return(
        <View style={styles.container}>
            <SettingItem onPress={() => navigation.navigate('ConnectBT')} title="Connect Bluetooth" />
            <Divider style={styles.divider}/>
            <SettingItem onPress={() => navigation.navigate('LocationList')} title="Location List" />
            <Divider style={styles.divider}/>
            <SettingItem onPress={() => navigation.navigate('SetTarget')} title="Set Target" />
            <Divider style={styles.divider}/>
            <SettingItem onPress={() => navigation.navigate('Debug')} title="Debug" />
            <Divider style={styles.divider}/>
            <SettingItem onPress={() => navigation.navigate('Compass')} title="Compass" />
            <Text style={styles.versionText}>{appConfig.expo.name} v{appConfig.expo.version}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    divider: {
        backgroundColor: '#fff',
        height: 2,
    },
    versionText: {
        fontFamily: 'Poppins-Bold',
        alignSelf: 'center',
        fontSize: 13,
        position: 'absolute',
        bottom: 20,
    },
});

export default Debug;