import { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MatchCard } from '@/components/match-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { matchesService } from '@/services/matches/matches.service';

export default function HomeScreen() {
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const { user, isAuthenticated } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const {
    data: todayMatches = [],
    isLoading: todayLoading,
    refetch: refetchToday,
    isRefetching: todayRefetching,
  } = useQuery({
    queryKey: ['matches', 'today'],
    queryFn: () => matchesService.getToday(),
  });

  const {
    data: upcomingMatches = [],
    isLoading: upcomingLoading,
    refetch: refetchUpcoming,
    isRefetching: upcomingRefetching,
  } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => matchesService.getUpcoming(),
  });

  const onRefresh = useCallback(() => {
    refetchToday();
    refetchUpcoming();
  }, [refetchToday, refetchUpcoming]);

  const cycleTheme = useCallback(() => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  }, [themeMode, setThemeMode]);

  const isLoading = todayLoading && upcomingLoading;
  const isRefetching = todayRefetching || upcomingRefetching;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <ThemedText type="title" style={styles.title}>
          Football Intel
        </ThemedText>
        <View style={styles.headerActions}>
          <Pressable onPress={cycleTheme} style={styles.iconButton} hitSlop={12}>
            <IconSymbol name="circle.lefthalf.filled" size={22} color={primary} />
          </Pressable>
          {isAuthenticated ? (
            <View style={styles.userRow}>
              <ThemedText style={styles.userEmail} numberOfLines={1}>
                {user?.email}
              </ThemedText>
              <Link href="/modal" asChild>
                <Pressable style={styles.iconButton} hitSlop={12}>
                  <IconSymbol name="person.fill" size={22} color={primary} />
                </Pressable>
              </Link>
            </View>
          ) : (
            <Link href="/modal" asChild>
              <Pressable style={[styles.loginButton, { borderColor: primary }]}>
                <ThemedText style={[styles.loginButtonText, { color: primary }]}>
                  Login
                </ThemedText>
              </Pressable>
            </Link>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Today
              </ThemedText>
              {todayMatches.length === 0 ? (
                <ThemedText style={styles.empty}>No matches today</ThemedText>
              ) : (
                todayMatches.map((m) => <MatchCard key={m.id} match={m} />)
              )}
            </View>
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Upcoming
              </ThemedText>
              {upcomingMatches.length === 0 ? (
                <ThemedText style={styles.empty}>No upcoming matches</ThemedText>
              ) : (
                upcomingMatches.map((m) => <MatchCard key={m.id} match={m} />)
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    fontSize: 13,
    maxWidth: 120,
    opacity: 0.9,
  },
  loginButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  centered: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  empty: {
    fontSize: 15,
    opacity: 0.7,
  },
});
