import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, UserProgress } from '../types';
import { getProgress, resetProgress, resetKickstart } from '../utils/storage';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';
import formsData from '../data/forms.json';
import glossaryData from '../data/glossary.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const p = await getProgress();
    setProgress(p);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            await loadProgress();
          }
        }
      ]
    );
  };

  const handleRestartKickstart = () => {
    Alert.alert(
      'Restart 5-Day Kickstart',
      'This will reset your kickstart progress so you can start fresh. Your other progress will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restart', 
          onPress: async () => {
            await resetKickstart();
            await loadProgress();
          }
        }
      ]
    );
  };

  const totalComposers = composersData.composers.length;
  const totalPeriods = periodsData.periods.length;
  const totalForms = formsData.forms.length;
  const totalTerms = glossaryData.terms.length;

  const viewedComposers = progress?.viewedComposers.length || 0;
  const viewedPeriods = progress?.viewedPeriods.length || 0;
  const viewedForms = progress?.viewedForms.length || 0;
  const viewedTerms = progress?.viewedTerms.length || 0;
  const badgesEarned = progress?.badges.length || 0;

  const StatCard = ({ 
    title, 
    current, 
    total, 
    icon, 
    color 
  }: { 
    title: string; 
    current: number; 
    total: number; 
    icon: keyof typeof Ionicons.glyphMap; 
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: t.colors.surface, borderLeftColor: color, borderLeftWidth: 3 }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: t.colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: t.colors.text }]}>
          {current} <Text style={[styles.statTotal, { color: t.colors.textMuted }]}>/ {total}</Text>
        </Text>
        <View style={[styles.progressBar, { backgroundColor: t.colors.surfaceLight }]}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(current / total) * 100}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: t.colors.primary + '30' }]}>
          <Ionicons name="musical-notes" size={40} color={t.colors.primary} />
        </View>
        <Text style={[styles.greeting, { color: t.colors.text }]}>Your Learning Journey</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
          {progress?.kickstartCompleted 
            ? 'Kickstart completed! Keep exploring.'
            : `Day ${(progress?.kickstartDay || 0) + 1} of 5-Day Kickstart`
          }
        </Text>
      </View>

      {/* Kickstart Status */}
      {!progress?.kickstartCompleted && (
        <TouchableOpacity 
          style={[styles.kickstartCard, { backgroundColor: t.colors.primary + '20', borderColor: t.colors.primary + '40' }]}
          onPress={() => navigation.navigate('Kickstart')}
        >
          <View style={styles.kickstartContent}>
            <Ionicons name="rocket" size={24} color={t.colors.primary} />
            <View style={styles.kickstartText}>
              <Text style={[styles.kickstartTitle, { color: t.colors.text }]}>Continue 5-Day Kickstart</Text>
              <Text style={[styles.kickstartSubtitle, { color: t.colors.textSecondary }]}>
                {5 - (progress?.kickstartDay || 0)} days remaining
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Stats */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Your Progress</Text>
      <View style={styles.statsGrid}>
        <StatCard 
          title="Composers" 
          current={viewedComposers} 
          total={totalComposers}
          icon="person"
          color="#C0392B"
        />
        <StatCard 
          title="Eras" 
          current={viewedPeriods} 
          total={totalPeriods}
          icon="time"
          color="#8E44AD"
        />
        <StatCard 
          title="Forms" 
          current={viewedForms} 
          total={totalForms}
          icon="musical-notes"
          color="#2980B9"
        />
        <StatCard 
          title="Terms" 
          current={viewedTerms} 
          total={totalTerms}
          icon="book"
          color={t.colors.primary}
        />
      </View>

      {/* Badges */}
      <TouchableOpacity 
        style={[styles.badgesCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
        onPress={() => navigation.navigate('Badges')}
      >
        <View style={styles.badgesHeader}>
          <Ionicons name="ribbon" size={24} color={t.colors.secondary} />
          <Text style={[styles.badgesTitle, { color: t.colors.text }]}>Badges</Text>
        </View>
        <View style={styles.badgesContent}>
          <Text style={[styles.badgesCount, { color: t.colors.secondary }]}>{badgesEarned}</Text>
          <Text style={[styles.badgesLabel, { color: t.colors.textMuted }]}>earned</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
      </TouchableOpacity>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Settings</Text>
      <View style={[styles.settingsCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="color-palette" size={20} color={t.colors.primary} />
          <Text style={[styles.settingText, { color: t.colors.text }]}>Theme & Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleRestartKickstart}>
          <Ionicons name="rocket" size={20} color={t.colors.secondary} />
          <Text style={[styles.settingText, { color: t.colors.text }]}>
            Restart 5-Day Kickstart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={t.colors.error} />
          <Text style={[styles.settingText, { color: t.colors.error }]}>
            Reset All Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: t.colors.textSecondary }]}>Context Composer</Text>
        <Text style={[styles.appVersion, { color: t.colors.textMuted }]}>Version 1.0.0</Text>
        <Text style={[styles.appTagline, { color: t.colors.textMuted }]}>
          Simplifying the learning curve of classical music
        </Text>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  greeting: { fontSize: fontSize.xxl, fontWeight: 'bold' },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
  kickstartCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1 },
  kickstartContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kickstartText: {},
  kickstartTitle: { fontSize: fontSize.md, fontWeight: '600' },
  kickstartSubtitle: { fontSize: fontSize.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  statsGrid: { gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.md },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  statContent: { flex: 1 },
  statTitle: { fontSize: fontSize.sm },
  statValue: { fontSize: fontSize.xl, fontWeight: 'bold' },
  statTotal: { fontSize: fontSize.md, fontWeight: 'normal' },
  progressBar: { height: 4, borderRadius: 2, marginTop: spacing.xs, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  badgesCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  badgesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  badgesTitle: { fontSize: fontSize.lg, fontWeight: '600' },
  badgesContent: { alignItems: 'center', marginRight: spacing.md },
  badgesCount: { fontSize: fontSize.xxl, fontWeight: 'bold' },
  badgesLabel: { fontSize: fontSize.xs },
  settingsCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  settingText: { fontSize: fontSize.md },
  appInfo: { alignItems: 'center', paddingVertical: spacing.lg },
  appName: { fontSize: fontSize.lg, fontWeight: '600' },
  appVersion: { fontSize: fontSize.sm, marginTop: 2 },
  appTagline: { fontSize: fontSize.sm, fontStyle: 'italic', marginTop: spacing.sm, textAlign: 'center' },
});
