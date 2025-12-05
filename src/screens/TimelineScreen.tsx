import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Period, Composer } from '../types';

import periodsData from '../data/periods.json';
import composersData from '../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TimelineScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const periods: Period[] = periodsData.periods;
  const composers: Composer[] = composersData.composers;

  const getComposersForPeriod = (periodId: string) => {
    return composers.filter(c => c.period === periodId);
  };

  const renderPeriodCard = (period: Period) => {
    const isSelected = selectedPeriod === period.id;
    const periodComposers = getComposersForPeriod(period.id);

    return (
      <View key={period.id}>
        <TouchableOpacity
          style={[
            styles.periodCard,
            dynamicStyles.periodCard,
            { borderLeftColor: period.color, borderLeftWidth: 4 },
            isSelected && dynamicStyles.periodCardSelected,
          ]}
          onPress={() => setSelectedPeriod(isSelected ? null : period.id)}
          activeOpacity={0.8}
        >
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
              <Text style={[styles.characteristicsTitle, dynamicStyles.characteristicsTitle]}>Key Characteristics:</Text>
              {period.keyCharacteristics.map((char, idx) => (
                <View key={idx} style={styles.characteristicItem}>
                  <View style={[styles.bullet, { backgroundColor: period.color }]} />
                  <Text style={[styles.characteristicText, dynamicStyles.characteristicText]}>{char}</Text>
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
        </TouchableOpacity>

        {isSelected && periodComposers.length > 0 && (
          <View style={styles.composersList}>
            {periodComposers.map(composer => (
              <TouchableOpacity
                key={composer.id}
                style={[styles.composerCard, dynamicStyles.composerCard]}
                onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
                activeOpacity={0.7}
              >
                <View style={[styles.composerAvatar, { backgroundColor: period.color + '40' }]}>
                  <Text style={[styles.composerInitial, { color: period.color }]}>
                    {composer.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.composerInfo}>
                  <Text style={[styles.composerName, dynamicStyles.composerName]}>{composer.name}</Text>
                  <Text style={[styles.composerYears, dynamicStyles.composerYears]}>{composer.years}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const dynamicStyles = {
    container: { backgroundColor: t.colors.background },
    intro: { color: t.colors.textSecondary },
    periodCard: { backgroundColor: t.colors.surface, ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm) },
    periodCardSelected: { backgroundColor: t.colors.surfaceLight },
    periodName: { color: t.colors.text },
    periodYears: { color: t.colors.textMuted },
    composerCount: { color: t.colors.textMuted },
    periodDescription: { color: t.colors.textSecondary },
    characteristicsTitle: { color: t.colors.text },
    characteristicText: { color: t.colors.textSecondary },
    composerCard: { backgroundColor: t.colors.surface, ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm) },
    composerName: { color: t.colors.text },
    composerYears: { color: t.colors.textMuted },
  };

  return (
    <ScrollView 
      style={[styles.container, dynamicStyles.container]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.intro, dynamicStyles.intro]}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  intro: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.lg },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { position: 'absolute', top: 5, left: '50%', right: '-50%', height: 2, zIndex: -1 },
  periodsList: { gap: spacing.md },
  periodCard: { borderRadius: borderRadius.lg, padding: spacing.md },
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
  composerCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.sm },
  composerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  composerInitial: { fontSize: fontSize.lg, fontWeight: 'bold' },
  composerInfo: { flex: 1 },
  composerName: { fontSize: fontSize.md, fontWeight: '600' },
  composerYears: { fontSize: fontSize.xs },
});
