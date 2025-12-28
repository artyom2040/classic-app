import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// LinearGradient import removed - was only used for glass theme which is disabled

import { useTheme } from '../context/ThemeContext';
import { useCardStyle } from '../hooks/useCardStyle';
import { useResponsive } from '../hooks/useResponsive';
import { useExpensiveCalculation } from '../utils/performance';
import { spacing } from '../theme';
import {
  Display2,
  H3,
  Body,
  Caption,
  TimelineSlider,
  Era,
  CategoryPills,
  CategoryPill,
  KickstartHeroCard,
  DailyMixGrid,
  TermOfDayCard,
  MonthlyThemeSection,
} from '../design-system';
import { RootStackParamList, UserProgress, WeeklyAlbum, MonthlySpotlight } from '../types';
import { getProgress, getWeekNumber, getDayOfYear, getCurrentMonth } from '../utils/storage';
import { hapticSelection } from '../utils/haptics';
import { getShortDefinition } from '../utils/terms';
import { ERA_IMAGES } from '../utils/images';
import { getAlbumForCategory, AlbumCategory } from '../utils/albumCategories';
import { SkeletonHeroCard, SkeletonGrid } from '../components';

import glossaryData from '../data/glossary.json';
import albumsData from '../data/albums.json';
import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';
import conductorsData from '../data/conductors.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const { isDesktop, maxContentWidth } = useResponsive();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AlbumCategory>('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Category pills data for quick navigation
  const categoryPills: CategoryPill[] = [
    { id: 'all', label: 'For You', icon: 'sparkles' },
    { id: 'composers', label: 'Composers', icon: 'people' },
    { id: 'eras', label: 'Eras', icon: 'time' },
    { id: 'forms', label: 'Forms', icon: 'musical-notes' },
    { id: 'terms', label: 'Terms', icon: 'book' },
  ];

  const weekNumber = getWeekNumber();
  const dayOfYear = getDayOfYear();
  const currentMonth = getCurrentMonth();

  // Memoized expensive calculations for data selection
  const weeklyAlbum = useExpensiveCalculation(
    () => albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length] as WeeklyAlbum,
    [weekNumber],
    'weeklyAlbum selection'
  );

  const monthlySpotlight = useExpensiveCalculation(
    () => albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length] as MonthlySpotlight,
    [currentMonth],
    'monthlySpotlight selection'
  );

  const termOfDay = useExpensiveCalculation(
    () => glossaryData.terms[(dayOfYear - 1) % glossaryData.terms.length],
    [dayOfYear],
    'termOfDay selection'
  );

  const featuredComposer = useExpensiveCalculation(
    () => composersData.composers[dayOfYear % composersData.composers.length],
    [dayOfYear],
    'featuredComposer selection'
  );

  const featuredConductor = useExpensiveCalculation(
    () => conductorsData.conductors[dayOfYear % conductorsData.conductors.length],
    [dayOfYear],
    'featuredConductor selection'
  );

  // Filtered album based on category selection
  const filteredAlbum = useExpensiveCalculation(
    () => selectedCategory === 'all'
      ? weeklyAlbum
      : getAlbumForCategory(albumsData.weeklyAlbums as WeeklyAlbum[], selectedCategory, dayOfYear),
    [selectedCategory, weeklyAlbum, dayOfYear],
    'filteredAlbum selection'
  );

  const termSummary = useExpensiveCalculation(
    () => getShortDefinition(termOfDay),
    [termOfDay],
    'termSummary calculation'
  );

  // Transform periods data for TimelineSlider
  const timelineEras: Era[] = useExpensiveCalculation(
    () => periodsData.periods.map(period => ({
      id: period.id,
      name: period.name,
      period: period.years,
      color: period.color,
      image: ERA_IMAGES[period.id],
      composerCount: composersData.composers.filter(c => c.period === period.id).length,
    })),
    [],
    'timelineEras transformation'
  );

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

  const { cardStyle } = useCardStyle();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.colors.background }]}
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
          {/* Enhanced Header with new typography */}
          <View style={styles.header}>
            <View style={styles.stitchHeaderLeft}>
              <View style={[styles.avatarCircle, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : t.colors.border }]}>
                <Ionicons name="person" size={20} color={t.colors.textSecondary} />
              </View>
              <View>
                <Caption color={t.colors.textMuted}>
                  {getGreeting().toUpperCase()}
                </Caption>
                <H3 color={t.colors.text}>Maestro</H3>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : t.colors.surfaceLight }]}
              onPress={() => navigation.navigate('Search')}
              accessibilityLabel="Search"
            >
              <Ionicons name="search" size={22} color={t.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Category Filter Pills */}
          <CategoryPills
            categories={categoryPills}
            selectedId={selectedFilter}
            onSelect={(id) => {
              setSelectedFilter(id);
              // Navigate to relevant section based on filter
              if (id === 'composers') navigation.navigate('Composers');
              else if (id === 'eras') navigation.navigate('MainTabs', { screen: 'Timeline' });
              else if (id === 'forms') navigation.navigate('MainTabs', { screen: 'Discover' });
              else if (id === 'terms') navigation.navigate('MainTabs', { screen: 'Glossary' });
            }}
            style={{ marginBottom: spacing.md }}
          />

          {/* Hero Kickstart Card with Progress */}
          <KickstartHeroCard
            currentDay={progress?.kickstartDay || 0}
            title={progress?.kickstartDay === 0
              ? 'Bach to Basics'
              : `Day ${(progress?.kickstartDay || 0) + 1}: ${weeklyAlbum.title}`}
            subtitle="Understanding the mathematical beauty of the fugue without needing a calculator."
            timeRemaining="15 mins"
            imageSource={ERA_IMAGES.baroque}
            onPress={() => navigation.navigate('Kickstart')}
            isCompleted={progress?.kickstartCompleted}
          />

          {/* Horizontal Timeline Slider */}
          <TimelineSlider
            eras={timelineEras}
            onSelectEra={(era) => navigation.navigate('PeriodDetail', { periodId: era.id })}
          />

          {/* Enhanced Term of the Day */}
          <TermOfDayCard
            term={termOfDay.term}
            pronunciation={`/${termOfDay.term.toLowerCase().split('').join('-')}/`}
            definition={termSummary}
            category={termOfDay.category}
            onPress={() => navigation.navigate('TermDetail', { termId: String(termOfDay.id) })}
          />

          {/* 2x2 Daily Mix Grid */}
          <DailyMixGrid badgesCount={progress?.badges?.length || 0} />

          {/* Monthly Theme Section with Composer Spotlights */}
          <MonthlyThemeSection
            monthLabel={`${new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()} FOCUS`}
            title={monthlySpotlight.title}
            subtitle={monthlySpotlight.subtitle}
            description={monthlySpotlight.description}
            imageSource={ERA_IMAGES.romantic}
            onExplorePress={() => navigation.navigate('MonthlySpotlight')}
            composerSpotlights={[
              {
                name: featuredComposer.name,
                subtitle: featuredComposer.shortBio?.substring(0, 30) + '...',
                onPress: () => navigation.navigate('ComposerDetail', { composerId: featuredComposer.id }),
              },
              {
                name: featuredConductor.name,
                subtitle: featuredConductor.shortBio?.substring(0, 30) + '...',
                onPress: () => navigation.navigate('ConductorDetail', { conductorId: featuredConductor.id }),
              },
            ]}
          />

          <View style={{ height: 100 }} />
        </>
      )}
    </ScrollView>
  );
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
  stitchGreetingSmall: { fontSize: 10, fontWeight: '500', letterSpacing: 1.5, marginBottom: 2 },
  stitchUserName: { fontSize: 18, fontWeight: '700' },
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
