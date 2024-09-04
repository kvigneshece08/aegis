import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
import {Text} from 'react-native-paper';

import {styles} from './styles';

type LinkProps = TouchableOpacityProps & {
  title: string;
};

export const Link = ({title, ...rest}: LinkProps) => {
  return (
    <TouchableOpacity style={styles.buttonLink} activeOpacity={0.7} {...rest}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
