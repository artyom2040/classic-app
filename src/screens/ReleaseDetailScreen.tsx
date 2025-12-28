import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, NewRelease, ListenerLevel } from '../types';
import { useSettings } from '../context/SettingsContext';
import { openInMusicService } from '../utils/musicLinks';
import albumsData from '../data/albums.json';

type ReleaseDetailRouteProp = RouteProp<RootStackParamList, 'ReleaseDetail'>;

export default function ReleaseDetailScreen() {
  const route = useRoute<ReleaseDetailRouteProp>();
  const { theme, themeName, isDark } = useTheme();
  const { musicService } = useSettings();
  const t = theme;
  const isBrutal = false;
  const preferredService = (musicService === 'apple' ? 'appleMusic' : musicService) as 'spotify' | 'appleMusic' | 'youtube';

  const release = (albumsData as any).newReleases.find((r: NewRelease) => r.id === route.params.releaseId) as NewRelease | undefined;
  if (!release) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: t.colors.error, fontSize: fontSize.lg }}>Release not found</Text>
      </View>
    );
  }

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
      <Text style={[styles.title, { color: t.colors.text }]}>{release.title}</Text>
      <Text style={[styles.artist, { color: t.colors.textSecondary }]}>{release.artist}</Text>
      <Text style={[styles.date, { color: t.colors.textMuted }]}>{formatReleaseDate(release.releaseDate)}</Text>
      {release.listenerLevel && (
        <View style={[styles.pill, { backgroundColor: t.colors.secondary + '20' }]}>
          <Ionicons name="person" size={14} color={t.colors.secondary} />
          <Text style={[styles.pillText, { color: t.colors.secondary }]}>{levelLabel(release.listenerLevel)}</Text>
        </View>
      )}
      {release.highlightTrack && (
        <View style={[styles.pill, { backgroundColor: t.colors.primary + '20' }]}>
          <Ionicons name="musical-notes" size={14} color={t.colors.primary} />
          <Text style={[styles.pillText, { color: t.colors.primary }]} numberOfLines={1}>
            {release.highlightTrack}
          </Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>About</Text>
        <Text style={[styles.description, { color: t.colors.textSecondary }]}>{release.description}</Text>
      </View>

      <TouchableOpacity
        style={[styles.listenButton, { backgroundColor: t.colors.primary }]}
        activeOpacity={0.85}
        onPress={() => openInMusicService(`${release.title} ${release.artist}`, preferredService)}
      >
        <Ionicons name="play" size={18} color={t.colors.textInverse} />
        <Text style={[styles.listenText, { color: t.colors.textInverse }]}>
          Listen in {preferredService === 'appleMusic' ? 'Apple Music' : preferredService === 'spotify' ? 'Spotify' : 'YouTube'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '800' },
  artist: { fontSize: fontSize.md, marginTop: spacing.xs },
  date: { fontSize: fontSize.sm, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.xs, alignSelf: 'flex-start' },
  pillText: { fontSize: fontSize.xs, fontWeight: '600' },
  card: { borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  description: { fontSize: fontSize.md, lineHeight: 22 },
  listenButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.lg },
  listenText: { fontSize: fontSize.md, fontWeight: '700' },
});
