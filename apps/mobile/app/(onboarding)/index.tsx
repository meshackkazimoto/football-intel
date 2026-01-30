import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setOnboardingDone } from '@/lib/storage';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Live scores and results',
    subtitle: 'Follow matches in real time and see full-time results at a glance.',
  },
  {
    title: 'Leagues and standings',
    subtitle: 'Browse competitions and keep track of the table throughout the season.',
  },
  {
    title: 'Your experience, your way',
    subtitle: 'Use the app without an account, or sign in to sync preferences across devices.',
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToOffset({ offset: width * (index + 1), animated: true });
    } else {
      setOnboardingDone().then(() => router.replace('/landing'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.content}>
              <ThemedText type="title" style={styles.title}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? primary : border },
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <ThemedText
            style={[
              styles.buttonText,
              { color: Colors.light.primaryForeground },
            ]}
          >
            {index < SLIDES.length - 1 ? 'Next' : 'Get started'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    opacity: 0.85,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    gap: 28,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
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
