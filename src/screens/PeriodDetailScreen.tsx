import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, Period, Composer } from '../types';
import { markPeriodViewed } from '../utils/storage';

import periodsData from '../data/periods.json';
import composersData from '../data/composers.json';

type PeriodDetailRouteProp = RouteProp<RootStackParamList, 'PeriodDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PeriodDetailScreen() {
  const route = useRoute<PeriodDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { periodId } = route.params;

  const period = periodsData.periods.find(p => p.id === periodId) as Period | undefined;
  const composers = composersData.composers.filter(c => c.period === periodId) as Composer[];

  useEffect(() => {
    if (periodId) markPeriodViewed(periodId);
  }, [periodId]);

  if (!period) {
    return <View style={styles.container}><Text style={styles.errorText}>Period not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: period.color + '20' }]}>
        <Text style={[styles.title, { color: period.color }]}>{period.name}</Text>
        <Text style={styles.years}>{period.years}</Text>
      </View>
      
      <Text style={styles.description}>{period.description}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Characteristics</Text>
        {period.keyCharacteristics.map((char, idx) => (
          <View key={idx} style={styles.characteristicItem}>
            <View style={[styles.bullet, { backgroundColor: period.color }]} />
            <Text style={styles.characteristicText}>{char}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Composers ({composers.length})</Text>
        {composers.map(composer => (
          <TouchableOpacity
            key={composer.id}
            style={styles.composerCard}
            onPress={() => navigation.navigate('ComposerDetail', { composerId: composer.id })}
          >
            <View style={[styles.avatar, { backgroundColor: period.color + '30' }]}>
              <Text style={[styles.avatarText, { color: period.color }]}>{composer.name[0]}</Text>
            </View>
            <View style={styles.composerInfo}>
              <Text style={styles.composerName}>{composer.name}</Text>
              <Text style={styles.composerYears}>{composer.years}</Text>
              <Text style={styles.composerBio} numberOfLines={2}>{composer.shortBio}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold' },
  years: { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.xs },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  characteristicItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  bullet: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  characteristicText: { fontSize: fontSize.md, color: colors.textSecondary, flex: 1 },
  composerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.xl, fontWeight: 'bold' },
  composerInfo: { flex: 1 },
  composerName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  composerYears: { fontSize: fontSize.xs, color: colors.textMuted },
  composerBio: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
});
