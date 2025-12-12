import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { getWeekNumber } from '../utils/storage';

import albumsData from '../data/albums.json';
import { ListenerLevel } from '../types';

export default function WeeklyAlbumScreen() {
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const isBrutal = false;
  const weekNumber = getWeekNumber();
  const album = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];
  const level = album.listenerLevel as ListenerLevel | undefined;

  const openSpotify = () => Linking.openURL(`https://open.spotify.com/search/${encodeURIComponent(album.title + ' ' + album.artist)}`);
  const openYouTube = () => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.title + ' ' + album.artist)}`);

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.weekLabel, { color: t.colors.primary }]}>Week {weekNumber} Pick</Text>
        <Text style={[styles.title, { color: t.colors.text }]}>{album.title}</Text>
        <Text style={[styles.artist, { color: t.colors.textSecondary }]}>{album.artist}</Text>
        <Text style={[styles.year, { color: t.colors.textMuted }]}>{album.year}</Text>
        {level && (
          <View style={[styles.levelPill, { backgroundColor: t.colors.secondary + '20' }]}>
            <Ionicons name="person" size={14} color={t.colors.secondary} />
            <Text style={[styles.levelText, { color: t.colors.secondary }]}>
              {level === 'beginner' ? 'Beginner friendly' : level === 'intermediate' ? 'Intermediate' : 'Advanced'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.listenButtons}>
        <TouchableOpacity style={[styles.listenButton, { backgroundColor: '#1DB954' }]} onPress={openSpotify}>
          <Ionicons name="play-circle" size={24} color="#FFFFFF" />
          <Text style={[styles.listenButtonText, { color: '#FFFFFF' }]}>Listen on Spotify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listenButton, { backgroundColor: '#FF0000' }]} onPress={openYouTube}>
          <Ionicons name="logo-youtube" size={24} color="#FFFFFF" />
          <Text style={[styles.listenButtonText, { color: '#FFFFFF' }]}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>About This Recording</Text>
        <Text style={[styles.description, { color: t.colors.textSecondary }]}>{album.description}</Text>
      </View>

      <View style={[styles.whyCard, { backgroundColor: t.colors.secondary + '20' }]}>
        <Ionicons name="bulb" size={20} color={t.colors.secondary} />
        <View style={styles.whyContent}>
          <Text style={[styles.whyLabel, { color: t.colors.secondary }]}>Why Listen?</Text>
          <Text style={[styles.whyText, { color: t.colors.text }]}>{album.whyListen}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Key Moments</Text>
        {album.keyMoments.map((moment, idx) => (
          <View key={idx} style={[styles.momentCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
            <View style={[styles.momentTime, { backgroundColor: t.colors.primary + '30' }]}>
              <Text style={[styles.momentTimeText, { color: t.colors.primary }]}>{moment.time}</Text>
            </View>
            <Text style={[styles.momentDescription, { color: t.colors.textSecondary }]}>{moment.description}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  weekLabel: { fontSize: fontSize.sm, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center', marginTop: spacing.xs },
  artist: { fontSize: fontSize.md, marginTop: spacing.xs, textAlign: 'center' },
  year: { fontSize: fontSize.sm, marginTop: 2 },
  levelPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.xs },
  levelText: { fontSize: fontSize.xs, fontWeight: '600' },
  listenButtons: { gap: spacing.sm, marginBottom: spacing.lg },
  listenButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  listenButtonText: { fontSize: fontSize.md, fontWeight: '600' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  description: { fontSize: fontSize.md, lineHeight: 24 },
  whyCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  whyContent: { flex: 1 },
  whyLabel: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  whyText: { fontSize: fontSize.md, lineHeight: 22 },
  momentCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  momentTime: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  momentTimeText: { fontSize: fontSize.sm, fontWeight: '600' },
  momentDescription: { flex: 1, fontSize: fontSize.md, lineHeight: 20 },
});
