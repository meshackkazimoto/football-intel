import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import type { MatchListItem } from '@/services/matches/types/match-list';
import type { LiveMatch } from '@/services/matches/types/match-live';
import type { MatchSearchResult } from '@/services/search/types';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

interface MatchCardProps {
  match: (MatchListItem | LiveMatch | MatchSearchResult) & {
    minute?: number | null;
    competition?: string;
  };
}

export function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');

  const homeTeamData = match.homeTeam as
    | { club?: { name?: string } | null; name?: string }
    | undefined;
  const awayTeamData = match.awayTeam as
    | { club?: { name?: string } | null; name?: string }
    | undefined;

  const homeName = homeTeamData?.club?.name ?? homeTeamData?.name ?? 'Home';
  const awayName = awayTeamData?.club?.name ?? awayTeamData?.name ?? 'Away';
  const homeShort = homeName.substring(0, 3).toUpperCase();
  const awayShort = awayName.substring(0, 3).toUpperCase();

  const homeScore = 'score' in match ? match.score.home : match.homeScore;
  const awayScore = 'score' in match ? match.score.away : match.awayScore;

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isHalftime = match.status === 'half_time';
  return (
    <Pressable
      onPress={() => router.push(`/match/${match.id}`)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <ThemedView
        lightColor={Colors.light.card}
        darkColor={Colors.dark.card}
        style={[styles.card, { borderColor: border }]}
      >
        <View style={styles.header}>
          <View style={styles.metaLeft}>
            <ThemedText style={styles.date}>{formatDate(match.matchDate)}</ThemedText>
            <View style={[styles.dot, { backgroundColor: border }]} />
            <ThemedText style={styles.time}>{formatTime(match.matchDate)}</ThemedText>
          </View>

          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>
                {match.minute ? `${match.minute}'` : 'LIVE'}
              </ThemedText>
            </View>
          )}

          {isHalftime && (
            <View style={[styles.statusBadge, { backgroundColor: `${primary}15` }]}>
              <ThemedText style={[styles.statusText, { color: primary }]}>HT</ThemedText>
            </View>
          )}

          {isFinished && (
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>FT</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.matchContent}>
          <View style={styles.team}>
            <View style={[styles.teamBadge, { backgroundColor: background, borderColor: border }]}>
              <ThemedText style={styles.badgeText}>{homeShort}</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.teamName} numberOfLines={1}>
              {homeName}
            </ThemedText>
          </View>

          <View style={styles.scoreContainer}>
            {isFinished || isLive || isHalftime ? (
              <>
                <ThemedText type="defaultSemiBold" style={styles.score}>
                  {homeScore ?? 0}
                </ThemedText>
                <ThemedText style={styles.scoreSeparator}>-</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.score}>
                  {awayScore ?? 0}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={styles.vs}>vs</ThemedText>
            )}
          </View>

          <View style={[styles.team, styles.awayTeam]}>
            <ThemedText 
              type="defaultSemiBold" 
              style={[styles.teamName, styles.awayName]} 
              numberOfLines={1}
            >
              {awayName}
            </ThemedText>
            <View style={[styles.teamBadge, { backgroundColor: background, borderColor: border }]}>
              <ThemedText style={styles.badgeText}>{awayShort}</ThemedText>
            </View>
          </View>
        </View>

        {match.competition && (
          <View style={styles.footer}>
            <ThemedText style={styles.competition}>{match.competition}</ThemedText>
          </View>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#ef444410',
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.3,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
  },

  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  team: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  awayTeam: {
    flexDirection: 'row-reverse',
  },
  teamBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamName: {
    flex: 1,
    fontSize: 15,
  },
  awayName: {
    textAlign: 'right',
  },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    gap: 6,
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.4,
  },
  vs: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.5,
  },

  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb20',
  },
  competition: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});
