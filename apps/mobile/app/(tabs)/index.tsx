import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { matchesService } from '@/services/matches/matches.service';
import { theme } from '@/theme';
import { formatTime, formatDate } from '@/utils/format';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['matches', 'today'],
    queryFn: () => matchesService.getTodayMatches(),
    retry: 1,
  });

  const matches = data?.data || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
        />
      }
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Football Intel</Text>
        <Text style={styles.headerSubtitle}>NBC Premier League</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Matches</Text>
          <Text style={styles.sectionSubtitle}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyTitle}>Error loading matches</Text>
            <Text style={styles.emptySubtitle}>
              {error instanceof Error ? error.message : 'Something went wrong'}
            </Text>
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⚽</Text>
            <Text style={styles.emptyTitle}>No matches today</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for upcoming fixtures
            </Text>
          </View>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPress={() => {
                try {
                  router.push(`/match/${match.id}`);
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/(tabs)/matches')}
        >
          <Text style={styles.viewAllText}>View All Matches →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MatchCard({
  match,
  onPress,
}: {
  match: {
    id: string;
    matchDate: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    homeTeam?: { club?: { name?: string } };
    awayTeam?: { club?: { name?: string } };
  };
  onPress: () => void;
}) {
  const homeTeam = match.homeTeam?.club?.name || 'TBD';
  const awayTeam = match.awayTeam?.club?.name || 'TBD';
  const homeScore = match.homeScore ?? '-';
  const awayScore = match.awayScore ?? '-';
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchDate}>{formatDate(match.matchDate)}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        {isFinished && (
          <Text style={styles.finishedBadge}>FT</Text>
        )}
      </View>

      <View style={styles.matchContent}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            {homeTeam}
          </Text>
          <Text style={styles.score}>{homeScore}</Text>
        </View>

        <Text style={styles.vs}>vs</Text>

        <View style={styles.teamContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            {awayTeam}
          </Text>
          <Text style={styles.score}>{awayScore}</Text>
        </View>
      </View>

      <View style={styles.matchFooter}>
        <Text style={styles.matchTime}>
          {formatTime(match.matchDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  centerContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  matchDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.rose[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.rose[500],
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.rose[600],
    textTransform: 'uppercase',
  },
  finishedBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.md,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  vs: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing.md,
    fontWeight: '600',
  },
  matchFooter: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  matchTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  viewAllButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryBg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
