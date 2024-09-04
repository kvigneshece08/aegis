import {Appearance} from 'react-native';
import {darkColor} from './colors';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  configureFonts,
} from 'react-native-paper';

const {LightTheme, DarkTheme} = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const colorScheme = Appearance.getColorScheme();
const baseFont = {
  fontFamily: 'Inter-Regular',
} as const;

const baseVariants = configureFonts({config: baseFont});

const customVariants = {
  // Customize individual base variants:
  displayLarge: {
    ...baseVariants.displayLarge,
    fontFamily: 'Inter-ExtraBold',
  },
  displayMedium: {
    ...baseVariants.displayMedium,
    fontFamily: 'Inter-Bold',
  },
  displaySmall: {
    ...baseVariants.displaySmall,
    fontFamily: 'Inter-SemiBold',
  },

  headlineLarge: {
    ...baseVariants.headlineLarge,
    fontFamily: 'Inter-Bold',
  },
  headlineMedium: {
    ...baseVariants.headlineMedium,
    fontFamily: 'Inter-SemiBold',
  },
  headlineSmall: {
    ...baseVariants.headlineSmall,
    fontFamily: 'Inter-Medium',
  },

  titleLarge: {
    ...baseVariants.titleLarge,
    fontFamily: 'Inter-Medium',
  },
  titleMedium: {
    ...baseVariants.titleMedium,
    fontFamily: 'Inter-Medium',
  },
  titleSmall: {
    ...baseVariants.titleSmall,
    fontFamily: 'Inter-Regular',
  },

  bodyLarge: {
    ...baseVariants.bodyLarge,
    fontFamily: 'Inter-Medium',
  },
  bodyMedium: {
    ...baseVariants.bodyMedium,
    fontFamily: 'Inter-Regular',
  },
  bodySmall: {
    ...baseVariants.bodySmall,
    fontFamily: 'Inter-ExtraThin',
  },

  labelLarge: {
    ...baseVariants.labelLarge,
    fontFamily: 'Inter-Regular',
  },
  labelMedium: {
    ...baseVariants.labelMedium,
    fontFamily: 'Inter-Regular',
  },
  labelSmall: {
    ...baseVariants.labelSmall,
    fontFamily: 'Inter-ExtraThin',
  },
} as const;

export const themeColorScheme =
  colorScheme === 'dark' ? darkColor.colors : darkColor.colors;

export const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  fonts: configureFonts({
    config: {
      ...baseVariants,
      ...customVariants,
    },
  }),
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    ...themeColorScheme,
  },
};
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  fonts: configureFonts({
    config: {
      ...baseVariants,
      ...customVariants,
    },
  }),
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    ...themeColorScheme,
  },
};

export const theme =
  colorScheme === 'dark' ? CombinedDarkTheme : CombinedDarkTheme;
