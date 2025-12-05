import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme, ThemeName } from '../theme/themes';
import { useTheme } from '../context/ThemeContext';

interface ThemeCardProps {
  themeOption: Theme;
  isSelected: boolean;
  onSelect: (name: ThemeName) => void;
}

export default function ThemeCard({ themeOption, isSelected, onSelect }: ThemeCardProps) {
  const { theme } = useTheme();
  const t = themeOption;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={() => onSelect(t.name)}
      activeOpacity={0.8}
    >
      {/* Preview colors */}
      <View style={styles.previewRow}>
        <View style={[styles.colorDot, { backgroundColor: t.colors.background }]} />
        <View style={[styles.colorDot, { backgroundColor: t.colors.surface }]} />
        <View style={[styles.colorDot, { backgroundColor: t.colors.primary }]} />
        <View style={[styles.colorDot, { backgroundColor: t.colors.secondary }]} />
        <View style={[styles.colorDot, { backgroundColor: t.colors.text }]} />
      </View>

      {/* Theme info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{t.displayName}</Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
          )}
        </View>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {t.description}
        </Text>
      </View>

      {/* Mini preview card */}
      {t.cardStyle === 'glass' ? (
        // Special glass preview with gradient background
        <View
          style={[
            styles.miniPreview,
            {
              borderRadius: t.borderRadius.md,
              overflow: 'hidden',
            },
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glassMiniCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
            )}
            <View style={styles.glassCardContent}>
              <View style={[styles.miniAccent, { backgroundColor: t.colors.primary }]} />
              <View style={[styles.miniLine, { backgroundColor: t.colors.text, opacity: 0.8 }]} />
              <View style={[styles.miniLine, { backgroundColor: t.colors.textSecondary, width: '60%' }]} />
            </View>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.miniPreview,
            {
              backgroundColor: t.colors.background,
              borderRadius: t.borderRadius.md,
              ...(t.cardStyle === 'brutal' ? { borderWidth: 2, borderColor: t.colors.border } : {}),
            },
          ]}
        >
          <View
            style={[
              styles.miniCard,
              {
                backgroundColor: t.colors.surface,
                borderRadius: t.borderRadius.sm,
                ...(t.cardStyle === 'brutal'
                  ? { borderWidth: 2, borderColor: t.colors.border }
                  : {}),
              },
            ]}
          >
            <View style={[styles.miniAccent, { backgroundColor: t.colors.primary }]} />
            <View style={[styles.miniLine, { backgroundColor: t.colors.text, opacity: 0.8 }]} />
            <View style={[styles.miniLine, { backgroundColor: t.colors.textSecondary, width: '60%' }]} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  info: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  miniPreview: {
    padding: 12,
    marginTop: 4,
  },
  miniCard: {
    padding: 10,
  },
  miniAccent: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  miniLine: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    width: '80%',
  },
  // Glass theme styles
  glassMiniCard: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  glassCardContent: {
    zIndex: 1,
  },
});
