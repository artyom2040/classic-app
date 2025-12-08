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
import { ScreenContainer, ScreenHeader, ListCard } from '../components/ui';
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
      <ListCard
        title={item.term}
        subtitle={summary}
        onPress={() => navigation.navigate('TermDetail', { termId: String(item.id) })}
        accessibilityLabel={`${item.term}, ${item.category}`}
        rightContent={
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category}
            </Text>
          </View>
        }
        showChevron={false}
      />
    );
  }, [t, isBrutal, getCategoryColor, navigation]);

  return (
    <ScreenContainer padded={false}>
      <ScreenHeader title="Glossary" subtitle={`${filteredTerms.length} musical terms`} />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}>
        <Ionicons name="search" size={20} color={t.colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: t.colors.text }]}
          placeholder="Search terms..."
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
                  { color: selectedCategory === item ? '#fff' : t.colors.textSecondary },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    marginLeft: spacing.sm
  },
  categoryContainer: {
    marginVertical: spacing.sm
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: '500'
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.md
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs
  },
});
