import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ConcertHall } from '../types';

import albumsData from '../data/albums.json';

export default function ConcertHallsScreen({ navigation }: any) {
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const halls = useMemo(() => (albumsData.concertHalls || []) as ConcertHall[], []);

  const openMap = useCallback((hall: ConcertHall) => {
    const url = hall.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${hall.name} ${hall.city}`)}`;
    Linking.openURL(url);
  }, []);

  const renderHall = useCallback(({ item: hall }: { item: ConcertHall }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: t.colors.surface },
        isBrutal ? { borderWidth: 2, borderColor: t.colors.border, borderRadius: borderRadius.md } : t.shadows.sm,
      ]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ConcertHallDetail', { hallId: hall.id })}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.hallName, { color: t.colors.text }]}>{hall.name}</Text>
        <Ionicons name="map" size={18} color={t.colors.warning} />
      </View>
      <Text style={[styles.hallLocation, { color: t.colors.textSecondary }]}>{hall.city}</Text>
      <Text style={[styles.hallDescription, { color: t.colors.textMuted }]}>{hall.description}</Text>
      {hall.signatureSound && (
        <View style={[styles.pill, { backgroundColor: t.colors.warning + '20' }]}>
          <Ionicons name="volume-high" size={14} color={t.colors.warning} />
          <Text style={[styles.pillText, { color: t.colors.warning }]} numberOfLines={1}>
            {hall.signatureSound}
          </Text>
        </View>
      )}
      <View style={styles.actionRow}>
        <View style={[styles.pill, { backgroundColor: t.colors.primary + '18' }]}>
          <Ionicons name="pin" size={14} color={t.colors.primary} />
          <Text style={[styles.pillText, { color: t.colors.primary }]}>Open in Maps</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
      </View>
    </TouchableOpacity>
  ), [navigation, t.colors, isBrutal, borderRadius]);

  const listHeader = useMemo(() => (
    <>
      <Text style={[styles.title, { color: t.colors.text }]}>Concert Halls</Text>
      <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
        Legendary rooms and their signature sounds.
      </Text>
    </>
  ), [t.colors.text, t.colors.textSecondary]);

  return (
    <FlatList
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      data={halls}
      renderItem={renderHall}
      keyExtractor={(item) => item.id}
      scrollEnabled={true}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      ListHeaderComponent={listHeader}
      ListFooterComponent={<View style={{ height: spacing.xxl }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginBottom: spacing.md },
  list: { gap: spacing.md },
  card: { borderRadius: borderRadius.md, padding: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  hallName: { fontSize: fontSize.lg, fontWeight: '700' },
  hallLocation: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  hallDescription: { fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.xs },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  pillText: { fontSize: fontSize.xs, fontWeight: '600' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
});
