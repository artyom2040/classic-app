import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Period, Composer } from '../types';
import { markPeriodViewed } from '../utils/storage';
import { NetworkImage } from '../components/NetworkImage';
import { getEraImage } from '../utils/images';

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
  // header: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
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
});
