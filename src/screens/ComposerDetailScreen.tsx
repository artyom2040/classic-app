import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { RootStackParamList, Composer } from '../types';
import { markComposerViewed } from '../utils/storage';
import { getComposerPortrait } from '../utils/images';
import { NetworkImage } from '../components/NetworkImage';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';

type ComposerDetailRouteProp = RouteProp<RootStackParamList, 'ComposerDetail'>;

export default function ComposerDetailScreen() {
  const route = useRoute<ComposerDetailRouteProp>();
  const { theme, themeName } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const { composerId } = route.params;
  const isLiked = isFavorite(composerId, 'composer');

  const composer = composersData.composers.find(c => c.id === composerId) as Composer | undefined;
  const period = periodsData.periods.find(p => p.id === composer?.period);
  const accentColor = period?.color || t.colors.primary;

  useEffect(() => {
    if (composerId) {
      markComposerViewed(composerId);
    }
  }, [composerId]);

  if (!composer) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background }]}>
        <Text style={[styles.errorText, { color: t.colors.error }]}>Composer not found</Text>
      </View>
    );
  }

  const openSpotify = () => {
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(composer.name)}`;
    Linking.openURL(searchUrl);
  };

  const openYouTube = () => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(composer.youtubeSearch)}`;
    Linking.openURL(searchUrl);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <NetworkImage
          uri={getComposerPortrait(composer.id)}
          size={100}
          borderRadius={isBrutal ? 0 : 50}
          fallbackType="composer"
          fallbackText={composer.name}
          style={isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : {}}
        />
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: t.colors.text }]}>{composer.name}</Text>
          <TouchableOpacity 
            style={[styles.favoriteButton, { backgroundColor: isLiked ? t.colors.error + '20' : t.colors.surfaceLight }]}
            onPress={() => toggleFavorite(composerId, 'composer')}
          >
            <Ionicons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={22} 
              color={isLiked ? t.colors.error : t.colors.textMuted} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.years, { color: t.colors.textSecondary }]}>{composer.years}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: accentColor + '30' }]}>
            <Text style={[styles.tagText, { color: accentColor }]}>
              {period?.name || composer.period}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: t.colors.surface }]}>
            <Text style={[styles.tagText, { color: t.colors.textSecondary }]}>{composer.nationality}</Text>
          </View>
        </View>
      </View>

      {/* Quick Listen */}
      <View style={[styles.listenCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.listenTitle, { color: t.colors.text }]}>🎧 Start Here</Text>
        <Text style={[styles.listenText, { color: t.colors.textSecondary }]}>{composer.listenFirst}</Text>
        <View style={styles.listenButtons}>
          <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openSpotify}>
            <Ionicons name="play-circle" size={20} color="#1DB954" />
            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>Spotify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openYouTube}>
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Biography */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Biography</Text>
        <Text style={[styles.bio, { color: t.colors.textSecondary }]}>{composer.fullBio}</Text>
      </View>

      {/* Fun Fact */}
      <View style={[styles.funFactCard, { backgroundColor: t.colors.secondary + '20' }]}>
        <Ionicons name="bulb" size={20} color={t.colors.secondary} />
        <Text style={[styles.funFactText, { color: t.colors.text }]}>{composer.funFact}</Text>
      </View>

      {/* Key Works */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Key Works</Text>
        {composer.keyWorks.map((work, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.workCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(composer.name + ' ' + work.title)}`)}
          >
            <View style={styles.workInfo}>
              <Text style={[styles.workTitle, { color: t.colors.text }]}>{work.title}</Text>
              <View style={styles.workMeta}>
                <Text style={[styles.workType, { color: t.colors.primary }]}>{work.type}</Text>
                <Text style={[styles.workYear, { color: t.colors.textMuted }]}>{work.year}</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={t.colors.primary} />
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
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  name: { fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center' },
  favoriteButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  years: { fontSize: fontSize.md, marginTop: spacing.xs },
  tags: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  tagText: { fontSize: fontSize.sm },
  listenCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  listenTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  listenText: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.md },
  listenButtons: { flexDirection: 'row', gap: spacing.sm },
  listenButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs },
  listenButtonText: { fontSize: fontSize.md, fontWeight: '500' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  bio: { fontSize: fontSize.md, lineHeight: 24 },
  funFactCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  funFactText: { flex: 1, fontSize: fontSize.md, fontStyle: 'italic', lineHeight: 22 },
  workCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  workInfo: { flex: 1 },
  workTitle: { fontSize: fontSize.md, fontWeight: '600' },
  workMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  workType: { fontSize: fontSize.sm },
  workYear: { fontSize: fontSize.sm },
});
