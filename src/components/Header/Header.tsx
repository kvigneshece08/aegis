import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Feather';

import {styles} from './styles';

export const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}>
        {/* <Icon name="chevron-left" style={styles.icon} /> */}
      </TouchableOpacity>
    </View>
  );
};
