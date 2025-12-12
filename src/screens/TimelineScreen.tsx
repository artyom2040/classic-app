import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { ScreenContainer, ScreenHeader, ListCard, ListCardAvatar } from '../components/ui';
import { HoverCard } from '../components/HoverCard';
import { RootStackParamList, Period, Composer } from '../types';
import { hapticSelection } from '../utils/haptics';
import { NetworkImage } from '../components/NetworkImage';
import { getEraImage, getComposerPortrait } from '../utils/images';
import { HeroCard, CategoryChips } from '../components/stitch';

import periodsData from '../data/periods.json';
import composersData from '../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TimelineScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const isStitch = themeName === 'stitch';
  const { maxContentWidth, isDesktop } = useResponsive();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter chips for Stitch theme
  const TIMELINE_FILTERS = [
    { id: 'all', label: 'All Eras' },
    { id: 'complexity', label: 'Complexity' },
    { id: 'ornamentation', label: 'Ornamentation' },
    { id: 'emotional', label: 'Emotional' },
  ];

  const periods: Period[] = periodsData.periods;
  const composers: Composer[] = composersData.composers;

  const onRefresh = useCallback(() => {
    hapticSelection();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const getComposersForPeriod = useCallback((periodId: string) => {
    return composers.filter(c => c.period === periodId);
  }, [composers]);

  const cardStyle = useMemo(() => ({
    backgroundColor: t.colors.surface,
    borderRadius: borderRadius.lg,
    ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm),
  }), [t.colors.surface, t.colors.border, t.shadows.sm, isBrutal]);

  // Stitch-specific era card rendering with vertical timeline
  const renderStitchEraCard = useCallback((period: Period, index: number) => {
    const periodComposers = getComposersForPeriod(period.id);
    const isFirst = index === 0;
    const eraImage = getEraImage(period.id);
    const tagline = period.keyCharacteristics?.[0] || '';

    return (
      <View key={period.id} style={styles.stitchTimelineRow}>
        {/* Left: Timeline Node */}
        <View style={styles.stitchTimelineNode}>
          <View
            style={[
              styles.stitchDot,
              isFirst && styles.stitchDotActive,
              { borderColor: t.colors.primary },
            ]}
          >
            {isFirst && <View style={[styles.stitchDotInner, { backgroundColor: t.colors.primary }]} />}
          </View>
        </View>

        {/* Right: Card Content */}
        <View style={styles.stitchCardWrapper}>
          {/* Year Range - consistent white styling */}
          <View style={styles.stitchYearRow}>
            <Text style={styles.stitchYearText}>
              {period.years.replace('–', '-')}
            </Text>
          </View>

          {/* Main Card */}
          <TouchableOpacity
            style={[
              styles.stitchEraCard,
              { backgroundColor: t.colors.surface, borderColor: 'rgba(255,255,255,0.05)' },
              t.shadows.md,
            ]}
            onPress={() => navigation.navigate('PeriodDetail', { periodId: period.id })}
            activeOpacity={0.8}
          >
            {/* Background Image */}
            <NetworkImage
              uri={eraImage}
              fallbackType="era"
              style={styles.stitchEraImage}
              contentFit="cover"
            />
            <View style={styles.stitchEraGradient} />

            {/* Content */}
            <View style={styles.stitchEraContent}>
              <Text style={styles.stitchEraName}>{period.name}</Text>
              <Text style={styles.stitchEraTagline}>{tagline}</Text>

              {/* Keyword Chips */}
              <View style={styles.stitchChipsRow}>
                {period.keyCharacteristics.slice(0, 2).map((char, idx) => (
                  <View key={idx} style={styles.stitchChip}>
                    <Text style={styles.stitchChipText}>{char}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>

          {/* Composer Cameos */}
          {periodComposers.length > 0 && (
            <View style={styles.stitchComposerRow}>
              <View style={styles.stitchAvatarsStack}>
                {periodComposers.slice(0, 3).map((composer, idx) => (
                  <TouchableOpacity
                    key={composer.id}
                    onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
                    style={[styles.stitchAvatarWrapper, { marginLeft: idx > 0 ? -12 : 0, zIndex: 10 - idx }]}
                  >
                    <NetworkImage
                      uri={getComposerPortrait(composer.id)}
                      size={48}
                      fallbackType="composer"
                      fallbackText={composer.name}
                      style={styles.stitchComposerAvatar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.stitchComposerNames, { color: t.colors.textMuted }]}>
                {periodComposers.slice(0, 2).map(c => c.name.split(' ').pop()).join(', ')}
                {periodComposers.length > 2 && (
                  <Text style={{ color: t.colors.primary }}>
                    {' & '}{periodComposers.length - 2} more
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [navigation, getComposersForPeriod, t.colors, isBrutal, borderRadius, spacing]);

  const renderPeriodCard = useCallback((period: Period) => {
    const isSelected = selectedPeriod === period.id;
    const periodComposers = getComposersForPeriod(period.id);
    const eraImage = getEraImage(period.id);

    return (
      <View key={period.id}>
        <HoverCard
          style={{
            ...cardStyle,
            borderLeftColor: period.color,
            borderLeftWidth: 4,
            padding: spacing.md,
            ...(isSelected && { backgroundColor: t.colors.surfaceLight }),
          }}
          onPress={() => setSelectedPeriod(isSelected ? null : period.id)}
        >
          <NetworkImage
            uri={eraImage}
            fallbackType="era"
            style={{
              width: '100%',
              height: 180,
              marginBottom: spacing.md,
              borderRadius: borderRadius.md
            }}
            contentFit="cover"
          />
          <View style={styles.periodHeader}>
            <View>
              <Text style={[styles.periodName, { color: t.colors.text }]}>{period.name}</Text>
              <Text style={[styles.periodYears, { color: t.colors.textMuted }]}>{period.years}</Text>
            </View>
            <View style={styles.periodMeta}>
              <Text style={[styles.composerCount, { color: t.colors.textMuted }]}>{periodComposers.length} composers</Text>
              <Ionicons
                name={isSelected ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={t.colors.textMuted}
              />
            </View>
          </View>
          <Text style={[styles.periodDescription, { color: t.colors.textSecondary }]} numberOfLines={isSelected ? undefined : 2}>
            {period.description}
          </Text>

          {isSelected && (
            <View style={styles.characteristics}>
              <Text style={[styles.characteristicsTitle, { color: t.colors.text }]}>Key Characteristics:</Text>
              {period.keyCharacteristics.map((char, idx) => (
                <View key={idx} style={styles.characteristicItem}>
                  <View style={[styles.bullet, { backgroundColor: period.color }]} />
                  <Text style={[styles.characteristicText, { color: t.colors.textSecondary }]}>{char}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: period.color + '30' }]}
            onPress={() => navigation.navigate('PeriodDetail', { periodId: period.id })}
          >
            <Text style={[styles.exploreButtonText, { color: period.color }]}>
              Explore {period.name} Era
            </Text>
            <Ionicons name="arrow-forward" size={16} color={period.color} />
          </TouchableOpacity>
        </HoverCard>

        {isSelected && periodComposers.length > 0 && (
          <View style={styles.composersList}>
            {periodComposers.map(composer => (
              <ListCard
                key={composer.id}
                title={composer.name}
                subtitle={composer.years}
                leftContent={
                  <NetworkImage
                    uri={getComposerPortrait(composer.id)}
                    size={40}
                    fallbackType="composer"
                    fallbackText={composer.name}
                  />
                }
                onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
              />
            ))}
          </View>
        )}
      </View>
    );
  }, [selectedPeriod, getComposersForPeriod, t.colors, cardStyle, isBrutal, navigation]);

  // Prepare data for FlatList
  const timelineData = useMemo(() => {
    if (isStitch) {
      return periods.map((period, index) => ({
        id: period.id,
        type: 'stitch-era' as const,
        period,
        index,
      }));
    } else {
      return [
        { id: 'timeline-header', type: 'timeline-header' as const },
        ...periods.map(period => ({
          id: period.id,
          type: 'period-card' as const,
          period,
        })),
      ];
    }
  }, [periods, isStitch]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.type === 'stitch-era') {
      return (
        <View style={styles.stitchItemWrapper}>
          <View style={[styles.stitchVerticalLine, { backgroundColor: t.colors.primary + '40' }]} />
          {renderStitchEraCard(item.period, item.index)}
        </View>
      );
    } else if (item.type === 'timeline-header') {
      return (
        <>
          <Text style={[styles.intro, { color: t.colors.textSecondary }]}>
            Explore classical music through the ages. Tap any era to see its composers and characteristics.
          </Text>
          {/* Timeline visualization */}
          <View style={styles.timeline}>
            {periods.map((period, idx) => (
              <View key={period.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: period.color }]} />
                {idx < periods.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: period.color + '50' }]} />
                )}
              </View>
            ))}
          </View>
        </>
      );
    } else if (item.type === 'period-card') {
      return renderPeriodCard(item.period);
    }
    return null;
  }, [renderStitchEraCard, renderPeriodCard, t.colors, periods]);

  const listHeader = useMemo(() => {
    if (isStitch) {
      return (
        <View style={styles.stitchHeaderContainer}>
          {/* Filter Chips */}
          <CategoryChips
            items={TIMELINE_FILTERS}
            selectedId={selectedFilter}
            onSelect={(id) => setSelectedFilter(id)}
            style={{ marginBottom: spacing.md }}
          />
        </View>
      );
    }
    return null;
  }, [isStitch, selectedFilter, TIMELINE_FILTERS]);

  return (
    <ScreenContainer padded={false}>
      <ScreenHeader
        title={isStitch ? 'Musical Evolution' : 'Timeline'}
        subtitle={isStitch ? 'Explore the structure of sound through the ages' : 'Musical Eras'}
      />

      <FlatList
        data={timelineData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
            colors={[t.colors.primary]}
          />
        }
        ListFooterComponent={<View style={{ height: spacing.xxl * 2 }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  intro: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.lg },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { position: 'absolute', top: 5, left: '50%', right: '-50%', height: 2, zIndex: -1 },
  periodsList: { gap: spacing.md },
  stitchItemWrapper: { position: 'relative' },
  periodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  periodName: { fontSize: fontSize.xl, fontWeight: 'bold' },
  periodYears: { fontSize: fontSize.sm, marginTop: 2 },
  periodMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  composerCount: { fontSize: fontSize.xs },
  periodDescription: { fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.sm },
  characteristics: { marginTop: spacing.sm, marginBottom: spacing.sm },
  characteristicsTitle: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  characteristicItem: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  bullet: { width: 6, height: 6, borderRadius: 3, marginRight: spacing.sm },
  characteristicText: { fontSize: fontSize.sm },
  exploreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs, marginTop: spacing.xs },
  exploreButtonText: { fontSize: fontSize.sm, fontWeight: '600' },
  composersList: { marginTop: spacing.sm, marginLeft: spacing.lg, gap: spacing.xs },

  // Stitch-specific timeline styles
  stitchHeaderContainer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  stitchContainer: { position: 'relative', paddingLeft: 40 },
  stitchVerticalLine: { position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, borderRadius: 1 },
  stitchTimelineRow: { flexDirection: 'row', marginBottom: spacing.xl },
  stitchTimelineNode: { width: 40, alignItems: 'center', paddingTop: 8 },
  stitchDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, backgroundColor: '#161121', alignItems: 'center', justifyContent: 'center' },
  stitchDotActive: { width: 16, height: 16, borderRadius: 8 },
  stitchDotInner: { width: 6, height: 6, borderRadius: 3 },
  stitchCardWrapper: { flex: 1 },
  stitchYearRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  stitchYear: { fontSize: 28, fontWeight: '700', fontStyle: 'italic' },
  stitchYearText: { fontSize: 26, fontWeight: '300', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  stitchYearDash: { fontSize: 14, letterSpacing: 1 },
  stitchEraCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, height: 200 },
  stitchEraImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85 },
  stitchEraGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(22, 17, 33, 0.5)' },
  stitchEraContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  stitchEraName: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  stitchEraTagline: { fontSize: 16, fontWeight: '300', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  stitchChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stitchChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stitchChipText: { fontSize: 12, fontWeight: '500', color: '#FFFFFF', letterSpacing: 0.5 },
  stitchComposerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingLeft: 8, gap: 16 },
  stitchAvatarsStack: { flexDirection: 'row' },
  stitchAvatarWrapper: { borderRadius: 24, borderWidth: 2, borderColor: '#161121', overflow: 'hidden' },
  stitchComposerAvatar: { borderRadius: 24 },
  stitchComposerNames: { fontSize: 14, lineHeight: 18, maxWidth: 140 },
});
