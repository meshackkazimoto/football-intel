import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { matchesService } from '@/services/matches/matches.service';
import { theme } from '@/theme';
import { formatDateTime } from '@/utils/format';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', id, 'result'],
    queryFn: () => matchesService.getMatchResult(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  const homeTeam = match.homeTeam?.club?.name || 'TBD';
  const awayTeam = match.awayTeam?.club?.name || 'TBD';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchDate}>{formatDateTime(match.matchDate)}</Text>
          {match.status === 'live' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {match.status === 'finished' && (
            <Text style={styles.finishedBadge}>Full Time</Text>
          )}
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.teamSection}>
            <Text style={styles.teamNameLarge}>{homeTeam}</Text>
            <Text style={styles.scoreLarge}>{match.homeScore ?? '-'}</Text>
          </View>

          <Text style={styles.vsLarge}>vs</Text>

          <View style={styles.teamSection}>
            <Text style={styles.teamNameLarge}>{awayTeam}</Text>
            <Text style={styles.scoreLarge}>{match.awayScore ?? '-'}</Text>
          </View>
        </View>
      </View>

      {match.timeline && match.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Timeline</Text>
          {match.timeline.map((event, index) => (
            <EventItem key={index} event={event} homeTeamId={match.homeTeamId} />
          ))}
        </View>
      )}

      {match.lineups && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lineups</Text>
          <View style={styles.lineupContainer}>
            <View style={styles.lineupSection}>
              <Text style={styles.lineupTitle}>Home</Text>
              {match.lineups.home?.map((player: any, index: number) => (
                <Text key={index} style={styles.lineupPlayer}>
                  {player.player?.fullName || 'TBD'}
                </Text>
              ))}
            </View>
            <View style={styles.lineupSection}>
              <Text style={styles.lineupTitle}>Away</Text>
              {match.lineups.away?.map((player: any, index: number) => (
                <Text key={index} style={styles.lineupPlayer}>
                  {player.player?.fullName || 'TBD'}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function EventItem({ event, homeTeamId }: { event: any; homeTeamId: string }) {
  const isHome = event.teamId === homeTeamId;
  const eventIcons: Record<string, string> = {
    goal: '⚽',
    yellow_card: '🟨',
    red_card: '🟥',
    substitution: '🔄',
    disallowed_goal: '❌',
  };

  return (
    <View style={styles.eventItem}>
      <Text style={styles.eventMinute}>{event.minute}'</Text>
      <Text style={styles.eventIcon}>{eventIcons[event.type] || '•'}</Text>
      <View style={styles.eventContent}>
        <Text style={styles.eventType}>{event.type.replace('_', ' ')}</Text>
        {event.player && (
          <Text style={styles.eventPlayer}>{event.player.fullName}</Text>
        )}
      </View>
      <Text style={[styles.eventTeam, isHome && styles.eventTeamHome]}>
        {isHome ? 'Home' : 'Away'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  scoreCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  matchDate: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.rose[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.rose[500],
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.rose[600],
    textTransform: 'uppercase',
  },
  finishedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.lg,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamNameLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  scoreLarge: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  vsLarge: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.lg,
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventMinute: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    width: 40,
  },
  eventIcon: {
    fontSize: 20,
    marginHorizontal: theme.spacing.sm,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  eventPlayer: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  eventTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  eventTeamHome: {
    color: theme.colors.primary,
  },
  lineupContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  lineupSection: {
    flex: 1,
  },
  lineupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  lineupPlayer: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    paddingVertical: 4,
  },
});
