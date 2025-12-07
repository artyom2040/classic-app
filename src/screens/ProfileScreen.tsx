import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  const { isAuthenticated, isLoading: authLoading, user, signOut, isAdmin } = useAuth();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const loadProgress = useCallback(async () => {
    const p = await getProgress();
    setProgress(p);
  }, []);

  // Load on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

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

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="musical-notes" size={40} color={t.colors.primary} />
        <Text style={[styles.subtitle, { color: t.colors.textSecondary, marginTop: spacing.md }]}>Loading...</Text>
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }]}>
        <View style={[styles.authPromptCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
          <Ionicons name="person-outline" size={48} color={t.colors.primary} />
          <Text style={[styles.authTitle, { color: t.colors.text }]}>Welcome to Your Profile</Text>
          <Text style={[styles.authSubtitle, { color: t.colors.textSecondary }]}>
            Sign in to track your progress, earn badges, and sync across devices
          </Text>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: t.colors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.authButtonText, { color: '#fff' }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButtonSecondary, { borderColor: t.colors.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.authButtonSecondaryText, { color: t.colors.primary }]}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Text style={[styles.skipText, { color: t.colors.textMuted }]}>Continue without signing in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.userAvatar, { backgroundColor: t.colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: t.colors.primary }]}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: t.colors.text }]}>
              {user?.displayName || 'Profile'}
            </Text>
            <Text style={[styles.userEmail, { color: t.colors.textSecondary }]}>
              {user?.email}
            </Text>
            {isAdmin && (
              <View style={[styles.adminBadge, { backgroundColor: t.colors.warning + '20' }]}>
                <Ionicons name="shield-checkmark" size={12} color={t.colors.warning} />
                <Text style={[styles.adminBadgeText, { color: t.colors.warning }]}>Admin</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={t.colors.text} />
          </TouchableOpacity>
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

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { borderColor: t.colors.error }]}
        onPress={async () => {
          await signOut();
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={t.colors.error} />
        <Text style={[styles.signOutText, { color: t.colors.error }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  userAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '700' },
  userName: { fontSize: fontSize.lg, fontWeight: '600' },
  userEmail: { fontSize: fontSize.sm, marginTop: spacing.xs },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.full, marginTop: spacing.xs, width: 'auto' },
  adminBadgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  greeting: { fontSize: fontSize.xxl, fontWeight: 'bold', marginTop: spacing.md },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
  authPromptCard: { borderRadius: borderRadius.lg, padding: spacing.xl, alignItems: 'center', width: '100%' },
  authTitle: { fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.xs },
  authSubtitle: { fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
  authButton: { width: '100%', paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.md },
  authButtonText: { fontSize: fontSize.md, fontWeight: '600' },
  authButtonSecondary: { width: '100%', paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginBottom: spacing.md },
  authButtonSecondaryText: { fontSize: fontSize.md, fontWeight: '600' },
  skipText: { fontSize: fontSize.sm, marginTop: spacing.md },
  kickstartCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1 },
  kickstartContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kickstartText: {},
  kickstartTitle: { fontSize: fontSize.md, fontWeight: '600' },
  kickstartSubtitle: { fontSize: fontSize.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, marginTop: spacing.lg },
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
  accountCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  accountItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.md },
  accountLabel: { flex: 1, fontSize: fontSize.md },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderRadius: borderRadius.lg, gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.lg },
  signOutText: { fontSize: fontSize.md, fontWeight: '600' },
  appInfo: { alignItems: 'center', paddingVertical: spacing.lg },
  appName: { fontSize: fontSize.lg, fontWeight: '600' },
  appVersion: { fontSize: fontSize.sm, marginTop: 2 },
  appTagline: { fontSize: fontSize.sm, fontStyle: 'italic', marginTop: spacing.sm, textAlign: 'center' },
});
