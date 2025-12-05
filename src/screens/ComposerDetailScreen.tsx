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

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, Composer } from '../types';
import { markComposerViewed } from '../utils/storage';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';

type ComposerDetailRouteProp = RouteProp<RootStackParamList, 'ComposerDetail'>;

export default function ComposerDetailScreen() {
  const route = useRoute<ComposerDetailRouteProp>();
  const { composerId } = route.params;

  const composer = composersData.composers.find(c => c.id === composerId) as Composer | undefined;
  const period = periodsData.periods.find(p => p.id === composer?.period);

  useEffect(() => {
    if (composerId) {
      markComposerViewed(composerId);
    }
  }, [composerId]);

  if (!composer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Composer not found</Text>
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
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: (period?.color || colors.primary) + '40' }]}>
          <Text style={[styles.avatarText, { color: period?.color || colors.primary }]}>
            {composer.name.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>{composer.name}</Text>
        <Text style={styles.years}>{composer.years}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: (period?.color || colors.primary) + '30' }]}>
            <Text style={[styles.tagText, { color: period?.color || colors.primary }]}>
              {period?.name || composer.period}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{composer.nationality}</Text>
          </View>
        </View>
      </View>

      {/* Quick Listen */}
      <View style={styles.listenCard}>
        <Text style={styles.listenTitle}>🎧 Start Here</Text>
        <Text style={styles.listenText}>{composer.listenFirst}</Text>
        <View style={styles.listenButtons}>
          <TouchableOpacity style={styles.listenButton} onPress={openSpotify}>
            <Ionicons name="play-circle" size={20} color={colors.success} />
            <Text style={styles.listenButtonText}>Spotify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listenButton} onPress={openYouTube}>
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={styles.listenButtonText}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Biography */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biography</Text>
        <Text style={styles.bio}>{composer.fullBio}</Text>
      </View>

      {/* Fun Fact */}
      <View style={styles.funFactCard}>
        <Ionicons name="bulb" size={20} color={colors.secondary} />
        <Text style={styles.funFactText}>{composer.funFact}</Text>
      </View>

      {/* Key Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Works</Text>
        {composer.keyWorks.map((work, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.workCard}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(composer.name + ' ' + work.title)}`)}
          >
            <View style={styles.workInfo}>
              <Text style={styles.workTitle}>{work.title}</Text>
              <View style={styles.workMeta}>
                <Text style={styles.workType}>{work.type}</Text>
                <Text style={styles.workYear}>{work.year}</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  years: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  listenCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  listenTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listenText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  listenButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  listenButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  funFactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  funFactText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  workCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  workInfo: {
    flex: 1,
  },
  workTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  workMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  workType: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  workYear: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
