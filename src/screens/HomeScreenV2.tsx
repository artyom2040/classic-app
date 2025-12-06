import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';
import { RootStackParamList, UserProgress, NewRelease, ConcertHall, Term } from '../types';
import { getProgress, getWeekNumber, getDayOfYear, getCurrentMonth } from '../utils/storage';
import { openInMusicService } from '../utils/musicLinks';
import { hapticSelection } from '../utils/haptics';
import { SkeletonHeroCard, SkeletonGrid } from '../components';
import { useSettings } from '../context/SettingsContext';
import { getShortDefinition } from '../utils/terms';

import glossaryData from '../data/glossary.json';
import albumsData from '../data/albums.json';
import composersData from '../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName } = useTheme();
  const t = theme;
  const { musicService } = useSettings();

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const weekNumber = getWeekNumber();
  const dayOfYear = getDayOfYear();
  const currentMonth = getCurrentMonth();

  const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];
  const monthlySpotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length];
  const newReleases = (albumsData.newReleases || []) as NewRelease[];
  const concertHalls = (albumsData.concertHalls || []) as ConcertHall[];
  const termOfDay = glossaryData.terms[(dayOfYear - 1) % glossaryData.terms.length] as Term;
  const featuredComposer = composersData.composers[dayOfYear % composersData.composers.length];
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

  const kickstartProgress = progress?.kickstartDay || 0;
  const showKickstart = progress && !progress.kickstartCompleted;
  const isBrutal = themeName === 'neobrutalist';
  const isGlass = themeName === 'liquidglass';
  const preferredService = (musicService === 'apple' ? 'appleMusic' : musicService) as 'spotify' | 'appleMusic' | 'youtube';

  const formatReleaseDate = (date: string) => {
    const parsed = new Date(date);
    return isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openRelease = (release: NewRelease) => {
    openInMusicService(`${release.title} ${release.artist}`, preferredService);
  };

  const openHallMap = (hall: ConcertHall) => {
    const url = hall.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${hall.name} ${hall.city}`)}`;
    Linking.openURL(url);
  };

  // Card style based on theme
  const cardStyle = {
    backgroundColor: isGlass ? 'rgba(255, 255, 255, 0.6)' : t.colors.surface,
    borderRadius: t.borderRadius.lg,
    ...(isBrutal ? { borderWidth: 3, borderColor: t.colors.border } : {}),
    ...(isGlass ? { 
      borderWidth: 1, 
      borderColor: 'rgba(255, 255, 255, 0.5)',
      overflow: 'hidden' as const,
    } : t.shadows.sm),
  };

  // Glass card wrapper component
  const GlassWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
    if (!isGlass) return <>{children}</>;
    
    return (
      <View style={[style, { overflow: 'hidden' }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.7)' }]} />
        )}
        {children}
      </View>
    );
  };

  // Main content wrapped in gradient for glass theme
  const renderContent = () => (
    <ScrollView
      style={[styles.container, !isGlass && { backgroundColor: t.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
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
          >
            <Ionicons name="search-outline" size={22} color={t.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: t.colors.surfaceLight }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color={t.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Section - 3 Cards */}
      <View style={styles.featuredGrid}>
        {/* 5-Day Kickstart - Always visible */}
        <TouchableOpacity
          style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.primary }]}
          onPress={() => navigation.navigate('Kickstart')}
          activeOpacity={0.8}
        >
          <View style={[styles.featuredIcon, { backgroundColor: t.colors.primary + '20' }]}>
            <Ionicons name="rocket" size={28} color={t.colors.primary} />
          </View>
          <Text style={[styles.featuredLabel, { color: t.colors.primary }]}>5-Day Kickstart</Text>
          {progress?.kickstartCompleted ? (
            <>
              <Text style={[styles.featuredTitle, { color: t.colors.text }]}>Completed! 🎉</Text>
              <Text style={[styles.featuredSub, { color: t.colors.textMuted }]}>Tap to review</Text>
            </>
          ) : (
            <>
              <Text style={[styles.featuredTitle, { color: t.colors.text }]}>
                {kickstartProgress === 0 ? 'Start Now' : `Day ${kickstartProgress + 1}`}
              </Text>
              <View style={styles.progressDots}>
                {[0, 1, 2, 3, 4].map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: day < kickstartProgress
                          ? t.colors.success
                          : day === kickstartProgress
                          ? t.colors.primary
                          : t.colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Weekly Album */}
        <TouchableOpacity
          style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.secondary }]}
          onPress={() => navigation.navigate('WeeklyAlbum')}
          activeOpacity={0.8}
        >
          <View style={[styles.featuredIcon, { backgroundColor: t.colors.secondary + '20' }]}>
            <Ionicons name="disc" size={28} color={t.colors.secondary} />
          </View>
          <Text style={[styles.featuredLabel, { color: t.colors.secondary }]}>Weekly Pick</Text>
          <Text style={[styles.featuredTitle, { color: t.colors.text }]} numberOfLines={1}>
            {weeklyAlbum.title}
          </Text>
          <Text style={[styles.featuredSub, { color: t.colors.textMuted }]} numberOfLines={1}>
            {weeklyAlbum.artist}
          </Text>
        </TouchableOpacity>

        {/* Monthly Spotlight */}
        <TouchableOpacity
          style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.warning }]}
          onPress={() => navigation.navigate('MonthlySpotlight')}
          activeOpacity={0.8}
        >
          <View style={[styles.featuredIcon, { backgroundColor: t.colors.warning + '20' }]}>
            <Ionicons name="star" size={28} color={t.colors.warning} />
          </View>
          <Text style={[styles.featuredLabel, { color: t.colors.warning }]}>This Month</Text>
          <Text style={[styles.featuredTitle, { color: t.colors.text }]} numberOfLines={1}>
            {monthlySpotlight.title}
          </Text>
          <Text style={[styles.featuredSub, { color: t.colors.textMuted }]} numberOfLines={1}>
            {monthlySpotlight.subtitle}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Daily Discovery Section */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
        Today's Discovery
      </Text>

      {/* Term of the Day - Hero Card */}
      <TouchableOpacity
        style={[styles.heroCard, cardStyle]}
        onPress={() => navigation.navigate('TermDetail', { termId: termOfDay.id })}
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

      <View style={styles.exploreGrid}>
        {[
          { icon: 'people', label: 'Composers', sub: `${composersData.composers.length} Profiles`, color: t.colors.primary, screen: 'Composers' },
          { icon: 'time', label: 'Timeline', sub: 'Eras & History', color: '#6B8E23', screen: 'Timeline' },
          { icon: 'book', label: 'Glossary', sub: `${glossaryData.terms.length} Terms`, color: t.colors.secondary, screen: 'Glossary' },
          { icon: 'albums', label: 'Spotlight', sub: 'Monthly Feature', color: t.colors.warning, screen: 'MonthlySpotlight' },
          { icon: 'help-circle', label: 'Daily Quiz', sub: '5 Questions', color: t.colors.error, screen: 'Quiz' },
          { icon: 'ribbon', label: 'Badges', sub: 'Achievements', color: t.colors.success, screen: 'Badges' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.exploreCard,
              {
                backgroundColor: item.color + '15',
                borderRadius: t.borderRadius.lg,
                ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : {}),
              },
            ]}
            onPress={() => {
              if (item.screen === 'Composers' || item.screen === 'MonthlySpotlight' || item.screen === 'Badges' || item.screen === 'Quiz') {
                navigation.navigate(item.screen as any);
                return;
              }
              navigation.navigate('MainTabs', { screen: item.screen } as any);
            }}
          >
            <Ionicons name={item.icon as any} size={28} color={item.color} />
            <Text style={[styles.exploreLabel, { color: t.colors.text }]}>{item.label}</Text>
            <Text style={[styles.exploreSub, { color: t.colors.textMuted }]}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New Releases */}
      {newReleases.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>New Released Albums</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            style={{ marginBottom: 12 }}
          >
            {newReleases.map((release) => (
              <TouchableOpacity
                key={release.id}
                style={[
                  styles.releaseCard,
                  cardStyle,
                  { width: width * 0.72, borderTopWidth: 3, borderTopColor: t.colors.secondary },
                ]}
                activeOpacity={0.85}
                onPress={() => openRelease(release)}
              >
                <View style={styles.releaseHeader}>
                  <Text style={[styles.releaseDate, { color: t.colors.secondary }]}>{formatReleaseDate(release.releaseDate)}</Text>
                  {release.highlightTrack && (
                    <View style={[styles.releasePill, { backgroundColor: t.colors.secondary + '20' }]}>
                      <Ionicons name="musical-notes" size={14} color={t.colors.secondary} />
                      <Text style={[styles.releasePillText, { color: t.colors.secondary }]} numberOfLines={1}>
                        {release.highlightTrack}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.releaseTitle, { color: t.colors.text }]} numberOfLines={2}>
                  {release.title}
                </Text>
                <Text style={[styles.releaseArtist, { color: t.colors.textSecondary }]} numberOfLines={1}>
                  {release.artist}
                </Text>
                <Text style={[styles.releaseDescription, { color: t.colors.textMuted }]} numberOfLines={3}>
                  {release.description}
                </Text>
                <View style={styles.releaseActions}>
                  <View style={[styles.releasePill, { backgroundColor: t.colors.primary + '18' }]}>
                    <Ionicons name="play" size={14} color={t.colors.primary} />
                    <Text style={[styles.releasePillText, { color: t.colors.primary }]}>Listen</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Concert Halls */}
      {concertHalls.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Concert Halls</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
            style={{ marginBottom: 12 }}
          >
            {concertHalls.map((hall) => (
              <TouchableOpacity
                key={hall.id}
                style={[
                  styles.hallCard,
                  cardStyle,
                  { width: width * 0.72, borderTopWidth: 3, borderTopColor: t.colors.warning },
                ]}
                activeOpacity={0.85}
                onPress={() => openHallMap(hall)}
              >
                <View style={styles.hallHeader}>
                  <Text style={[styles.hallName, { color: t.colors.text }]} numberOfLines={1}>
                    {hall.name}
                  </Text>
                  <Ionicons name="map" size={18} color={t.colors.warning} />
                </View>
                <Text style={[styles.hallLocation, { color: t.colors.textSecondary }]} numberOfLines={1}>
                  {hall.city}
                </Text>
                <Text style={[styles.hallDescription, { color: t.colors.textMuted }]} numberOfLines={3}>
                  {hall.description}
                </Text>
                {hall.signatureSound && (
                  <View style={[styles.releasePill, { backgroundColor: t.colors.warning + '20' }]}>
                    <Ionicons name="volume-high" size={14} color={t.colors.warning} />
                    <Text style={[styles.releasePillText, { color: t.colors.warning }]} numberOfLines={1}>
                      {hall.signatureSound}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

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
  
  // Featured grid (3 cards: kickstart, weekly, monthly)
  featuredGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  featuredCard: { flex: 1, padding: 12, alignItems: 'center' },
  featuredIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  featuredLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  featuredTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  featuredSub: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  progressDots: { flexDirection: 'row', gap: 4, marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  
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
  
  twoColumn: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfCard: { flex: 1, padding: 14 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardSub: { fontSize: 12, marginBottom: 10 },
  listenRow: { flexDirection: 'row', gap: 8 },
  miniButton: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  challengePreview: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  challengePreviewText: { fontSize: 10 },
  
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, marginVertical: 4 },
  
  exploreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  exploreCard: { width: (width - 32 - 10) / 2, padding: 16, alignItems: 'center' },
  exploreLabel: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  exploreSub: { fontSize: 11, marginTop: 2 },
  releaseCard: { padding: 14, justifyContent: 'space-between' },
  releaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
  releaseDate: { fontSize: 12, fontWeight: '700' },
  releaseTitle: { fontSize: 16, fontWeight: '700' },
  releaseArtist: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  releaseDescription: { fontSize: 12, lineHeight: 18, flex: 1 },
  releaseActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  releasePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  releasePillText: { fontSize: 12, fontWeight: '600' },
  hallCard: { padding: 14 },
  hallHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hallName: { fontSize: 16, fontWeight: '700' },
  hallLocation: { fontSize: 13, marginTop: 2 },
  hallDescription: { fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 8 },
  
  composerTeaser: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  composerContent: { flex: 1 },
  composerLabel: { fontSize: 11, marginBottom: 4 },
  composerName: { fontSize: 18, fontWeight: '700' },
  composerDates: { fontSize: 12, marginBottom: 6 },
  composerBio: { fontSize: 12, lineHeight: 18 },
  composerArrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
});
