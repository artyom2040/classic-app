import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { useCardStyle } from '../hooks/useCardStyle';
import { useResponsive } from '../hooks/useResponsive';
import { spacing } from '../theme';
import { RootStackParamList, UserProgress, Term, WeeklyAlbum, MonthlySpotlight } from '../types';
import { getProgress, getWeekNumber, getDayOfYear, getCurrentMonth } from '../utils/storage';
import { hapticSelection } from '../utils/haptics';
import { getShortDefinition } from '../utils/terms';
import { ERA_IMAGES } from '../utils/images';
import { getAlbumForCategory, AlbumCategory } from '../utils/albumCategories';
import { SkeletonHeroCard, SkeletonGrid } from '../components';
import { HeroCard, CategoryChips, KnowledgeBite, SpotlightCard, HorizontalCarousel } from '../components/stitch';

// Extracted components
import { FeaturedGrid, ExploreGrid } from './Home';

import glossaryData from '../data/glossary.json';
import albumsData from '../data/albums.json';
import composersData from '../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName } = useTheme();
  const t = theme;
  const { isDesktop, maxContentWidth } = useResponsive();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AlbumCategory>('all');

  const weekNumber = getWeekNumber();
  const dayOfYear = getDayOfYear();
  const currentMonth = getCurrentMonth();

  const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length] as WeeklyAlbum;
  const monthlySpotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length] as MonthlySpotlight;
  const termOfDay = glossaryData.terms[(dayOfYear - 1) % glossaryData.terms.length];
  const featuredComposer = composersData.composers[dayOfYear % composersData.composers.length];

  // Filtered album based on category selection
  const filteredAlbum = selectedCategory === 'all'
    ? weeklyAlbum
    : getAlbumForCategory(albumsData.weeklyAlbums as WeeklyAlbum[], selectedCategory, dayOfYear);
  const termSummary = getShortDefinition(termOfDay);

  const loadProgress = useCallback(async () => {
    setProgressLoading(true);
    const p = await getProgress();
    setProgress(p);
    setProgressLoading(false);
  }, []);

  // Load on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    hapticSelection();
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  }, [loadProgress]);

  const isGlass = themeName === 'liquidglass';
  const { cardStyle } = useCardStyle();

  // Main content wrapped in gradient for glass theme
  const renderContent = () => (
    <ScrollView
      style={[styles.container, !isGlass && { backgroundColor: t.colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16 },
        isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
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
      {progressLoading ? (
        <>
          <SkeletonHeroCard />
          <View style={{ marginTop: spacing.md }}>
            <SkeletonGrid count={3} />
          </View>
          <View style={{ height: spacing.xxl }} />
        </>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            {themeName === 'stitch' ? (
              /* Stitch Header: Avatar + Greeting on left, Search on right */
              <>
                <View style={styles.stitchHeaderLeft}>
                  <View style={[styles.avatarCircle, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                    <Ionicons name="person" size={20} color={t.colors.textSecondary} />
                  </View>
                  <Text style={[styles.stitchGreeting, { color: t.colors.textSecondary }]}>
                    {getGreeting()}, Listener
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => navigation.navigate('Search')}
                  accessibilityLabel="Search"
                >
                  <Ionicons name="search" size={22} color={t.colors.text} />
                </TouchableOpacity>
              </>
            ) : (
              /* Default Header */
              <>
                <View>
                  <Text style={[styles.greeting, { color: t.colors.textSecondary }]}>
                    {getGreeting()}
                  </Text>
                  <Text style={[styles.title, { color: t.colors.text }]}>
                    Context Composer
                  </Text>
                </View>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.navigate('Search')}
                    accessibilityLabel="Search"
                  >
                    <Ionicons name="search-outline" size={22} color={t.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.navigate('Discover')}
                    accessibilityLabel="Discover"
                  >
                    <Ionicons name="planet-outline" size={22} color={t.colors.text} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Stitch: Italic title below header */}
          {themeName === 'stitch' && (
            <Text style={[styles.stitchTitle, { color: 'rgba(255,255,255,0.9)' }]}>
              Curated For You
            </Text>
          )}

          {/* Stitch Theme: Category Chips and Hero Card */}
          {themeName === 'stitch' && (
            <>
              <CategoryChips
                items={[
                  { id: 'baroque', label: 'Baroque' },
                  { id: 'symphonies', label: 'Symphonies' },
                  { id: 'piano', label: 'Piano' },
                  { id: 'opera', label: 'Opera' },
                ]}
                selectedId={selectedCategory}
                onSelect={(id) => setSelectedCategory(id as AlbumCategory)}
                style={{ marginHorizontal: -16, marginBottom: 16 }}
              />
              <HeroCard
                badge={selectedCategory === 'all' ? 'Weekly Pick' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                title={filteredAlbum.title}
                subtitle={filteredAlbum.artist}
                description={filteredAlbum.whyListen}
                actionLabel="Listen & Learn"
                actionIcon="play"
                imageSource={
                  selectedCategory === 'baroque' ? ERA_IMAGES.baroque :
                    selectedCategory === 'piano' ? ERA_IMAGES.classical :
                      selectedCategory === 'symphonies' ? ERA_IMAGES.romantic :
                        selectedCategory === 'opera' ? ERA_IMAGES.modern :
                          ERA_IMAGES.romantic
                }
                onPress={() => navigation.navigate('WeeklyAlbum')}
                style={{ marginBottom: 20 }}
                height={320}
              />
            </>
          )}

          {/* Featured Section - 3 Cards (shown for non-Stitch themes, or all for Stitch) */}
          <FeaturedGrid
            progress={progress}
            weeklyAlbum={weeklyAlbum}
            monthlySpotlight={monthlySpotlight}
          />

          {/* Monthly Spotlight Carousel - Stitch Only */}
          {themeName === 'stitch' && (
            <View style={styles.stitchSpotlightSection}>
              <View style={styles.stitchSectionHeader}>
                <Text style={[styles.stitchSectionTitle, { color: t.colors.text }]}>Monthly Spotlight</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MonthlySpotlight')}>
                  <Text style={[styles.stitchSectionLink, { color: t.colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <HorizontalCarousel cardWidth={180} gap={12}>
                <SpotlightCard
                  title={monthlySpotlight.theme}
                  subtitle={monthlySpotlight.composer?.name || 'Various'}
                  imageSource={ERA_IMAGES.romantic}
                  onPress={() => navigation.navigate('MonthlySpotlight')}
                />
                <SpotlightCard
                  title="Piano Sonatas"
                  subtitle="Essential Repertoire"
                  imageSource={ERA_IMAGES.classical}
                  onPress={() => navigation.navigate('MonthlySpotlight')}
                />
                <SpotlightCard
                  title="Baroque Masters"
                  subtitle="J.S. Bach & More"
                  imageSource={ERA_IMAGES.baroque}
                  onPress={() => navigation.navigate('MonthlySpotlight')}
                />
              </HorizontalCarousel>
            </View>
          )}

          {/* Daily Discovery Section */}
          {themeName === 'stitch' ? (
            <>
              <KnowledgeBite
                label="TERM OF THE DAY"
                title={termOfDay.term}
                description={termSummary}
                imageSource={ERA_IMAGES.baroque}
                onPress={() => navigation.navigate('TermDetail', { termId: String(termOfDay.id) })}
              />
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
                Today's Discovery
              </Text>
              {/* Term of the Day - Hero Card (for non-Stitch themes) */}
              <TouchableOpacity
                style={[styles.heroCard, cardStyle]}
                onPress={() => navigation.navigate('TermDetail', { termId: String(termOfDay.id) })}
                activeOpacity={0.8}
              >
                <View style={[styles.heroAccent, { backgroundColor: t.colors.secondary }]} />
                <View style={styles.heroContent}>
                  <View style={styles.heroHeader}>
                    <View style={[styles.badge, { backgroundColor: t.colors.secondary + '20' }]}>
                      <Ionicons name="bulb" size={14} color={t.colors.secondary} />
                      <Text style={[styles.badgeText, { color: t.colors.secondary }]}>Term of the Day</Text>
                    </View>
                    <Text style={[styles.categoryBadge, { color: t.colors.textMuted, backgroundColor: t.colors.surfaceLight }]}>
                      {termOfDay.category}
                    </Text>
                  </View>
                  <Text style={[styles.heroTitle, { color: t.colors.text }]}>{termOfDay.term}</Text>
                  <Text style={[styles.heroDescription, { color: t.colors.textSecondary }]} numberOfLines={2}>
                    {termSummary}
                  </Text>
                  <View style={styles.heroFooter}>
                    <Text style={[styles.exampleLabel, { color: t.colors.textMuted }]}>Example:</Text>
                    <Text style={[styles.exampleText, { color: t.colors.primary }]} numberOfLines={1}>
                      {termOfDay.example}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Quick Stats */}
          <View style={[styles.statsRow, cardStyle, { padding: 16 }]}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: t.colors.primary }]}>
                {progress?.viewedTerms?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Terms Learned</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: t.colors.secondary }]}>
                {progress?.viewedComposers?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Composers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: t.colors.warning }]}>
                {progress?.badges?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Badges</Text>
            </View>
          </View>

          {/* Explore Section */}
          <Text style={[styles.sectionTitle, { color: t.colors.text, marginTop: 8 }]}>
            Explore
          </Text>

          <ExploreGrid
            composersCount={composersData.composers.length}
            termsCount={glossaryData.terms.length}
          />

          {/* Featured Composer Teaser */}
          <TouchableOpacity
            style={[styles.composerTeaser, cardStyle]}
            onPress={() => navigation.navigate('ComposerDetail', { composerId: featuredComposer.id })}
            activeOpacity={0.8}
          >
            <View style={styles.composerContent}>
              <Text style={[styles.composerLabel, { color: t.colors.textMuted }]}>Discover Today</Text>
              <Text style={[styles.composerName, { color: t.colors.text }]}>{featuredComposer.name}</Text>
              <Text style={[styles.composerDates, { color: t.colors.textSecondary }]}>
                {featuredComposer.years}
              </Text>
              <Text style={[styles.composerBio, { color: t.colors.textMuted }]} numberOfLines={2}>
                {featuredComposer.shortBio}
              </Text>
            </View>
            <View style={[styles.composerArrow, { backgroundColor: t.colors.primary + '20' }]}>
              <Ionicons name="arrow-forward" size={20} color={t.colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </>
      )}
    </ScrollView>
  );

  // Wrap in gradient for glass theme
  if (isGlass) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {renderContent()}
      </View>
    );
  }

  return renderContent();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14 },
  title: { fontSize: 26, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Stitch-specific header styles
  stitchHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  stitchGreeting: { fontSize: 14, fontWeight: '500', letterSpacing: 1 }, // Reference: tracking-wide
  stitchTitle: { fontSize: 30, fontWeight: '300', fontStyle: 'italic', marginBottom: 8, opacity: 0.9 }, // Reference: text-3xl font-light italic text-white/90
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  sectionLink: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 }, // Reference: tracking-wide

  // Featured grid styles moved to extracted components

  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },

  heroCard: { marginBottom: 16, overflow: 'hidden' },
  heroAccent: { height: 4 },
  heroContent: { padding: 16 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  categoryBadge: { fontSize: 10, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  heroTitle: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  heroDescription: { fontSize: 14, lineHeight: 20 },
  heroFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  exampleLabel: { fontSize: 11 },
  exampleText: { fontSize: 12, fontWeight: '500', flex: 1 },

  statsRow: { flexDirection: 'row', marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },

  // Explore and Release styles moved to extracted components

  composerTeaser: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  composerContent: { flex: 1 },
  composerLabel: { fontSize: 11, marginBottom: 4 },
  composerName: { fontSize: 18, fontWeight: '700' },
  composerDates: { fontSize: 12, marginBottom: 6 },
  composerBio: { fontSize: 12, lineHeight: 18 },
  composerArrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },

  // Stitch: Knowledge Bite Card (exact reference matching)
  stitchKnowledgeCard: {
    flexDirection: 'row',
    backgroundColor: '#261e35', // Reference: bg-[#261e35]
    borderRadius: 16, // Reference: rounded-2xl
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: 24, // Reference: mb-10 section spacing
    padding: 4, // Reference: p-1
  },
  stitchKnowledgeVisual: {
    width: '33%',
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: 12, // Reference: rounded-xl for inner visual
  },
  stitchVisualGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchVisualOverlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // Background handled by LinearGradient
  },
  stitchKnowledgeContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  stitchKnowledgeLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: '#a593c8', // text-secondary
    marginBottom: 4,
  },
  stitchKnowledgeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  stitchKnowledgeDesc: {
    fontSize: 13,
    color: '#9ca3af', // gray-400
    lineHeight: 18,
  },
  stitchKnowledgeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  stitchKnowledgeLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Stitch Spotlight Section
  stitchSpotlightSection: {
    marginBottom: 24,
  },
  stitchSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stitchSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  stitchSectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
