/**
 * KnowledgeBite - Knowledge/Term of the Day Card
 * Split layout with visual on left, content on right (Stitch design)
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface KnowledgeBiteProps {
  label: string; // e.g., "TERM OF THE DAY"
  title: string;
  description: string;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
  showArchiveLink?: boolean;
  onArchivePress?: () => void;
}

export function KnowledgeBite({
  label,
  title,
  description,
  imageSource,
  onPress,
  showArchiveLink = true,
  onArchivePress,
}: KnowledgeBiteProps) {
  const { theme, themeName } = useTheme();
  const t = theme;
  const isStitch = themeName === 'stitch';

  if (!isStitch) return null;

  return (
    <View>
      {/* Header with title and archive link */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
          Knowledge Bite
        </Text>
        {showArchiveLink && (
          <TouchableOpacity onPress={onArchivePress}>
            <Text style={[styles.archiveLink, { color: t.colors.primary }]}>
              View Archive
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Knowledge Bite Card */}
      <TouchableOpacity
        style={[styles.card, { borderColor: t.colors.borderLight }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Left: Visual (1/3 width) */}
        <View style={styles.visual}>
          {imageSource ? (
            <ImageBackground
              source={imageSource}
              style={styles.imageBackground}
              imageStyle={styles.image}
              resizeMode="cover"
            >
              <LinearGradient
                colors={[
                  'rgba(84, 23, 207, 0.1)',
                  'rgba(84, 23, 207, 0.4)',
                  'rgba(38, 30, 53, 0.8)',
                ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.overlay}
              >
                <Ionicons
                  name="musical-notes"
                  size={28}
                  color="rgba(255,255,255,0.9)"
                />
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[
                'rgba(84, 23, 207, 0.2)',
                'rgba(84, 23, 207, 0.1)',
                'rgba(38, 30, 53, 0.6)',
              ]}
              style={styles.overlay}
            >
              <Ionicons
                name="musical-notes"
                size={28}
                color="rgba(255,255,255,0.9)"
              />
            </LinearGradient>
          )}
        </View>

        {/* Right: Content (2/3 width) */}
        <View style={styles.content}>
          <Text style={[styles.label, { color: t.colors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.title, { color: t.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.link}>
            <Text style={[styles.linkText, { color: t.colors.primary }]}>
              Reveal & Listen
            </Text>
            <Ionicons name="arrow-forward" size={14} color={t.colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  archiveLink: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#261e35', // Slightly lighter than base surface
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  visual: {
    width: '33%',
    minHeight: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
  },
  image: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
