import {StyleSheet} from 'react-native';
import {THEME} from '../../utils/theme';

interface Props {
  color?: string;
}

export const stylesButton = ({color}: Props) =>
  StyleSheet.create({
    button: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginTop: 30,
      borderRadius: 10,
      backgroundColor: color || THEME.GREEN,
    },
  });

export const stylesText = StyleSheet.create({
  text: {
    color: THEME.WHITE,
    fontFamily: 'Inter-ExtraBold',
    fontSize: 22,
    fontWeight: '800',
  },
});
