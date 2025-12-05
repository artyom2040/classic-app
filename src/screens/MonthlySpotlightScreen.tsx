import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList } from '../types';
import { getCurrentMonth } from '../utils/storage';

import albumsData from '../data/albums.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MonthlySpotlightScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentMonth = getCurrentMonth();
  const spotlight = albumsData.monthlySpotlights[(currentMonth - 1) % albumsData.monthlySpotlights.length];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{monthNames[currentMonth - 1]} Spotlight</Text>
        <Text style={styles.title}>{spotlight.title}</Text>
        <Text style={styles.subtitle}>{spotlight.subtitle}</Text>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.description}>{spotlight.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Works</Text>
        {spotlight.featuredWorks.map((work, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.workCard}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(work)}`)}
          >
            <Text style={styles.workTitle}>{work}</Text>
            <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Ionicons name="trophy" size={24} color={colors.secondary} />
          <Text style={styles.challengeLabel}>This Month's Challenge</Text>
        </View>
        <Text style={styles.challengeText}>{spotlight.challenge}</Text>
      </View>

      {spotlight.type === 'composer' && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('ComposerDetail', { composerId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Explore {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      )}

      {spotlight.type === 'era' && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('PeriodDetail', { periodId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Explore the {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      )}

      {spotlight.type === 'form' && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('FormDetail', { formId: spotlight.id })}
        >
          <Text style={styles.exploreButtonText}>Learn About {spotlight.title}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  monthLabel: { fontSize: fontSize.sm, color: colors.warning, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.primary, marginTop: spacing.xs, textAlign: 'center' },
  descriptionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  workCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  workTitle: { fontSize: fontSize.md, color: colors.text, flex: 1 },
  challengeCard: { backgroundColor: colors.secondary + '20', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  challengeLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.secondary },
  challengeText: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  exploreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  exploreButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
});
