import { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { matchesService } from '@/services/matches/matches.service';

export default function LiveScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');

  const {
    data: liveMatches = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesService.getLive(),
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <View style={styles.headerContent}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>Live</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            {liveMatches.length} {liveMatches.length === 1 ? 'Match' : 'Matches'}
          </ThemedText>
        </View>
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
        ) : liveMatches.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ThemedText style={styles.emptyIconText}>⚽</ThemedText>
            </View>
            <ThemedText style={styles.emptyTitle}>No Live Matches</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Check back during match days
            </ThemedText>
          </View>
        ) : (
          <View style={styles.matches}>
            {liveMatches.map((match) => (
              <Pressable
                key={match.id}
                onPress={() => router.push(`/match/${match.id}`)}
                style={({ pressed }) => [
                  styles.matchCard,
                  { borderColor: border, backgroundColor: background },
                  pressed && styles.matchCardPressed,
                ]}
              >
                <View style={styles.matchHeader}>
                  <ThemedText style={styles.league}>
                    {match.competition}
                  </ThemedText>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <ThemedText style={styles.statusText}>
                      {match.minute}'
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.matchBody}>
                  <View style={styles.team}>
                    <View style={styles.teamLeft}>
                      <View style={[styles.teamBadge, { borderColor: border }]}>
                        <ThemedText style={styles.teamBadgeText}>
                          {match.homeTeamShort}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.teamName} numberOfLines={1}>
                        {match.homeTeam}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.score}>{match.homeScore}</ThemedText>
                  </View>

                  <View style={styles.team}>
                    <View style={styles.teamLeft}>
                      <View style={[styles.teamBadge, { borderColor: border }]}>
                        <ThemedText style={styles.teamBadgeText}>
                          {match.awayTeamShort}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.teamName} numberOfLines={1}>
                        {match.awayTeam}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.score}>{match.awayScore}</ThemedText>
                  </View>
                </View>

                {match.events && match.events.length > 0 && (
                  <View style={[styles.events, { borderTopColor: border }]}>
                    {match.events.slice(0, 3).map((event, i: number) => (
                      <View key={i} style={styles.event}>
                        <ThemedText style={styles.eventMinute}>
                          {event.minute}{"'"}
                        </ThemedText>
                        <ThemedText style={styles.eventIcon}>
                          {event.type === 'goal' ? '⚽' : event.type === 'yellow' ? '🟨' : '🟥'}
                        </ThemedText>
                        <ThemedText style={styles.eventText} numberOfLines={1}>
                          {event.player}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
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
  headerContent: {
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  loading: {
    paddingTop: 80,
    alignItems: 'center',
  },

  empty: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },

  matches: {
    gap: 16,
  },
  matchCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matchCardPressed: {
    opacity: 0.7,
  },

  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  league: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#ef444410',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },

  matchBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  team: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  teamBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },

  events: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    width: 28,
  },
  eventIcon: {
    fontSize: 14,
  },
  eventText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});