import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { themeList, ThemeName } from '../theme/themes';
import ThemeCard from '../components/ThemeCard';

export default function SettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const t = theme;

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

      {/* Music Services Section */}
      <View style={[styles.section, { borderTopColor: t.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
          <Ionicons name="musical-notes" size={18} /> Music Services
        </Text>
        
        <View style={[styles.settingRow, { backgroundColor: t.colors.surface, borderRadius: t.borderRadius.md }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: t.colors.text }]}>Prefer Spotify</Text>
            <Text style={[styles.settingHint, { color: t.colors.textMuted }]}>Open links in Spotify first</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: t.colors.border, true: t.colors.primary }}
            thumbColor={t.colors.text}
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: t.colors.surface, borderRadius: t.borderRadius.md }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: t.colors.text }]}>Prefer Apple Music</Text>
            <Text style={[styles.settingHint, { color: t.colors.textMuted }]}>Open links in Apple Music first</Text>
          </View>
          <Switch
            value={false}
            trackColor={{ false: t.colors.border, true: t.colors.primary }}
            thumbColor={t.colors.text}
          />
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
  section: { paddingTop: 24, borderTopWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 8 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '500' },
  settingHint: { fontSize: 12, marginTop: 2 },
  aboutText: { fontSize: 14, lineHeight: 22 },
});
