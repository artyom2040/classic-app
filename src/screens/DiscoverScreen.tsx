import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import {
    searchArtists,
    getWorksByArtist,
    MBArtist,
    MBWork,
    formatLifespan,
} from '../services/musicBrainz';

type ViewMode = 'search' | 'works';

export default function DiscoverScreen() {
    const navigation = useNavigation();
    const { theme, themeName } = useTheme();
    const { isDesktop, isTablet, maxContentWidth, contentPadding, isWeb } = useResponsive();
    const t = theme;
    const isBrutal = themeName === 'neobrutalist';

    const [searchQuery, setSearchQuery] = useState('');
    const [artists, setArtists] = useState<MBArtist[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<MBArtist | null>(null);
    const [works, setWorks] = useState<MBWork[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('search');

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        const results = await searchArtists(searchQuery, 15);
        setArtists(results);
        setLoading(false);
    }, [searchQuery]);

    const handleSelectArtist = useCallback(async (artist: MBArtist) => {
        setSelectedArtist(artist);
        setLoading(true);
        setViewMode('works');

        const artistWorks = await getWorksByArtist(artist.id, 50);
        setWorks(artistWorks);
        setLoading(false);
    }, []);

    const handleBack = useCallback(() => {
        setViewMode('search');
        setSelectedArtist(null);
        setWorks([]);
    }, []);

    const renderArtistItem = useCallback(({ item }: { item: MBArtist }) => {
        const lifespan = formatLifespan(item['life-span']);

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: t.colors.surface },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm,
                ]}
                onPress={() => handleSelectArtist(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.avatarContainer, { backgroundColor: t.colors.primary + '20' }]}>
                    <Ionicons name="person" size={24} color={t.colors.primary} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: t.colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.metaRow}>
                        {lifespan && (
                            <Text style={[styles.metaText, { color: t.colors.textMuted }]}>
                                {lifespan}
                            </Text>
                        )}
                        {item.country && (
                            <Text style={[styles.metaText, { color: t.colors.textMuted }]}>
                                • {item.country}
                            </Text>
                        )}
                        {item.type && (
                            <Text style={[styles.metaText, { color: t.colors.textSecondary }]}>
                                • {item.type}
                            </Text>
                        )}
                    </View>
                    {item.disambiguation && (
                        <Text style={[styles.disambiguation, { color: t.colors.textSecondary }]} numberOfLines={1}>
                            {item.disambiguation}
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
            </TouchableOpacity>
        );
    }, [t, isBrutal, handleSelectArtist]);

    const renderWorkItem = useCallback(({ item }: { item: MBWork }) => {
        return (
            <View
                style={[
                    styles.workCard,
                    { backgroundColor: t.colors.surface },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm,
                ]}
            >
                <View style={[styles.workIcon, { backgroundColor: t.colors.secondary + '20' }]}>
                    <Ionicons name="musical-notes" size={18} color={t.colors.secondary} />
                </View>
                <View style={styles.workContent}>
                    <Text style={[styles.workTitle, { color: t.colors.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.workMeta}>
                        {item.type && (
                            <View style={[styles.tag, { backgroundColor: t.colors.primary + '20' }]}>
                                <Text style={[styles.tagText, { color: t.colors.primary }]}>{item.type}</Text>
                            </View>
                        )}
                        {item.language && (
                            <Text style={[styles.metaText, { color: t.colors.textMuted }]}>
                                {item.language.toUpperCase()}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    }, [t, isBrutal]);

    // Works view
    if (viewMode === 'works' && selectedArtist) {
        return (
            <View style={[styles.container, { backgroundColor: t.colors.background }]}>
                {/* Header */}
                <View style={styles.worksHeader}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={[styles.headerTitle, { color: t.colors.text }]} numberOfLines={1}>
                            {selectedArtist.name}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: t.colors.textMuted }]}>
                            {works.length} works from MusicBrainz
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={t.colors.primary} />
                        <Text style={[styles.loadingText, { color: t.colors.textMuted }]}>
                            Loading works...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={works}
                        keyExtractor={(item) => item.id}
                        renderItem={renderWorkItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="musical-notes-outline" size={48} color={t.colors.textMuted} />
                                <Text style={[styles.emptyText, { color: t.colors.text }]}>No works found</Text>
                            </View>
                        }
                    />
                )}

                {/* MusicBrainz attribution */}
                <View style={[styles.attribution, { backgroundColor: t.colors.surface }]}>
                    <Text style={[styles.attributionText, { color: t.colors.textMuted }]}>
                        Data from MusicBrainz • CC0 / CC-BY-NC-SA
                    </Text>
                </View>
            </View>
        );
    }

    // Search view
    return (
        <View style={[styles.container, { backgroundColor: t.colors.background }]}>
            {/* Responsive content wrapper */}
            <View style={[
                styles.contentWrapper,
                isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
            ]}>
                {/* Header with back button */}
                <View style={styles.header}>
                    {(isWeb || navigation.canGoBack()) && (
                        <TouchableOpacity
                            style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                            onPress={() => navigation.goBack()}
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                        </TouchableOpacity>
                    )}
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.title, { color: t.colors.text }]}>Discover</Text>
                        <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                            Search the MusicBrainz database
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={[
                    styles.searchContainer,
                    { backgroundColor: t.colors.surface },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm
                ]}>
                    <Ionicons name="search" size={20} color={t.colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: t.colors.text }]}
                        placeholder="Search composers, performers..."
                        placeholderTextColor={t.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoCapitalize="words"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={t.colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Button */}
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        { backgroundColor: t.colors.primary },
                        isBrutal && { borderRadius: 0 },
                    ]}
                    onPress={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Search MusicBrainz"
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="search" size={18} color="#fff" />
                            <Text style={styles.searchButtonText}>Search MusicBrainz</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Quick Search Suggestions */}
                {artists.length === 0 && !loading && (
                    <View style={styles.suggestions}>
                        <Text style={[styles.suggestionsTitle, { color: t.colors.textMuted }]}>
                            Try searching for:
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                            {['Bach', 'Mozart', 'Beethoven', 'Chopin', 'Debussy', 'Stravinsky'].map((name) => (
                                <TouchableOpacity
                                    key={name}
                                    style={[styles.chip, { backgroundColor: t.colors.surfaceLight }]}
                                    onPress={() => {
                                        setSearchQuery(name);
                                        setTimeout(() => {
                                            searchArtists(name, 15).then(setArtists);
                                        }, 100);
                                    }}
                                >
                                    <Text style={[styles.chipText, { color: t.colors.text }]}>{name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Results */}
                {loading && artists.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={t.colors.primary} />
                        <Text style={[styles.loadingText, { color: t.colors.textMuted }]}>Searching...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={artists}
                        keyExtractor={(item) => item.id}
                        renderItem={renderArtistItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            searchQuery.length > 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={48} color={t.colors.textMuted} />
                                    <Text style={[styles.emptyText, { color: t.colors.text }]}>No artists found</Text>
                                    <Text style={[styles.emptySubtext, { color: t.colors.textMuted }]}>
                                        Try a different search term
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}

                {/* Attribution Footer */}
                <View style={[styles.attribution, { backgroundColor: t.colors.surface }]}>
                    <Ionicons name="globe-outline" size={14} color={t.colors.textMuted} />
                    <Text style={[styles.attributionText, { color: t.colors.textMuted }]}>
                        Powered by MusicBrainz
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentWrapper: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, paddingTop: spacing.lg, gap: spacing.md },
    headerTextContainer: { flex: 1 },
    title: { fontSize: fontSize.xxxl, fontWeight: 'bold' },
    subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    searchInput: { flex: 1, fontSize: fontSize.md, marginLeft: spacing.sm },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    searchButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },
    suggestions: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
    suggestionsTitle: { fontSize: fontSize.sm, marginBottom: spacing.sm },
    chipContainer: { flexDirection: 'row' },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginRight: spacing.sm,
    },
    chipText: { fontSize: fontSize.sm },
    listContent: { padding: spacing.md, paddingTop: 0 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: fontSize.md, fontWeight: '600' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: spacing.xs },
    metaText: { fontSize: fontSize.xs },
    disambiguation: { fontSize: fontSize.xs, marginTop: 2, fontStyle: 'italic' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: fontSize.sm, marginTop: spacing.md },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
    emptyText: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
    emptySubtext: { fontSize: fontSize.sm, marginTop: spacing.xs },
    attribution: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        gap: spacing.xs,
    },
    attributionText: { fontSize: fontSize.xs },
    // Works view styles
    worksHeader: {
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
    headerContent: { flex: 1 },
    headerTitle: { fontSize: fontSize.xl, fontWeight: 'bold' },
    headerSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
    workCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    workIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    workContent: { flex: 1 },
    workTitle: { fontSize: fontSize.md, fontWeight: '500' },
    workMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: spacing.sm },
    tag: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    tagText: { fontSize: fontSize.xs, fontWeight: '500' },
});
