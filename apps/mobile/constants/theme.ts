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

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
