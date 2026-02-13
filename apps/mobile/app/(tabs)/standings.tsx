import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { leaguesService } from '@/services/leagues/leagues.service';
import { matchesService } from '@/services/matches/matches.service';

export default function StandingsScreen() {
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');

  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [liveMatchId, setLiveMatchId] = useState<string | null>(null);

  const { data: leagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: leaguesService.getLeagues,
  });

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
    const nextSeasonId = current?.id ?? seasons[0].id;
    setSeasonId(nextSeasonId);
    setLiveMatchId(null);
  }, [seasons, seasonId]);

  const {
    data: standingsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['standings', seasonId],
    queryFn: () => leaguesService.getStandings(seasonId!),
    enabled: !!seasonId,
  });

  const { data: liveMatches } = useQuery({
    queryKey: ['matches', 'live', seasonId],
    queryFn: () => matchesService.getLive({ seasonId: seasonId! }),
    enabled: !!seasonId,
    refetchInterval: 20000,
  });

  useEffect(() => {
    if (!liveMatches?.data.length) {
      setLiveMatchId(null);
      return;
    }

    setLiveMatchId((current) => {
      if (current && liveMatches.data.some((match) => match.id === current)) {
        return current;
      }
      return liveMatches.data[0].id;
    });
  }, [liveMatches]);

  const { data: liveMatchDetails } = useQuery({
    queryKey: ['matches', 'details', liveMatchId],
    queryFn: () => matchesService.getDetails(liveMatchId!),
    enabled: !!liveMatchId,
    refetchInterval: 20000,
  });

  const rows = useMemo(() => {
    if (liveMatchDetails?.standings.liveTable.length) {
      return liveMatchDetails.standings.liveTable.map((row) => ({
        teamId: row.team.id,
        position: row.position,
        played: row.played,
        points: row.points,
        displayName: row.team.club.name,
      }));
    }

    return (standingsData?.standings ?? []).map((row) => ({
      teamId: row.team.id,
      position: row.position,
      played: row.played,
      points: row.points,
      displayName: row.team.clubName,
    }));
  }, [standingsData, liveMatchDetails]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}> 
        <ThemedText type="title" style={styles.title}>
          Standings
        </ThemedText>
        {standingsData?.league ? (
          <ThemedText style={styles.subtitle}>
            {standingsData.league.name} • {standingsData.league.season}
          </ThemedText>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {leagues.map((league) => (
          <Pressable
            key={league.id}
            onPress={() => {
              setLeagueId(league.id);
              setSeasonId(null);
              setLiveMatchId(null);
            }}
            style={[
              styles.filterChip,
              {
                borderColor: border,
                backgroundColor: league.id === leagueId ? `${primary}20` : card,
              },
            ]}
          >
            <ThemedText style={{ color: league.id === leagueId ? primary : undefined }}>
              {league.shortName || league.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {seasons.map((season) => (
          <Pressable
            key={season.id}
            onPress={() => {
              setSeasonId(season.id);
              setLiveMatchId(null);
            }}
            style={[
              styles.filterChip,
              {
                borderColor: border,
                backgroundColor: season.id === seasonId ? `${primary}20` : card,
              },
            ]}
          >
            <ThemedText style={{ color: season.id === seasonId ? primary : undefined }}>
              {season.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {liveMatches?.data?.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.liveMatchesWrap}
        >
          {liveMatches.data.map((match) => {
            const label = `${match.homeTeam.club.name} ${match.score.home ?? 0}-${match.score.away ?? 0} ${match.awayTeam.club.name}`;
            const selected = match.id === liveMatchId;

            return (
              <Pressable
                key={match.id}
                onPress={() => setLiveMatchId(match.id)}
                style={[
                  styles.liveMatchChip,
                  {
                    borderColor: border,
                    backgroundColor: selected ? '#dc262620' : card,
                  },
                ]}
              >
                <ThemedText style={[styles.liveMatchText, selected ? { color: '#dc2626' } : null]}>
                  LIVE {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.loading}>
            <ThemedText>No standings available</ThemedText>
          </View>
        ) : (
          <View style={[styles.table, { borderColor: border }]}> 
            <View style={[styles.tableHeader, { borderBottomColor: border }]}> 
              <ThemedText style={styles.colPos}>#</ThemedText>
              <ThemedText style={styles.colTeam}>Team</ThemedText>
              <ThemedText style={styles.colP}>P</ThemedText>
              <ThemedText style={styles.colPts}>Pts</ThemedText>
            </View>

            {rows.map((row) => (
              <View
                key={row.teamId}
                style={[
                  styles.tableRow,
                  { borderBottomColor: border },
                  row.teamId === liveMatchDetails?.teams.home.id || row.teamId === liveMatchDetails?.teams.away.id
                    ? styles.highlightRow
                    : null,
                ]}
              >
                <ThemedText style={styles.colPos}>{row.position}</ThemedText>
                <ThemedText numberOfLines={1} style={styles.colTeam}>
                  {row.displayName}
                </ThemedText>
                <ThemedText style={styles.colP}>{row.played}</ThemedText>
                <ThemedText style={styles.colPts}>{row.points}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22 },
  subtitle: { fontSize: 13, opacity: 0.65, marginTop: 4 },
  filters: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveMatchesWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  liveMatchChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveMatchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 6,
  },
  loading: { paddingTop: 60, alignItems: 'center' },
  table: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  highlightRow: {
    backgroundColor: '#dc262612',
  },
  colPos: { width: 30, fontSize: 13 },
  colTeam: { flex: 1, fontSize: 14 },
  colP: { width: 30, textAlign: 'right', fontSize: 13 },
  colPts: { width: 42, textAlign: 'right', fontSize: 14, fontWeight: '700' },
});
