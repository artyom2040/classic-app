import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { getLongDefinition, getShortDefinition } from '../utils/terms';

import glossaryData from '../data/glossary.json';

// Local type matching raw JSON structure
type GlossaryTerm = typeof glossaryData.terms[number];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  'All',
  'Tempo',
  'Form',
  'Harmony',
  'Technique',
  'Dynamics',
  'Theory',
  'Genre',
  'Voice',
  'Period',
  'Style',
] as const;

// Static category colors - moved outside component to prevent recreation
const CATEGORY_COLORS: Record<string, string> = {
  Tempo: '#E74C3C',
  Form: '#9B59B6',
  Harmony: '#3498DB',
  Technique: '#1ABC9C',
  Dynamics: '#F39C12',
  Genre: '#E67E22',
  Theory: '#2ECC71',
  Period: '#8E44AD',
  Style: '#C0392B',
};


export default function GlossaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Merge static colors with theme-dependent ones
  const getCategoryColor = useCallback((category: string): string => {
    if (category === 'Voice') return t.colors.primary;
    return CATEGORY_COLORS[category] || t.colors.textMuted;
  }, [t.colors.primary, t.colors.textMuted]);

  const terms = glossaryData.terms;

  const filteredTerms = useMemo(() => {
    return terms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getLongDefinition(term).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, terms]);

  const renderTerm = useCallback(({ item }: { item: GlossaryTerm }) => {
    const categoryColor = getCategoryColor(item.category);
    const summary = getShortDefinition(item);

    return (
      <TouchableOpacity
        style={[styles.termCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
        onPress={() => navigation.navigate('TermDetail', { termId: String(item.id) })}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.term}, ${item.category}`}
        accessibilityHint="Double tap to view term details"
      >
        <View style={styles.termHeader}>
          <Text style={[styles.termTitle, { color: t.colors.text }]}>{item.term}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category}
            </Text>
          </View>
        </View>
        <Text style={[styles.termDefinition, { color: t.colors.textSecondary }]} numberOfLines={2}>
          {summary}
        </Text>
      </TouchableOpacity>
    );
  }, [t, isBrutal, getCategoryColor, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Ionicons name="search" size={20} color={t.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: t.colors.text }]}
          placeholder="Search 150 musical terms..."
          placeholderTextColor={t.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={t.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === item ? t.colors.primary : t.colors.surface },
              ]}
              onPress={() => setSelectedCategory(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === item }}
              accessibilityLabel={`Filter by ${item}`}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === item ? t.colors.text : t.colors.textSecondary },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      <Text style={[styles.resultsCount, { color: t.colors.textMuted }]}>
        {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </Text>

      {/* Terms List */}
      <FlatList
        data={filteredTerms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTerm}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={t.colors.textMuted} />
            <Text style={[styles.emptyText, { color: t.colors.text }]}>No terms found</Text>
            <Text style={[styles.emptySubtext, { color: t.colors.textMuted }]}>Try a different search or category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, margin: spacing.md, paddingHorizontal: spacing.md, height: 48 },
  searchInput: { flex: 1, fontSize: fontSize.md, marginLeft: spacing.sm },
  categoryContainer: { marginBottom: spacing.sm },
  categoryList: { paddingHorizontal: spacing.md, gap: spacing.xs },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginRight: spacing.xs },
  categoryChipText: { fontSize: fontSize.sm, fontWeight: '500' },
  resultsCount: { fontSize: fontSize.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  listContent: { padding: spacing.md, paddingTop: 0 },
  termCard: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  termHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  termTitle: { fontSize: fontSize.lg, fontWeight: '600', flex: 1 },
  categoryBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  categoryText: { fontSize: fontSize.xs, fontWeight: '600' },
  termDefinition: { fontSize: fontSize.sm, lineHeight: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, marginTop: spacing.xs },
});
