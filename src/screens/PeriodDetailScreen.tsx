import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Period, Composer } from '../types';
import { markPeriodViewed } from '../utils/storage';
import { NetworkImage } from '../components/NetworkImage';
import { getEraImage, getComposerPortrait } from '../utils/images';

import periodsData from '../data/periods.json';
import composersData from '../data/composers.json';

type PeriodDetailRouteProp = RouteProp<RootStackParamList, 'PeriodDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PeriodDetailScreen() {
  const route = useRoute<PeriodDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const isStitch = themeName === 'stitch';
  const { periodId } = route.params;

  const period = periodsData.periods.find(p => p.id === periodId) as Period | undefined;
  const composers = composersData.composers.filter(c => c.period === periodId) as Composer[];
  const eraImage = period ? getEraImage(period.id) : null;

  useEffect(() => {
    if (periodId) markPeriodViewed(periodId);
  }, [periodId]);

  if (!period) {
    return <View style={[styles.container, { backgroundColor: t.colors.background }]}><Text style={[styles.errorText, { color: t.colors.error }]}>Period not found</Text></View>;
  }

  // Parse years for Stitch display (e.g., "500-1400" -> ["500", "1400"])
  const [startYear, endYear] = period.years.split('-').map(y => y.trim());

  // Stitch Theme Layout
  if (isStitch) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.stitchContent}>
        {/* Hero Card with Background Image */}
        <View style={[styles.stitchHeroCard, { backgroundColor: t.colors.surface }]}>
          {eraImage ? (
            <ImageBackground
              source={typeof eraImage === 'string' ? { uri: eraImage } : eraImage}
              style={styles.stitchHeroBackground}
              imageStyle={{ opacity: 0.7 }}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(22, 17, 33, 0.6)', '#161121']}
                locations={[0, 0.4, 1]}
                style={styles.stitchHeroGradient}
              >
                <View style={styles.stitchHeroContent}>
                  {/* Years Label */}
                  <View style={styles.stitchYearsRow}>
                    <Text style={styles.stitchStartYear}>{startYear}</Text>
                    <Text style={styles.stitchYearsSeparator}> — </Text>
                    <Text style={styles.stitchEndYear}>{endYear}</Text>
                  </View>
                  {/* Period Name */}
                  <Text style={styles.stitchPeriodName}>{period.name}</Text>
                  {/* Tagline */}
                  {period.keyCharacteristics[0] && (
                    <Text style={styles.stitchTagline}>{period.keyCharacteristics[0]}</Text>
                  )}
                  {/* Keyword Chips */}
                  <View style={styles.stitchChipsRow}>
                    {period.keyCharacteristics.slice(1, 3).map((char, idx) => (
                      <View key={idx} style={styles.stitchChip}>
                        <Text style={styles.stitchChipText}>{char}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[t.colors.surface, t.colors.background]}
              style={styles.stitchHeroGradient}
            >
              <View style={styles.stitchHeroContent}>
                <View style={styles.stitchYearsRow}>
                  <Text style={styles.stitchStartYear}>{startYear}</Text>
                  <Text style={styles.stitchYearsSeparator}> — </Text>
                  <Text style={styles.stitchEndYear}>{endYear}</Text>
                </View>
                <Text style={styles.stitchPeriodName}>{period.name}</Text>
                {period.keyCharacteristics[0] && (
                  <Text style={styles.stitchTagline}>{period.keyCharacteristics[0]}</Text>
                )}
                <View style={styles.stitchChipsRow}>
                  {period.keyCharacteristics.slice(1, 3).map((char, idx) => (
                    <View key={idx} style={styles.stitchChip}>
                      <Text style={styles.stitchChipText}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.stitchDescription, { color: t.colors.textSecondary }]}>
          {period.description}
        </Text>

        {/* All Characteristics */}
        <View style={styles.stitchSection}>
          <Text style={[styles.stitchSectionTitle, { color: t.colors.text }]}>Key Characteristics</Text>
          {period.keyCharacteristics.map((char, idx) => (
            <View key={idx} style={styles.stitchCharRow}>
              <View style={[styles.stitchBullet, { backgroundColor: t.colors.primary }]} />
              <Text style={[styles.stitchCharText, { color: t.colors.textSecondary }]}>{char}</Text>
            </View>
          ))}
        </View>

        {/* Composers Section with Stacked Portraits */}
        <View style={styles.stitchSection}>
          <Text style={[styles.stitchSectionTitle, { color: t.colors.text }]}>
            Composers ({composers.length})
          </Text>

          {/* Stacked Portraits Preview */}
          <View style={styles.stitchComposerPreview}>
            <View style={styles.stitchStackedAvatars}>
              {composers.slice(0, 4).map((composer, idx) => {
                const portrait = getComposerPortrait(composer.id);
                return (
                  <View key={composer.id} style={[styles.stitchStackedAvatar, { marginLeft: idx > 0 ? -12 : 0, zIndex: 4 - idx }]}>
                    <NetworkImage
                      uri={portrait}
                      fallbackType="composer"
                      style={styles.stitchAvatarImg}
                      contentFit="cover"
                    />
                  </View>
                );
              })}
            </View>
            {composers.length > 4 && (
              <Text style={styles.stitchMoreComposers}>+{composers.length - 4} more</Text>
            )}
          </View>

          {/* Full Composer List */}
          {composers.map(composer => {
            const portrait = getComposerPortrait(composer.id);
            return (
              <TouchableOpacity
                key={composer.id}
                style={[styles.stitchComposerCard, { backgroundColor: t.colors.surface }]}
                onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
                activeOpacity={0.8}
              >
                <NetworkImage
                  uri={portrait}
                  fallbackType="composer"
                  style={styles.stitchComposerAvatar}
                  contentFit="cover"
                />
                <View style={styles.stitchComposerInfo}>
                  <Text style={[styles.stitchComposerName, { color: t.colors.text }]}>{composer.name}</Text>
                  <Text style={[styles.stitchComposerYears, { color: t.colors.textMuted }]}>{composer.years}</Text>
                  <Text style={[styles.stitchComposerBio, { color: t.colors.textSecondary }]} numberOfLines={2}>
                    {composer.shortBio}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    );
  }

  // Default/Other Themes Layout
  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <View style={{ marginBottom: spacing.lg }}>
        <NetworkImage
          uri={eraImage}
          fallbackType="era"
          style={{ width: '100%', height: 200, borderRadius: borderRadius.lg }}
          contentFit="cover"
        />
        <View style={[styles.headerOverlay, {
          backgroundColor: period.color + '20',
          marginTop: -40,
          marginHorizontal: spacing.md,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: period.color + '40',
        }]}>
          <Text style={[styles.title, { color: period.color }]}>{period.name}</Text>
          <Text style={[styles.years, { color: t.colors.textSecondary }]}>{period.years}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: t.colors.textSecondary }]}>{period.description}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Key Characteristics</Text>
        {period.keyCharacteristics.map((char, idx) => (
          <View key={idx} style={styles.characteristicItem}>
            <View style={[styles.bullet, { backgroundColor: period.color }]} />
            <Text style={[styles.characteristicText, { color: t.colors.textSecondary }]}>{char}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Composers ({composers.length})</Text>
        {composers.map(composer => (
          <TouchableOpacity
            key={composer.id}
            style={[styles.composerCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
            onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
          >
            <View style={[styles.avatar, { backgroundColor: period.color + '30' }]}>
              <Text style={[styles.avatarText, { color: period.color }]}>{composer.name[0]}</Text>
            </View>
            <View style={styles.composerInfo}>
              <Text style={[styles.composerName, { color: t.colors.text }]}>{composer.name}</Text>
              <Text style={[styles.composerYears, { color: t.colors.textMuted }]}>{composer.years}</Text>
              <Text style={[styles.composerBio, { color: t.colors.textSecondary }]} numberOfLines={2}>{composer.shortBio}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  headerOverlay: { alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold' },
  years: { fontSize: fontSize.lg, marginTop: spacing.xs },
  description: { fontSize: fontSize.md, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  characteristicItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  bullet: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  characteristicText: { fontSize: fontSize.md, flex: 1 },
  composerCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.xl, fontWeight: 'bold' },
  composerInfo: { flex: 1 },
  composerName: { fontSize: fontSize.md, fontWeight: '600' },
  composerYears: { fontSize: fontSize.xs },
  composerBio: { fontSize: fontSize.sm, marginTop: 4 },

  // Stitch Theme Styles
  stitchContent: { paddingBottom: spacing.xxl },
  stitchHeroCard: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: spacing.lg,
    borderRadius: 0,
    overflow: 'hidden',
    height: 320,
  },
  stitchHeroBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  stitchHeroGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  stitchHeroContent: {
    padding: 24,
  },
  stitchYearsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  stitchStartYear: {
    fontSize: 32,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#5417cf',
  },
  stitchYearsSeparator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  stitchEndYear: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  stitchPeriodName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stitchTagline: {
    fontSize: 18,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#e5e7eb',
    marginBottom: 16,
  },
  stitchChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stitchChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stitchChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  stitchDescription: {
    fontSize: 16,
    lineHeight: 26,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  stitchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  stitchSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  stitchCharRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stitchBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  stitchCharText: {
    fontSize: 15,
    flex: 1,
  },
  stitchComposerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 16,
  },
  stitchStackedAvatars: {
    flexDirection: 'row',
  },
  stitchStackedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#161121',
    overflow: 'hidden',
  },
  stitchAvatarImg: {
    width: '100%',
    height: '100%',
  },
  stitchMoreComposers: {
    fontSize: 14,
    color: '#5417cf',
    fontWeight: '600',
  },
  stitchComposerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stitchComposerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  stitchComposerInfo: {
    flex: 1,
  },
  stitchComposerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stitchComposerYears: {
    fontSize: 12,
    marginBottom: 4,
  },
  stitchComposerBio: {
    fontSize: 13,
    lineHeight: 18,
  },
});
