/**
 * Leaderboard Screen
 * Displays weekly and monthly quiz rankings with Duolingo-style gamification UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, LeaderboardEntry, LeaderboardPeriod } from '../types';
import { spacing, fontSize, borderRadius } from '../theme';
import { getWeeklyLeaderboard, getMonthlyLeaderboard, getUserRank } from '../services/leaderboardService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
];

export default function LeaderboardScreen() {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { theme: t, isDark } = useTheme();
    const { user, isAuthenticated } = useAuth();

    const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('week');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userScore, setUserScore] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);

        const result = selectedPeriod === 'week'
            ? await getWeeklyLeaderboard()
            : await getMonthlyLeaderboard();

        setLeaderboard(result.data);

        // Get user's rank if authenticated
        if (isAuthenticated) {
            const rankResult = await getUserRank(selectedPeriod);
            setUserRank(rankResult.rank);
            setUserScore(rankResult.totalScore);
        }

        setLoading(false);
    }, [selectedPeriod, isAuthenticated]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLeaderboard();
        setRefreshing(false);
    }, [fetchLeaderboard]);

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1: return { emoji: '🥇', color: '#FFD700' };
            case 2: return { emoji: '🥈', color: '#C0C0C0' };
            case 3: return { emoji: '🥉', color: '#CD7F32' };
            default: return { emoji: `${rank}`, color: t.colors.textMuted };
        }
    };

    const cardStyle = {
        backgroundColor: t.colors.surface,
        borderRadius: borderRadius.lg,
        ...t.shadows.sm,
    };

    return (
        <View style={[styles.container, { backgroundColor: t.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={t.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: t.colors.text }]}>Leaderboard</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Period Tabs */}
            <View style={[styles.tabsContainer, { borderBottomColor: t.colors.border }]}>
                {PERIODS.map((period) => (
                    <TouchableOpacity
                        key={period.id}
                        style={[
                            styles.tab,
                            selectedPeriod === period.id && [styles.tabActive, { borderBottomColor: t.colors.primary }],
                        ]}
                        onPress={() => setSelectedPeriod(period.id)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: selectedPeriod === period.id ? t.colors.primary : t.colors.textMuted },
                            ]}
                        >
                            {period.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* User's Rank Card (if authenticated and ranked) */}
            {isAuthenticated && userRank && (
                <View style={[styles.userRankCard, { backgroundColor: t.colors.primary + '15', borderColor: t.colors.primary }]}>
                    <View style={styles.userRankLeft}>
                        <Text style={[styles.yourRankLabel, { color: t.colors.textSecondary }]}>Your Rank</Text>
                        <View style={styles.userRankRow}>
                            <Text style={[styles.userRankNumber, { color: t.colors.primary }]}>
                                #{userRank}
                            </Text>
                            <Text style={[styles.userRankScore, { color: t.colors.text }]}>
                                {userScore} pts
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.quizButton, { backgroundColor: t.colors.primary }]}
                        onPress={() => navigation.navigate('Quiz')}
                    >
                        <Text style={styles.quizButtonText}>Take Quiz</Text>
                        <Ionicons name="play" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Leaderboard List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={t.colors.primary} />
                    <Text style={[styles.loadingText, { color: t.colors.textMuted }]}>Loading rankings...</Text>
                </View>
            ) : leaderboard.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={64} color={t.colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: t.colors.text }]}>No Rankings Yet</Text>
                    <Text style={[styles.emptyText, { color: t.colors.textSecondary }]}>
                        Be the first to take a quiz and claim the top spot!
                    </Text>
                    <TouchableOpacity
                        style={[styles.startQuizButton, { backgroundColor: t.colors.primary }]}
                        onPress={() => navigation.navigate('Quiz')}
                    >
                        <Text style={styles.startQuizButtonText}>Start Quiz</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={t.colors.primary}
                        />
                    }
                >
                    {leaderboard.map((entry, index) => {
                        const badge = getRankBadge(entry.rank);
                        const isCurrentUser = user?.id === entry.userId;

                        return (
                            <View
                                key={entry.userId}
                                style={[
                                    styles.leaderboardItem,
                                    cardStyle,
                                    isCurrentUser && {
                                        borderWidth: 2,
                                        borderColor: t.colors.primary,
                                        backgroundColor: t.colors.primary + '10',
                                    },
                                ]}
                            >
                                {/* Rank */}
                                <View style={[styles.rankBadge, entry.rank <= 3 && { backgroundColor: badge.color + '20' }]}>
                                    {entry.rank <= 3 ? (
                                        <Text style={styles.rankEmoji}>{badge.emoji}</Text>
                                    ) : (
                                        <Text style={[styles.rankNumber, { color: badge.color }]}>{entry.rank}</Text>
                                    )}
                                </View>

                                {/* Avatar */}
                                <View style={[styles.avatar, { backgroundColor: t.colors.primary + '30' }]}>
                                    {entry.avatarUrl ? (
                                        <Text style={[styles.avatarText, { color: t.colors.primary }]}>
                                            {entry.displayName.charAt(0).toUpperCase()}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.avatarText, { color: t.colors.primary }]}>
                                            {entry.displayName.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>

                                {/* Name and Stats */}
                                <View style={styles.userInfo}>
                                    <Text
                                        style={[
                                            styles.userName,
                                            { color: t.colors.text },
                                            isCurrentUser && { color: t.colors.primary, fontWeight: '700' },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {entry.displayName}
                                        {isCurrentUser && ' (You)'}
                                    </Text>
                                    <Text style={[styles.userStats, { color: t.colors.textMuted }]}>
                                        {entry.quizzesTaken} quiz{entry.quizzesTaken !== 1 ? 'zes' : ''}
                                        {entry.avgPercentage && ` · ${entry.avgPercentage}% avg`}
                                    </Text>
                                </View>

                                {/* Score */}
                                <View style={styles.scoreContainer}>
                                    <Text style={[styles.scoreValue, { color: t.colors.success }]}>
                                        {entry.totalScore}
                                    </Text>
                                    <Text style={[styles.scoreLabel, { color: t.colors.textMuted }]}>pts</Text>
                                </View>
                            </View>
                        );
                    })}

                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: fontSize.xl, fontWeight: '700' },

    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomWidth: 2 },
    tabText: { fontSize: fontSize.md, fontWeight: '600' },

    userRankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    userRankLeft: {},
    yourRankLabel: { fontSize: fontSize.xs, fontWeight: '500', marginBottom: 2 },
    userRankRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
    userRankNumber: { fontSize: fontSize.xxl, fontWeight: '800' },
    userRankScore: { fontSize: fontSize.md, fontWeight: '600' },
    quizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    quizButtonText: { color: '#fff', fontWeight: '600', fontSize: fontSize.sm },

    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: spacing.md, fontSize: fontSize.md },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.md },
    emptyText: { fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm },
    startQuizButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        marginTop: spacing.lg,
    },
    startQuizButtonText: { color: '#fff', fontWeight: '700', fontSize: fontSize.md },

    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.md },

    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
    },

    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    rankEmoji: { fontSize: 20 },
    rankNumber: { fontSize: fontSize.md, fontWeight: '700' },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    avatarText: { fontSize: 18, fontWeight: '700' },

    userInfo: { flex: 1 },
    userName: { fontSize: fontSize.md, fontWeight: '600' },
    userStats: { fontSize: fontSize.xs, marginTop: 2 },

    scoreContainer: { alignItems: 'flex-end' },
    scoreValue: { fontSize: fontSize.lg, fontWeight: '800' },
    scoreLabel: { fontSize: fontSize.xs },
});
