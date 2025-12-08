import React, { useCallback, useState } from 'react';
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

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { ScreenContainer, ScreenHeader, ListCard, ListCardAvatar } from '../components/ui';
import { HoverCard } from '../components/HoverCard';
import { RootStackParamList, Period, Composer } from '../types';
import { hapticSelection } from '../utils/haptics';
import { NetworkImage } from '../components/NetworkImage';
import { getEraImage } from '../utils/images';

import periodsData from '../data/periods.json';
import composersData from '../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TimelineScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const { maxContentWidth, isDesktop } = useResponsive();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const periods: Period[] = periodsData.periods;
  const composers: Composer[] = composersData.composers;

  const onRefresh = useCallback(() => {
    hapticSelection();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  const getComposersForPeriod = (periodId: string) => {
    return composers.filter(c => c.period === periodId);
  };

  const cardStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: borderRadius.lg,
    ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm),
  };

  const renderPeriodCard = (period: Period) => {
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
              height: 140,
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
                  <ListCardAvatar
                    letter={composer.name.charAt(0)}
                    color={period.color}
                    size={40}
                  />
                }
                onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer padded={false}>
      <ScreenHeader title="Timeline" subtitle="Musical Eras" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
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
        <Text style={[styles.intro, { color: t.colors.textSecondary }]}>
          Explore classical music through the ages. Tap any era to see its composers and characteristics.
        </Text>

        {/* Timeline visualization */}
        <View style={styles.timeline}>
          {periods.map((period, index) => (
            <View key={period.id} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: period.color }]} />
              {index < periods.length - 1 && (
                <View style={[styles.timelineLine, { backgroundColor: period.color + '50' }]} />
              )}
            </View>
          ))}
        </View>

        {/* Period cards */}
        <View style={styles.periodsList}>
          {periods.map(renderPeriodCard)}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
});
