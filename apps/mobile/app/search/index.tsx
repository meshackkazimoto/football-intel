import { useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MatchCard } from '@/components/match-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { searchService } from '@/services/search/search.service';

type SearchTab = 'all' | 'matches' | 'teams';

export default function SearchScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  const {
    data: results,
    isLoading,
  } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchService.search(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const filteredResults = useMemo(() => {
    if (!results) return { matches: [], teams: [] };

    if (activeTab === 'matches') {
      return { matches: results.matches, teams: [] };
    }
    if (activeTab === 'teams') {
      return { matches: [], teams: results.teams };
    }
    return results;
  }, [results, activeTab]);

  const hasResults = filteredResults.matches.length > 0 || filteredResults.teams.length > 0;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconSymbol name="chevron.left" size={24} color={primary} />
        </Pressable>
        <ThemedText type="subtitle">Search</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: background, borderColor: border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={primary} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search matches, teams..."
            placeholderTextColor={`${textColor}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={18} color={`${textColor}60`} />
            </Pressable>
          )}
        </View>

        {searchQuery.length > 2 && (
          <View style={[styles.tabs, { borderBottomColor: border }]}>
            <Pressable
              onPress={() => setActiveTab('all')}
              style={[
                styles.tab,
                activeTab === 'all' && {
                  borderBottomWidth: 2,
                  borderBottomColor: primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'all' && { color: primary, fontWeight: '600' },
                ]}
              >
                All
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('matches')}
              style={[
                styles.tab,
                activeTab === 'matches' && {
                  borderBottomWidth: 2,
                  borderBottomColor: primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'matches' && { color: primary, fontWeight: '600' },
                ]}
              >
                Matches
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('teams')}
              style={[
                styles.tab,
                activeTab === 'teams' && {
                  borderBottomWidth: 2,
                  borderBottomColor: primary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'teams' && { color: primary, fontWeight: '600' },
                ]}
              >
                Teams
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {searchQuery.length === 0 ? (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <ThemedText style={styles.placeholderIconText}>🔍</ThemedText>
            </View>
            <ThemedText style={styles.placeholderTitle}>
              Search Football Intel
            </ThemedText>
            <ThemedText style={styles.placeholderText}>
              Find matches, teams, and more
            </ThemedText>
          </View>
        ) : searchQuery.length < 3 ? (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              Type at least 3 characters
            </ThemedText>
          </View>
        ) : isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : !hasResults ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyText}>No results found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try a different search term
            </ThemedText>
          </View>
        ) : (
          <View style={styles.results}>
            {filteredResults.matches.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Matches</ThemedText>
                <View style={styles.matchesList}>
                  {filteredResults.matches.map((match, i) => (
                    <View
                      key={match.id}
                      style={[
                        styles.matchItem,
                        i !== filteredResults.matches.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: border,
                        },
                      ]}
                    >
                      <MatchCard match={match} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {filteredResults.teams.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Teams</ThemedText>
                <View style={styles.teamsList}>
                  {filteredResults.teams.map((team) => (
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
                            {team.shortName}
                          </ThemedText>
                        </View>
                        <View style={styles.teamInfo}>
                          <ThemedText style={styles.teamName}>{team.name}</ThemedText>
                          <ThemedText style={styles.teamLeague}>{team.league}</ThemedText>
                        </View>
                      </View>
                      <IconSymbol name="chevron.right" size={18} color={`${textColor}40`} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },

  content: {
    paddingBottom: 40,
  },

  placeholder: {
    paddingTop: 120,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 12,
  },
  placeholderIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeholderIconText: {
    fontSize: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
  },

  loading: {
    paddingTop: 80,
    alignItems: 'center',
  },

  empty: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },

  results: {
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 32,
  },

  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  matchesList: {},
  matchItem: {
    paddingVertical: 12,
  },

  teamsList: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  teamInfo: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
  },
  teamLeague: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
});