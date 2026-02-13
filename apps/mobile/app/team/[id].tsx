import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MatchCard } from '@/components/match-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { teamsService } from '@/services/teams/teams.service';

type Tab = 'squad' | 'fixtures' | 'results';

export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Array.isArray(id) ? id[0] : id;

  const [activeTab, setActiveTab] = useState<Tab>('squad');

  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');

  const {
    data: details,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['team', 'details', teamId],
    queryFn: () => teamsService.getDetails(teamId!),
    enabled: !!teamId,
  });

  const { data: fixtures = [] } = useQuery({
    queryKey: ['team', 'matches', teamId, 'scheduled'],
    queryFn: () => teamsService.getMatches(teamId!, { status: 'scheduled', limit: 10 }),
    enabled: !!teamId,
  });

  const { data: results = [] } = useQuery({
    queryKey: ['team', 'matches', teamId, 'finished'],
    queryFn: () => teamsService.getMatches(teamId!, { status: 'finished', limit: 10 }),
    enabled: !!teamId,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Team" onBack={() => router.back()} border={border} primary={primary} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ThemedView>
    );
  }

  if (!details) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Team" onBack={() => router.back()} border={border} primary={primary} />
        <View style={styles.loading}>
          <ThemedText>Team not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderTab = () => {
    if (activeTab === 'fixtures') {
      return fixtures.length > 0 ? (
        <View style={styles.matchList}>
          {fixtures.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>No upcoming fixtures</ThemedText>
      );
    }

    if (activeTab === 'results') {
      return results.length > 0 ? (
        <View style={styles.matchList}>
          {results.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>No recent results</ThemedText>
      );
    }

    return (
      <View style={[styles.panel, { borderColor: border }]}> 
        {details.squad.length === 0 ? (
          <ThemedText style={styles.emptyText}>No players in squad</ThemedText>
        ) : (
          details.squad.map((player) => (
            <View key={player.id} style={[styles.playerRow, { borderBottomColor: border }]}> 
              <View style={styles.playerLeft}>
                <ThemedText type="defaultSemiBold">{player.fullName}</ThemedText>
                <ThemedText style={styles.muted}>{player.position}</ThemedText>
              </View>
              <ThemedText style={styles.jersey}>#{player.jerseyNumber ?? '-'}</ThemedText>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header title={details.club.name} onBack={() => router.back()} border={border} primary={primary} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        <View style={[styles.hero, { borderBottomColor: border }]}> 
          <ThemedText type="subtitle" style={styles.teamName}>{details.club.name}</ThemedText>
          <ThemedText style={styles.muted}>
            {details.league.name} • {details.league.season}
          </ThemedText>
        </View>

        {details.standings ? (
          <View style={styles.metricsRow}>
            <MetricCard label="Position" value={String(details.standings.position)} border={border} card={card} />
            <MetricCard label="Points" value={String(details.standings.points)} border={border} card={card} />
            <MetricCard label="GD" value={String(details.standings.goalDifference)} border={border} card={card} />
          </View>
        ) : null}

        <View style={[styles.panel, { borderColor: border }]}> 
          <ThemedText type="defaultSemiBold">Performance</ThemedText>
          <View style={styles.performanceRow}>
            <PerformanceBlock title="Home" data={details.performance.home} />
            <PerformanceBlock title="Away" data={details.performance.away} />
          </View>
        </View>

        <View style={[styles.tabs, { borderBottomColor: border }]}> 
          {(['squad', 'fixtures', 'results'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab ? { borderBottomColor: primary, borderBottomWidth: 2 } : null,
              ]}
            >
              <ThemedText style={[styles.tabText, activeTab === tab ? { color: primary } : null]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {renderTab()}
      </ScrollView>
    </ThemedView>
  );
}

function Header({
  title,
  onBack,
  border,
  primary,
}: {
  title: string;
  onBack: () => void;
  border: string;
  primary: string;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: border }]}> 
      <Pressable onPress={onBack} hitSlop={12}>
        <IconSymbol name="chevron.left" size={24} color={primary} />
      </Pressable>
      <ThemedText numberOfLines={1} style={styles.headerTitle}>{title}</ThemedText>
      <View style={styles.headerRight} />
    </View>
  );
}

function MetricCard({
  label,
  value,
  border,
  card,
}: {
  label: string;
  value: string;
  border: string;
  card: string;
}) {
  return (
    <View style={[styles.metricCard, { borderColor: border, backgroundColor: card }]}> 
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={styles.muted}>{label}</ThemedText>
    </View>
  );
}

function PerformanceBlock({
  title,
  data,
}: {
  title: string;
  data: { played: number; wins: number; draws: number; losses: number };
}) {
  return (
    <View style={styles.performanceBlock}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText style={styles.muted}>P {data.played}</ThemedText>
      <ThemedText style={styles.muted}>W {data.wins}</ThemedText>
      <ThemedText style={styles.muted}>D {data.draws}</ThemedText>
      <ThemedText style={styles.muted}>L {data.losses}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
    fontSize: 15,
  },
  headerRight: { width: 24 },
  content: {
    paddingBottom: 40,
    gap: 14,
  },
  loading: { paddingTop: 80, alignItems: 'center' },
  hero: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    gap: 4,
  },
  teamName: { textAlign: 'center' },
  muted: { fontSize: 13, opacity: 0.65 },
  metricsRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 3,
  },
  metricValue: { fontSize: 20, fontWeight: '700' },
  panel: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceBlock: {
    gap: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  playerLeft: { gap: 2, flex: 1, marginRight: 10 },
  jersey: { fontSize: 14, fontWeight: '700' },
  emptyText: { textAlign: 'center', opacity: 0.6, fontSize: 14 },
  matchList: {
    paddingHorizontal: 20,
    gap: 0,
  },
});
