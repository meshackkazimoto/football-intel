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

type League = 'nbc-premier' | 'championship' | 'fa-cup';

const LEAGUES = [
  { id: 'nbc-premier', name: 'NBC Premier League' },
  { id: 'championship', name: 'Championship' },
  { id: 'fa-cup', name: 'FA Cup' },
];

export default function StandingsScreen() {
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [selectedLeague, setSelectedLeague] = useState<League>('nbc-premier');

  const {
    data: standings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['standings', selectedLeague],
    queryFn: () => leaguesService.getStandings(selectedLeague),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <ThemedText type="title" style={styles.title}>
          Standings
        </ThemedText>
      </View>

      <View style={[styles.tabs, { borderBottomColor: border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {LEAGUES.map((league) => (
            <Pressable
              key={league.id}
              onPress={() => setSelectedLeague(league.id as League)}
              style={[
                styles.tab,
                selectedLeague === league.id && {
                  borderBottomWidth: 2,
                  borderBottomColor: primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  selectedLeague === league.id && {
                    color: primary,
                    fontWeight: '600',
                  },
                ]}
              >
                {league.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

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
        ) : (
          <>
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

            <View style={styles.table}>
              {standings.map((team, index) => (
                <View
                  key={team.id}
                  style={[
                    styles.row,
                    index !== standings.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: border,
                    },
                    team.zone === 'champions' && {
                      backgroundColor: `${primary}08`,
                      borderLeftWidth: 3,
                      borderLeftColor: primary,
                    },
                    team.zone === 'relegation' && {
                      backgroundColor: '#ff444408',
                      borderLeftWidth: 3,
                      borderLeftColor: '#ff4444',
                    },
                  ]}
                >
                  <View style={styles.posCol}>
                    <ThemedText style={styles.position}>
                      {team.position}
                    </ThemedText>
                  </View>

                  <View style={styles.teamCol}>
                    <View style={styles.teamInfo}>
                      <View
                        style={[styles.badge, { backgroundColor: background }]}
                      >
                        <ThemedText style={styles.badgeText}>
                          {team.teamShort}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.teamName} numberOfLines={1}>
                        {team.teamName}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.statCol}>
                    <ThemedText style={styles.stat}>
                      {team.played}
                    </ThemedText>
                  </View>

                  <View style={styles.statCol}>
                    <ThemedText
                      style={[
                        styles.stat,
                        team.goalDifference > 0 && { color: '#22c55e' },
                        team.goalDifference < 0 && { color: '#ef4444' },
                      ]}
                    >
                      {team.goalDifference > 0 ? '+' : ''}
                      {team.goalDifference}
                    </ThemedText>
                  </View>

                  <View style={styles.ptsCol}>
                    <ThemedText style={styles.points}>
                      {team.points}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            {standings.length === 0 && (
              <View style={styles.empty}>
                <ThemedText style={styles.emptyText}>
                  No standings available
                </ThemedText>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
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
  },
  title: {
    fontSize: 22,
  },

  tabs: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingVertical: 14,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },

  content: {
    paddingBottom: 40,
  },

  loading: {
    paddingTop: 80,
    alignItems: 'center',
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
    letterSpacing: 0.5,
  },

  table: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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

  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
  },
});