import React from 'react';
import {Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {styles} from './styles';
import {Text} from 'react-native-paper';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {Button} from '../../components/Button';
import { Images, ItemSpaceTen, FontsStyle, theme } from "../../themes";
import {ImgStyles} from '../../themes';
import {IconButton} from 'react-native-paper';

const AccountEnroll = () => {
  const navigation = useNavigation<ScreensNavigationProps>();
  return (
    <ScrollViewCenterView>
      <View style={styles.content}>
        <Image
          style={ImgStyles.imgContain}
          source={Images.app_aegis_logo_icon}
        />
        <Text variant="titleLarge" style={styles.text}>
          Project and Program Management
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          A Multifaceted Application to assist in Project, Planning, Contract
          Management enabling comprehensive tracking and visibility from the
          lowest level of detail to the highest.
        </Text>
      </View>
      <Button
        mode="contained"
        uppercase
        style={ItemSpaceTen.spaceTenVerticalMargin}
        labelStyle={FontsStyle.fontBold}
        onPress={() => navigation.navigate('SignIn')}>
        Login
      </Button>
      <Button
        mode="outlined"
        uppercase
        style={ItemSpaceTen.spaceTenVerticalMargin}
        labelStyle={FontsStyle.fontBold}
        onPress={() => navigation.navigate('SignUp')}>
        Sign Up
      </Button>
    </ScrollViewCenterView>
  );
};

export default AccountEnroll;
