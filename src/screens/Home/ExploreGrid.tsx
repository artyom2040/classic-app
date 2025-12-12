import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { HoverCard } from '../../components/HoverCard';
import { RootStackParamList } from '../../types';
import { spacing, fontSize, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StackScreen = 'Composers' | 'MonthlySpotlight' | 'Quiz' | 'Badges';
type TabScreen = 'Timeline' | 'Glossary';

interface ExploreItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  color: string;
  screen: StackScreen | TabScreen;
}

interface ExploreGridProps {
  composersCount: number;
  termsCount: number;
}

export function ExploreGrid({ composersCount, termsCount }: ExploreGridProps) {
  const navigation = useNavigation<NavigationProp>();
  const { theme: t, themeName } = useTheme();
  const { gridColumns, cardMinWidth } = useResponsive();
  const { width } = useWindowDimensions();
  const isBrutal = themeName === 'neobrutalist';

  const exploreItems: ExploreItem[] = [
    { icon: 'people', label: 'Composers', sub: `${composersCount} Profiles`, color: t.colors.primary, screen: 'Composers' },
    { icon: 'time', label: 'Timeline', sub: 'Eras & History', color: '#6B8E23', screen: 'Timeline' },
    { icon: 'book', label: 'Glossary', sub: `${termsCount} Terms`, color: t.colors.secondary, screen: 'Glossary' },
    { icon: 'albums', label: 'Spotlight', sub: 'Monthly Feature', color: t.colors.warning, screen: 'MonthlySpotlight' },
    { icon: 'help-circle', label: 'Daily Quiz', sub: '5 Questions', color: t.colors.error, screen: 'Quiz' },
    { icon: 'ribbon', label: 'Badges', sub: 'Achievements', color: t.colors.success, screen: 'Badges' },
  ];

  const handlePress = (screen: ExploreItem['screen']) => {
    // Tab screens need special navigation
    if (screen === 'Timeline' || screen === 'Glossary') {
      navigation.navigate('MainTabs', { screen } as any);
    } else {
      navigation.navigate(screen);
    }
  };

  // Responsive card sizing
  const gap = spacing.sm;
  const padding = spacing.md * 2;
  const availableWidth = width - padding;
  const columns = gridColumns;
  const cardWidth = Math.max(
    cardMinWidth,
    (availableWidth - (gap * (columns - 1))) / columns
  );

  return (
    <View style={styles.exploreGrid}>
      {exploreItems.map((item) => (
        <HoverCard
          key={item.label}
          style={{
            ...styles.exploreCard,
            width: cardWidth,
            backgroundColor: item.color + '15',
            borderRadius: borderRadius.lg,
            ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : {}),
          }}
          onPress={() => handlePress(item.screen)}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}. ${item.sub}`}
          accessibilityHint={`Navigate to ${item.label}`}
        >
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={28} color={item.color} />
          </View>
          <Text style={[styles.exploreLabel, { color: t.colors.text }]}>{item.label}</Text>
          <Text style={[styles.exploreSub, { color: t.colors.textMuted }]}>{item.sub}</Text>
        </HoverCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  exploreCard: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 120,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  exploreLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  exploreSub: {
    fontSize: fontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },
});
