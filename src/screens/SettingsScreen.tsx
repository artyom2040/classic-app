import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings, IconPack, MusicService } from '../context/SettingsContext';
import { themeList, ThemeName } from '../theme/themes';
import ThemeCard from '../components/ThemeCard';
import { Icon } from '../components/Icon';

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
  const { theme, themeName, setTheme } = useTheme();
  const { iconPack, setIconPack, musicService, setMusicService } = useSettings();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="color-palette" size={28} color={t.colors.primary} />
        <Text style={[styles.headerTitle, { color: t.colors.text }]}>Appearance</Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: t.colors.textSecondary }]}>
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

      {/* Icon Pack Section */}
      <View style={[styles.section, { borderTopColor: t.colors.border }]}>
        <View style={styles.sectionHeader}>
          <Icon name="sparkles" size={18} color={t.colors.primary} />
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
                { backgroundColor: t.colors.surface },
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
      <View style={[styles.section, { borderTopColor: t.colors.border }]}>
        <View style={styles.sectionHeader}>
          <Icon name="headset" size={18} color={t.colors.primary} />
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Music Service</Text>
        </View>
        <Text style={[styles.sectionHint, { color: t.colors.textSecondary }]}>
          Preferred service for listening links
        </Text>
        
        <View style={styles.optionsRow}>
          {MUSIC_SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                { backgroundColor: t.colors.surface },
                musicService === service.id && { borderColor: t.colors.primary, borderWidth: 2 },
                isBrutal && { borderRadius: 0, borderWidth: 2, borderColor: musicService === service.id ? t.colors.primary : t.colors.border },
              ]}
              onPress={() => setMusicService(service.id)}
            >
              <Ionicons 
                name={service.icon as any} 
                size={24} 
                color={musicService === service.id ? t.colors.primary : t.colors.textMuted} 
              />
              <Text style={[
                styles.serviceName, 
                { color: musicService === service.id ? t.colors.text : t.colors.textSecondary }
              ]}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, { borderTopColor: t.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
          <Ionicons name="information-circle" size={18} /> About
        </Text>
        <Text style={[styles.aboutText, { color: t.colors.textSecondary }]}>
          Context Composer v1.0.0{'\n'}
          Your classical music companion
        </Text>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginBottom: 24 },
  themesSection: { marginBottom: 24 },
  section: { paddingTop: 24, borderTopWidth: 1, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionHint: { fontSize: 13, marginBottom: 16 },
  optionsRow: { flexDirection: 'row', gap: 12 },
  optionCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  iconPreview: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  optionName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  optionDesc: { fontSize: 11, textAlign: 'center' },
  selectedBadge: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', gap: 6 },
  serviceName: { fontSize: 12, fontWeight: '500' },
  aboutText: { fontSize: 14, lineHeight: 22 },
});
