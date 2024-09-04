import {StyleSheet} from 'react-native';
import {THEME} from '../../utils/theme';
import {theme} from '../../themes';

export const styles = (tooltipEnabled = null) =>
  StyleSheet.create({
    container: {
      marginTop: 10,
      marginBottom: tooltipEnabled === null ? 10 : 0,
    },
    label: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      fontWeight: '700',
      color: THEME.BLACK,
    },
    input: {
      backgroundColor: theme.colors.onSurface,
    },
    errorContainer: {
      flexDirection: 'row',
    },
    error: {
      flexGrow: 1,
      flex: 1,
    },
  });
