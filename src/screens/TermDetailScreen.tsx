import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Term } from '../types';
import { markTermViewed } from '../utils/storage';

import glossaryData from '../data/glossary.json';

type TermDetailRouteProp = RouteProp<RootStackParamList, 'TermDetail'>;


export default function TermDetailScreen() {
  const route = useRoute<TermDetailRouteProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const { termId } = route.params;
  const term = glossaryData.terms.find(item => item.id === termId) as Term | undefined;

  const categoryColors: { [key: string]: string } = {
    Tempo: '#E74C3C', Form: '#9B59B6', Harmony: '#3498DB', Technique: '#1ABC9C',
    Dynamics: '#F39C12', Genre: '#E67E22', Theory: '#2ECC71', default: t.colors.primary,
  };

  useEffect(() => {
    if (termId) markTermViewed(termId);
  }, [termId]);

  if (!term) {
    return <View style={[styles.container, { backgroundColor: t.colors.background }]}><Text style={[styles.errorText, { color: t.colors.error }]}>Term not found</Text></View>;
  }

  const categoryColor = categoryColors[term.category] || categoryColors.default;

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.term, { color: t.colors.text }]}>{term.term}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>{term.category}</Text>
        </View>
      </View>

      <View style={[styles.definitionCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Ionicons name="book-outline" size={20} color={t.colors.primary} />
        <Text style={[styles.definition, { color: t.colors.text }]}>{term.definition}</Text>
      </View>

      {term.example && (
        <View style={[styles.exampleCard, { backgroundColor: t.colors.surfaceLight }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
          <Text style={[styles.exampleLabel, { color: t.colors.textMuted }]}>Example</Text>
          <Text style={[styles.exampleText, { color: t.colors.textSecondary }]}>{term.example}</Text>
          <TouchableOpacity
            style={styles.listenButton}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(term.example)}`)}
          >
            <Ionicons name="play-circle-outline" size={18} color={t.colors.primary} />
            <Text style={[styles.listenButtonText, { color: t.colors.primary }]}>Listen on YouTube</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { marginBottom: spacing.lg },
  term: { fontSize: fontSize.xxxl, fontWeight: 'bold', marginBottom: spacing.sm },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  categoryText: { fontSize: fontSize.sm, fontWeight: '600' },
  definitionCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  definition: { flex: 1, fontSize: fontSize.lg, lineHeight: 28 },
  exampleCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  exampleLabel: { fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs },
  exampleText: { fontSize: fontSize.md, fontStyle: 'italic', marginBottom: spacing.md },
  listenButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  listenButtonText: { fontSize: fontSize.sm, fontWeight: '500' },
});
