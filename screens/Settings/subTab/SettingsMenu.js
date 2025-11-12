import { View, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
import SettingItem from "../../../components/SettingItem";

const Debug = () => {
    const navigation = useNavigation();

    return(
        <View>
            <Text>
                <SettingItem onPress={() => navigation.navigate('Debug')} moreText={'test'} title="Debug" />
            </Text>
        </View>
    );
}

export default Debug;