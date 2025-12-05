import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{earnedBadges.length}</Text>
          <Text style={styles.statsLabel}>of {ALL_BADGES.length} badges earned</Text>
        </View>
      </View>

      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.badgesGrid}>
            {badges.map(badge => {
              const isEarned = earnedBadges.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}
                >
                  <View style={[styles.badgeIcon, isEarned ? styles.badgeIconEarned : styles.badgeIconLocked]}>
                    <Ionicons
                      name={badge.icon as any}
                      size={28}
                      color={isEarned ? colors.text : colors.textMuted}
                    />
                  </View>
                  <Text style={[styles.badgeName, !isEarned && styles.textLocked]}>
                    {badge.name}
                  </Text>
                  <Text style={[styles.badgeDescription, !isEarned && styles.textLocked]}>
                    {badge.description}
                  </Text>
                  {!isEarned && (
                    <View style={styles.lockedOverlay}>
                      <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  statsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', ...shadows.sm },
  statsNumber: { fontSize: 48, fontWeight: 'bold', color: colors.secondary },
  statsLabel: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  categorySection: { marginBottom: spacing.lg },
  categoryTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: { width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  badgeCardLocked: { opacity: 0.6 },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  badgeIconEarned: { backgroundColor: colors.secondary + '30' },
  badgeIconLocked: { backgroundColor: colors.surfaceLight },
  badgeName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, textAlign: 'center' },
  badgeDescription: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  textLocked: { color: colors.textMuted },
  lockedOverlay: { position: 'absolute', top: spacing.sm, right: spacing.sm },
});
