import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useFavorites } from '../context/FavoritesContext';
import { useAudio, Track } from '../context/AudioContext';
import { haptic } from '../utils/haptics';
import { RootStackParamList, Composer, AudioSample, AudioSamplesData } from '../types';
import { ScreenContainer, ScreenHeader } from '../components/ui';
import { markComposerViewed } from '../utils/storage';
import { getComposerPortrait } from '../utils/images';
import { NetworkImage } from '../components/NetworkImage';
import { SkeletonComposerDetail } from '../components';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';
import audioSamplesJson from '../data/audioSamples.json';

const audioSamples = audioSamplesJson as AudioSamplesData;

type ComposerDetailRouteProp = RouteProp<RootStackParamList, 'ComposerDetail'>;

type StitchTab = 'biography' | 'works' | 'influence';

export default function ComposerDetailScreen() {
  const route = useRoute<ComposerDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, themeName, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const t = theme;
  const isBrutal = false;
  const isStitch = isDark;
  const { composerId } = route.params;
  const isLiked = isFavorite(composerId, 'composer');
  const [loading, setLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = useState<StitchTab>('biography');

  // Get audio samples for this composer
  const composerSamples: AudioSample[] = audioSamples.samples[composerId] || [];

  // Memoize expensive lookups
  const { composer, period, relatedComposers } = useMemo(() => {
    const c = composersData.composers.find(comp => comp.id === composerId) as Composer | undefined;
    const p = periodsData.periods.find(per => per.id === c?.period);
    const related = composersData.composers
      .filter(comp => comp.period === c?.period && comp.id !== c?.id)
      .slice(0, 3);
    return { composer: c, period: p, relatedComposers: related };
  }, [composerId]);

  const accentColor = period?.color || t.colors.primary;
  const yearsText = composer?.years || ((composer as any)?.birth && (composer as any)?.death
    ? `${(composer as any).birth}-${(composer as any).death}`
    : composer?.years || '');

  useEffect(() => {
    if (composerId) {
      markComposerViewed(composerId);
    }
    const timer = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(timer);
  }, [composerId]);

  const { isDesktop, maxContentWidth } = useResponsive();

  if (!composer) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Composer" />
        <Text style={[styles.errorText, { color: t.colors.error }]}>Composer not found</Text>
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer scroll padded>
        <ScreenHeader title="Loading..." />
        <SkeletonComposerDetail />
      </ScreenContainer>
    );
  }

  const openSpotify = () => {
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(composer.name)}`;
    Linking.openURL(searchUrl);
  };

  const openYouTube = () => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(composer.youtubeSearch)}`;
    Linking.openURL(searchUrl);
  };

  const handlePlaySample = (sample: AudioSample) => {
    haptic('light');
    const track: Track = {
      id: sample.id,
      title: sample.title,
      composer: sample.composer,
      audioUrl: sample.audioUrl,
      duration: sample.duration,
    };
    playTrack(track);
  };

  // Shuffle play all samples
  const handleShufflePlay = () => {
    if (composerSamples.length > 0) {
      haptic('light');
      const randomIndex = Math.floor(Math.random() * composerSamples.length);
      const sample = composerSamples[randomIndex];
      const track: Track = {
        id: sample.id,
        title: sample.title,
        composer: sample.composer,
        audioUrl: sample.audioUrl,
        duration: sample.duration,
      };
      playTrack(track);
    }
  };

  // Stitch Tab Content Renderer
  const renderStitchTabContent = () => {
    switch (selectedTab) {
      case 'biography':
        return (
          <>
            <Text style={[styles.bio, { color: t.colors.textSecondary }]}>{composer.fullBio}</Text>
            {/* Fun Fact */}
            <View style={[styles.stitchFunFact, { backgroundColor: t.colors.primary + '15' }]}>
              <Ionicons name="bulb" size={18} color={t.colors.primary} />
              <Text style={[styles.funFactText, { color: t.colors.text }]}>{composer.funFact}</Text>
            </View>
          </>
        );
      case 'works':
        return (
          <>
            {composer.keyWorks.map((work, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.stitchWorkCard, { backgroundColor: t.colors.surface }]}
                onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(composer.name + ' ' + work.title)}`)}
              >
                <View style={styles.workInfo}>
                  <Text style={[styles.workTitle, { color: t.colors.text }]}>{work.title}</Text>
                  <Text style={[styles.workYear, { color: t.colors.textMuted }]}>{work.year}</Text>
                </View>
                <View style={[styles.stitchPlayIcon, { backgroundColor: t.colors.primary + '20' }]}>
                  <Ionicons name="play" size={16} color={t.colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        );
      case 'influence':
        return (
          <>
            <Text style={[styles.bio, { color: t.colors.textSecondary, marginBottom: spacing.lg }]}>
              {composer.name} was a pivotal figure in the {period?.name || composer.period} period,
              influencing countless composers and shaping the direction of Western classical music.
            </Text>
            {relatedComposers.length > 0 && (
              <>
                <Text style={[styles.stitchSubheading, { color: t.colors.text }]}>Related Composers</Text>
                {relatedComposers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.stitchRelatedCard, { backgroundColor: t.colors.surface }]}
                    onPress={() => navigation.navigate('ComposerDetail', { composerId: c.id })}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.relatedAvatar, { backgroundColor: accentColor + '30' }]}>
                      <Text style={[styles.relatedInitial, { color: accentColor }]}>
                        {c.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.relatedInfo}>
                      <Text style={[styles.relatedName, { color: t.colors.text }]} numberOfLines={1}>{c.name}</Text>
                      <Text style={[styles.relatedYears, { color: t.colors.textMuted }]} numberOfLines={1}>{c.years}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        );
    }
  };

  // Stitch Layout
  if (isStitch) {
    return (
      <ScreenContainer padded={false}>
        <ScreenHeader title="" transparent />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Stitch Header - Centered Portrait with Glow */}
          <View style={styles.stitchHeader}>
            <View style={styles.stitchPortraitContainer}>
              {/* Glow effect */}
              <View style={[styles.stitchPortraitGlow, { shadowColor: t.colors.primary }]} />
              <NetworkImage
                uri={getComposerPortrait(composer.id)}
                size={120}
                borderRadius={60}
                fallbackType="composer"
                fallbackText={composer.name}
                style={styles.stitchPortrait}
              />
            </View>
            <Text style={[styles.stitchName, { color: t.colors.text }]}>{composer.name}</Text>
            <Text style={[styles.stitchYears, { color: t.colors.textSecondary }]}>
              {yearsText} | {period?.name || composer.period}
            </Text>

            {/* View on Timeline Button */}
            <TouchableOpacity
              style={[styles.stitchTimelineButton, { borderColor: t.colors.primary }]}
              onPress={() => navigation.navigate('Timeline')}
            >
              <Text style={[styles.stitchTimelineText, { color: t.colors.primary }]}>View on Timeline</Text>
            </TouchableOpacity>
          </View>

          {/* Stitch Tab Bar */}
          <View style={[styles.stitchTabBar, { borderColor: t.colors.border }]}>
            {(['biography', 'works', 'influence'] as StitchTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.stitchTab,
                  selectedTab === tab && [styles.stitchTabActive, { borderColor: t.colors.primary }]
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.stitchTabText,
                  { color: selectedTab === tab ? t.colors.text : t.colors.textMuted }
                ]}>
                  {tab === 'works' ? 'Key Works' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.stitchTabContent}>
            {renderStitchTabContent()}
          </View>

          {/* Recommended Listening Section */}
          {composerSamples.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.stitchSectionTitle, { color: t.colors.text, fontStyle: 'italic' }]}>
                Recommended Listening
              </Text>

              {/* Featured Listening Card */}
              <View style={[styles.stitchListeningCard, { backgroundColor: t.colors.surface }]}>
                <View style={[styles.stitchListeningIcon, { backgroundColor: t.colors.primary + '20' }]}>
                  <Ionicons name="musical-notes" size={24} color={t.colors.primary} />
                </View>
                <View style={styles.stitchListeningInfo}>
                  <Text style={[styles.stitchListeningTitle, { color: t.colors.text }]}>Getting Started</Text>
                  <Text style={[styles.stitchListeningDesc, { color: t.colors.textMuted }]}>
                    A curated playlist of essential works to begin your journey.
                  </Text>
                </View>
              </View>

              {/* Shuffle Play Button */}
              <TouchableOpacity
                style={[styles.stitchShuffleButton, { backgroundColor: t.colors.primary }]}
                onPress={handleShufflePlay}
              >
                <Ionicons name="shuffle" size={18} color="#FFF" />
                <Text style={styles.stitchShuffleText}>Shuffle Play</Text>
              </TouchableOpacity>

              {/* Sample List */}
              {composerSamples.slice(0, 3).map((sample) => {
                const isCurrentTrack = currentTrack?.id === sample.id;
                return (
                  <TouchableOpacity
                    key={sample.id}
                    style={[styles.stitchSampleRow]}
                    onPress={() => handlePlaySample(sample)}
                  >
                    <View style={styles.stitchSampleInfo}>
                      <Text style={[styles.stitchSampleTitle, { color: t.colors.text }]}>{sample.title}</Text>
                      <Text style={[styles.stitchSampleDuration, { color: t.colors.textMuted }]}>
                        {Math.floor(sample.duration / 60)}:{(sample.duration % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={[styles.stitchPlaySmall, { backgroundColor: isCurrentTrack ? t.colors.primary : 'transparent' }]}>
                      <Ionicons
                        name={isCurrentTrack && isPlaying ? 'pause' : 'play'}
                        size={16}
                        color={isCurrentTrack ? '#FFF' : t.colors.primary}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: spacing.xxl * 2 }} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Default (non-Stitch) Layout
  return (
    <ScreenContainer padded={false}>
      <ScreenHeader title={composer.name} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
            <NetworkImage
              uri={getComposerPortrait(composer.id)}
              size={100}
              borderRadius={isBrutal ? 0 : 50}
              fallbackType="composer"
              fallbackText={composer.name}
              style={isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : {}}
            />
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: t.colors.text }]}>{composer.name}</Text>
              <TouchableOpacity
                style={[styles.favoriteButton, { backgroundColor: isLiked ? t.colors.error + '20' : t.colors.surfaceLight }]}
                onPress={() => toggleFavorite(composerId, 'composer')}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? t.colors.error : t.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.years, { color: t.colors.textSecondary }]}>{yearsText}</Text>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: accentColor + '30' }]}>
                <Text style={[styles.tagText, { color: accentColor }]}>
                  {period?.name || composer.period}
                </Text>
              </View>
              <View style={[styles.tag, { backgroundColor: t.colors.surface }]}>
                <Text style={[styles.tagText, { color: t.colors.textSecondary }]}>{composer.nationality}</Text>
              </View>
              </View>
              </View>

        {/* Audio Samples - In App */}
        {composerSamples.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>🎵 Listen Now</Text>
            <Text style={[styles.sectionSubtitle, { color: t.colors.textMuted }]}>
              Free samples • No ads • Public domain
            </Text>
            {composerSamples.map((sample: any) => {
              const isCurrentTrack = currentTrack?.id === sample.id;
              return (
                <TouchableOpacity
                  key={sample.id}
                  style={[
                    styles.sampleCard,
                    { backgroundColor: t.colors.surface },
                    isCurrentTrack && { borderColor: t.colors.primary, borderWidth: 2 },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm
                  ]}
                  onPress={() => handlePlaySample(sample)}
                >
                  <View style={[styles.sampleIcon, { backgroundColor: t.colors.primary + '20' }]}>
                    <Ionicons
                      name={isCurrentTrack && isPlaying ? 'pause' : 'play'}
                      size={20}
                      color={t.colors.primary}
                    />
                  </View>
                  <View style={styles.sampleInfo}>
                    <Text style={[styles.sampleTitle, { color: t.colors.text }]}>{sample.title}</Text>
                    <Text style={[styles.sampleDuration, { color: t.colors.textMuted }]}>
                      {Math.floor(sample.duration / 60)}:{(sample.duration % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                  {isCurrentTrack && (
                    <View style={[styles.nowPlaying, { backgroundColor: t.colors.primary }]}>
                      <Text style={styles.nowPlayingText}>Playing</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick Listen - External */}
        <View style={[styles.listenCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
          <Text style={[styles.listenTitle, { color: t.colors.text }]}>🎧 More on Streaming</Text>
          <Text style={[styles.listenText, { color: t.colors.textSecondary }]}>{composer.listenFirst}</Text>
          <View style={styles.listenButtons}>
            <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openSpotify}>
              <Ionicons name="play-circle" size={20} color="#1DB954" />
              <Text style={[styles.listenButtonText, { color: t.colors.text }]}>Spotify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openYouTube}>
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              <Text style={[styles.listenButtonText, { color: t.colors.text }]}>YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Biography */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Biography</Text>
          <Text style={[styles.bio, { color: t.colors.textSecondary }]}>{composer.fullBio}</Text>
        </View>

        {/* Fun Fact */}
        <View style={[styles.funFactCard, { backgroundColor: t.colors.secondary + '20' }]}>
          <Ionicons name="bulb" size={20} color={t.colors.secondary} />
          <Text style={[styles.funFactText, { color: t.colors.text }]}>{composer.funFact}</Text>
        </View>

        {/* Key Works */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Key Works</Text>
            {composer.keyWorks.map((work, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.workCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
                onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(composer.name + ' ' + work.title)}`)}
              >
                <View style={styles.workInfo}>
                  <Text style={[styles.workTitle, { color: t.colors.text }]}>{work.title}</Text>
                  <View style={styles.workMeta}>
                    <Text style={[styles.workType, { color: t.colors.primary }]}>{work.type}</Text>
                    <Text style={[styles.workYear, { color: t.colors.textMuted }]}>{work.year}</Text>
                  </View>
                </View>
                <Ionicons name="play-circle-outline" size={24} color={t.colors.primary} />
              </TouchableOpacity>
              ))}
              </View>

        {relatedComposers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
              Related {period?.name || 'Composers'}
            </Text>
            {relatedComposers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.relatedCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
                onPress={() => navigation.navigate('ComposerDetail', { composerId: c.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.relatedAvatar, { backgroundColor: accentColor + '30' }]}>
                  <Text style={[styles.relatedInitial, { color: accentColor }]}>
                    {c.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.relatedInfo}>
                  <Text style={[styles.relatedName, { color: t.colors.text }]} numberOfLines={1}>{c.name}</Text>
                  <Text style={[styles.relatedYears, { color: t.colors.textMuted }]} numberOfLines={1}>{c.years}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  name: { fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center' },
  favoriteButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  years: { fontSize: fontSize.md, marginTop: spacing.xs },
  tags: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  tagText: { fontSize: fontSize.sm },
  listenCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  listenTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  listenText: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.md },
  listenButtons: { flexDirection: 'row', gap: spacing.sm },
  listenButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs },
  listenButtonText: { fontSize: fontSize.md, fontWeight: '500' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: fontSize.sm, marginBottom: spacing.md },
  bio: { fontSize: fontSize.md, lineHeight: 24 },
  sampleCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  sampleIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sampleInfo: { flex: 1 },
  sampleTitle: { fontSize: fontSize.md, fontWeight: '600' },
  sampleDuration: { fontSize: fontSize.sm, marginTop: 2 },
  nowPlaying: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  nowPlayingText: { fontSize: fontSize.xs, fontWeight: '600', color: '#fff' },
  funFactCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  funFactText: { flex: 1, fontSize: fontSize.md, fontStyle: 'italic', lineHeight: 22 },
  workCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  workInfo: { flex: 1 },
  workTitle: { fontSize: fontSize.md, fontWeight: '600' },
  workMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  workType: { fontSize: fontSize.sm },
  workYear: { fontSize: fontSize.sm },
  relatedCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.sm, marginTop: spacing.xs },
  relatedAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  relatedInitial: { fontSize: fontSize.lg, fontWeight: '700' },
  relatedInfo: { flex: 1 },
  relatedName: { fontSize: fontSize.md, fontWeight: '600' },
  relatedYears: { fontSize: fontSize.xs },

  // ========== STITCH STYLES ==========
  stitchHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  stitchPortraitContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  stitchPortraitGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  stitchPortrait: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  stitchName: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stitchYears: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stitchTimelineButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  stitchTimelineText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  stitchTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  stitchTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stitchTabActive: {
    borderBottomWidth: 2,
  },
  stitchTabText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  stitchTabContent: {
    paddingHorizontal: spacing.md,
    minHeight: 200,
  },
  stitchFunFact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stitchSubheading: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  stitchWorkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  stitchPlayIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchRelatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  stitchSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  stitchListeningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stitchListeningIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stitchListeningInfo: {
    flex: 1,
  },
  stitchListeningTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  stitchListeningDesc: {
    fontSize: fontSize.sm,
  },
  stitchShuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  stitchShuffleText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  stitchSampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  stitchSampleInfo: {
    flex: 1,
  },
  stitchSampleTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  stitchSampleDuration: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  stitchPlaySmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
