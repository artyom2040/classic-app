import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Note: LinearGradient was removed - was only used for disabled glass theme

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useCardStyle } from '../hooks/useCardStyle';
import { useResponsive } from '../hooks/useResponsive';
import { useSettings } from '../context/SettingsContext';
import { RootStackParamList, WeeklyAlbum, NewRelease, ConcertHall } from '../types';
import { getWeekNumber } from '../utils/storage';

// Import carousels from Home
import { NewReleasesCarousel } from './Home';

// Import data
import albumsData from '../data/albums.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Featured Article Section (replaces Editor's Corner)
// ============================================================================

interface FeaturedArticle {
    id: string;
    title: string;
    description: string;
    readTime: string;
    category: string;
    screen?: keyof RootStackParamList;
}

// Featured article - can be updated dynamically
const featuredArticle: FeaturedArticle = {
    id: 'bach-mastery',
    title: 'Why Bach is the Perfect Starting Point for Classical Newcomers',
    description: 'Johann Sebastian Bach\'s music offers a unique gateway into classical music. His Brandenburg Concertos blend joyful melodies with intricate counterpoint that reveals new layers with each listen. Whether you\'re commuting or relaxing at home, Bach provides the perfect introduction to the depth and beauty of classical music.',
    readTime: '5 min read',
    category: 'Getting Started',
    screen: 'Composers',
};

function FeaturedArticleSection() {
    const navigation = useNavigation<NavigationProp>();
    const { theme: t } = useTheme();
    const { cardStyle } = useCardStyle();

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Featured Article</Text>
                <View style={[styles.badge, { backgroundColor: t.colors.primary + '20' }]}>
                    <Ionicons name="newspaper" size={12} color={t.colors.primary} />
                    <Text style={[styles.badgeText, { color: t.colors.primary }]}>Editor's Pick</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.articleCard,
                    cardStyle,
                    { borderLeftWidth: 4, borderLeftColor: t.colors.primary },
                ]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Article', { articleId: featuredArticle.id })}
            >
                {/* Category & Read Time */}
                <View style={styles.articleMeta}>
                    <View style={[styles.articleCategory, { backgroundColor: t.colors.primary + '15' }]}>
                        <Ionicons name="bookmark" size={12} color={t.colors.primary} />
                        <Text style={[styles.articleCategoryText, { color: t.colors.primary }]}>
                            {featuredArticle.category}
                        </Text>
                    </View>
                    <View style={styles.articleReadTime}>
                        <Ionicons name="time-outline" size={12} color={t.colors.textMuted} />
                        <Text style={[styles.articleReadTimeText, { color: t.colors.textMuted }]}>
                            {featuredArticle.readTime}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.articleTitle, { color: t.colors.text }]}>
                    {featuredArticle.title}
                </Text>

                {/* Description */}
                <Text style={[styles.articleDescription, { color: t.colors.textSecondary }]}>
                    {featuredArticle.description}
                </Text>

                {/* Read More Button */}
                <View style={styles.articleFooter}>
                    <View style={[styles.readMoreButton, { backgroundColor: t.colors.primary }]}>
                        <Text style={styles.readMoreText}>Read Article</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}


// ============================================================================
// Concert Hall Video Section
// ============================================================================

interface FeaturedVideo {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    thumbnailUrl?: string;
}

// Sample featured video - can be updated in albums.json later
const featuredVideo: FeaturedVideo = {
    id: 'vienna-newyear-2024',
    title: 'Vienna Philharmonic New Year Concert 2024',
    description: 'Experience the legendary Musikverein Golden Hall during the world-famous New Year\'s Concert.',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder - replace with real concert
};

function ConcertHallVideoSection() {
    const navigation = useNavigation<NavigationProp>();
    const { theme: t, themeName } = useTheme();
    const { cardStyle } = useCardStyle();
    const isBrutal = false;

    const openYouTube = () => {
        // Could open YouTube link or use an embedded player
        // For now, just a placeholder
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Concert Hall</Text>
                <View style={[styles.badge, { backgroundColor: t.colors.error + '20' }]}>
                    <Ionicons name="videocam" size={12} color={t.colors.error} />
                    <Text style={[styles.badgeText, { color: t.colors.error }]}>Featured Video</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.videoCard,
                    cardStyle,
                    isBrutal && { borderRadius: 0 },
                ]}
                activeOpacity={0.85}
                onPress={openYouTube}
            >
                {/* Video Thumbnail Placeholder */}
                <View style={[styles.videoThumbnail, { backgroundColor: t.colors.surfaceLight }]}>
                    <View style={[styles.playButton, { backgroundColor: t.colors.error }]}>
                        <Ionicons name="play" size={32} color="#fff" />
                    </View>
                    <Text style={[styles.videoOverlayText, { color: t.colors.textMuted }]}>
                        Coming Soon
                    </Text>
                </View>
                <View style={styles.videoContent}>
                    <Text style={[styles.videoTitle, { color: t.colors.text }]} numberOfLines={2}>
                        {featuredVideo.title}
                    </Text>
                    <Text style={[styles.videoDescription, { color: t.colors.textMuted }]} numberOfLines={2}>
                        {featuredVideo.description}
                    </Text>
                    <View style={styles.videoFooter}>
                        <View style={[styles.pill, { backgroundColor: t.colors.error + '18' }]}>
                            <Ionicons name="logo-youtube" size={14} color={t.colors.error} />
                            <Text style={[styles.pillText, { color: t.colors.error }]}>Watch on YouTube</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

// ============================================================================
// Venues Section (renamed from Concert Halls)
// ============================================================================

function VenuesSection() {
    const navigation = useNavigation<NavigationProp>();
    const { theme: t, themeName } = useTheme();
    const { cardStyle } = useCardStyle();
    const isBrutal = false;
    const halls = (albumsData.concertHalls || []) as ConcertHall[];

    if (halls.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Venues</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ConcertHalls')}
                    accessibilityRole="button"
                    accessibilityLabel="See all venues"
                >
                    <Text style={[styles.sectionLink, { color: t.colors.primary }]}>See all</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            >
                {halls.map((hall) => (
                    <TouchableOpacity
                        key={hall.id}
                        style={[
                            styles.venueCard,
                            cardStyle,
                            { borderTopWidth: 3, borderTopColor: t.colors.warning },
                            isBrutal && { borderRadius: 0 },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('ConcertHallDetail', { hallId: hall.id })}
                    >
                        <View style={styles.venueHeader}>
                            <Text style={[styles.venueName, { color: t.colors.text }]} numberOfLines={1}>
                                {hall.name}
                            </Text>
                            <Ionicons name="location" size={16} color={t.colors.warning} />
                        </View>
                        <Text style={[styles.venueLocation, { color: t.colors.textSecondary }]} numberOfLines={1}>
                            {hall.city}
                        </Text>
                        <Text style={[styles.venueDescription, { color: t.colors.textMuted }]} numberOfLines={2}>
                            {hall.description}
                        </Text>
                        {hall.signatureSound && (
                            <View style={[styles.pill, { backgroundColor: t.colors.warning + '20', marginTop: 8 }]}>
                                <Ionicons name="volume-high" size={12} color={t.colors.warning} />
                                <Text style={[styles.pillText, { color: t.colors.warning }]} numberOfLines={1}>
                                    {hall.signatureSound.substring(0, 30)}...
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// ============================================================================
// Weekly Pick Section
// ============================================================================

function WeeklyPickSection() {
    const navigation = useNavigation<NavigationProp>();
    const { theme: t, themeName } = useTheme();
    const { cardStyle } = useCardStyle();
    const isBrutal = false;

    const weekNumber = getWeekNumber();
    const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length] as WeeklyAlbum;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Weekly Pick</Text>
                <View style={[styles.badge, { backgroundColor: t.colors.secondary + '20' }]}>
                    <Ionicons name="disc" size={12} color={t.colors.secondary} />
                    <Text style={[styles.badgeText, { color: t.colors.secondary }]}>Week {weekNumber}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.weeklyCard,
                    cardStyle,
                    { borderLeftWidth: 4, borderLeftColor: t.colors.secondary },
                    isBrutal && { borderRadius: 0 },
                ]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('WeeklyAlbum')}
            >
                <View style={[styles.weeklyIcon, { backgroundColor: t.colors.secondary + '20' }]}>
                    <Ionicons name="disc" size={32} color={t.colors.secondary} />
                </View>
                <View style={styles.weeklyContent}>
                    <Text style={[styles.weeklyTitle, { color: t.colors.text }]} numberOfLines={2}>
                        {weeklyAlbum.title}
                    </Text>
                    <Text style={[styles.weeklyArtist, { color: t.colors.textSecondary }]} numberOfLines={1}>
                        {weeklyAlbum.artist}
                    </Text>
                    <Text style={[styles.weeklyDescription, { color: t.colors.textMuted }]} numberOfLines={2}>
                        {weeklyAlbum.whyListen}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

// ============================================================================
// Main Discover Screen
// ============================================================================

export default function DiscoverScreen() {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { theme: t, themeName } = useTheme();
    const { isDesktop, maxContentWidth, isWeb } = useResponsive();
    const { musicService } = useSettings();

    const [refreshing, setRefreshing] = React.useState(false);
    const preferredService = (musicService === 'apple' ? 'appleMusic' : musicService) as 'spotify' | 'appleMusic' | 'youtube';

    const newReleases = (albumsData.newReleases || []) as NewRelease[];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: t.colors.background }]}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 16 },
                isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={t.colors.primary}
                    colors={[t.colors.primary]}
                />
            }
        >
            {/* Header */}
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
                        Explore classical music
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.navigate('MusicBrainzSearch' as any)}
                    accessibilityLabel="Search MusicBrainz"
                >
                    <Ionicons name="search" size={20} color={t.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Weekly Pick */}
            <WeeklyPickSection />

            {/* New Releases */}
            <View style={styles.section}>
                <NewReleasesCarousel releases={newReleases} musicService={preferredService} />
            </View>

            {/* Featured Article */}
            <FeaturedArticleSection />

            {/* Concert Hall Video */}
            <ConcertHallVideoSection />

            {/* Venues (Concert Halls) - Disabled for now, keeping for future phases */}
            {/* <VenuesSection /> */}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.md },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    headerTextContainer: { flex: 1 },
    title: { fontSize: fontSize.xxxl, fontWeight: 'bold' },
    subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Sections
    section: { marginBottom: spacing.lg },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: { fontSize: fontSize.xl, fontWeight: '700' },
    sectionLink: { fontSize: fontSize.sm, fontWeight: '600' },

    // Badge
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },

    // Weekly Pick
    weeklyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    weeklyIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weeklyContent: { flex: 1 },
    weeklyTitle: { fontSize: fontSize.lg, fontWeight: '700' },
    weeklyArtist: { fontSize: fontSize.sm, marginTop: 2 },
    weeklyDescription: { fontSize: fontSize.sm, marginTop: spacing.xs, lineHeight: 20 },

    // Featured Article
    articleCard: {
        padding: spacing.lg,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    articleCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    articleCategoryText: { fontSize: 12, fontWeight: '600' },
    articleReadTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    articleReadTimeText: { fontSize: 12 },
    articleTitle: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
        marginBottom: spacing.sm,
    },
    articleDescription: {
        fontSize: fontSize.md,
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    articleFooter: {
        flexDirection: 'row',
    },
    readMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    readMoreText: {
        color: '#fff',
        fontSize: fontSize.md,
        fontWeight: '600',
    },

    // Video Section
    videoCard: {
        overflow: 'hidden',
    },
    videoThumbnail: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoOverlayText: {
        marginTop: spacing.sm,
        fontSize: fontSize.sm,
    },
    videoContent: {
        padding: spacing.md,
    },
    videoTitle: { fontSize: fontSize.lg, fontWeight: '700' },
    videoDescription: { fontSize: fontSize.sm, marginTop: spacing.xs, lineHeight: 20 },
    videoFooter: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },

    // Venues
    venueCard: {
        width: 260,
        padding: spacing.md,
    },
    venueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    venueName: { fontSize: fontSize.md, fontWeight: '700', flex: 1 },
    venueLocation: { fontSize: fontSize.sm, marginTop: 2 },
    venueDescription: { fontSize: fontSize.sm, marginTop: spacing.xs, lineHeight: 18 },

    // Pill
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    pillText: { fontSize: 12, fontWeight: '600' },
});
