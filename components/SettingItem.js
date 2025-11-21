import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SettingItem = ({ title, onPress, color='F7F7F7', moreText }) => {

    const truncateText = (text, maxLength) => {
        if(text.length > maxLength){
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    return(
        <View style={{backgroundColor: `#${color}`}}>
            <View style={[styles.settingItem]}>
                <TouchableOpacity style={{width: '100%'}} onPress={onPress}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.settingText}>{title}</Text>
                        {moreText && (
                            <Text style={styles.detailText}>{truncateText(moreText, 15)}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingVertical: 12,
        marginHorizontal: 10,
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        textAlign: 'right',
    },
    detailText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#909090',
    },
});

export default SettingItem;