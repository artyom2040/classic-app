/**
 * Category Pills Component
 * Horizontal scrolling filter chips
 * Based on stitch/curated_home_screen designs
 */

import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Label } from '../atoms/Typography';
import { hapticSelection } from '../../utils/haptics';

export interface CategoryPill {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export function CategoryPills({
  categories,
  selectedId,
  onSelect,
  style,
}: CategoryPillsProps) {
  const { theme } = useTheme();

  const handleSelect = (id: string) => {
    hapticSelection();
    onSelect(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={style}
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        const pillColor = category.color || theme.colors.primary;

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleSelect(category.id)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected
                  ? pillColor
                  : theme.colors.surfaceLight,
                borderColor: isSelected
                  ? pillColor
                  : theme.colors.border,
              },
            ]}
          >
            {category.icon && (
              <Ionicons
                name={category.icon}
                size={16}
                color={
                  isSelected ? theme.colors.textInverse : theme.colors.text
                }
              />
            )}
            <Label
              color={
                isSelected ? theme.colors.textInverse : theme.colors.text
              }
            >
              {category.label}
            </Label>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
});