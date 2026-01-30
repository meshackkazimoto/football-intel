import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import type { Match } from '@/services/matches/types';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function MatchCard({ match }: { match: Match }) {
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const homeName = match.homeTeam?.club?.name ?? match.homeTeam?.club?.shortName ?? 'Home';
  const awayName = match.awayTeam?.club?.name ?? match.awayTeam?.club?.shortName ?? 'Away';
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <ThemedView
      lightColor={Colors.light.card}
      darkColor={Colors.dark.card}
      style={[styles.card, { borderColor: border }]}
    >
      <View style={styles.meta}>
        <ThemedText style={styles.date}>{formatDate(match.matchDate)}</ThemedText>
        <ThemedText style={styles.time}>{formatTime(match.matchDate)}</ThemedText>
        {isLive && (
          <View style={[styles.liveBadge, { backgroundColor: primary }]}>
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.teams}>
        <ThemedText type="defaultSemiBold" style={styles.teamName} numberOfLines={1}>
          {homeName}
        </ThemedText>
        <View style={styles.scoreRow}>
          {isFinished || isLive ? (
            <ThemedText type="defaultSemiBold" style={styles.score}>
              {match.homeScore ?? '-'} - {match.awayScore ?? '-'}
            </ThemedText>
          ) : (
            <ThemedText style={styles.vs}>vs</ThemedText>
          )}
        </View>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.teamName, styles.awayName]}
          numberOfLines={1}
        >
          {awayName}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    opacity: 0.8,
  },
  time: {
    fontSize: 13,
    opacity: 0.8,
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    flex: 1,
    fontSize: 15,
  },
  awayName: {
    textAlign: 'right',
  },
  scoreRow: {
    minWidth: 64,
    alignItems: 'center',
  },
  score: {
    fontSize: 16,
  },
  vs: {
    fontSize: 13,
    opacity: 0.7,
  },
});
