import { useMemo, useState, useCallback } from 'react';
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { matchesService } from '@/services/matches/matches.service';
import type { MatchDetails, MatchStandingRow } from '@/services/matches/types/match-details';

type TabKey = 'overview' | 'stats' | 'lineup' | 'standings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'stats', label: 'Stats' },
  { key: 'lineup', label: 'Lineup' },
  { key: 'standings', label: 'Standings' },
];

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(match: MatchDetails) {
  if (match.status === 'live') {
    return `${match.minute ?? 0}'`;
  }

  if (match.status === 'half_time') {
    return 'Half Time';
  }

  if (match.status === 'finished') {
    return 'Full Time';
  }

  if (match.status === 'postponed') {
    return 'Postponed';
  }
  if (match.status === 'abandoned') {
    return 'Abandoned';
  }
  if (match.status === 'cancelled') {
    return 'Cancelled';
  }

  return formatDateTime(match.matchDate);
}

function statusColor(status: MatchDetails['status']) {
  if (status === 'live') return '#dc2626';
  if (status === 'half_time') return '#f59e0b';
  if (status === 'finished') return '#16a34a';
  if (status === 'postponed') return '#6b7280';
  if (status === 'abandoned') return '#f97316';
  if (status === 'cancelled') return '#6b7280';
  return '#6b7280';
}

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Array.isArray(id) ? id[0] : id;

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');

  const {
    data: match,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['matches', 'details', matchId],
    queryFn: () => matchesService.getDetails(matchId!),
    enabled: !!matchId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'live' || status === 'half_time') return 15000;
      return false;
    },
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const tableRows = useMemo(() => {
    if (!match) return [];
    return match.standings.isLiveAdjusted
      ? match.standings.liveTable
      : match.standings.table;
  }, [match]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header onBack={() => router.back()} border={border} primary={primary} title="Match" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ThemedView>
    );
  }

  if (!match) {
    return (
      <ThemedView style={styles.container}>
        <Header onBack={() => router.back()} border={border} primary={primary} title="Match" />
        <View style={styles.loading}>
          <ThemedText>Match not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const homeName = match.teams.home.club.name;
  const awayName = match.teams.away.club.name;
  const status = formatStatus(match);

  return (
    <ThemedView style={styles.container}>
      <Header
        onBack={() => router.back()}
        border={border}
        primary={primary}
        title={match.competition.leagueName}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        <View style={[styles.hero, { borderBottomColor: border }]}> 
          <ThemedText style={styles.compMeta}>
            {match.competition.country} • {match.competition.seasonName}
          </ThemedText>

          <View style={styles.scoreRow}>
            <TeamPill name={homeName} border={border} />
            <View style={styles.scoreWrap}>
              <ThemedText type="subtitle" style={styles.scoreText}>
                {match.score.home ?? '-'} : {match.score.away ?? '-'}
              </ThemedText>
            </View>
            <TeamPill name={awayName} border={border} />
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${statusColor(match.status)}20` }]}>
            <ThemedText style={[styles.statusLabel, { color: statusColor(match.status) }]}>
              {status}
            </ThemedText>
          </View>

          <ThemedText style={styles.venue}>{match.venue ?? 'Venue TBA'}</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                { borderColor: border, backgroundColor: activeTab === tab.key ? `${primary}20` : card },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? primary : undefined },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {activeTab === 'overview' && (
          <View style={styles.section}>
            {match.prediction ? (
              <View style={[styles.panel, { borderColor: border }]}> 
                <ThemedText type="defaultSemiBold">Win Probability</ThemedText>
                <View style={styles.probRow}>
                  <ProbItem label={homeName} value={match.prediction.homeWinProb} />
                  <ProbItem label="Draw" value={match.prediction.drawProb} />
                  <ProbItem label={awayName} value={match.prediction.awayWinProb} />
                </View>
              </View>
            ) : null}

            <View style={[styles.panel, { borderColor: border }]}> 
              <ThemedText type="defaultSemiBold">Match Events</ThemedText>
              {match.timeline.length === 0 ? <ThemedText style={styles.muted}>No events yet</ThemedText> : null}
              {match.timeline.map((event) => {
                const isHome = event.teamId === match.teams.home.id;
                return (
                  <View key={event.id} style={styles.timelineRow}>
                    <View style={[styles.timelineSide, styles.timelineSideLeft]}>
                      {isHome ? (
                        <View style={[styles.eventBubble, styles.eventBubbleHome]}>
                          <ThemedText style={styles.eventBubbleText}>
                            {event.type.replaceAll('_', ' ')}
                            {event.player ? ` • ${event.player.fullName}` : ''}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                    <ThemedText style={styles.timelineMinute}>{`${event.minute}'`}</ThemedText>
                    <View style={[styles.timelineSide, styles.timelineSideRight]}>
                      {!isHome ? (
                        <View style={[styles.eventBubble, styles.eventBubbleAway]}>
                          <ThemedText style={styles.eventBubbleText}>
                            {event.type.replaceAll('_', ' ')}
                            {event.player ? ` • ${event.player.fullName}` : ''}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.section}>
            <StatsPanel
              border={border}
              homeName={homeName}
              awayName={awayName}
              home={match.stats.home}
              away={match.stats.away}
            />
          </View>
        )}

        {activeTab === 'lineup' && (
          <View style={styles.section}>
            <LineupPanel
              border={border}
              title={`${homeName} XI`}
              starters={match.lineups.home.starters}
              bench={match.lineups.home.bench}
            />
            <LineupPanel
              border={border}
              title={`${awayName} XI`}
              starters={match.lineups.away.starters}
              bench={match.lineups.away.bench}
            />
          </View>
        )}

        {activeTab === 'standings' && (
          <View style={styles.section}>
            <View style={[styles.panel, { borderColor: border }]}> 
              <ThemedText type="defaultSemiBold">
                {match.standings.isLiveAdjusted ? 'Live Table Projection' : 'League Table'}
              </ThemedText>
              {tableRows.map((row) => (
                <StandingRow
                  key={row.teamId}
                  row={row}
                  border={border}
                  highlight={row.teamId === match.teams.home.id || row.teamId === match.teams.away.id}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function Header({
  onBack,
  border,
  primary,
  title,
}: {
  onBack: () => void;
  border: string;
  primary: string;
  title: string;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: border }]}> 
      <Pressable onPress={onBack} hitSlop={12}>
        <IconSymbol name="chevron.left" size={24} color={primary} />
      </Pressable>
      <ThemedText numberOfLines={1} style={styles.headerTitle}>
        {title}
      </ThemedText>
      <View style={styles.headerRight} />
    </View>
  );
}

function TeamPill({ name, border }: { name: string; border: string }) {
  return (
    <View style={[styles.teamPill, { borderColor: border }]}> 
      <ThemedText numberOfLines={1} style={styles.teamName}>
        {name}
      </ThemedText>
    </View>
  );
}

function ProbItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.probItem}>
      <ThemedText style={styles.muted} numberOfLines={1}>
        {label}
      </ThemedText>
      <ThemedText type="defaultSemiBold">{value}%</ThemedText>
    </View>
  );
}

function StatsPanel({
  border,
  homeName,
  awayName,
  home,
  away,
}: {
  border: string;
  homeName: string;
  awayName: string;
  home: MatchDetails['stats']['home'];
  away: MatchDetails['stats']['away'];
}) {
  const rows = [
    { key: 'Possession', home: home?.possession, away: away?.possession, suffix: '%' },
    { key: 'Shots On Target', home: home?.shotsOnTarget, away: away?.shotsOnTarget },
    { key: 'Shots Off Target', home: home?.shotsOffTarget, away: away?.shotsOffTarget },
    { key: 'Corners', home: home?.corners, away: away?.corners },
    { key: 'Fouls', home: home?.fouls, away: away?.fouls },
    { key: 'Yellow Cards', home: home?.yellowCards, away: away?.yellowCards },
    { key: 'Red Cards', home: home?.redCards, away: away?.redCards },
    { key: 'Pass Accuracy', home: home?.passAccuracy, away: away?.passAccuracy, suffix: '%' },
  ];

  return (
    <View style={[styles.panel, { borderColor: border }]}> 
      <View style={[styles.statsHeader, { borderBottomColor: border }]}> 
        <ThemedText numberOfLines={1} style={styles.teamHeaderText}>{homeName}</ThemedText>
        <ThemedText style={styles.muted}>Stat</ThemedText>
        <ThemedText numberOfLines={1} style={[styles.teamHeaderText, styles.teamHeaderTextRight]}>{awayName}</ThemedText>
      </View>
      {rows.map((row) => (
        <View key={row.key} style={[styles.statsRow, { borderBottomColor: border }]}> 
          <ThemedText>{formatStat(row.home, row.suffix)}</ThemedText>
          <ThemedText style={styles.muted}>{row.key}</ThemedText>
          <ThemedText>{formatStat(row.away, row.suffix)}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function formatStat(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '-';
  return `${value}${suffix}`;
}

function LineupPanel({
  border,
  title,
  starters,
  bench,
}: {
  border: string;
  title: string;
  starters: MatchDetails['lineups']['home']['starters'];
  bench: MatchDetails['lineups']['home']['bench'];
}) {
  return (
    <View style={[styles.panel, { borderColor: border }]}> 
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText style={styles.groupLabel}>Starters</ThemedText>
      {starters.length === 0 ? <ThemedText style={styles.muted}>No lineup data</ThemedText> : null}
      {starters.map((player) => (
        <ThemedText key={player.id} style={styles.playerLine}>
          {player.jerseyNumber ? `#${player.jerseyNumber} ` : ''}
          {player.player.fullName} ({player.position})
        </ThemedText>
      ))}

      <ThemedText style={styles.groupLabel}>Bench</ThemedText>
      {bench.length === 0 ? <ThemedText style={styles.muted}>No bench data</ThemedText> : null}
      {bench.map((player) => (
        <ThemedText key={player.id} style={styles.playerLine}>
          {player.jerseyNumber ? `#${player.jerseyNumber} ` : ''}
          {player.player.fullName} ({player.position})
        </ThemedText>
      ))}
    </View>
  );
}

function StandingRow({
  row,
  border,
  highlight,
}: {
  row: MatchStandingRow;
  border: string;
  highlight: boolean;
}) {
  return (
    <View style={[styles.standingRow, { borderBottomColor: border, backgroundColor: highlight ? '#10b98114' : 'transparent' }]}> 
      <ThemedText style={styles.standingPos}>{row.position}</ThemedText>
      <ThemedText numberOfLines={1} style={styles.standingTeam}>{row.team.club.name}</ThemedText>
      <ThemedText style={styles.standingPts}>{row.points}</ThemedText>
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
    fontSize: 15,
    marginHorizontal: 12,
  },
  headerRight: { width: 24 },
  content: { paddingBottom: 40 },
  loading: { paddingTop: 80, alignItems: 'center' },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    gap: 10,
  },
  compMeta: { fontSize: 13, opacity: 0.7, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreWrap: { minWidth: 88, alignItems: 'center' },
  scoreText: { fontSize: 28 },
  teamPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  teamName: { fontSize: 14, textAlign: 'center' },
  statusBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  venue: { textAlign: 'center', fontSize: 13, opacity: 0.7 },
  tabs: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  tab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 20, gap: 12 },
  panel: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  probRow: { flexDirection: 'row', gap: 8 },
  probItem: { flex: 1, alignItems: 'center', gap: 4 },
  muted: { fontSize: 13, opacity: 0.65 },
  eventLine: { fontSize: 14, opacity: 0.9 },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineSide: {
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
  },
  timelineSideLeft: {
    alignItems: 'flex-end',
  },
  timelineSideRight: {
    alignItems: 'flex-start',
  },
  eventBubble: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: '95%',
  },
  eventBubbleHome: {
    backgroundColor: '#10b98120',
  },
  eventBubbleAway: {
    backgroundColor: '#3b82f620',
  },
  eventBubbleText: {
    fontSize: 12,
  },
  timelineMinute: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '700',
  },
  eventRow: {
    flexDirection: 'row',
    gap: 10,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  eventMinute: { width: 36, fontSize: 13, opacity: 0.75 },
  eventInfo: { flex: 1, gap: 2 },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  teamHeaderText: { flex: 1, fontSize: 13 },
  teamHeaderTextRight: { textAlign: 'right' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  groupLabel: { fontSize: 12, opacity: 0.65, textTransform: 'uppercase' },
  playerLine: { fontSize: 14 },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  standingPos: { width: 26, fontSize: 13 },
  standingTeam: { flex: 1, fontSize: 14 },
  standingPts: { width: 28, textAlign: 'right', fontWeight: '700' },
});
