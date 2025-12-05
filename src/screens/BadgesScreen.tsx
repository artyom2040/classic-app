import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { UserProgress } from '../types';
import { getProgress } from '../utils/storage';

const ALL_BADGES = [
  { id: 'first_listen', name: 'First Listen', description: 'You\'ve taken the first step', icon: 'musical-note', category: 'Kickstart' },
  { id: 'orchestra_explorer', name: 'Orchestra Explorer', description: 'You know the instrumental families', icon: 'people', category: 'Kickstart' },
  { id: 'time_traveler', name: 'Time Traveler', description: 'You can navigate classical music history', icon: 'time', category: 'Kickstart' },
  { id: 'form_finder', name: 'Form Finder', description: 'You understand musical architecture', icon: 'grid', category: 'Kickstart' },
  { id: 'journey_begun', name: 'Journey Begun', description: 'You\'ve completed the Kickstart!', icon: 'rocket', category: 'Kickstart' },
  { id: 'baroque_explorer', name: 'Baroque Explorer', description: 'Explored all Baroque composers', icon: 'library', category: 'Eras' },
  { id: 'classical_explorer', name: 'Classical Explorer', description: 'Explored all Classical composers', icon: 'library', category: 'Eras' },
  { id: 'romantic_explorer', name: 'Romantic Explorer', description: 'Explored all Romantic composers', icon: 'library', category: 'Eras' },
  { id: 'term_collector_10', name: 'Term Collector', description: 'Learned 10 musical terms', icon: 'book', category: 'Learning' },
  { id: 'term_collector_50', name: 'Term Master', description: 'Learned 50 musical terms', icon: 'book', category: 'Learning' },
  { id: 'form_scholar', name: 'Form Scholar', description: 'Explored all musical forms', icon: 'musical-notes', category: 'Learning' },
];

export default function BadgesScreen() {
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    loadProgress();
  }, []);

  const earnedBadges = progress?.badges || [];
  const badgesByCategory = ALL_BADGES.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as { [key: string]: typeof ALL_BADGES });

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.statsCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
          <Text style={[styles.statsNumber, { color: t.colors.secondary }]}>{earnedBadges.length}</Text>
          <Text style={[styles.statsLabel, { color: t.colors.textSecondary }]}>of {ALL_BADGES.length} badges earned</Text>
        </View>
      </View>

      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={[styles.categoryTitle, { color: t.colors.text }]}>{category}</Text>
          <View style={styles.badgesGrid}>
            {badges.map(badge => {
              const isEarned = earnedBadges.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, { backgroundColor: t.colors.surface }, !isEarned && styles.badgeCardLocked, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
                >
                  <View style={[styles.badgeIcon, { backgroundColor: isEarned ? t.colors.secondary + '30' : t.colors.surfaceLight }]}>
                    <Ionicons
                      name={badge.icon as any}
                      size={28}
                      color={isEarned ? t.colors.text : t.colors.textMuted}
                    />
                  </View>
                  <Text style={[styles.badgeName, { color: isEarned ? t.colors.text : t.colors.textMuted }]}>
                    {badge.name}
                  </Text>
                  <Text style={[styles.badgeDescription, { color: isEarned ? t.colors.textSecondary : t.colors.textMuted }]}>
                    {badge.description}
                  </Text>
                  {!isEarned && (
                    <View style={styles.lockedOverlay}>
                      <Ionicons name="lock-closed" size={16} color={t.colors.textMuted} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  statsCard: { borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center' },
  statsNumber: { fontSize: 48, fontWeight: 'bold' },
  statsLabel: { fontSize: fontSize.md, marginTop: spacing.xs },
  categorySection: { marginBottom: spacing.lg },
  categoryTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: { width: '48%', borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  badgeCardLocked: { opacity: 0.6 },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  badgeName: { fontSize: fontSize.md, fontWeight: '600', textAlign: 'center' },
  badgeDescription: { fontSize: fontSize.xs, textAlign: 'center', marginTop: 4 },
  lockedOverlay: { position: 'absolute', top: spacing.sm, right: spacing.sm },
});
