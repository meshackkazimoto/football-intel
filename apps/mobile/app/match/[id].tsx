import { useCallback } from 'react';
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { matchesService } from '@/services/matches/matches.service';

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const {
    data: match,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchesService.getMatchDetails(id as string),
    enabled: !!id,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={primary} />
          </Pressable>
          <ThemedText type="subtitle">Match Details</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ThemedView>
    );
  }

  if (!match) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={primary} />
          </Pressable>
          <ThemedText type="subtitle">Match Details</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}>
          <ThemedText style={styles.emptyText}>Match not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={primary} />
        </Pressable>
        <ThemedText type="subtitle">{match.competition}</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
      >
        <View style={styles.scoreSection}>
          {match.status === 'live' && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.statusText}>{match.minute}'</ThemedText>
            </View>
          )}

          {(match.status === 'finished' || match.status === 'halftime') && (
            <ThemedText style={styles.statusLabel}>
              {match.status === 'finished' ? 'Full Time' : 'Half Time'}
            </ThemedText>
          )}

          {match.status === 'scheduled' && (
            <ThemedText style={styles.kickoffTime}>{match.kickoffTime}</ThemedText>
          )}

          <View style={styles.teams}>
            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                <View style={[styles.teamBadge, { borderColor: border }]}>
                  <ThemedText style={styles.teamBadgeText}>
                    {match.homeTeamShort}
                  </ThemedText>
                </View>
                <ThemedText style={styles.teamName}>{match.homeTeam}</ThemedText>
              </View>
              {match.status !== 'scheduled' && (
                <ThemedText style={styles.teamScore}>{match.homeScore}</ThemedText>
              )}
            </View>

            <View style={styles.teamRow}>
              <View style={styles.teamInfo}>
                <View style={[styles.teamBadge, { borderColor: border }]}>
                  <ThemedText style={styles.teamBadgeText}>
                    {match.awayTeamShort}
                  </ThemedText>
                </View>
                <ThemedText style={styles.teamName}>{match.awayTeam}</ThemedText>
              </View>
              {match.status !== 'scheduled' && (
                <ThemedText style={styles.teamScore}>{match.awayScore}</ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: background, borderColor: border }]}>
          <InfoRow label="Venue" value={match.venue || 'TBA'} border={border} />
          <InfoRow label="Referee" value={match.referee || 'TBA'} border={border} />
          <InfoRow label="Date" value={match.date} border={border} last />
        </View>

        {match.timeline && match.timeline.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Match Events</ThemedText>
            <View style={[styles.timeline, { borderColor: border }]}>
              {match.timeline.map((event, i) => (
                <View
                  key={i}
                  style={[
                    styles.timelineItem,
                    i !== match.timeline.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: border,
                    },
                  ]}
                >
                  <View style={styles.timelineLeft}>
                    <ThemedText style={styles.timelineMinute}>
                      {event.minute}'
                    </ThemedText>
                    <View style={styles.timelineIcon}>
                      <ThemedText style={styles.timelineIconText}>
                        {event.type === 'goal' ? '⚽' : event.type === 'yellow' ? '🟨' : event.type === 'red' ? '🟥' : '🔄'}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.timelineRight}>
                    <ThemedText style={styles.timelinePlayer}>
                      {event.player}
                    </ThemedText>
                    {event.assist && (
                      <ThemedText style={styles.timelineAssist}>
                        Assist: {event.assist}
                      </ThemedText>
                    )}
                    <ThemedText style={styles.timelineTeam}>
                      {event.team}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {match.stats && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Match Statistics</ThemedText>
            <View style={[styles.stats, { borderColor: border }]}>
              <StatBar
                label="Possession"
                homeValue={match.stats.possession.home}
                awayValue={match.stats.possession.away}
                primary={primary}
                border={border}
              />
              <StatBar
                label="Shots"
                homeValue={match.stats.shots.home}
                awayValue={match.stats.shots.away}
                primary={primary}
                border={border}
              />
              <StatBar
                label="Shots on Target"
                homeValue={match.stats.shotsOnTarget.home}
                awayValue={match.stats.shotsOnTarget.away}
                primary={primary}
                border={border}
              />
              <StatBar
                label="Corners"
                homeValue={match.stats.corners.home}
                awayValue={match.stats.corners.away}
                primary={primary}
                border={border}
                last
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({ label, value, border, last }: any) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && { borderBottomWidth: 1, borderBottomColor: border },
      ]}
    >
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

function StatBar({ label, homeValue, awayValue, primary, border, last }: any) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <View
      style={[
        styles.statRow,
        !last && { borderBottomWidth: 1, borderBottomColor: border },
      ]}
    >
      <View style={styles.statValues}>
        <ThemedText style={styles.statValue}>{homeValue}</ThemedText>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
        <ThemedText style={styles.statValue}>{awayValue}</ThemedText>
      </View>
      <View style={styles.statBar}>
        <View
          style={[
            styles.statBarHome,
            { width: `${homePercent}%`, backgroundColor: primary },
          ]}
        />
        <View
          style={[
            styles.statBarAway,
            { width: `${awayPercent}%`, backgroundColor: '#94a3b8' },
          ]}
        />
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
    alignItems: 'center',
  },

  content: {
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

  scoreSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ef444410',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kickoffTime: {
    fontSize: 15,
    fontWeight: '600',
  },

  teams: {
    width: '100%',
    gap: 20,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginRight: 16,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  teamScore: {
    fontSize: 32,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'right',
  },

  infoCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },

  timeline: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    gap: 8,
    width: 50,
  },
  timelineMinute: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.6,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineRight: {
    flex: 1,
    gap: 4,
  },
  timelinePlayer: {
    fontSize: 15,
    fontWeight: '600',
  },
  timelineAssist: {
    fontSize: 13,
    opacity: 0.6,
  },
  timelineTeam: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 2,
  },

  stats: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statRow: {
    padding: 16,
    gap: 12,
  },
  statValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 32,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  statBar: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  statBarHome: {
    height: '100%',
  },
  statBarAway: {
    height: '100%',
  },
});