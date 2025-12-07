import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StackScreen = 'Composers' | 'MonthlySpotlight' | 'NewReleases' | 'ConcertHalls' | 'Quiz' | 'Badges';
type TabScreen = 'Timeline' | 'Glossary';
const { width } = Dimensions.get('window');

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
  const isBrutal = themeName === 'neobrutalist';

  const exploreItems: ExploreItem[] = [
    { icon: 'people', label: 'Composers', sub: `${composersCount} Profiles`, color: t.colors.primary, screen: 'Composers' },
    { icon: 'time', label: 'Timeline', sub: 'Eras & History', color: '#6B8E23', screen: 'Timeline' },
    { icon: 'book', label: 'Glossary', sub: `${termsCount} Terms`, color: t.colors.secondary, screen: 'Glossary' },
    { icon: 'albums', label: 'Spotlight', sub: 'Monthly Feature', color: t.colors.warning, screen: 'MonthlySpotlight' },
    { icon: 'musical-notes', label: 'New Releases', sub: 'Latest recordings', color: t.colors.secondary, screen: 'NewReleases' },
    { icon: 'business', label: 'Concert Halls', sub: 'World venues', color: t.colors.warning, screen: 'ConcertHalls' },
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

  return (
    <View style={styles.exploreGrid}>
      {exploreItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.exploreCard,
            {
              backgroundColor: item.color + '15',
              borderRadius: t.borderRadius.lg,
              ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : {}),
            },
          ]}
          onPress={() => handlePress(item.screen)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}. ${item.sub}`}
          accessibilityHint={`Navigate to ${item.label}`}
        >
          <Ionicons name={item.icon} size={28} color={item.color} />
          <Text style={[styles.exploreLabel, { color: t.colors.text }]}>{item.label}</Text>
          <Text style={[styles.exploreSub, { color: t.colors.textMuted }]}>{item.sub}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  exploreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  exploreCard: {
    width: (width - 32 - 10) / 2,
    padding: 16,
    alignItems: 'center',
  },
  exploreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  exploreSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
