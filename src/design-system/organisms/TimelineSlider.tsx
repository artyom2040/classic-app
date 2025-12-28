/**
 * Timeline Slider Component
 * Premium horizontal scrolling timeline with era markers
 * Modern design with smooth gradients and better visual hierarchy
 */

import React from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { H3, Caption, Label, LabelSmall } from '../atoms/Typography';
import { hapticSelection } from '../../utils/haptics';

export interface Era {
  id: string;
  name: string;
  period: string;
  color: string;
  image?: ImageSourcePropType;
  composerCount?: number;
}

interface TimelineSliderProps {
  eras: Era[];
  selectedId?: string;
  onSelectEra: (era: Era) => void;
}

export function TimelineSlider({
  eras,
  selectedId,
  onSelectEra,
}: TimelineSliderProps) {
  const { theme, isDark } = useTheme();

  const handleSelect = (era: Era) => {
    hapticSelection();
    onSelectEra(era);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <H3 color={theme.colors.text}>Musical Timeline</H3>
        <Caption color={theme.colors.textMuted}>
          Explore by era
        </Caption>
      </View>

      {/* Horizontal Timeline */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={214} // card width (200) + gap (14)
        decelerationRate="fast"
      >
        {eras.map((era, index) => {
          const isSelected = era.id === selectedId;

          return (
            <TouchableOpacity
              key={era.id}
              onPress={() => handleSelect(era)}
              activeOpacity={0.85}
              style={[
                styles.eraCard,
                {
                  backgroundColor: isDark ? theme.colors.surface : '#fff',
                  borderColor: isSelected ? era.color : theme.colors.border,
                  boxShadow: isSelected
                    ? `0px 8px 24px ${era.color}40`
                    : isDark
                      ? '0px 4px 16px rgba(0, 0, 0, 0.3)'
                      : '0px 4px 16px rgba(0, 0, 0, 0.08)',
                },
                isSelected && styles.eraCardSelected,
              ]}
            >
              {/* Image section with smooth gradient overlay */}
              <View style={styles.imageContainer}>
                {era.image ? (
                  <ImageBackground
                    source={era.image}
                    style={styles.eraImage}
                    imageStyle={styles.eraImageStyle}
                    resizeMode="cover"
                  >
                    {/* Subtle bottom gradient for text legibility */}
                    <LinearGradient
                      colors={[
                        'transparent',
                        'rgba(0,0,0,0.4)',
                        'rgba(0,0,0,0.6)',
                      ]}
                      locations={[0.3, 0.7, 1]}
                      style={styles.imageGradient}
                    />
                  </ImageBackground>
                ) : (
                  <LinearGradient
                    colors={[`${era.color}60`, `${era.color}90`]}
                    style={styles.eraImage}
                  />
                )}

                {/* Period badge overlaid on image */}
                <View style={[styles.periodBadge, { backgroundColor: era.color }]}>
                  <LabelSmall color="#FFFFFF" weight="bold">{era.period}</LabelSmall>
                </View>
              </View>

              {/* Content section below image */}
              <View style={styles.eraContent}>
                <Label
                  color={theme.colors.text}
                  weight="bold"
                  numberOfLines={1}
                  style={styles.eraName}
                >
                  {era.name}
                </Label>
                {era.composerCount !== undefined && (
                  <Caption color={theme.colors.textMuted}>
                    {era.composerCount} composer{era.composerCount !== 1 ? 's' : ''}
                  </Caption>
                )}
              </View>

              {/* Accent bar at bottom */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: era.color }
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 12, // Space for shadow
    gap: 14,
  },
  eraCard: {
    width: 200,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  eraCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  imageContainer: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  eraImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  eraImageStyle: {
    // No border radius - let container handle it
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  periodBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  eraContent: {
    padding: 14,
    paddingBottom: 18,
    gap: 4,
  },
  eraName: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});