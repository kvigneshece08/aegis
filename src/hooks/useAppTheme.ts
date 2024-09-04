import {useTheme} from 'react-native-paper';
import {theme} from '../themes';
export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme<AppTheme>();
