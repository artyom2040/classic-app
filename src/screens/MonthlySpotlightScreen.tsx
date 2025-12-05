import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { getCurrentMonth } from '../utils/storage';

import albumsData from '../data/albums.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MonthlySpotlightScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const currentMonth = getCurrentMonth();
  const spotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.monthLabel, { color: t.colors.warning }]}>{monthNames[currentMonth - 1]} Spotlight</Text>
        <Text style={[styles.title, { color: t.colors.text }]}>{spotlight.title}</Text>
        <Text style={[styles.subtitle, { color: t.colors.primary }]}>{spotlight.subtitle}</Text>
      </View>

      <View style={[styles.descriptionCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.description, { color: t.colors.textSecondary }]}>{spotlight.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Featured Works</Text>
        {spotlight.featuredWorks.map((work, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.workCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(work)}`)}
          >
            <Text style={[styles.workTitle, { color: t.colors.text }]}>{work}</Text>
            <Ionicons name="play-circle-outline" size={20} color={t.colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.challengeCard, { backgroundColor: t.colors.secondary + '20' }]}>
        <View style={styles.challengeHeader}>
          <Ionicons name="trophy" size={24} color={t.colors.secondary} />
          <Text style={[styles.challengeLabel, { color: t.colors.secondary }]}>This Month's Challenge</Text>
        </View>
        <Text style={[styles.challengeText, { color: t.colors.text }]}>{spotlight.challenge}</Text>
      </View>

      {spotlight.type === 'composer' && (
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: t.colors.primary }]}
          onPress={() => navigation.navigate('ComposerDetail', { composerId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Explore {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {spotlight.type === 'era' && (
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: t.colors.primary }]}
          onPress={() => navigation.navigate('PeriodDetail', { periodId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Explore the {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {spotlight.type === 'form' && (
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: t.colors.primary }]}
          onPress={() => navigation.navigate('FormDetail', { formId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Learn About {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  monthLabel: { fontSize: fontSize.sm, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center', marginTop: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs, textAlign: 'center' },
  descriptionCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  description: { fontSize: fontSize.md, lineHeight: 24 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  workCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  workTitle: { fontSize: fontSize.md, flex: 1 },
  challengeCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  challengeLabel: { fontSize: fontSize.md, fontWeight: '600' },
  challengeText: { fontSize: fontSize.md, lineHeight: 22 },
  exploreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  exploreButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: '#FFFFFF' },
});
