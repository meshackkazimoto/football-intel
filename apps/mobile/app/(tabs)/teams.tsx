import { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { teamsService } from '@/services/teams/teams.service';

export default function TeamsScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: teams = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsService.getList(),
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <ThemedText type="title" style={styles.title}>
          Teams
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: background, borderColor: border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={primary} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search teams..."
            placeholderTextColor={`${textColor}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={18} color={`${textColor}60`} />
            </Pressable>
          )}
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
        ) : filteredTeams.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No teams found' : 'No teams available'}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.teams}>
            {filteredTeams.map((team, index) => (
              <Pressable
                key={team.id}
                onPress={() => router.push(`/team/${team.id}`)}
                style={({ pressed }) => [
                  styles.teamCard,
                  { borderColor: border },
                  pressed && styles.teamCardPressed,
                ]}
              >
                <View style={styles.teamLeft}>
                  <View style={[styles.teamBadge, { borderColor: border }]}>
                    <ThemedText style={styles.teamBadgeText}>
                      {team.name.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.teamInfo}>
                    <ThemedText style={styles.teamName}>{team.name}</ThemedText>
                    <ThemedText style={styles.teamLeague}>{team.club.name}</ThemedText>
                  </View>
                </View>
                <View style={styles.teamRight}>
                  {team.season && (
                    <View style={[styles.positionBadge, { backgroundColor: `${primary}15` }]}>
                      <ThemedText style={[styles.positionText, { color: primary }]}>
                        #{team.season.name}
                      </ThemedText>
                    </View>
                  )}
                  <IconSymbol name="chevron.right" size={18} color={`${textColor}40`} />
                </View>
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
  title: {
    fontSize: 22,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  loading: {
    paddingTop: 60,
    alignItems: 'center',
  },

  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
  },

  teams: {
    gap: 12,
  },
  teamCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  teamCardPressed: {
    opacity: 0.7,
  },

  teamLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginRight: 16,
  },
  teamBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  teamInfo: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
  },
  teamLeague: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },

  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  positionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  positionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});