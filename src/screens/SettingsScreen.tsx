import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { useSettings, IconPack, MusicService } from '../context/SettingsContext';
import { themeList, ThemeName } from '../theme/themes';
import ThemeCard from '../components/ThemeCard';
import { Icon } from '../components/Icon';
import { RootStackParamList } from '../types';
import { hasAnyLabsEnabled } from '../experimental/labs.config';
import { useResponsive } from '../hooks/useResponsive';
import { spacing, fontSize, borderRadius } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ICON_PACKS: { id: IconPack; name: string; description: string }[] = [
  { id: 'ionicons', name: 'Ionicons', description: 'Classic iOS/Android style' },
  { id: 'lucide', name: 'Lucide', description: 'Clean, minimal modern icons' },
];

const MUSIC_SERVICES: { id: MusicService; name: string; icon: string }[] = [
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube' },
  { id: 'spotify', name: 'Spotify', icon: 'musical-note' },
  { id: 'apple', name: 'Apple Music', icon: 'musical-notes' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName, setTheme } = useTheme();
  const { iconPack, setIconPack, musicService, setMusicService } = useSettings();
  const { isDesktop, maxContentWidth, isWeb } = useResponsive();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: t.colors.border }]}>
        {(isWeb || navigation.canGoBack()) && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={t.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: t.colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: t.colors.primary + '20' }]}>
              <Ionicons name="color-palette" size={20} color={t.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Appearance</Text>
          </View>
          <Text style={[styles.sectionHint, { color: t.colors.textSecondary }]}>
            Choose a theme that matches your style
          </Text>

          {/* Theme Options */}
          <View style={styles.themesSection}>
            {themeList.map((themeOption) => (
              <ThemeCard
                key={themeOption.name}
                themeOption={themeOption}
                isSelected={themeName === themeOption.name}
                onSelect={(name: ThemeName) => setTheme(name)}
              />
            ))}
          </View>
        </View>

        {/* Icon Pack Section */}
        <View style={[styles.sectionCard, { backgroundColor: t.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: t.colors.secondary + '20' }]}>
              <Icon name="sparkles" size={20} color={t.colors.secondary || t.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Icon Style</Text>
          </View>
          <Text style={[styles.sectionHint, { color: t.colors.textSecondary }]}>
            Choose an icon pack for the app UI
          </Text>

          <View style={styles.optionsRow}>
            {ICON_PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: t.colors.background },
                  iconPack === pack.id && { borderColor: t.colors.primary, borderWidth: 2 },
                  isBrutal && { borderRadius: 0, borderWidth: 2, borderColor: iconPack === pack.id ? t.colors.primary : t.colors.border },
                ]}
                onPress={() => setIconPack(pack.id)}
              >
                <View style={[styles.iconPreview, { backgroundColor: t.colors.primary + '20' }]}>
                  <Icon name="musical-note" size={24} color={t.colors.primary} pack={pack.id} />
                </View>
                <Text style={[styles.optionName, { color: t.colors.text }]}>{pack.name}</Text>
                <Text style={[styles.optionDesc, { color: t.colors.textMuted }]}>{pack.description}</Text>
                {iconPack === pack.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: t.colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Music Services Section */}
        <View style={[styles.sectionCard, { backgroundColor: t.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#EC489920' }]}>
              <Icon name="headset" size={20} color="#EC4899" />
            </View>
            <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Music Service</Text>
          </View>
          <Text style={[styles.sectionHint, { color: t.colors.textSecondary }]}>
            Preferred service for listening links
          </Text>

          <View style={styles.serviceRow}>
            {MUSIC_SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: t.colors.background },
                  musicService === service.id && { borderColor: t.colors.primary, borderWidth: 2 },
                  isBrutal && { borderRadius: 0, borderWidth: 2, borderColor: musicService === service.id ? t.colors.primary : t.colors.border },
                ]}
                onPress={() => setMusicService(service.id)}
              >
                <Ionicons
                  name={service.icon as any}
                  size={28}
                  color={musicService === service.id ? t.colors.primary : t.colors.textMuted}
                />
                <Text style={[
                  styles.serviceName,
                  { color: musicService === service.id ? t.colors.text : t.colors.textSecondary }
                ]}>
                  {service.name}
                </Text>
                {musicService === service.id && (
                  <View style={[styles.serviceCheck, { backgroundColor: t.colors.primary }]}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Labs Section */}
        {hasAnyLabsEnabled() && (
          <TouchableOpacity
            style={[
              styles.labsCard,
              { backgroundColor: '#8B5CF615' },
              isBrutal && { borderRadius: 0, borderWidth: 2, borderColor: '#8B5CF6' },
            ]}
            onPress={() => navigation.navigate('Labs')}
            activeOpacity={0.7}
          >
            <View style={[styles.labsIcon, { backgroundColor: '#8B5CF630' }]}>
              <Ionicons name="flask" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.labsInfo}>
              <View style={styles.labsTitleRow}>
                <Text style={[styles.labsTitle, { color: t.colors.text }]}>Labs</Text>
                <View style={styles.labsBadge}>
                  <Text style={styles.labsBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={[styles.labsHint, { color: t.colors.textSecondary }]}>
                Try experimental features like Mood Playlists, Listening Guides, and more
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* About Section */}
        <View style={[styles.aboutSection, { borderTopColor: t.colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={t.colors.textMuted} />
          <View style={styles.aboutInfo}>
            <Text style={[styles.appName, { color: t.colors.text }]}>Context Composer</Text>
            <Text style={[styles.version, { color: t.colors.textMuted }]}>
              v1.0.0 • Your classical music companion
            </Text>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  scrollView: { flex: 1 },
  content: { padding: spacing.md },
  sectionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600' },
  sectionHint: { fontSize: fontSize.sm, marginBottom: spacing.md, marginLeft: 44 },
  themesSection: { marginTop: spacing.sm },
  optionsRow: { flexDirection: 'row', gap: spacing.sm },
  optionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  optionName: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: 2 },
  optionDesc: { fontSize: fontSize.xs, textAlign: 'center' },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceRow: { flexDirection: 'row', gap: spacing.sm },
  serviceCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  serviceName: { fontSize: fontSize.xs, fontWeight: '500' },
  serviceCheck: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  labsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labsInfo: { flex: 1 },
  labsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  labsTitle: { fontSize: fontSize.md, fontWeight: '600' },
  labsHint: { fontSize: fontSize.sm, marginTop: 2 },
  labsBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  labsBadgeText: { fontSize: 9, fontWeight: '700', color: '#8B5CF6' },
  aboutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  aboutInfo: { flex: 1 },
  appName: { fontSize: fontSize.sm, fontWeight: '600' },
  version: { fontSize: fontSize.xs, marginTop: 2 },
});
