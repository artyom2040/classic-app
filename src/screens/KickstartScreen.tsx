import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, UserProgress } from '../types';
import { getProgress, saveProgress } from '../utils/storage';

import kickstartData from '../data/kickstart.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function KickstartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
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
    await saveProgress({ firstLaunch: false, kickstartCompleted: true });
    navigation.navigate('MainTabs');
  };

  const currentDay = (progress?.kickstartDay || 0) + 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎼</Text>
          <Text style={styles.title}>5-Day Kickstart</Text>
          <Text style={styles.subtitle}>
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
                  isCompleted && styles.dayCardCompleted,
                  isCurrent && styles.dayCardCurrent,
                  !isAvailable && styles.dayCardLocked,
                ]}
                onPress={() => isAvailable && navigation.navigate('KickstartDay', { day: day.day })}
                disabled={!isAvailable}
              >
                <View style={[styles.dayNumber, isCompleted && styles.dayNumberCompleted, isCurrent && styles.dayNumberCurrent]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={20} color={colors.text} />
                  ) : (
                    <Text style={[styles.dayNumberText, isCurrent && styles.dayNumberTextCurrent]}>{day.day}</Text>
                  )}
                </View>
                <View style={styles.dayContent}>
                  <Text style={[styles.dayTitle, !isAvailable && styles.textLocked]}>{day.title}</Text>
                  <Text style={[styles.daySubtitle, !isAvailable && styles.textLocked]}>{day.subtitle}</Text>
                </View>
                {!isAvailable && <Ionicons name="lock-closed" size={18} color={colors.textMuted} />}
                {isAvailable && !isCompleted && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {progress?.kickstartCompleted && (
          <View style={styles.completionCard}>
            <Ionicons name="trophy" size={32} color={colors.secondary} />
            <Text style={styles.completionTitle}>Kickstart Complete!</Text>
            <Text style={styles.completionText}>{kickstartData.completionMessage.message}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {currentDay === 1 && !progress?.kickstartCompleted ? (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartKickstart}>
              <Text style={styles.primaryButtonText}>Start Your Journey</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 150 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  emoji: { fontSize: 60, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  daysContainer: { gap: spacing.sm },
  dayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm },
  dayCardCompleted: { backgroundColor: colors.success + '20', borderColor: colors.success, borderWidth: 1 },
  dayCardCurrent: { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 },
  dayCardLocked: { opacity: 0.5 },
  dayNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  dayNumberCompleted: { backgroundColor: colors.success },
  dayNumberCurrent: { backgroundColor: colors.primary },
  dayNumberText: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textSecondary },
  dayNumberTextCurrent: { color: colors.text },
  dayContent: { flex: 1 },
  dayTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  daySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  textLocked: { color: colors.textMuted },
  completionCard: { backgroundColor: colors.secondary + '20', borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  completionTitle: { fontSize: fontSize.xl, fontWeight: 'bold', color: colors.text, marginTop: spacing.sm },
  completionText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.surface },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  primaryButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  skipButton: { alignItems: 'center', padding: spacing.md },
  skipButtonText: { fontSize: fontSize.md, color: colors.textMuted },
  secondaryButton: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md },
  secondaryButtonText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
});
