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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentsLoading, setRecentsLoading] = useState(true);

  // Load recent searches
  const loadRecentSearches = useCallback(async () => {
    setRecentsLoading(true);
    const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    setRecentSearches(data ? JSON.parse(data) : []);
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
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Clear recent searches
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
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
        navigation.navigate('TermDetail', { termId: result.id as number });
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

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background, paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }, isBrutal && { borderWidth: 2, borderColor: t.colors.border }]}
          onPress={() => {
            hapticSelection();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={20} color={t.colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: t.colors.surface }, isBrutal && { borderWidth: 2, borderColor: t.colors.border }]}>
          <Ionicons name="search" size={20} color={t.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: t.colors.text }]}
            placeholder="Search composers, terms, forms..."
            placeholderTextColor={t.colors.textMuted}
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
              <Ionicons name="close-circle" size={20} color={t.colors.textMuted} />
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
                  <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Recent Searches</Text>
                </View>
                {[0, 1, 2].map((i) => (
                  <SkeletonListItem key={i} />
                ))}
              </View>
            )}

            {!recentsLoading && recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={[styles.clearButton, { color: t.colors.error }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.recentItem, cardStyle]}
                    onPress={() => setQuery(term)}
                  >
                    <Ionicons name="time-outline" size={18} color={t.colors.textMuted} />
                    <Text style={[styles.recentText, { color: t.colors.text }]}>{term}</Text>
                    <Ionicons name="arrow-forward" size={16} color={t.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Browse by Category</Text>
              <View style={styles.categoryGrid}>
                {[
                  { label: 'Composers', count: composersData.composers.length, icon: 'person', color: t.colors.primary, query: 'baroque romantic classical' },
                  { label: 'Terms', count: glossaryData.terms.length, icon: 'book', color: t.colors.secondary, query: 'sonata symphony' },
                  { label: 'Forms', count: formsData.forms.length, icon: 'musical-notes', color: t.colors.warning, query: 'concerto fugue' },
                  { label: 'Eras', count: periodsData.periods.length, icon: 'time', color: t.colors.success, query: 'baroque' },
                ].map((cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.categoryCard, cardStyle]}
                    onPress={() => navigation.navigate(
                      idx === 0 ? 'Timeline' as any : 
                      idx === 1 ? 'Glossary' as any : 
                      idx === 2 ? 'Forms' as any : 
                      'Timeline' as any
                    )}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                    </View>
                    <Text style={[styles.categoryLabel, { color: t.colors.text }]}>{cat.label}</Text>
                    <Text style={[styles.categoryCount, { color: t.colors.textMuted }]}>{cat.count} items</Text>
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
                <Text style={[styles.resultCount, { color: t.colors.textSecondary }]}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                </Text>
                
                {/* Result type chips */}
                <View style={styles.chipRow}>
                  {Object.entries(categoryCounts).map(([type, count]) => count > 0 && (
                    <View key={type} style={[styles.chip, { backgroundColor: t.colors.surfaceLight }]}>
                      <Text style={[styles.chipText, { color: t.colors.textSecondary }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}s: {count}
                      </Text>
                    </View>
                  ))}
                </View>

                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.type}-${result.id}`}
                    style={[styles.resultItem, cardStyle]}
                    onPress={() => navigateToResult(result)}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: result.color + '20' }]}>
                      <Ionicons name={result.icon as any} size={20} color={result.color} />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={[styles.resultTitle, { color: t.colors.text }]}>{result.title}</Text>
                      <Text style={[styles.resultSubtitle, { color: t.colors.textMuted }]}>{result.subtitle}</Text>
                    </View>
                    <View style={[styles.resultType, { backgroundColor: result.color + '15' }]}>
                      <Text style={[styles.resultTypeText, { color: result.color }]}>
                        {result.type}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={t.colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: t.colors.text }]}>No results found</Text>
                <Text style={[styles.emptySubtitle, { color: t.colors.textMuted }]}>
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
  categoryCard: { width: '48%', padding: spacing.md, alignItems: 'center' },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  categoryLabel: { fontSize: fontSize.md, fontWeight: '600' },
  categoryCount: { fontSize: fontSize.sm, marginTop: 2 },
  
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
