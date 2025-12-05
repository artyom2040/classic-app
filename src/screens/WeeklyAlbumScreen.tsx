import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { getWeekNumber } from '../utils/storage';

import albumsData from '../data/albums.json';

export default function WeeklyAlbumScreen() {
  const weekNumber = getWeekNumber();
  const album = albumsData.weeklyAlbums[(weekNumber - 1) % albumsData.weeklyAlbums.length];

  const openSpotify = () => Linking.openURL(`https://open.spotify.com/search/${encodeURIComponent(album.title + ' ' + album.artist)}`);
  const openYouTube = () => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.title + ' ' + album.artist)}`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.weekLabel}>Week {weekNumber} Pick</Text>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.artist}>{album.artist}</Text>
        <Text style={styles.year}>{album.year}</Text>
      </View>

      <View style={styles.listenButtons}>
        <TouchableOpacity style={[styles.listenButton, { backgroundColor: '#1DB954' }]} onPress={openSpotify}>
          <Ionicons name="play-circle" size={24} color={colors.text} />
          <Text style={styles.listenButtonText}>Listen on Spotify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listenButton, { backgroundColor: '#FF0000' }]} onPress={openYouTube}>
          <Ionicons name="logo-youtube" size={24} color={colors.text} />
          <Text style={styles.listenButtonText}>Watch on YouTube</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Recording</Text>
        <Text style={styles.description}>{album.description}</Text>
      </View>

      <View style={styles.whyCard}>
        <Ionicons name="bulb" size={20} color={colors.secondary} />
        <View style={styles.whyContent}>
          <Text style={styles.whyLabel}>Why Listen?</Text>
          <Text style={styles.whyText}>{album.whyListen}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Moments</Text>
        {album.keyMoments.map((moment, idx) => (
          <View key={idx} style={styles.momentCard}>
            <View style={styles.momentTime}>
              <Text style={styles.momentTimeText}>{moment.time}</Text>
            </View>
            <Text style={styles.momentDescription}>{moment.description}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  weekLabel: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  artist: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  year: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  listenButtons: { gap: spacing.sm, marginBottom: spacing.lg },
  listenButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  listenButtonText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },
  whyCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.secondary + '20', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  whyContent: { flex: 1 },
  whyLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.secondary, marginBottom: spacing.xs },
  whyText: { fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  momentCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md, ...shadows.sm },
  momentTime: { backgroundColor: colors.primary + '30', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  momentTimeText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  momentDescription: { flex: 1, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 20 },
});
