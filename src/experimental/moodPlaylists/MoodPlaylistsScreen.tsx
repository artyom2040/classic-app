import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList, Composer } from '../../types';
import { moodPlaylists, MoodPlaylist } from './data';

import composersData from '../../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MoodPlaylistsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { theme, themeName, isDark } = useTheme();
    const t = theme;
    const isBrutal = false;

    const allComposers = composersData.composers as Composer[];

    const getPlaylistComposers = useCallback((playlist: MoodPlaylist): Composer[] => {
        return playlist.composerIds
            .map(id => allComposers.find(c => c.id === id))
            .filter((c): c is Composer => c !== undefined)
            .slice(0, 4);
    }, [allComposers]);

    const renderPlaylistCard = useCallback(({ item }: { item: MoodPlaylist }) => {
        const composers = getPlaylistComposers(item);

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: item.color + '15' },
                    isBrutal ? { borderWidth: 2, borderColor: item.color } : {},
                ]}
                activeOpacity={0.7}
                accessibilityLabel={`${item.name} playlist`}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                    <View style={styles.headerText}>
                        <Text style={[styles.cardTitle, { color: t.colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.cardDescription, { color: t.colors.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>

                <View style={styles.composerList}>
                    <Text style={[styles.composersLabel, { color: t.colors.textMuted }]}>
                        Featured Composers:
                    </Text>
                    <View style={styles.composerTags}>
                        {composers.map(composer => (
                            <TouchableOpacity
                                key={composer.id}
                                style={[styles.composerTag, { backgroundColor: item.color + '30' }]}
                                onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
                            >
                                <Text style={[styles.composerTagText, { color: item.color }]}>
                                    {composer.name.split(' ').pop()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={[styles.playButton, { backgroundColor: item.color }]}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.playButtonText}>Explore Playlist</Text>
                </View>
            </TouchableOpacity>
        );
    }, [t, isBrutal, getPlaylistComposers, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: t.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: t.colors.text }]}>Mood Playlists</Text>
                    <View style={styles.labsBadge}>
                        <Ionicons name="flask" size={12} color="#8B5CF6" />
                        <Text style={styles.labsBadgeText}>Labs</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                Curated classical music for every moment
            </Text>

            <FlatList
                data={moodPlaylists}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaylistCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: { fontSize: fontSize.xxl, fontWeight: 'bold' },
    labsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF620',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    labsBadgeText: { fontSize: fontSize.xs, color: '#8B5CF6', fontWeight: '600' },
    subtitle: {
        fontSize: fontSize.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    listContent: { padding: spacing.md, paddingTop: 0 },
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    emoji: { fontSize: 36 },
    headerText: { flex: 1 },
    cardTitle: { fontSize: fontSize.lg, fontWeight: '700' },
    cardDescription: { fontSize: fontSize.sm, marginTop: 4, lineHeight: 20 },
    composerList: { marginBottom: spacing.md },
    composersLabel: { fontSize: fontSize.xs, marginBottom: spacing.xs },
    composerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    composerTag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    composerTagText: { fontSize: fontSize.xs, fontWeight: '600' },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    playButtonText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '600' },
});
