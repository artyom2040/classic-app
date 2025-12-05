import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, UserProgress } from '../types';
import { getProgress, saveProgress } from '../utils/storage';

import kickstartData from '../data/kickstart.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function KickstartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    loadProgress();
  }, []);

  const handleStartKickstart = async () => {
    await saveProgress({ firstLaunch: false });
    navigation.navigate('KickstartDay', { day: 1 });
  };

  const handleSkip = async () => {
    // Just mark first launch done, but DON'T mark kickstart completed
    // So user can still see and access the kickstart later
    await saveProgress({ firstLaunch: false });
    navigation.navigate('MainTabs');
  };

  const currentDay = (progress?.kickstartDay || 0) + 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: t.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎼</Text>
          <Text style={[styles.title, { color: t.colors.text }]}>5-Day Kickstart</Text>
          <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
            Your fast-track to understanding classical music. 10-15 minutes per day.
          </Text>
        </View>

        <View style={styles.daysContainer}>
          {kickstartData.days.map((day, index) => {
            const isCompleted = (progress?.kickstartDay || 0) >= day.day;
            const isAvailable = day.day <= currentDay;
            const isCurrent = day.day === currentDay;

            return (
              <TouchableOpacity
                key={day.day}
                style={[
                  styles.dayCard,
                  { backgroundColor: t.colors.surface },
                  isCompleted && { backgroundColor: t.colors.success + '20', borderColor: t.colors.success, borderWidth: 1 },
                  isCurrent && { backgroundColor: t.colors.primary + '20', borderColor: t.colors.primary, borderWidth: 1 },
                  !isAvailable && styles.dayCardLocked,
                  isBrutal && { borderRadius: 0, borderWidth: 2, borderColor: t.colors.border },
                ]}
                onPress={() => isAvailable && navigation.navigate('KickstartDay', { day: day.day })}
                disabled={!isAvailable}
              >
                <View style={[
                  styles.dayNumber, 
                  { backgroundColor: t.colors.surfaceLight },
                  isCompleted && { backgroundColor: t.colors.success }, 
                  isCurrent && { backgroundColor: t.colors.primary }
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.dayNumberText, { color: t.colors.textSecondary }, isCurrent && { color: '#FFFFFF' }]}>{day.day}</Text>
                  )}
                </View>
                <View style={styles.dayContent}>
                  <Text style={[styles.dayTitle, { color: t.colors.text }, !isAvailable && { color: t.colors.textMuted }]}>{day.title}</Text>
                  <Text style={[styles.daySubtitle, { color: t.colors.textSecondary }, !isAvailable && { color: t.colors.textMuted }]}>{day.subtitle}</Text>
                </View>
                {!isAvailable && <Ionicons name="lock-closed" size={18} color={t.colors.textMuted} />}
                {isAvailable && !isCompleted && <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {progress?.kickstartCompleted && (
          <View style={[styles.completionCard, { backgroundColor: t.colors.secondary + '20' }]}>
            <Ionicons name="trophy" size={32} color={t.colors.secondary} />
            <Text style={[styles.completionTitle, { color: t.colors.text }]}>Kickstart Complete!</Text>
            <Text style={[styles.completionText, { color: t.colors.textSecondary }]}>{kickstartData.completionMessage.message}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: t.colors.background, borderTopColor: t.colors.surface }]}>
        {currentDay === 1 && !progress?.kickstartCompleted ? (
          <>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: t.colors.primary }]} onPress={handleStartKickstart}>
              <Text style={styles.primaryButtonText}>Start Your Journey</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={[styles.skipButtonText, { color: t.colors.textMuted }]}>Skip for now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: t.colors.surface }]} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={[styles.secondaryButtonText, { color: t.colors.text }]}>Go to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 150 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  emoji: { fontSize: 60, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  daysContainer: { gap: spacing.sm },
  dayCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md },
  dayCardLocked: { opacity: 0.5 },
  dayNumber: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  dayNumberText: { fontSize: fontSize.lg, fontWeight: 'bold' },
  dayContent: { flex: 1 },
  dayTitle: { fontSize: fontSize.md, fontWeight: '600' },
  daySubtitle: { fontSize: fontSize.sm, marginTop: 2 },
  completionCard: { borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  completionTitle: { fontSize: fontSize.xl, fontWeight: 'bold', marginTop: spacing.sm },
  completionText: { fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, borderTopWidth: 1 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  primaryButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: '#FFFFFF' },
  skipButton: { alignItems: 'center', padding: spacing.md },
  skipButtonText: { fontSize: fontSize.md },
  secondaryButton: { alignItems: 'center', borderRadius: borderRadius.lg, padding: spacing.md },
  secondaryButtonText: { fontSize: fontSize.lg, fontWeight: '600' },
});
