import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, UserProgress } from '../types';
import { getProgress, getWeekNumber, getDayOfYear, getCurrentMonth } from '../utils/storage';
import { openInMusicService } from '../utils/musicLinks';

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

  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const weekNumber = getWeekNumber();
  const dayOfYear = getDayOfYear();
  const currentMonth = getCurrentMonth();

  const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];
  const monthlySpotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length];
  const termOfDay = glossaryData.terms[(dayOfYear - 1) % glossaryData.terms.length];
  const featuredComposer = composersData.composers[dayOfYear % composersData.composers.length];

  const loadProgress = useCallback(async () => {
    const p = await getProgress();
    setProgress(p);
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
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  }, [loadProgress]);

  const kickstartProgress = progress?.kickstartDay || 0;
  const showKickstart = progress && !progress.kickstartCompleted;
  const isBrutal = themeName === 'neobrutalist';
  const isGlass = themeName === 'liquidglass';

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
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: t.colors.surfaceLight }]}
          onPress={() => navigation.navigate('Settings' as any)}
        >
          <Ionicons name="settings-outline" size={22} color={t.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Compact Kickstart Progress */}
      {showKickstart && (
        <TouchableOpacity
          style={[styles.kickstartCard, cardStyle, { borderLeftWidth: 4, borderLeftColor: t.colors.primary }]}
          onPress={() => navigation.navigate('Kickstart')}
          activeOpacity={0.8}
        >
          <View style={styles.kickstartRow}>
            <View style={[styles.kickstartIcon, { backgroundColor: t.colors.primary + '20' }]}>
              <Ionicons name="rocket" size={20} color={t.colors.primary} />
            </View>
            <View style={styles.kickstartInfo}>
              <Text style={[styles.kickstartTitle, { color: t.colors.text }]}>
                5-Day Kickstart
              </Text>
              <Text style={[styles.kickstartSub, { color: t.colors.textSecondary }]}>
                {kickstartProgress === 0 ? 'Start your journey' : `Day ${kickstartProgress + 1} of 5`}
              </Text>
            </View>
            <View style={styles.progressDots}>
              {[0, 1, 2, 3, 4].map((day) => (
                <View
                  key={day}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: day < kickstartProgress
                        ? t.colors.primary
                        : day === kickstartProgress
                        ? t.colors.secondary
                        : t.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      )}

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
            {termOfDay.definition}
          </Text>
          <View style={styles.heroFooter}>
            <Text style={[styles.exampleLabel, { color: t.colors.textMuted }]}>Example:</Text>
            <Text style={[styles.exampleText, { color: t.colors.primary }]} numberOfLines={1}>
              {termOfDay.example}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Two Column Cards */}
      <View style={styles.twoColumn}>
        {/* Weekly Album */}
        <TouchableOpacity
          style={[styles.halfCard, cardStyle]}
          onPress={() => navigation.navigate('WeeklyAlbum')}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: t.colors.primary + '20' }]}>
            <Ionicons name="disc" size={24} color={t.colors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: t.colors.primary }]}>Weekly Pick</Text>
          <Text style={[styles.cardTitle, { color: t.colors.text }]} numberOfLines={2}>
            {weeklyAlbum.title}
          </Text>
          <Text style={[styles.cardSub, { color: t.colors.textMuted }]} numberOfLines={1}>
            {weeklyAlbum.artist}
          </Text>
          <View style={styles.listenRow}>
            <TouchableOpacity
              style={[styles.miniButton, { backgroundColor: '#1DB954' }]}
              onPress={(e) => {
                e.stopPropagation();
                openInMusicService(`${weeklyAlbum.title} ${weeklyAlbum.artist}`, 'spotify');
              }}
            >
              <Ionicons name="play" size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.miniButton, { backgroundColor: '#FF0000' }]}
              onPress={(e) => {
                e.stopPropagation();
                openInMusicService(`${weeklyAlbum.title} ${weeklyAlbum.artist}`, 'youtube');
              }}
            >
              <Ionicons name="logo-youtube" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Monthly Spotlight */}
        <TouchableOpacity
          style={[styles.halfCard, cardStyle]}
          onPress={() => navigation.navigate('MonthlySpotlight')}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: t.colors.warning + '20' }]}>
            <Ionicons name="star" size={24} color={t.colors.warning} />
          </View>
          <Text style={[styles.cardLabel, { color: t.colors.warning }]}>This Month</Text>
          <Text style={[styles.cardTitle, { color: t.colors.text }]} numberOfLines={2}>
            {monthlySpotlight.title}
          </Text>
          <Text style={[styles.cardSub, { color: t.colors.textMuted }]} numberOfLines={1}>
            {monthlySpotlight.subtitle}
          </Text>
          <View style={[styles.challengePreview, { backgroundColor: t.colors.surfaceLight }]}>
            <Ionicons name="trophy" size={10} color={t.colors.secondary} />
            <Text style={[styles.challengePreviewText, { color: t.colors.textSecondary }]} numberOfLines={1}>
              Challenge included
            </Text>
          </View>
        </TouchableOpacity>
      </View>

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
          { icon: 'time', label: 'Timeline', sub: 'Eras & History', color: '#6B8E23', screen: 'Timeline' },
          { icon: 'book', label: 'Glossary', sub: '150 Terms', color: t.colors.primary, screen: 'Glossary' },
          { icon: 'musical-notes', label: 'Forms', sub: 'Structures', color: '#8B4513', screen: 'Forms' },
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
              if (item.screen === 'Badges') {
                navigation.navigate('Badges');
              } else {
                navigation.navigate('MainTabs', { screen: item.screen } as any);
              }
            }}
          >
            <Ionicons name={item.icon as any} size={28} color={item.color} />
            <Text style={[styles.exploreLabel, { color: t.colors.text }]}>{item.label}</Text>
            <Text style={[styles.exploreSub, { color: t.colors.textMuted }]}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
  settingsButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  
  kickstartCard: { padding: 14, marginBottom: 20 },
  kickstartRow: { flexDirection: 'row', alignItems: 'center' },
  kickstartIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  kickstartInfo: { flex: 1, marginLeft: 12 },
  kickstartTitle: { fontSize: 15, fontWeight: '600' },
  kickstartSub: { fontSize: 12, marginTop: 1 },
  progressDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  
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
  
  composerTeaser: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  composerContent: { flex: 1 },
  composerLabel: { fontSize: 11, marginBottom: 4 },
  composerName: { fontSize: 18, fontWeight: '700' },
  composerDates: { fontSize: 12, marginBottom: 6 },
  composerBio: { fontSize: 12, lineHeight: 18 },
  composerArrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
});
