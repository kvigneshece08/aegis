import {StyleSheet} from 'react-native';
import {THEME} from '../../utils/theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 30,
  },
  button: {
    width: 50,
    padding: 10,
    marginLeft: 5,
  },
  icon: {
    fontSize: 40,
    textAlign: 'center',
    color: THEME.BLACK,
  },
});
