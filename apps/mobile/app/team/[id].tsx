import { useState, useCallback } from 'react';
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
import { MatchCard } from '@/components/match-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { teamsService } from '@/services/teams/teams.service';

type Tab = 'overview' | 'fixtures' | 'results';

export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const {
    data: team,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsService.getTeamDetails(id as string),
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
          <ThemedText type="subtitle">Team</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ThemedView>
    );
  }

  if (!team) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={primary} />
          </Pressable>
          <ThemedText type="subtitle">Team</ThemedText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}>
          <ThemedText style={styles.emptyText}>Team not found</ThemedText>
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
        <ThemedText type="subtitle">{team.league}</ThemedText>
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
        <View style={styles.teamHeader}>
          <View style={[styles.teamBadge, { borderColor: border }]}>
            <ThemedText style={styles.teamBadgeText}>
              {team.shortName}
            </ThemedText>
          </View>
          <ThemedText style={styles.teamName}>{team.name}</ThemedText>
          <ThemedText style={styles.teamLeague}>{team.league}</ThemedText>
        </View>

        <View style={[styles.statsGrid, { borderColor: border }]}>
          <View style={[styles.statBox, { borderRightWidth: 1, borderRightColor: border }]}>
            <ThemedText style={styles.statValue}>{team.position || '-'}</ThemedText>
            <ThemedText style={styles.statLabel}>Position</ThemedText>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 1, borderRightColor: border }]}>
            <ThemedText style={styles.statValue}>{team.points || '-'}</ThemedText>
            <ThemedText style={styles.statLabel}>Points</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statValue}>{team.played || '-'}</ThemedText>
            <ThemedText style={styles.statLabel}>Played</ThemedText>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: background, borderColor: border }]}>
          <InfoRow label="Stadium" value={team.stadium || 'N/A'} border={border} />
          <InfoRow label="Manager" value={team.manager || 'N/A'} border={border} />
          <InfoRow label="Founded" value={team.founded || 'N/A'} border={border} last />
        </View>

        <View style={[styles.tabs, { borderBottomColor: border }]}>
          <Pressable
            onPress={() => setActiveTab('overview')}
            style={[
              styles.tab,
              activeTab === 'overview' && {
                borderBottomWidth: 2,
                borderBottomColor: primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'overview' && { color: primary, fontWeight: '600' },
              ]}
            >
              Overview
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('fixtures')}
            style={[
              styles.tab,
              activeTab === 'fixtures' && {
                borderBottomWidth: 2,
                borderBottomColor: primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'fixtures' && { color: primary, fontWeight: '600' },
              ]}
            >
              Fixtures
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('results')}
            style={[
              styles.tab,
              activeTab === 'results' && {
                borderBottomWidth: 2,
                borderBottomColor: primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'results' && { color: primary, fontWeight: '600' },
              ]}
            >
              Results
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View style={styles.overview}>
              {team.form && team.form.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Form</ThemedText>
                  <View style={styles.formContainer}>
                    {team.form.map((result, i) => (
                      <View
                        key={i}
                        style={[
                          styles.formBadge,
                          {
                            backgroundColor:
                              result === 'W'
                                ? '#22c55e20'
                                : result === 'D'
                                ? '#f59e0b20'
                                : '#ef444420',
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.formText,
                            {
                              color:
                                result === 'W'
                                  ? '#22c55e'
                                  : result === 'D'
                                  ? '#f59e0b'
                                  : '#ef4444',
                            },
                          ]}
                        >
                          {result}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {team.topScorers && team.topScorers.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Top Scorers</ThemedText>
                  <View style={[styles.scorersList, { borderColor: border }]}>
                    {team.topScorers.map((scorer, i) => (
                      <View
                        key={i}
                        style={[
                          styles.scorerItem,
                          i !== team.topScorers.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: border,
                          },
                        ]}
                      >
                        <ThemedText style={styles.scorerName}>
                          {scorer.name}
                        </ThemedText>
                        <ThemedText style={styles.scorerGoals}>
                          {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'fixtures' && (
            <View style={styles.matchList}>
              {team.fixtures && team.fixtures.length > 0 ? (
                team.fixtures.map((match, i) => (
                  <View
                    key={match.id}
                    style={[
                      styles.matchItem,
                      i !== team.fixtures.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: border,
                      },
                    ]}
                  >
                    <MatchCard match={match} />
                  </View>
                ))
              ) : (
                <View style={styles.emptySection}>
                  <ThemedText style={styles.emptySectionText}>
                    No upcoming fixtures
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {activeTab === 'results' && (
            <View style={styles.matchList}>
              {team.results && team.results.length > 0 ? (
                team.results.map((match, i) => (
                  <View
                    key={match.id}
                    style={[
                      styles.matchItem,
                      i !== team.results.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: border,
                      },
                    ]}
                  >
                    <MatchCard match={match} />
                  </View>
                ))
              ) : (
                <View style={styles.emptySection}>
                  <ThemedText style={styles.emptySectionText}>
                    No recent results
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </View>
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

  teamHeader: {
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  teamBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  teamLeague: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.6,
  },

  statsGrid: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
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

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },

  tabContent: {
    paddingTop: 24,
  },

  overview: {
    paddingHorizontal: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  formContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  formBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formText: {
    fontSize: 16,
    fontWeight: '700',
  },

  scorersList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scorerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scorerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  scorerGoals: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },

  matchList: {
    paddingHorizontal: 20,
  },
  matchItem: {
    paddingVertical: 12,
  },

  emptySection: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 15,
    opacity: 0.6,
  },
});