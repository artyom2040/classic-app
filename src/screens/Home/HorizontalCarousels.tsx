import React from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, StyleSheet, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../context/ThemeContext';
import { useCardStyle } from '../../hooks/useCardStyle';
import { RootStackParamList, NewRelease, ConcertHall, ListenerLevel } from '../../types';
import { openInMusicService } from '../../utils/musicLinks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

// ============================================================================
// Helpers
// ============================================================================

const formatReleaseDate = (date: string) => {
  const parsed = new Date(date);
  return isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const levelLabel = (level?: ListenerLevel) => {
  if (!level) return null;
  if (level === 'beginner') return 'Beginner friendly';
  if (level === 'intermediate') return 'Intermediate';
  return 'Advanced';
};

// ============================================================================
// New Releases Carousel
// ============================================================================

interface NewReleasesCarouselProps {
  releases: NewRelease[];
  musicService: 'spotify' | 'appleMusic' | 'youtube';
}

export function NewReleasesCarousel({ releases, musicService }: NewReleasesCarouselProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme: t } = useTheme();
  const { cardStyle } = useCardStyle();

  const openRelease = (release: NewRelease) => {
    openInMusicService(`${release.title} ${release.artist}`, musicService);
  };

  if (releases.length === 0) return null;

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>New Released Albums</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewReleases')} accessibilityRole="button" accessibilityLabel="See all new releases">
          <Text style={[styles.sectionLink, { color: t.colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
        style={{ marginBottom: 12 }}
      >
        {releases.map((release) => (
          <View
            key={release.id}
            style={[
              styles.releaseCard,
              cardStyle,
              { width: width * 0.72, borderTopWidth: 3, borderTopColor: t.colors.secondary },
            ]}
          >
            <Pressable
              style={styles.cardPressArea}
              onPress={() => navigation.navigate('ReleaseDetail', { releaseId: release.id })}
              accessibilityRole="button"
              accessibilityLabel={`${release.title} by ${release.artist}, released ${formatReleaseDate(release.releaseDate)}`}
              accessibilityHint="Double tap to view album details"
            >
              <View style={styles.releaseHeader}>
                <Text style={[styles.releaseDate, { color: t.colors.secondary }]}>
                  {formatReleaseDate(release.releaseDate)}
                </Text>
                {release.highlightTrack && (
                  <View style={[styles.pill, { backgroundColor: t.colors.secondary + '20' }]}>
                    <Ionicons name="musical-notes" size={14} color={t.colors.secondary} />
                    <Text style={[styles.pillText, { color: t.colors.secondary }]} numberOfLines={1}>
                      {release.highlightTrack}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.releaseTitle, { color: t.colors.text }]} numberOfLines={2}>
                {release.title}
              </Text>
              <Text style={[styles.releaseArtist, { color: t.colors.textSecondary }]} numberOfLines={1}>
                {release.artist}
              </Text>
              {release.listenerLevel && (
                <View style={[styles.pill, { backgroundColor: t.colors.primary + '20' }]}>
                  <Ionicons name="person" size={14} color={t.colors.primary} />
                  <Text style={[styles.pillText, { color: t.colors.primary }]} numberOfLines={1}>
                    {levelLabel(release.listenerLevel)}
                  </Text>
                </View>
              )}
              <Text style={[styles.releaseDescription, { color: t.colors.textMuted }]} numberOfLines={3}>
                {release.description}
              </Text>
            </Pressable>
            <View style={styles.releaseActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: t.colors.primary + '18', opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => openRelease(release)}
                accessibilityRole="button"
                accessibilityLabel={`Listen to ${release.title}`}
              >
                <Ionicons name="play" size={14} color={t.colors.primary} />
                <Text style={[styles.pillText, { color: t.colors.primary }]}>Listen</Text>
              </Pressable>
              <TouchableOpacity onPress={() => navigation.navigate('ReleaseDetail', { releaseId: release.id })}>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ============================================================================
// Concert Halls Carousel
// ============================================================================

interface ConcertHallsCarouselProps {
  halls: ConcertHall[];
}

export function ConcertHallsCarousel({ halls }: ConcertHallsCarouselProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme: t } = useTheme();
  const { cardStyle } = useCardStyle();

  const openHallMap = (hall: ConcertHall) => {
    const url = hall.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${hall.name} ${hall.city}`)}`;
    Linking.openURL(url);
  };

  if (halls.length === 0) return null;

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Concert Halls</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ConcertHalls')} accessibilityRole="button" accessibilityLabel="See all concert halls">
          <Text style={[styles.sectionLink, { color: t.colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
        style={{ marginBottom: 12 }}
      >
        {halls.map((hall) => (
          <View
            key={hall.id}
            style={[
              styles.hallCard,
              cardStyle,
              { width: width * 0.72, borderTopWidth: 3, borderTopColor: t.colors.warning },
            ]}
          >
            <Pressable
              style={styles.cardPressArea}
              onPress={() => navigation.navigate('ConcertHallDetail', { hallId: hall.id })}
              accessibilityRole="button"
              accessibilityLabel={`${hall.name} in ${hall.city}`}
              accessibilityHint="Double tap to view concert hall details"
            >
              <View style={styles.hallHeader}>
                <Text style={[styles.hallName, { color: t.colors.text }]} numberOfLines={1}>
                  {hall.name}
                </Text>
                <Ionicons name="map" size={18} color={t.colors.warning} />
              </View>
              <Text style={[styles.hallLocation, { color: t.colors.textSecondary }]} numberOfLines={1}>
                {hall.city}
              </Text>
              <Text style={[styles.hallDescription, { color: t.colors.textMuted }]} numberOfLines={3}>
                {hall.description}
              </Text>
              {hall.signatureSound && (
                <View style={[styles.pill, { backgroundColor: t.colors.warning + '20' }]}>
                  <Ionicons name="volume-high" size={14} color={t.colors.warning} />
                  <Text style={[styles.pillText, { color: t.colors.warning }]} numberOfLines={1}>
                    {hall.signatureSound}
                  </Text>
                </View>
              )}
            </Pressable>
            <View style={styles.releaseActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: t.colors.primary + '18', opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => openHallMap(hall)}
                accessibilityRole="button"
                accessibilityLabel={`Open map for ${hall.name}`}
              >
                <Ionicons name="pin" size={14} color={t.colors.primary} />
                <Text style={[styles.pillText, { color: t.colors.primary }]}>Open map</Text>
              </Pressable>
              <TouchableOpacity onPress={() => navigation.navigate('ConcertHallDetail', { hallId: hall.id })}>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  releaseCard: {
    padding: 14,
    borderRadius: 14,
  },
  cardPressArea: {
    flex: 1,
  },
  releaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  releaseDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  releaseTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  releaseArtist: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  releaseDescription: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  releaseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  hallCard: {
    padding: 14,
  },
  hallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hallName: {
    fontSize: 16,
    fontWeight: '700',
  },
  hallLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  hallDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
