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

    const {
        data,
        isLoading,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['matches', 'live'],
        queryFn: () => matchesService.getLive(),
        refetchInterval: 30000,
    });

    const liveMatches = data?.data ?? [];
    const liveCount = data?.count ?? 0;

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: border }]}>
                <View style={styles.headerRow}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <ThemedText style={styles.liveLabel}>Live</ThemedText>
                    </View>

                    <ThemedText type="title" style={styles.title}>
                        {liveCount}
                    </ThemedText>
                </View>
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
                ) : liveMatches.length === 0 ? (
                    <View style={styles.empty}>
                        <ThemedText type="subtitle">No live matches</ThemedText>
                        <ThemedText style={styles.emptySub}>
                            Matches will appear here once they kick off
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {liveMatches.map((match) => (
                            <Pressable
                                key={match.id}
                                onPress={() => router.push(`/match/${match.id}`)}
                                style={({ pressed }) => [
                                    styles.item,
                                    { borderBottomColor: border },
                                    pressed && styles.itemPressed,
                                ]}
                            >
                                {/* League */}
                                {/* <ThemedText style={styles.league}>
                                    {match.league?.name}
                                </ThemedText> */}

                                {/* Teams + Score */}
                                <View style={styles.row}>
                                    <View style={styles.teams}>
                                        <ThemedText
                                            numberOfLines={1}
                                            style={styles.team}
                                        >
                                            {match.homeTeam.club.name}
                                        </ThemedText>

                                        <ThemedText
                                            numberOfLines={1}
                                            style={styles.team}
                                        >
                                            {match.awayTeam.club.name}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.score}>
                                        <ThemedText style={styles.scoreText}>
                                            {match.score.home}
                                        </ThemedText>
                                        <ThemedText style={styles.scoreDivider}>–</ThemedText>
                                        <ThemedText style={styles.scoreText}>
                                            {match.score.away}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Status */}
                                <View style={styles.statusRow}>
                                    <View style={styles.statusDot} />
                                    <ThemedText style={styles.minute}>
                                        {match.period === 'HT'
                                            ? 'Half-time'
                                            : `${match.minute}'`}
                                    </ThemedText>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#dc2626',
    },
    liveLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#dc2626',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 22,
    },

    content: {
        paddingTop: 12,
        paddingBottom: 32,
    },

    loading: {
        paddingTop: 80,
        alignItems: 'center',
    },

    empty: {
        paddingTop: 96,
        alignItems: 'center',
        gap: 8,
    },
    emptySub: {
        fontSize: 14,
        opacity: 0.6,
    },

    list: {
        gap: 0,
    },

    item: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    itemPressed: {
        opacity: 0.6,
    },

    league: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 6,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    teams: {
        flex: 1,
        gap: 6,
        paddingRight: 12,
    },
    team: {
        fontSize: 16,
        fontWeight: '600',
    },

    score: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreText: {
        fontSize: 22,
        fontWeight: '700',
    },
    scoreDivider: {
        fontSize: 20,
        opacity: 0.4,
    },

    statusRow: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#dc2626',
    },
    minute: {
        fontSize: 13,
        fontWeight: '600',
        color: '#dc2626',
    },
});