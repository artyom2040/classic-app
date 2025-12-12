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
import { CategoryChips, ExpandableAccordion } from '../components/stitch';
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
  const isStitch = themeName === 'stitch';
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
    const fullDefinition = getLongDefinition(item);

    // Stitch: Expandable accordion cards
    if (isStitch) {
      return (
        <ExpandableAccordion
          title={item.term}
          subtitle={summary}
          badge={item.category}
          badgeColor={categoryColor}
          onPress={() => navigation.navigate('TermDetail', { termId: String(item.id) })}
        >
          <Text style={[styles.accordionDefinition, { color: t.colors.textSecondary }]}>
            {fullDefinition}
          </Text>
          {item.example && (
            <View style={[styles.exampleBox, { backgroundColor: t.colors.surfaceLight }]}>
              <Text style={[styles.exampleLabel, { color: t.colors.textMuted }]}>Example:</Text>
              <Text style={[styles.exampleText, { color: t.colors.text }]}>{item.example}</Text>
            </View>
          )}
        </ExpandableAccordion>
      );
    }

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
  }, [t, isBrutal, isStitch, getCategoryColor, navigation]);

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

      {/* Stitch: Piano Keys Visual + Featured Term */}
      {isStitch && terms.length > 0 && (
        <View style={styles.stitchGlossaryHero}>
          {/* Piano Keys Visual */}
          <View style={styles.pianoKeysContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((key, index) => {
              const isBlackKey = [1, 3, 6, 8, 10].includes(index % 12);
              if (isBlackKey) {
                return (
                  <View key={key} style={[styles.pianoBlackKey, { backgroundColor: '#1a1525' }]} />
                );
              }
              return (
                <View key={key} style={[styles.pianoWhiteKey, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              );
            })}
          </View>

          {/* Featured Term Card */}
          <TouchableOpacity
            style={[styles.featuredTermHero, { backgroundColor: t.colors.surface }]}
            onPress={() => navigation.navigate('TermDetail', { termId: String(terms[0].id) })}
            activeOpacity={0.8}
          >
            <View style={[styles.featuredBadge, { backgroundColor: t.colors.primary + '30' }]}>
              <Text style={[styles.featuredBadgeText, { color: t.colors.primary }]}>TERM OF THE DAY</Text>
            </View>
            <Text style={[styles.featuredTitle, { color: t.colors.text }]}>{terms[0].term}</Text>
            <Text style={[styles.featuredDescription, { color: t.colors.textSecondary }]} numberOfLines={2}>
              {getShortDefinition(terms[0])}
            </Text>
            <View style={styles.featuredLink}>
              <Text style={[styles.featuredLinkText, { color: t.colors.primary }]}>Read Definition</Text>
              <Ionicons name="chevron-forward" size={16} color={t.colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter */}
      {isStitch ? (
        <CategoryChips
          items={CATEGORIES.filter(c => c !== 'All').map(c => ({ id: c, label: c }))}
          selectedId={selectedCategory === 'All' ? 'all' : selectedCategory}
          onSelect={(id) => setSelectedCategory(id === 'all' ? 'All' : id)}
          style={{ marginVertical: spacing.sm }}
        />
      ) : (
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
      )}

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
  // Accordion styles (Stitch)
  accordionDefinition: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  exampleBox: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  exampleLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  // Featured Term Hero (Stitch)
  featuredTermHero: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  featuredTitle: {
    fontSize: 26,
    fontWeight: '700',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  featuredDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  featuredLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredLinkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  // Piano Keys Visual
  stitchGlossaryHero: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  pianoKeysContainer: {
    flexDirection: 'row',
    height: 60,
    marginBottom: -30,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    opacity: 0.6,
  },
  pianoWhiteKey: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pianoBlackKey: {
    width: 18,
    height: 36,
    marginHorizontal: -9,
    zIndex: 1,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
