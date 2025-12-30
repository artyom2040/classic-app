import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { openInMusicService } from '../utils/musicLinks';
import { NewRelease, ListenerLevel, RootStackParamList } from '../types';

import albumsData from '../data/albums.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LEVEL_FILTERS: Array<{ label: string; value: ListenerLevel | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function NewReleasesScreen({ navigation }: { navigation: NavigationProp }) {
  const { theme, themeName, isDark } = useTheme();
  const { musicService } = useSettings();
  const t = theme;
  const isBrutal = false;
  const [levelFilter, setLevelFilter] = useState<ListenerLevel | 'all'>('all');

  const releases = (albumsData.newReleases || []) as NewRelease[];
  const filtered = useMemo(() => {
    if (levelFilter === 'all') return releases;
    return releases.filter(r => r.listenerLevel === levelFilter);
  }, [levelFilter, releases]);

  const preferredService = (musicService === 'apple' ? 'appleMusic' : musicService) as 'spotify' | 'appleMusic' | 'youtube';

  const levelLabel = (level?: ListenerLevel) => {
    if (!level) return null;
    if (level === 'beginner') return 'Beginner friendly';
    if (level === 'intermediate') return 'Intermediate';
    return 'Advanced';
  };

  const formatReleaseDate = (date: string) => {
    const parsed = new Date(date);
    return isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: t.colors.text }]}>New Released Albums</Text>
      <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
        Fresh recordings with quick links to your preferred service.
      </Text>

      <View style={styles.filterRow}>
        {LEVEL_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              { backgroundColor: levelFilter === filter.value ? t.colors.primary : t.colors.surface },
              isBrutal && { borderWidth: 2, borderColor: levelFilter === filter.value ? t.colors.primary : t.colors.border },
            ]}
            onPress={() => setLevelFilter(filter.value)}
          >
            <Text style={[styles.filterText, { color: levelFilter === filter.value ? t.colors.text : t.colors.textSecondary }]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.list}>
        {filtered.map(release => (
          <TouchableOpacity
            key={release.id}
            style={[
              styles.card,
              { backgroundColor: t.colors.surface },
              isBrutal ? { borderWidth: 2, borderColor: t.colors.border, borderRadius: borderRadius.md } : t.shadows.sm,
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReleaseDetail', { releaseId: release.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.releaseDate, { color: t.colors.secondary }]}>{formatReleaseDate(release.releaseDate)}</Text>
              {release.highlightTrack && (
                <View style={[styles.pill, { backgroundColor: t.colors.secondary + '20' }]}>
                  <Ionicons name="musical-notes" size={14} color={t.colors.secondary} />
                  <Text style={[styles.pillText, { color: t.colors.secondary }]} numberOfLines={1}>
                    {release.highlightTrack}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardTitle, { color: t.colors.text }]}>{release.title}</Text>
            <Text style={[styles.cardArtist, { color: t.colors.textSecondary }]}>{release.artist}</Text>
            {release.listenerLevel && (
              <View style={[styles.pill, { backgroundColor: t.colors.primary + '20' }]}>
                <Ionicons name="person" size={14} color={t.colors.primary} />
                <Text style={[styles.pillText, { color: t.colors.primary }]}>
                  {levelLabel(release.listenerLevel)}
                </Text>
              </View>
            )}
            <Text style={[styles.cardDescription, { color: t.colors.textMuted }]}>{release.description}</Text>
            <View style={styles.actions}>
              <View style={[styles.pill, { backgroundColor: t.colors.primary + '18' }]}>
                <Ionicons name="play" size={14} color={t.colors.primary} />
                <Text style={[styles.pillText, { color: t.colors.primary }]}>Open in {preferredService === 'appleMusic' ? 'Apple Music' : preferredService === 'spotify' ? 'Spotify' : 'YouTube'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
            </View>
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
  title: { fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  filterText: { fontSize: fontSize.sm, fontWeight: '600' },
  list: { gap: spacing.md },
  card: { borderRadius: borderRadius.md, padding: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs, gap: spacing.xs },
  releaseDate: { fontSize: fontSize.xs, fontWeight: '700' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: 2 },
  cardArtist: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardDescription: { fontSize: fontSize.sm, lineHeight: 20, marginTop: spacing.xs },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  pillText: { fontSize: fontSize.xs, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
});
