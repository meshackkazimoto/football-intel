import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MatchCard } from '@/components/match-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { leaguesService } from '@/services/leagues/leagues.service';
import { matchesService } from '@/services/matches/matches.service';

type StatusFilter = 'all' | 'live' | 'scheduled' | 'half_time' | 'finished';

export default function AllMatchesScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');

  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');

  const { data: leagues = [] } = useQuery({ queryKey: ['leagues'], queryFn: leaguesService.getLeagues });

  useEffect(() => {
    if (!leagueId && leagues.length > 0) {
      setLeagueId(leagues[0].id);
    }
  }, [leagueId, leagues]);

  const { data: seasons = [] } = useQuery({
    queryKey: ['leagues', leagueId, 'seasons'],
    queryFn: () => leaguesService.getSeasons(leagueId!),
    enabled: !!leagueId,
  });

  useEffect(() => {
    if (!seasons.length) return;
    if (seasonId && seasons.some((season) => season.id === seasonId)) {
      return;
    }
    const current = seasons.find((season) => season.isCurrent);
    setSeasonId(current?.id ?? seasons[0].id);
  }, [seasons, seasonId]);

  const {
    data: matchList,
    isLoading,
  } = useQuery({
    queryKey: ['matches', 'list', seasonId, status],
    queryFn: () =>
      matchesService.getList({
        seasonId: seasonId!,
        status: status === 'all' ? undefined : status,
        page: 1,
        limit: 50,
      }),
    enabled: !!seasonId,
  });

  const matches = useMemo(() => matchList?.data ?? [], [matchList]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}> 
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={primary} />
        </Pressable>
        <ThemedText type="subtitle">All Matches</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {leagues.map((league) => (
          <Pressable
            key={league.id}
            onPress={() => {
              setLeagueId(league.id);
              setSeasonId(null);
            }}
            style={[
              styles.chip,
              {
                borderColor: border,
                backgroundColor: league.id === leagueId ? `${primary}20` : card,
              },
            ]}
          >
            <ThemedText style={league.id === leagueId ? { color: primary } : undefined}>
              {league.shortName || league.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {seasons.map((season) => (
          <Pressable
            key={season.id}
            onPress={() => setSeasonId(season.id)}
            style={[
              styles.chip,
              {
                borderColor: border,
                backgroundColor: season.id === seasonId ? `${primary}20` : card,
              },
            ]}
          >
            <ThemedText style={season.id === seasonId ? { color: primary } : undefined}>
              {season.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {(['all', 'live', 'scheduled', 'half_time', 'finished'] as StatusFilter[]).map((option) => (
          <Pressable
            key={option}
            onPress={() => setStatus(option)}
            style={[
              styles.chip,
              {
                borderColor: border,
                backgroundColor: status === option ? `${primary}20` : card,
              },
            ]}
          >
            <ThemedText style={status === option ? { color: primary } : undefined}>
              {option.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.loading}>
            <ThemedText>No matches found for this filter</ThemedText>
          </View>
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsWrap: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  loading: {
    paddingTop: 80,
    alignItems: 'center',
  },
});
