import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from '../../components/Button';
import {useAppSelector} from '../../hooks/reduxHooks';
import {ItemSpaceTen, ItemSpaceTwenty, fonts} from '../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {Text} from 'react-native-paper';

const Home = () => {
  const navigation = useNavigation<ScreensNavigationProps>();
  const resetProjectSelectionStack = subStack => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'ProjectSelection',
          state: {
            index: 0,
            routes: [{name: subStack}],
          },
        },
      ],
    });
  };

  const authDetails = useAppSelector(state => state?.authDetails);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.text}>
        Hi {authDetails?.user?.firstName?.toUpperCase() || ''} {authDetails?.user?.lastName?.toUpperCase() || ''}
      </Text>
      <Button
        style={styles.buttonStyle}
        labelStyle={{fontSize: fonts.size.regular}}
        mode="contained-tonal"
        onPress={() => resetProjectSelectionStack('ProjectDashboard')}>
        View Dashboard
      </Button>
      <Button
        style={styles.buttonStyle}
        mode="contained-tonal"
        labelStyle={{fontSize: fonts.size.regular}}
        onPress={() => resetProjectSelectionStack('ProjectSelectionHome')}>
        View Assigned Projects
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginVertical: ItemSpaceTwenty.marginVerticalVal.marginVertical,
  },
  buttonStyle: {
    marginVertical: ItemSpaceTen.spaceTenVerticalMargin.marginVertical,
  },
});

export default Home;
