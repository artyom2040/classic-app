import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, KickstartDay } from '../types';
import { completeKickstartDay, earnBadge } from '../utils/storage';

import kickstartData from '../data/kickstart.json';

type KickstartDayRouteProp = RouteProp<RootStackParamList, 'KickstartDay'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function KickstartDayScreen() {
  const route = useRoute<KickstartDayRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { day: dayNumber } = route.params;
  
  const dayData = kickstartData.days.find(d => d.day === dayNumber) as KickstartDay | undefined;

  if (!dayData) {
    return <View style={styles.container}><Text style={styles.errorText}>Day not found</Text></View>;
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.dayLabel}>Day {dayData.day} of 5</Text>
        <Text style={styles.title}>{dayData.title}</Text>
        <Text style={styles.subtitle}>{dayData.subtitle}</Text>
        <Text style={styles.duration}>⏱️ {dayData.duration}</Text>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introText}>{dayData.content.introduction}</Text>
      </View>

      <View style={styles.insightCard}>
        <Ionicons name="bulb" size={20} color={colors.secondary} />
        <Text style={styles.insightText}>{dayData.content.keyInsight}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{dayData.content.mainLesson.title}</Text>
        {dayData.content.mainLesson.points.map((point, idx) => (
          <View key={idx} style={styles.lessonPoint}>
            <View style={styles.pointNumber}><Text style={styles.pointNumberText}>{idx + 1}</Text></View>
            <View style={styles.pointContent}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointDescription}>{point.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.listenCard}>
        <Text style={styles.listenTitle}>🎧 Today's Listening</Text>
        <Text style={styles.listenPiece}>{dayData.content.listenToday.piece}</Text>
        <Text style={styles.listenDuration}>{dayData.content.listenToday.duration}</Text>
        <Text style={styles.listenWhy}>{dayData.content.listenToday.whyThisPiece}</Text>
        
        <Text style={styles.whatToListenFor}>What to listen for:</Text>
        {dayData.content.listenToday.whatToListenFor.map((item, idx) => (
          <View key={idx} style={styles.listenForItem}>
            <Ionicons name="ear" size={14} color={colors.primary} />
            <Text style={styles.listenForText}>{item}</Text>
          </View>
        ))}
        
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

      <View style={styles.termCard}>
        <Text style={styles.termLabel}>📚 Term of the Day</Text>
        <Text style={styles.termTitle}>{dayData.content.termOfTheDay.term}</Text>
        <Text style={styles.termDefinition}>{dayData.content.termOfTheDay.definition}</Text>
      </View>

      {dayData.badge && (
        <View style={styles.badgeCard}>
          <Ionicons name="ribbon" size={32} color={colors.secondary} />
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeTitle}>{dayData.badge.name}</Text>
            <Text style={styles.badgeDescription}>{dayData.badge.description}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>
          {dayNumber < 5 ? 'Complete & Continue' : 'Complete Kickstart!'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { marginBottom: spacing.lg },
  dayLabel: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.text, marginTop: spacing.xs },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 },
  duration: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm },
  introCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  introText: { fontSize: fontSize.md, color: colors.text, lineHeight: 24 },
  insightCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.secondary + '20', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  insightText: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '500', lineHeight: 22 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  lessonPoint: { flexDirection: 'row', marginBottom: spacing.md },
  pointNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  pointNumberText: { fontSize: fontSize.sm, fontWeight: 'bold', color: colors.text },
  pointContent: { flex: 1 },
  pointTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  pointDescription: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  listenCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  listenTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  listenPiece: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
  listenDuration: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm },
  listenWhy: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  whatToListenFor: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  listenForItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs, gap: spacing.xs },
  listenForText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  listenButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  listenButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs },
  listenButtonText: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
  termCard: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
  termLabel: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.xs },
  termTitle: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.xs },
  termDefinition: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  badgeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary + '20', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.md },
  badgeInfo: { flex: 1 },
  badgeTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  badgeDescription: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  completeButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
});
