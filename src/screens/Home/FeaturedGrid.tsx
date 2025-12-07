import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../context/ThemeContext';
import { useCardStyle } from '../../hooks/useCardStyle';
import { spacing } from '../../theme';
import { RootStackParamList, UserProgress, WeeklyAlbum, MonthlySpotlight, ListenerLevel } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeaturedGridProps {
  progress: UserProgress | null;
  weeklyAlbum: WeeklyAlbum;
  monthlySpotlight: MonthlySpotlight;
}

const levelLabel = (level?: ListenerLevel) => {
  if (!level) return null;
  if (level === 'beginner') return 'Beginner friendly';
  if (level === 'intermediate') return 'Intermediate';
  return 'Advanced';
};

export function FeaturedGrid({ progress, weeklyAlbum, monthlySpotlight }: FeaturedGridProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme: t } = useTheme();
  const { cardStyle } = useCardStyle();

  const kickstartProgress = progress?.kickstartDay || 0;

  return (
    <View style={styles.featuredGrid}>
      {/* 5-Day Kickstart */}
      <TouchableOpacity
        style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.primary }]}
        onPress={() => navigation.navigate('Kickstart')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={progress?.kickstartCompleted ? '5-Day Kickstart, Completed' : `5-Day Kickstart, Day ${kickstartProgress} of 5`}
        accessibilityHint="Double tap to open kickstart course"
      >
        <View style={[styles.featuredIcon, { backgroundColor: t.colors.primary + '20' }]}>
          <Ionicons name="rocket" size={28} color={t.colors.primary} />
        </View>
        <Text style={[styles.featuredLabel, { color: t.colors.primary }]}>5-Day Kickstart</Text>
        {progress?.kickstartCompleted ? (
          <>
            <Text style={[styles.featuredTitle, { color: t.colors.text }]}>Completed! 🎉</Text>
            <Text style={[styles.featuredSub, { color: t.colors.textMuted }]}>Tap to review</Text>
          </>
        ) : (
          <>
            <Text style={[styles.featuredTitle, { color: t.colors.text }]}>
              {kickstartProgress === 0 ? 'Start Now' : `Day ${kickstartProgress + 1}`}
            </Text>
            <View style={styles.progressDots}>
              {[0, 1, 2, 3, 4].map((day) => (
                <View
                  key={day}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: day < kickstartProgress
                        ? t.colors.success
                        : day === kickstartProgress
                        ? t.colors.primary
                        : t.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Weekly Album */}
      <TouchableOpacity
        style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.secondary }]}
        onPress={() => navigation.navigate('WeeklyAlbum')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Weekly Pick: ${weeklyAlbum.title} by ${weeklyAlbum.artist}`}
        accessibilityHint="Double tap to view album details"
      >
        <View style={[styles.featuredIcon, { backgroundColor: t.colors.secondary + '20' }]}>
          <Ionicons name="disc" size={28} color={t.colors.secondary} />
        </View>
        <Text style={[styles.featuredLabel, { color: t.colors.secondary }]}>Weekly Pick</Text>
        <Text style={[styles.featuredTitle, { color: t.colors.text }]} numberOfLines={1}>
          {weeklyAlbum.title}
        </Text>
        <View style={styles.featuredSubRow}>
          <Text style={[styles.featuredSub, { color: t.colors.textMuted }]} numberOfLines={1}>
            {weeklyAlbum.artist}
          </Text>
          {weeklyAlbum.listenerLevel && (
            <View style={[styles.levelPill, { backgroundColor: t.colors.secondary + '20' }]}>
              <Ionicons name="person" size={12} color={t.colors.secondary} />
              <Text style={[styles.levelPillText, { color: t.colors.secondary }]} numberOfLines={1}>
                {levelLabel(weeklyAlbum.listenerLevel)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Monthly Spotlight */}
      <TouchableOpacity
        style={[styles.featuredCard, cardStyle, { borderTopWidth: 3, borderTopColor: t.colors.warning }]}
        onPress={() => navigation.navigate('MonthlySpotlight')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Monthly Spotlight: ${monthlySpotlight.title}`}
        accessibilityHint="Double tap to view spotlight details"
      >
        <View style={[styles.featuredIcon, { backgroundColor: t.colors.warning + '20' }]}>
          <Ionicons name="star" size={28} color={t.colors.warning} />
        </View>
        <Text style={[styles.featuredLabel, { color: t.colors.warning }]}>This Month</Text>
        <Text style={[styles.featuredTitle, { color: t.colors.text }]} numberOfLines={1}>
          {monthlySpotlight.title}
        </Text>
        <Text style={[styles.featuredSub, { color: t.colors.textMuted }]} numberOfLines={1}>
          {monthlySpotlight.subtitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  featuredGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  featuredCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featuredLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  featuredSub: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  featuredSubRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 8,
    fontWeight: '600',
  },
});
