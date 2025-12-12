import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storageUtils';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { spacing, fontSize, borderRadius } from '../theme';
import { hapticSelection } from '../utils/haptics';
import { SkeletonListItem } from '../components';
import { getLongDefinition } from '../utils/terms';

// Import all data
import composersData from '../data/composers.json';
import glossaryData from '../data/glossary.json';
import formsData from '../data/forms.json';
import periodsData from '../data/periods.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

interface SearchResult {
  id: string | number;
  type: 'composer' | 'term' | 'form' | 'period';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const isBrutal = false;

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentsLoading, setRecentsLoading] = useState(true);

  // Load recent searches
  const loadRecentSearches = useCallback(async () => {
    setRecentsLoading(true);
    const data = await getStorageItem<string[]>(RECENT_SEARCHES_KEY, []);
    setRecentSearches(data);
    setRecentsLoading(false);
  }, []);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  // Save to recent searches
  const saveRecentSearch = useCallback(async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    await setStorageItem(RECENT_SEARCHES_KEY, updated);
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await removeStorageItem(RECENT_SEARCHES_KEY);
  };

  const onRefresh = useCallback(async () => {
    hapticSelection();
    setRefreshing(true);
    await loadRecentSearches();
    setRefreshing(false);
  }, [loadRecentSearches]);

  // Search logic with fuzzy matching
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search composers
    composersData.composers.forEach((composer) => {
      const score = getMatchScore(q, [composer.name, composer.period, composer.nationality, composer.shortBio]);
      if (score > 0) {
        results.push({
          id: composer.id,
          type: 'composer',
          title: composer.name,
          subtitle: `${composer.period} • ${composer.years}`,
          icon: 'person',
          color: t.colors.primary,
        });
      }
    });

    // Search terms
    glossaryData.terms.forEach((term) => {
      const score = getMatchScore(q, [term.term, term.category, getLongDefinition(term as any)]);
      if (score > 0) {
        results.push({
          id: term.id,
          type: 'term',
          title: term.term,
          subtitle: term.category,
          icon: 'book',
          color: t.colors.secondary,
        });
      }
    });

    // Search forms
    formsData.forms.forEach((form) => {
      const score = getMatchScore(q, [form.name, form.category, form.description, form.period]);
      if (score > 0) {
        results.push({
          id: form.id,
          type: 'form',
          title: form.name,
          subtitle: `${form.category} • ${form.period}`,
          icon: 'musical-notes',
          color: t.colors.warning,
        });
      }
    });

    // Search periods
    periodsData.periods.forEach((period) => {
      const score = getMatchScore(q, [period.name, period.years, period.description]);
      if (score > 0) {
        results.push({
          id: period.id,
          type: 'period',
          title: period.name,
          subtitle: period.years,
          icon: 'time',
          color: period.color,
        });
      }
    });

    return results.slice(0, 30); // Limit results
  }, [query, t.colors]);

  // Simple fuzzy match scoring
  function getMatchScore(query: string, fields: string[]): number {
    let score = 0;
    const words = query.split(' ').filter(w => w.length > 0);

    for (const field of fields) {
      if (!field) continue;
      const lower = field.toLowerCase();

      // Exact match
      if (lower.includes(query)) {
        score += 10;
      }

      // Word match
      for (const word of words) {
        if (lower.includes(word)) {
          score += 5;
        }
      }
    }

    return score;
  }

  // Navigate to result
  const navigateToResult = (result: SearchResult) => {
    saveRecentSearch(query);
    Keyboard.dismiss();

    switch (result.type) {
      case 'composer':
        navigation.navigate('ComposerDetail', { composerId: result.id as string });
        break;
      case 'term':
        navigation.navigate('TermDetail', { termId: String(result.id) });
        break;
      case 'form':
        navigation.navigate('FormDetail', { formId: result.id as string });
        break;
      case 'period':
        navigation.navigate('PeriodDetail', { periodId: result.id as string });
        break;
    }
  };

  // Category filter counts
  const categoryCounts = useMemo(() => {
    const counts = { composer: 0, term: 0, form: 0, period: 0 };
    searchResults.forEach(r => counts[r.type]++);
    return counts;
  }, [searchResults]);

  const cardStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: borderRadius.md,
    ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm),
  };

  const isStitch = isDark;

  // Stitch-specific category card style
  const stitchCardStyle = {
    backgroundColor: 'rgba(35, 27, 51, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(84, 23, 207, 0.2)',
  };

  return (
    <View style={[styles.container, { backgroundColor: isStitch ? '#161022' : t.colors.background, paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: isStitch ? 'rgba(255,255,255,0.1)' : t.colors.surfaceLight },
            isBrutal && { borderWidth: 2, borderColor: t.colors.border }
          ]}
          onPress={() => {
            hapticSelection();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={20} color={isStitch ? '#FFFFFF' : t.colors.text} />
        </TouchableOpacity>
        <View style={[
          styles.searchBar,
          { backgroundColor: isStitch ? 'rgba(255,255,255,0.08)' : t.colors.surface },
          isStitch && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
          isBrutal && { borderWidth: 2, borderColor: t.colors.border }
        ]}>
          <Ionicons name="search" size={20} color={isStitch ? 'rgba(255,255,255,0.5)' : t.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: isStitch ? '#FFFFFF' : t.colors.text }]}
            placeholder="Search composers, term"
            placeholderTextColor={isStitch ? 'rgba(255,255,255,0.4)' : t.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => query.trim() && saveRecentSearch(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={isStitch ? 'rgba(255,255,255,0.5)' : t.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
            colors={[t.colors.primary]}
          />
        }
      >
        {/* No query - show recent searches */}
        {!query.trim() && (
          <>
            {recentsLoading && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>Recent Searches</Text>
                </View>
                {[0, 1, 2].map((i) => (
                  <SkeletonListItem key={i} />
                ))}
              </View>
            )}

            {!recentsLoading && recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={[styles.clearButton, { color: t.colors.error }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.recentItem, isStitch ? stitchCardStyle : cardStyle]}
                    onPress={() => setQuery(term)}
                  >
                    <Ionicons name="time-outline" size={18} color={isStitch ? 'rgba(255,255,255,0.5)' : t.colors.textMuted} />
                    <Text style={[styles.recentText, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>{term}</Text>
                    <Ionicons name="arrow-forward" size={16} color={isStitch ? 'rgba(255,255,255,0.3)' : t.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Categories - Enhanced with Gradients */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>Browse by Category</Text>
              <View style={styles.categoryGrid}>
                {[
                  { label: 'Composers', count: composersData.composers.length, icon: 'person', iconFilled: 'person', color: '#5417cf', screen: 'Timeline' },
                  { label: 'Terms', count: glossaryData.terms.length, icon: 'book', iconFilled: 'book', color: '#8b5cf6', screen: 'Glossary' },
                  { label: 'Forms', count: formsData.forms.length, icon: 'musical-notes', iconFilled: 'musical-notes', color: '#f59e0b', screen: 'Forms' },
                  { label: 'Eras', count: periodsData.periods.length, icon: 'time', iconFilled: 'time', color: '#22c55e', screen: 'Timeline' },
                ].map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.categoryCardWrapper}
                    onPress={() => navigation.navigate(cat.screen as any)}
                    activeOpacity={0.8}
                  >
                    {isStitch ? (
                      <LinearGradient
                        colors={[`${cat.color}20`, '#1e1a2e', '#1e1a2e']}
                        locations={[0, 0.4, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.categoryCardGradient, { borderColor: `${cat.color}25` }]}
                      >
                        {/* Decorative circle */}
                        <View style={[styles.categoryDecorativeCircle, { borderColor: `${cat.color}15` }]} />

                        {/* Icon with glow */}
                        <View style={styles.categoryIconWrapper}>
                          <View style={[styles.categoryIconGlow, { backgroundColor: `${cat.color}25` }]} />
                          <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                            <Ionicons name={cat.iconFilled as any} size={24} color={cat.color} />
                          </View>
                        </View>

                        <Text style={[styles.categoryLabel, { color: '#FFFFFF' }]}>{cat.label}</Text>
                        <Text style={[styles.categoryCount, { color: 'rgba(255,255,255,0.5)' }]}>{cat.count} items</Text>

                        {/* Arrow */}
                        <View style={[styles.categoryArrow, { backgroundColor: `${cat.color}15` }]}>
                          <Ionicons name="chevron-forward" size={14} color={cat.color} />
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.categoryCard, cardStyle]}>
                        <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                          <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                        </View>
                        <Text style={[styles.categoryLabel, { color: t.colors.text }]}>{cat.label}</Text>
                        <Text style={[styles.categoryCount, { color: t.colors.textMuted }]}>{cat.count} items</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Search Results */}
        {query.trim() && (
          <View style={styles.section}>
            {searchResults.length > 0 ? (
              <>
                <Text style={[styles.resultCount, { color: isStitch ? 'rgba(255,255,255,0.6)' : t.colors.textSecondary }]}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                </Text>

                {/* Result type chips */}
                <View style={styles.chipRow}>
                  {Object.entries(categoryCounts).map(([type, count]) => count > 0 && (
                    <View key={type} style={[styles.chip, { backgroundColor: isStitch ? 'rgba(84, 23, 207, 0.2)' : t.colors.surfaceLight }]}>
                      <Text style={[styles.chipText, { color: isStitch ? 'rgba(255,255,255,0.7)' : t.colors.textSecondary }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}s: {count}
                      </Text>
                    </View>
                  ))}
                </View>

                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.type}-${result.id}`}
                    style={[styles.resultItem, isStitch ? stitchCardStyle : cardStyle]}
                    onPress={() => navigateToResult(result)}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: result.color + '25' }]}>
                      <Ionicons name={result.icon as any} size={20} color={result.color} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={[styles.resultTitle, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>{result.title}</Text>
                      <Text style={[styles.resultSubtitle, { color: isStitch ? 'rgba(255,255,255,0.5)' : t.colors.textMuted }]}>{result.subtitle}</Text>
                    </View>
                    <View style={[styles.resultType, { backgroundColor: result.color + '20' }]}>
                      <Text style={[styles.resultTypeText, { color: result.color }]}>
                        {result.type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={isStitch ? 'rgba(255,255,255,0.3)' : t.colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: isStitch ? '#FFFFFF' : t.colors.text }]}>No results found</Text>
                <Text style={[styles.emptySubtitle, { color: isStitch ? 'rgba(255,255,255,0.5)' : t.colors.textMuted }]}>
                  Try searching for a composer, musical term, or era
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, paddingVertical: spacing.xs },
  content: { flex: 1, paddingHorizontal: spacing.md },

  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  clearButton: { fontSize: fontSize.sm, fontWeight: '500' },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  recentText: { flex: 1, fontSize: fontSize.md },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryCardWrapper: { width: '48%', flexGrow: 1 },
  categoryCard: { padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.md },
  categoryCardGradient: {
    padding: spacing.md,
    alignItems: 'flex-start' as const,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 140,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  categoryDecorativeCircle: {
    position: 'absolute' as const,
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
  },
  categoryIconWrapper: { position: 'relative' as const, marginBottom: 12 },
  categoryIconGlow: {
    position: 'absolute' as const,
    top: -4,
    left: -4,
    width: 56,
    height: 56,
    borderRadius: 16,
    opacity: 0.5,
  },
  stitchCategoryCard: { borderWidth: 1.5, borderRadius: borderRadius.md, padding: spacing.md },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  categoryLabel: { fontSize: fontSize.md, fontWeight: '700' },
  categoryCount: { fontSize: fontSize.sm, marginTop: 2 },
  categoryArrow: {
    position: 'absolute' as const,
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  resultCount: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  chipText: { fontSize: fontSize.xs },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  resultIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  resultContent: { flex: 1 },
  resultTitle: { fontSize: fontSize.md, fontWeight: '600' },
  resultSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
  resultType: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  resultTypeText: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'capitalize' },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.xs },
});
