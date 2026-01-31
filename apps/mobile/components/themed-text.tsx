import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const color = type === 'link' ? primaryColor : textColor;

  return (
    <Text
      {...rest}
      style={[
        { color },
        styles.base,
        type === 'default' && styles.default,
        type === 'defaultSemiBold' && styles.defaultSemiBold,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.regular,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.semibold,
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.bold,
  },
  link: {
    fontSize: 16,
    lineHeight: 30,
    fontFamily: Fonts.medium,
  },
});