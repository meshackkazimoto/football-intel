import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { matchesService } from '@/services/matches/matches.service';
import { theme } from '@/theme';
import { formatTime, formatDate } from '@/utils/format';
import { useRouter } from 'expo-router';

export default function MatchesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['matches', filter],
    queryFn: () => {
      if (filter === 'today') {
        return matchesService.getTodayMatches();
      }
      if (filter === 'upcoming') {
        return matchesService.getUpcomingMatches();
      }
      return matchesService.getMatches({ limit: 50 });
    },
  });

  const matches = data?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerSubtitle}>NBC Premier League</Text>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterButton
          label="Today"
          active={filter === 'today'}
          onPress={() => setFilter('today')}
        />
        <FilterButton
          label="Upcoming"
          active={filter === 'upcoming'}
          onPress={() => setFilter('upcoming')}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⚽</Text>
            <Text style={styles.emptyTitle}>No matches found</Text>
          </View>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPress={() => router.push(`/match/${match.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MatchCard({
  match,
  onPress,
}: {
  match: any;
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
        {isFinished && <Text style={styles.finishedBadge}>FT</Text>}
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
        <Text style={styles.matchTime}>{formatTime(match.matchDate)}</Text>
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
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.slate[100],
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primaryBg,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
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
  },
  matchCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
});
