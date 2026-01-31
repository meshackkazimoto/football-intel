import { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MatchCard } from '@/components/match-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { matchesService } from '@/services/matches/matches.service';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const { isAuthenticated } = useAuth();
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

  const {
    data: liveMatches = [],
    refetch: refetchLive,
  } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesService.getLive(),
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(() => {
    refetchToday();
    refetchUpcoming();
    refetchLive();
  }, [refetchToday, refetchUpcoming, refetchLive]);

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
        <View>
          <ThemedText type="title" style={styles.brand}>
            Football Intel
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Tanzania football, live & local
          </ThemedText>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/search')} hitSlop={12}>
            <IconSymbol name="magnifyingglass" size={22} color={primary} />
          </Pressable>

          <Pressable onPress={cycleTheme} hitSlop={12}>
            <IconSymbol name="circle.lefthalf.filled" size={22} color={primary} />
          </Pressable>

          <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
            <IconSymbol
              name={isAuthenticated ? 'person.fill' : 'person'}
              size={22}
              color={primary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : (
          <>
            {liveMatches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <ThemedText style={styles.liveTitle}>Live Now</ThemedText>
                    <View style={styles.liveCount}>
                      <ThemedText style={styles.liveCountText}>
                        {liveMatches.length}
                      </ThemedText>
                    </View>
                  </View>
                  {liveMatches.length > 3 && (
                    <Pressable onPress={() => router.push('/(tabs)/live')} hitSlop={8}>
                      <ThemedText style={[styles.seeAll, { color: primary }]}>
                        See all
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
                <View style={styles.matchList}>
                  {liveMatches.slice(0, 3).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.quickLinks}>
              <QuickLink
                icon="list.number"
                label="Standings"
                onPress={() => router.push('/(tabs)/standings')}
                primary={primary}
                border={border}
                background={background}
              />
              <QuickLink
                icon="calendar"
                label="Fixtures"
                onPress={() => router.push('/fixtures/nbc-premier')}
                primary={primary}
                border={border}
                background={background}
              />
              <QuickLink
                icon="shield.fill"
                label="Teams"
                onPress={() => router.push('/(tabs)/teams')}
                primary={primary}
                border={border}
                background={background}
              />
            </View>

            {todayMatches.length > 0 ? (
              <FeedSection
                title="Today"
                matches={todayMatches}
                border={border}
              />
            ) : (
              <View style={styles.emptySection}>
                <ThemedText style={styles.emptySectionTitle}>Today</ThemedText>
                <ThemedText style={styles.emptyText}>No matches scheduled today</ThemedText>
              </View>
            )}

            {upcomingMatches.length > 0 && (
              <FeedSection
                title="Upcoming"
                matches={upcomingMatches.slice(0, 5)}
                border={border}
              />
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function QuickLink({ icon, label, onPress, primary, border, background }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickLink,
        { borderColor: border, backgroundColor: background },
        pressed && styles.quickLinkPressed,
      ]}
    >
      <View style={[styles.quickLinkIcon, { backgroundColor: `${primary}15` }]}>
        <IconSymbol name={icon} size={22} color={primary} />
      </View>
      <ThemedText style={styles.quickLinkLabel}>{label}</ThemedText>
    </Pressable>
  );
}

function FeedSection({
  title,
  matches,
  border,
}: {
  title: string;
  matches: any[];
  border: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.matchList}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    opacity: 0.65,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 28,
  },

  loading: {
    paddingTop: 80,
    alignItems: 'center',
  },

  quickLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLink: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickLinkPressed: {
    opacity: 0.7,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  section: {
    gap: 4,
  },
  sectionHeader: {
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  liveCount: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#ef444415',
  },
  liveCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  matchList: {
    gap: 0,
  },

  emptySection: {
    gap: 8,
  },
  emptySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    paddingVertical: 16,
  },
});