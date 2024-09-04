import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';

type Props = {
  children: React.ReactNode;
};

export const ScrollViewCenterView = ({children}: Props) => (
  <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
});
