import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getLandingSeen, getOnboardingDone } from '@/lib/storage';

export default function GateScreen() {
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOnboardingDone(), getLandingSeen()]).then(
      ([onboardingDone, landingSeen]) => {
        if (cancelled) return;
        if (!onboardingDone) {
          router.replace('/(onboarding)');
          return;
        }
        if (!landingSeen) {
          router.replace('/landing');
          return;
        }
        router.replace('/(tabs)');
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ThemedView style={[styles.container, { backgroundColor: background }]}>
      <ActivityIndicator size="large" color={primary} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
