import { useCallback } from 'react';
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
import type { League } from '@/services/leagues/types';

export default function LeaguesScreen() {
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const {
    data: leagues = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => leaguesService.getLeagues(),
  });

  const onRefresh = useCallback(() => refetch(), [refetch]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <ThemedText type="title" style={styles.title}>
          Leagues
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Browse competitions and standings
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : leagues.length === 0 ? (
          <ThemedText style={styles.empty}>No leagues available</ThemedText>
        ) : (
          leagues.map((league) => (
            <LeagueCard key={league.id} league={league} borderColor={border} />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

function LeagueCard({ league, borderColor }: { league: League; borderColor: string }) {
  const country = league.country?.name;

  return (
    <ThemedView style={[styles.card, { borderColor }]}>
      <View style={styles.cardContent}>
        <ThemedText type="defaultSemiBold" style={styles.leagueName}>
          {league.name}
        </ThemedText>
        {country ? (
          <ThemedText style={styles.country}>{country}</ThemedText>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  centered: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  empty: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardContent: {
    gap: 4,
  },
  leagueName: {
    fontSize: 16,
  },
  country: {
    fontSize: 14,
    opacity: 0.75,
  },
});
