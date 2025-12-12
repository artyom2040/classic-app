import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, KickstartDay } from '../types';
import { completeKickstartDay, earnBadge } from '../utils/storage';

import kickstartData from '../data/kickstart.json';

type KickstartDayRouteProp = RouteProp<RootStackParamList, 'KickstartDay'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function KickstartDayScreen() {
  const route = useRoute<KickstartDayRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const isStitch = themeName === 'stitch';
  const { day: dayNumber } = route.params;

  const dayData = kickstartData.days.find(d => d.day === dayNumber) as KickstartDay | undefined;

  if (!dayData) {
    return <View style={[styles.container, { backgroundColor: t.colors.background }]}><Text style={[styles.errorText, { color: t.colors.error }]}>Day not found</Text></View>;
  }

  const handleComplete = async () => {
    await completeKickstartDay(dayNumber);
    if (dayData.badge) await earnBadge(dayData.badge.id);

    if (dayNumber < 5) {
      navigation.navigate('KickstartDay', { day: dayNumber + 1 });
    } else {
      navigation.navigate('Kickstart');
    }
  };

  const openSpotify = () => {
    Linking.openURL(`https://open.spotify.com/search/${encodeURIComponent(dayData.content.listenToday.spotifySearch)}`);
  };

  const openYouTube = () => {
    Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(dayData.content.listenToday.youtubeSearch)}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      {/* Stitch: 5-Day Progress Bar */}
      {isStitch && (
        <View style={styles.stitchProgress}>
          {[1, 2, 3, 4, 5].map((d) => (
            <View
              key={d}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: d <= dayNumber ? t.colors.primary : t.colors.surfaceLight,
                  borderColor: d === dayNumber ? t.colors.primary : 'transparent',
                },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.dayLabel, { color: t.colors.primary }]}>
          {isStitch ? `Day ${dayData.day}` : `Day ${dayData.day} of 5`}
        </Text>
        <Text style={[styles.title, { color: t.colors.text }]}>{dayData.title}</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>{dayData.subtitle}</Text>
        <Text style={[styles.duration, { color: t.colors.textMuted }]}>⏱️ {dayData.duration}</Text>
      </View>

      <View style={[styles.introCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.introText, { color: t.colors.text }]}>{dayData.content.introduction}</Text>
      </View>

      <View style={[styles.insightCard, { backgroundColor: t.colors.secondary + '20' }]}>
        <Ionicons name="bulb" size={20} color={t.colors.secondary} />
        <Text style={[styles.insightText, { color: t.colors.text }]}>{dayData.content.keyInsight}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>{dayData.content.mainLesson.title}</Text>
        {dayData.content.mainLesson.points.map((point, idx) => (
          <View key={idx} style={styles.lessonPoint}>
            <View style={[styles.pointNumber, { backgroundColor: t.colors.primary }]}><Text style={styles.pointNumberText}>{idx + 1}</Text></View>
            <View style={styles.pointContent}>
              <Text style={[styles.pointTitle, { color: t.colors.text }]}>{point.title}</Text>
              <Text style={[styles.pointDescription, { color: t.colors.textSecondary }]}>{point.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.listenCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Text style={[styles.listenTitle, { color: t.colors.text }]}>🎧 Today's Listening</Text>
        <Text style={[styles.listenPiece, { color: t.colors.primary }]}>{dayData.content.listenToday.piece}</Text>
        <Text style={[styles.listenDuration, { color: t.colors.textMuted }]}>{dayData.content.listenToday.duration}</Text>
        <Text style={[styles.listenWhy, { color: t.colors.textSecondary }]}>{dayData.content.listenToday.whyThisPiece}</Text>

        <Text style={[styles.whatToListenFor, { color: t.colors.text }]}>What to listen for:</Text>
        {dayData.content.listenToday.whatToListenFor.map((item, idx) => (
          <View key={idx} style={styles.listenForItem}>
            <Ionicons name="ear" size={14} color={t.colors.primary} />
            <Text style={[styles.listenForText, { color: t.colors.textSecondary }]}>{item}</Text>
          </View>
        ))}

        <View style={styles.listenButtons}>
          <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openSpotify}>
            <Ionicons name="play-circle" size={20} color={t.colors.success} />
            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>Spotify</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openYouTube}>
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.termCard, { backgroundColor: t.colors.surfaceLight }]}>
        <Text style={[styles.termLabel, { color: t.colors.textMuted }]}>📚 Term of the Day</Text>
        <Text style={[styles.termTitle, { color: t.colors.text }]}>{dayData.content.termOfTheDay.term}</Text>
        <Text style={[styles.termDefinition, { color: t.colors.textSecondary }]}>{dayData.content.termOfTheDay.definition}</Text>
      </View>

      {dayData.badge && (
        <View style={[styles.badgeCard, { backgroundColor: t.colors.secondary + '20' }]}>
          <Ionicons name="ribbon" size={32} color={t.colors.secondary} />
          <View style={styles.badgeInfo}>
            <Text style={[styles.badgeTitle, { color: t.colors.text }]}>{dayData.badge.name}</Text>
            <Text style={[styles.badgeDescription, { color: t.colors.textSecondary }]}>{dayData.badge.description}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={[styles.completeButton, { backgroundColor: t.colors.primary }]} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>
          {dayNumber < 5 ? 'Complete & Continue' : 'Complete Kickstart!'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { marginBottom: spacing.lg },
  dayLabel: { fontSize: fontSize.sm, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', marginTop: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginTop: 2 },
  duration: { fontSize: fontSize.sm, marginTop: spacing.sm },
  introCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  introText: { fontSize: fontSize.md, lineHeight: 24 },
  insightCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  insightText: { flex: 1, fontSize: fontSize.md, fontWeight: '500', lineHeight: 22 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  lessonPoint: { flexDirection: 'row', marginBottom: spacing.md },
  pointNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  pointNumberText: { fontSize: fontSize.sm, fontWeight: 'bold', color: '#FFFFFF' },
  pointContent: { flex: 1 },
  pointTitle: { fontSize: fontSize.md, fontWeight: '600' },
  pointDescription: { fontSize: fontSize.sm, marginTop: 4, lineHeight: 20 },
  listenCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  listenTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  listenPiece: { fontSize: fontSize.md, fontWeight: '600' },
  listenDuration: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  listenWhy: { fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  whatToListenFor: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  listenForItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs, gap: spacing.xs },
  listenForText: { flex: 1, fontSize: fontSize.sm },
  listenButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  listenButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs },
  listenButtonText: { fontSize: fontSize.md, fontWeight: '500' },
  termCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  termLabel: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  termTitle: { fontSize: fontSize.xl, fontWeight: 'bold', marginBottom: spacing.xs },
  termDefinition: { fontSize: fontSize.md, lineHeight: 22 },
  badgeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.md },
  badgeInfo: { flex: 1 },
  badgeTitle: { fontSize: fontSize.md, fontWeight: '600' },
  badgeDescription: { fontSize: fontSize.sm, marginTop: 2 },
  completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  completeButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: '#FFFFFF' },
  // Stitch styles
  stitchProgress: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  progressSegment: { flex: 1, height: 6, borderRadius: 3, borderWidth: 1 },
  stitchListenCard: { borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stitchPlayButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
});
