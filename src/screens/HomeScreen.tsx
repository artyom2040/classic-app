import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, Term } from '../types';
import { getProgress, getWeekNumber, getDayOfYear, getCurrentMonth } from '../utils/storage';
import { UserProgress } from '../types';
import { getShortDefinition } from '../utils/terms';

import glossaryData from '../data/glossary.json';
import albumsData from '../data/albums.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const weekNumber = getWeekNumber();
  const dayOfYear = getDayOfYear();
  const currentMonth = getCurrentMonth();

  // Get rotating content
  const weeklyAlbum = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];
  const monthlySpotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length];
  const termOfDay = glossaryData.terms[(dayOfYear - 1) % glossaryData.terms.length] as Term;
  const termSummary = getShortDefinition(termOfDay);

  useEffect(() => {
    async function loadProgress() {
      const p = await getProgress();
      setProgress(p);
    }
    loadProgress();
  }, []);

  const showKickstart = progress && !progress.kickstartCompleted;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Context Composer</Text>
        <Text style={styles.subtitle}>Your Classical Music Companion</Text>
      </View>

      {/* Kickstart Banner */}
      {showKickstart && (
        <TouchableOpacity 
          style={styles.kickstartBanner}
          onPress={() => navigation.navigate('Kickstart')}
          activeOpacity={0.8}
        >
          <View style={styles.kickstartIcon}>
            <Ionicons name="rocket" size={28} color={colors.text} />
          </View>
          <View style={styles.kickstartContent}>
            <Text style={styles.kickstartTitle}>5-Day Kickstart</Text>
            <Text style={styles.kickstartSubtitle}>
              {progress?.kickstartDay === 0 
                ? 'Begin your classical music journey'
                : `Day ${progress?.kickstartDay + 1} of 5 — Continue learning`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      {/* Term of the Day */}
      <TouchableOpacity 
        style={styles.termCard}
        onPress={() => navigation.navigate('TermDetail', { termId: termOfDay.id })}
        activeOpacity={0.8}
      >
        <View style={styles.termHeader}>
          <Ionicons name="bulb" size={20} color={colors.secondary} />
          <Text style={styles.termLabel}>Term of the Day</Text>
        </View>
        <Text style={styles.termTitle}>{termOfDay.term}</Text>
        <Text style={styles.termDefinition} numberOfLines={2}>
          {termSummary}
        </Text>
        <View style={styles.termCategory}>
          <Text style={styles.termCategoryText}>{termOfDay.category}</Text>
        </View>
      </TouchableOpacity>

      {/* Weekly Album */}
      <TouchableOpacity 
        style={styles.albumCard}
        onPress={() => navigation.navigate('WeeklyAlbum')}
        activeOpacity={0.8}
      >
        <View style={styles.albumHeader}>
          <Ionicons name="disc" size={20} color={colors.primary} />
          <Text style={styles.albumLabel}>Weekly Album Pick</Text>
        </View>
        <Text style={styles.albumTitle}>{weeklyAlbum.title}</Text>
        <Text style={styles.albumArtist}>{weeklyAlbum.artist}</Text>
        <Text style={styles.albumDescription} numberOfLines={2}>
          {weeklyAlbum.whyListen}
        </Text>
        <View style={styles.listenButtons}>
          <TouchableOpacity 
            style={styles.listenButton}
            onPress={() => Linking.openURL(`https://open.spotify.com/search/${encodeURIComponent(weeklyAlbum.title)}`)}
          >
            <Ionicons name="play-circle" size={18} color={colors.success} />
            <Text style={styles.listenButtonText}>Spotify</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.listenButton}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(weeklyAlbum.title + ' ' + weeklyAlbum.artist)}`)}
          >
            <Ionicons name="logo-youtube" size={18} color="#FF0000" />
            <Text style={styles.listenButtonText}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Monthly Spotlight */}
      <TouchableOpacity 
        style={styles.spotlightCard}
        onPress={() => navigation.navigate('MonthlySpotlight')}
        activeOpacity={0.8}
      >
        <View style={styles.spotlightHeader}>
          <Ionicons name="star" size={20} color={colors.warning} />
          <Text style={styles.spotlightLabel}>Monthly Spotlight</Text>
        </View>
        <Text style={styles.spotlightTitle}>{monthlySpotlight.title}</Text>
        <Text style={styles.spotlightSubtitle}>{monthlySpotlight.subtitle}</Text>
        <Text style={styles.spotlightDescription} numberOfLines={2}>
          {monthlySpotlight.description}
        </Text>
        <View style={styles.challengeBox}>
          <Ionicons name="trophy" size={16} color={colors.secondary} />
          <Text style={styles.challengeText}>{monthlySpotlight.challenge}</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Access Grid */}
      <Text style={styles.sectionTitle}>Explore</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity 
          style={[styles.quickCard, { backgroundColor: colors.periodBaroque + '40' }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Timeline' } as any)}
        >
          <Ionicons name="time" size={32} color={colors.periodBaroque} />
          <Text style={styles.quickCardTitle}>Timeline</Text>
          <Text style={styles.quickCardSubtitle}>Eras & Composers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickCard, { backgroundColor: colors.primary + '40' }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Glossary' } as any)}
        >
          <Ionicons name="book" size={32} color={colors.primary} />
          <Text style={styles.quickCardTitle}>Glossary</Text>
          <Text style={styles.quickCardSubtitle}>150 Terms</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickCard, { backgroundColor: colors.periodRomantic + '40' }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Forms' } as any)}
        >
          <Ionicons name="musical-notes" size={32} color={colors.periodRomantic} />
          <Text style={styles.quickCardTitle}>Forms</Text>
          <Text style={styles.quickCardSubtitle}>Musical Structures</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickCard, { backgroundColor: colors.success + '40' }]}
          onPress={() => navigation.navigate('Badges')}
        >
          <Ionicons name="ribbon" size={32} color={colors.success} />
          <Text style={styles.quickCardTitle}>Badges</Text>
          <Text style={styles.quickCardSubtitle}>{progress?.badges.length || 0} Earned</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  kickstartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  kickstartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  kickstartContent: {
    flex: 1,
  },
  kickstartTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  kickstartSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  termLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  termTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  termDefinition: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  termCategory: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  termCategoryText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  albumCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  albumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  albumLabel: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  albumTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  albumArtist: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  albumDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  listenButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  listenButtonText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  spotlightCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spotlightLabel: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  spotlightTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  spotlightSubtitle: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  spotlightDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  challengeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  challengeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  quickCardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
