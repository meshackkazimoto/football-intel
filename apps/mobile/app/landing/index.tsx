import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setLandingSeen } from '@/lib/storage';
import { Colors } from '@/constants/theme';

export default function LandingScreen() {
  const primary = useThemeColor({}, 'primary');

  const handleContinue = () => {
    setLandingSeen().then(() => router.replace('/(tabs)'));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Football Intel
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Scores, standings, and live updates for your favourite leagues.
        </ThemedText>
      </View>
      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <ThemedText
            style={[styles.buttonText, { color: Colors.light.primaryForeground }]}
          >
            Continue
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
  },
  content: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    opacity: 0.9,
  },
  footer: {},
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
