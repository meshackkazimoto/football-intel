import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { leaguesService } from '@/services/leagues/leagues.service';

export default function StandingsScreen() {
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  // TODO: replace with selected season from UI
  const [seasonId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    enabled: !!seasonId,
    queryKey: ['standings', seasonId],
    queryFn: () => leaguesService.getStandings(seasonId!),
  });

  const standings = data?.standings ?? [];
  const league = data?.league;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: border }]}>
        <ThemedText type="title" style={styles.title}>
          {league ? `${league.name}` : 'Standings'}
        </ThemedText>

        {league && (
          <ThemedText style={styles.subtitle}>
            {league.country} • {league.season}
          </ThemedText>
        )}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : standings.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              No standings available
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: border }]}>
              <View style={styles.posCol}>
                <ThemedText style={styles.headerText}>#</ThemedText>
              </View>
              <View style={styles.teamCol}>
                <ThemedText style={styles.headerText}>Team</ThemedText>
              </View>
              <View style={styles.statCol}>
                <ThemedText style={styles.headerText}>P</ThemedText>
              </View>
              <View style={styles.statCol}>
                <ThemedText style={styles.headerText}>GD</ThemedText>
              </View>
              <View style={styles.ptsCol}>
                <ThemedText style={styles.headerText}>Pts</ThemedText>
              </View>
            </View>

            {/* Table Body */}
            <View style={styles.table}>
              {standings.map((row) => {
                const isChampion = row.status === 'champions';
                const isRelegated = row.status === 'relegated';

                return (
                  <View
                    key={row.team.id}
                    style={[
                      styles.row,
                      { borderBottomColor: border },
                      isChampion && styles.championRow,
                      isRelegated && styles.relegationRow,
                    ]}
                  >
                    <View style={styles.posCol}>
                      <ThemedText style={styles.position}>
                        {row.position}
                      </ThemedText>
                    </View>

                    <View style={styles.teamCol}>
                      <View style={styles.teamInfo}>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: background },
                          ]}
                        >
                          <ThemedText style={styles.badgeText}>
                            {row.team.clubName.charAt(0)}
                          </ThemedText>
                        </View>

                        <ThemedText
                          style={styles.teamName}
                          numberOfLines={1}
                        >
                          {row.team.clubName}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.statCol}>
                      <ThemedText style={styles.stat}>
                        {row.played}
                      </ThemedText>
                    </View>

                    <View style={styles.statCol}>
                      <ThemedText
                        style={[
                          styles.stat,
                          row.goalDifference > 0 && { color: '#22c55e' },
                          row.goalDifference < 0 && { color: '#ef4444' },
                        ]}
                      >
                        {row.goalDifference > 0 ? '+' : ''}
                        {row.goalDifference}
                      </ThemedText>
                    </View>

                    <View style={styles.ptsCol}>
                      <ThemedText style={styles.points}>
                        {row.points}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ========================= STYLES ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
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

  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
  },

  table: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  championRow: {
    backgroundColor: '#22c55e12',
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  relegationRow: {
    backgroundColor: '#ef444412',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },

  posCol: {
    width: 32,
  },
  position: {
    fontSize: 15,
    fontWeight: '600',
  },

  teamCol: {
    flex: 1,
    marginRight: 12,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  statCol: {
    width: 42,
    alignItems: 'center',
  },
  stat: {
    fontSize: 14,
    fontWeight: '500',
  },

  ptsCol: {
    width: 46,
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 16,
    fontWeight: '700',
  },
});