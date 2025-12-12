import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, ConcertHall, ListenerLevel } from '../types';
import albumsData from '../data/albums.json';

type ConcertHallDetailRouteProp = RouteProp<RootStackParamList, 'ConcertHallDetail'>;

export default function ConcertHallDetailScreen() {
  const route = useRoute<ConcertHallDetailRouteProp>();
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const isBrutal = false;

  const hall = (albumsData as any).concertHalls.find((h: ConcertHall) => h.id === route.params.hallId) as ConcertHall | undefined;
  if (!hall) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: t.colors.error, fontSize: fontSize.lg }}>Concert hall not found</Text>
      </View>
    );
  }

  const levelLabel = (level?: ListenerLevel) => {
    if (!level) return null;
    if (level === 'beginner') return 'Beginner friendly';
    if (level === 'intermediate') return 'Intermediate';
    return 'Advanced';
  };

  const openMap = () => {
    const url = hall.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${hall.name} ${hall.city}`)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: t.colors.text }]}>{hall.name}</Text>
      <Text style={[styles.location, { color: t.colors.textSecondary }]}>{hall.city}</Text>
      {hall.listenerLevel && (
        <View style={[styles.pill, { backgroundColor: t.colors.primary + '20' }]}>
          <Ionicons name="person" size={14} color={t.colors.primary} />
          <Text style={[styles.pillText, { color: t.colors.primary }]}>{levelLabel(hall.listenerLevel)}</Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>About</Text>
        <Text style={[styles.description, { color: t.colors.textSecondary }]}>{hall.description}</Text>
      </View>

      {hall.signatureSound && (
        <View style={[styles.card, { backgroundColor: t.colors.surfaceLight }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Signature Sound</Text>
          <View style={[styles.pill, { backgroundColor: t.colors.warning + '20' }]}>
            <Ionicons name="volume-high" size={14} color={t.colors.warning} />
            <Text style={[styles.pillText, { color: t.colors.warning }]}>{hall.signatureSound}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.mapButton, { backgroundColor: t.colors.primary }]}
        activeOpacity={0.85}
        onPress={openMap}
      >
        <Ionicons name="map" size={18} color={t.colors.textInverse} />
        <Text style={[styles.mapText, { color: t.colors.textInverse }]}>Open in Maps</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '800' },
  location: { fontSize: fontSize.md, marginTop: spacing.xs },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.xs, alignSelf: 'flex-start' },
  pillText: { fontSize: fontSize.xs, fontWeight: '600' },
  card: { borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  description: { fontSize: fontSize.md, lineHeight: 22 },
  mapButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.lg },
  mapText: { fontSize: fontSize.md, fontWeight: '700' },
});
