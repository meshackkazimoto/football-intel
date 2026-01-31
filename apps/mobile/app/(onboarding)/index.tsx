import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  Pressable,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setOnboardingDone } from '@/lib/storage';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Live scores and results',
    subtitle: 'Follow matches in real time and see full-time results at a glance.',
    image: require('@/assets/onboarding/live-scores.png'),
  },
  {
    title: 'Leagues and standings',
    subtitle: 'Browse competitions and keep track of the table throughout the season.',
    image: require('@/assets/onboarding/standings.png'),
  },
  {
    title: 'Your experience, your way',
    subtitle: 'Use the app without an account, or sign in to sync preferences across devices.',
    image: require('@/assets/onboarding/personalize.png'),
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToOffset({
        offset: width * (index + 1),
        animated: true,
      });
    } else {
      setOnboardingDone().then(() => router.replace('/(tabs)'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index: i }) => (
          <Slide
            item={item}
            index={i}
            scrollX={scrollX}
            primary={primary}
          />
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? primary : border,
                  width: i === index ? 20 : 8,
                },
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
            type="defaultSemiBold"
            style={{ color: Colors.light.primaryForeground }}
          >
            {index < SLIDES.length - 1 ? 'Next' : 'Get started'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function Slide({ item, index, scrollX, primary }: any) {
  const animatedImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [40, 0, 40]
    );

    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.9, 1, 0.9]
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0]
    );

    const translateY = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [20, 0, 20]
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
        <Image source={item.image} style={styles.image} />
      </Animated.View>

      <Animated.View style={[styles.content, animatedTextStyle]}>
        <ThemedText type="title" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {item.subtitle}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.75,
    height: '100%',
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
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
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});