import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { standingsService } from '@/services/standings/standings.service';
import { theme } from '@/theme';

// You'll need to get the current season ID - for now using a placeholder
const CURRENT_SEASON_ID = 'current'; // Replace with actual season ID

export default function StandingsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['standings', CURRENT_SEASON_ID],
    queryFn: () => standingsService.getStandings(CURRENT_SEASON_ID),
    enabled: !!CURRENT_SEASON_ID && CURRENT_SEASON_ID !== 'current',
  });

  const standings = data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>League Standings</Text>
        <Text style={styles.headerSubtitle}>NBC Premier League</Text>
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
        ) : standings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyTitle}>No standings available</Text>
            <Text style={styles.emptySubtitle}>
              Standings will appear here once the season starts
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: 40 }]}>Pos</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Team</Text>
              <Text style={[styles.tableHeaderText, { width: 30 }]}>P</Text>
              <Text style={[styles.tableHeaderText, { width: 30 }]}>W</Text>
              <Text style={[styles.tableHeaderText, { width: 30 }]}>D</Text>
              <Text style={[styles.tableHeaderText, { width: 30 }]}>L</Text>
              <Text style={[styles.tableHeaderText, { width: 40 }]}>GD</Text>
              <Text style={[styles.tableHeaderText, { width: 40 }]}>Pts</Text>
            </View>
            {standings.map((standing, index) => (
              <StandingRow
                key={standing.id}
                standing={standing}
                position={index + 1}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StandingRow({
  standing,
  position,
}: {
  standing: any;
  position: number;
}) {
  const teamName = standing.team?.club?.name || 'TBD';
  const isTopThree = position <= 3;

  return (
    <View
      style={[
        styles.tableRow,
        isTopThree && styles.tableRowTopThree,
      ]}
    >
      <Text style={[styles.tableCell, { width: 40, fontWeight: '700' }]}>
        {position}
      </Text>
      <Text
        style={[styles.tableCell, { flex: 1 }]}
        numberOfLines={1}
      >
        {teamName}
      </Text>
      <Text style={[styles.tableCell, { width: 30 }]}>{standing.played}</Text>
      <Text style={[styles.tableCell, { width: 30 }]}>{standing.won}</Text>
      <Text style={[styles.tableCell, { width: 30 }]}>{standing.drawn}</Text>
      <Text style={[styles.tableCell, { width: 30 }]}>{standing.lost}</Text>
      <Text
        style={[
          styles.tableCell,
          { width: 40, color: standing.goalDifference >= 0 ? theme.colors.success : theme.colors.error },
        ]}
      >
        {standing.goalDifference > 0 ? '+' : ''}
        {standing.goalDifference}
      </Text>
      <Text
        style={[
          styles.tableCell,
          { width: 40, fontWeight: '700', color: theme.colors.primary },
        ]}
      >
        {standing.points}
      </Text>
    </View>
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.slate[50],
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  tableRowTopThree: {
    backgroundColor: theme.colors.primaryBg,
  },
  tableCell: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
});
