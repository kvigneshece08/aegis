import React from 'react';
import {View, StyleSheet} from 'react-native';

export const SpaceSeparator = ({
  type = 'Vertical',
  spacing = 'padding',
  size = 10,
}) => {
  return <View style={styles({type, spacing, size}).container} />;
};

const styles = ({
  type,
  spacing,
  size,
}: {
  type: string;
  spacing: string;
  size: number;
}) =>
  StyleSheet.create({
    container: {
      [spacing + type]: size,
    },
  });
