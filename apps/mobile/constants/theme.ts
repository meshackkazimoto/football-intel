import { Platform } from 'react-native';

const primary = '#10b981';
const primaryForeground = '#ffffff';
const backgroundLight = '#f8fafc';
const backgroundDark = '#0f172a';
const foregroundLight = '#0f172a';
const foregroundDark = '#f8fafc';
const cardLight = '#ffffff';
const cardDark = '#1e293b';
const borderLight = '#e2e8f0';
const borderDark = '#334155';
const iconLight = '#64748b';
const iconDark = '#94a3b8';

export type ThemeMode = 'light' | 'dark' | 'system';

export const Colors = {
  light: {
    text: foregroundLight,
    background: backgroundLight,
    card: cardLight,
    border: borderLight,
    primary,
    primaryForeground,
    tint: primary,
    icon: iconLight,
    tabIconDefault: iconLight,
    tabIconSelected: primary,
  },
  dark: {
    text: foregroundDark,
    background: backgroundDark,
    card: cardDark,
    border: borderDark,
    primary,
    primaryForeground,
    tint: primary,
    icon: iconDark,
    tabIconDefault: iconDark,
    tabIconSelected: primary,
  },
};

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};
