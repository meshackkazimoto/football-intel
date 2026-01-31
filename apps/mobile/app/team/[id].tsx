import { useState, useCallback, useMemo } from 'react';
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
import { clubsService } from '@/services/clubs/clubs.service';

type Tab = 'overview' | 'fixtures' | 'results';

export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // clubId
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['club-current-team', id],
    queryFn: () => clubsService.getCurrentTeam(id as string),
    enabled: !!id,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /* ---------------- MOCK FOOTBALL DATA (TEMP) ---------------- */

  const mock = useMemo(() => ({
    position: 1,
    points: 42,
    played: 18,

    form: ['W', 'W', 'D', 'L', 'W'] as ('W' | 'D' | 'L')[],

    topScorers: [
      { name: 'John Bocco', goals: 9 },
      { name: 'Clatous Chama', goals: 7 },
      { name: 'Sadio Kanoute', goals: 5 },
    ],

    fixtures: [
      {
        id: 'fx1',
        homeTeam: 'Simba SC',
        awayTeam: 'Azam FC',
        date: '2026-02-03',
        status: 'scheduled',
      },
    ],

    results: [
      {
        id: 'rs1',
        homeTeam: 'Simba SC',
        awayTeam: 'Young Africans SC',
        homeScore: 2,
        awayScore: 1,
        status: 'finished',
      },
    ],
  }), []);

  /* ----------------------------------------------------------- */

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Team" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Team" />
        <View style={styles.empty}>
          <ThemedText style={styles.emptyText}>Team not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const { club, team } = data;

  return (
    <ThemedView style={styles.container}>
      <Header title={club.name} />

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
        {/* HEADER */}
        <View style={styles.teamHeader}>
          <View style={[styles.teamBadge, { borderColor: border }]}>
            <ThemedText style={styles.teamBadgeText}>
              {club.name.charAt(0).toUpperCase()}
            </ThemedText>
          </View>

          <ThemedText style={styles.teamName}>{club.name}</ThemedText>

          <ThemedText style={styles.teamLeague}>
            {team.season.name}
          </ThemedText>
        </View>

        {/* STATS */}
        <View style={[styles.statsGrid, { borderColor: border }]}>
          <Stat label="Position" value={mock.position} border />
          <Stat label="Points" value={mock.points} border />
          <Stat label="Played" value={mock.played} />
        </View>

        {/* CLUB INFO */}
        <View style={[styles.infoCard, { backgroundColor: background, borderColor: border }]}>
          <InfoRow label="Stadium" value={club.stadiumName || 'N/A'} border={border} />
          <InfoRow label="Founded" value={club.foundedYear?.toString() || 'N/A'} border={border} last />
        </View>

        {/* TABS */}
        <View style={[styles.tabs, { borderBottomColor: border }]}>
          {(['overview', 'fixtures', 'results'] as Tab[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && {
                  borderBottomWidth: 2,
                  borderBottomColor: primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab && { color: primary, fontWeight: '600' },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* TAB CONTENT */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View style={styles.overview}>
              {/* FORM */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Form</ThemedText>
                <View style={styles.formContainer}>
                  {mock.form.map((r, i) => (
                    <View
                      key={i}
                      style={[
                        styles.formBadge,
                        {
                          backgroundColor:
                            r === 'W'
                              ? '#22c55e20'
                              : r === 'D'
                              ? '#f59e0b20'
                              : '#ef444420',
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.formText,
                          { color: r === 'W' ? '#22c55e' : r === 'D' ? '#f59e0b' : '#ef4444' },
                        ]}
                      >
                        {r}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* TOP SCORERS */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Top Scorers</ThemedText>
                <View style={[styles.scorersList, { borderColor: border }]}>
                  {mock.topScorers.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.scorerItem,
                        i !== mock.topScorers.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: border,
                        },
                      ]}
                    >
                      <ThemedText style={styles.scorerName}>{s.name}</ThemedText>
                      <ThemedText style={styles.scorerGoals}>
                        {s.goals} goals
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'fixtures' && (
            <View style={styles.matchList}>
              {mock.fixtures.map(m => (
                <MatchCard key={m.id} match={m} />
              ))}
            </View>
          )}

          {activeTab === 'results' && (
            <View style={styles.matchList}>
              {mock.results.map(m => (
                <MatchCard key={m.id} match={m} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Header({ title }: { title: string }) {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.header, { borderBottomColor: border }]}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <IconSymbol name="chevron.left" size={24} color={primary} />
      </Pressable>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={{ width: 24 }} />
    </View>
  );
}

function Stat({ label, value, border }: any) {
  return (
    <View style={[styles.statBox, border && { borderRightWidth: 1 }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
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