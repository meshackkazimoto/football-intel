import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MatchCard } from '@/components/match-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { matchesService } from '@/services/matches/matches.service';

type Tab = 'fixtures' | 'results';

export default function FixturesScreen() {
  const router = useRouter();
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const seasonId = Array.isArray(leagueId) ? leagueId[0] : leagueId;
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const [activeTab, setActiveTab] = useState<Tab>('fixtures');

  const {
    data: fixtures = [],
    isLoading: fixturesLoading,
    refetch: refetchFixtures,
    isRefetching: fixturesRefetching,
  } = useQuery({
    queryKey: ['fixtures', seasonId],
    queryFn: () => matchesService.getLeagueFixtures(seasonId!),
    enabled: !!seasonId && activeTab === 'fixtures',
  });

  const {
    data: results = [],
    isLoading: resultsLoading,
    refetch: refetchResults,
    isRefetching: resultsRefetching,
  } = useQuery({
    queryKey: ['results', seasonId],
    queryFn: () => matchesService.getLeagueResults(seasonId!),
    enabled: !!seasonId && activeTab === 'results',
  });

  const onRefresh = useCallback(() => {
    if (activeTab === 'fixtures') {
      refetchFixtures();
    } else {
      refetchResults();
    }
  }, [activeTab, refetchFixtures, refetchResults]);

  const isLoading = activeTab === 'fixtures' ? fixturesLoading : resultsLoading;
  const isRefetching = activeTab === 'fixtures' ? fixturesRefetching : resultsRefetching;
  const matches = activeTab === 'fixtures' ? fixtures : results;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={primary} />
        </Pressable>
        <ThemedText type="subtitle">Matches</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.tabs, { borderBottomColor: border }]}>
        <Pressable
          onPress={() => setActiveTab('fixtures')}
          style={[
            styles.tab,
            activeTab === 'fixtures' && {
              borderBottomWidth: 2,
              borderBottomColor: primary,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'fixtures' && { color: primary, fontWeight: '600' },
            ]}
          >
            Fixtures
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('results')}
          style={[
            styles.tab,
            activeTab === 'results' && {
              borderBottomWidth: 2,
              borderBottomColor: primary,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'results' && { color: primary, fontWeight: '600' },
            ]}
          >
            Results
          </ThemedText>
        </Pressable>
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
        ) : matches.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              {activeTab === 'fixtures' ? 'No upcoming fixtures' : 'No recent results'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.matches}>
            {groupMatchesByDate(matches).map((group, i) => (
              <View key={i} style={styles.dateGroup}>
                <ThemedText style={styles.dateLabel}>{group.date}</ThemedText>
                <View style={styles.matchList}>
                  {group.matches.map((match, j) => (
                    <View
                      key={match.id}
                      style={[
                        styles.matchItem,
                        j !== group.matches.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: border,
                        },
                      ]}
                    >
                      <MatchCard match={match} />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function groupMatchesByDate(matches: any[]) {
  const groups: { date: string; matches: any[] }[] = [];
  const dateMap = new Map<string, any[]>();

  matches.forEach((match) => {
    const date = new Date(match.matchDate).toDateString();
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(match);
  });

  dateMap.forEach((matches, date) => {
    groups.push({ date, matches });
  });

  return groups;
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
    alignItems: 'center',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  loading: {
    paddingTop: 80,
    alignItems: 'center',
  },

  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
  },

  matches: {
    gap: 32,
  },
  dateGroup: {
    gap: 16,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
    opacity: 0.8,
  },
  matchList: {},
  matchItem: {
    paddingVertical: 12,
  },
});
