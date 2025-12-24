/**
 * Timeline Slider Component
 * Horizontal scrolling timeline with era markers
 * Based on stitch/timeline_explorer designs
 */

import React from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { H3, Caption, Label } from '../atoms/Typography';
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
  const { theme } = useTheme();

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
        snapToInterval={200}
        decelerationRate="fast"
      >
        {eras.map((era, index) => {
          const isSelected = era.id === selectedId;
          
          return (
            <TouchableOpacity
              key={era.id}
              onPress={() => handleSelect(era)}
              activeOpacity={0.9}
              style={[
                styles.eraCard,
                isSelected && styles.eraCardSelected,
              ]}
            >
              {era.image ? (
                <ImageBackground
                  source={era.image}
                  style={styles.eraImage}
                  imageStyle={styles.eraImageStyle}
                >
                  <LinearGradient
                    colors={[
                      'transparent',
                      `${era.color}80`,
                      era.color,
                    ]}
                    style={styles.eraGradient}
                  >
                    <View style={styles.eraContent}>
                      <Label color="#FFFFFF">{era.period}</Label>
                      <H3 color="#FFFFFF" numberOfLines={2}>
                        {era.name}
                      </H3>
                      {era.composerCount !== undefined && (
                        <Caption color="rgba(255,255,255,0.8)">
                          {era.composerCount} composers
                        </Caption>
                      )}
                    </View>
                  </LinearGradient>
                </ImageBackground>
              ) : (
                <LinearGradient
                  colors={[`${era.color}40`, era.color]}
                  style={styles.eraGradient}
                >
                  <View style={styles.eraContent}>
                    <Label color="#FFFFFF">{era.period}</Label>
                    <H3 color="#FFFFFF" numberOfLines={2}>
                      {era.name}
                    </H3>
                    {era.composerCount !== undefined && (
                      <Caption color="rgba(255,255,255,0.8)">
                        {era.composerCount} composers
                      </Caption>
                    )}
                  </View>
                </LinearGradient>
              )}

              {/* Era marker dot */}
              <View
                style={[
                  styles.eraDot,
                  { backgroundColor: era.color },
                  isSelected && styles.eraDotSelected,
                ]}
              />

              {/* Connection line */}
              {index < eras.length - 1 && (
                <View
                  style={[
                    styles.connectionLine,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              )}
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
    gap: 16,
  },
  eraCard: {
    width: 180,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  eraCardSelected: {
    transform: [{ scale: 1.05 }],
  },
  eraImage: {
    flex: 1,
    width: '100%',
  },
  eraImageStyle: {
    borderRadius: 16,
  },
  eraGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  eraContent: {
    gap: 4,
  },
  eraDot: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  eraDotSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    bottom: -10,
  },
  connectionLine: {
    position: 'absolute',
    bottom: 0,
    left: '100%',
    width: 16,
    height: 2,
  },
});