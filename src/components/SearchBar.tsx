import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { spacing, fontSize, borderRadius } from '../theme';

// Import data for searching
import composersData from '../data/composers.json';
import glossaryData from '../data/glossary.json';
import formsData from '../data/forms.json';
import periodsData from '../data/periods.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SearchResult {
  id: string | number;
  title: string;
  subtitle: string;
  type: 'composer' | 'term' | 'form' | 'period';
  icon: string;
}

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export function SearchBar({ placeholder = 'Search...', autoFocus = false, onClose }: SearchBarProps) {
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const navigation = useNavigation<NavigationProp>();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const search = useCallback((text: string) => {
    setQuery(text);
    
    if (text.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = text.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search composers
    composersData.composers.forEach(composer => {
      if (
        composer.name.toLowerCase().includes(lowerQuery) ||
        composer.period.toLowerCase().includes(lowerQuery) ||
        composer.nationality.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: composer.id,
          title: composer.name,
          subtitle: `${composer.period} • ${composer.years}`,
          type: 'composer',
          icon: 'person',
        });
      }
    });

    // Search terms
    glossaryData.terms.forEach(term => {
      if (
        term.term.toLowerCase().includes(lowerQuery) ||
        term.definition.toLowerCase().includes(lowerQuery) ||
        term.category.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: term.id,
          title: term.term,
          subtitle: term.category,
          type: 'term',
          icon: 'book',
        });
      }
    });

    // Search forms
    formsData.forms.forEach(form => {
      if (
        form.name.toLowerCase().includes(lowerQuery) ||
        form.description.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: form.id,
          title: form.name,
          subtitle: form.category,
          type: 'form',
          icon: 'musical-notes',
        });
      }
    });

    // Search periods
    periodsData.periods.forEach(period => {
      if (
        period.name.toLowerCase().includes(lowerQuery) ||
        period.description.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: period.id,
          title: period.name,
          subtitle: period.years,
          type: 'period',
          icon: 'time',
        });
      }
    });

    // Limit results and sort by relevance (exact matches first)
    const sorted = searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      const bExact = b.title.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      return aExact - bExact;
    });

    setResults(sorted.slice(0, 15));
  }, []);

  const handleSelect = (result: SearchResult) => {
    Keyboard.dismiss();
    setQuery('');
    setResults([]);
    
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
    
    onClose?.();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'composer': return '#C0392B';
      case 'term': return t.colors.primary;
      case 'form': return '#2980B9';
      case 'period': return '#8E44AD';
      default: return t.colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: t.colors.surface,
          borderColor: isFocused ? t.colors.primary : t.colors.border,
        },
        isBrutal ? { borderRadius: 0, borderWidth: 2 } : { borderRadius: borderRadius.lg, borderWidth: 1 },
      ]}>
        <Ionicons name="search" size={20} color={t.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: t.colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textMuted}
          value={query}
          onChangeText={search}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={t.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <View style={[
          styles.resultsContainer,
          { backgroundColor: t.colors.surface },
          isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.md,
        ]}>
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: t.colors.border }]}
                onPress={() => handleSelect(item)}
              >
                <View style={[styles.resultIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Ionicons name={item.icon as any} size={18} color={getTypeColor(item.type)} />
                </View>
                <View style={styles.resultContent}>
                  <Text style={[styles.resultTitle, { color: t.colors.text }]}>{item.title}</Text>
                  <Text style={[styles.resultSubtitle, { color: t.colors.textMuted }]}>{item.subtitle}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '15' }]}>
                  <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                    {item.type}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {query.length >= 2 && results.length === 0 && (
        <View style={[
          styles.noResults,
          { backgroundColor: t.colors.surface },
          isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm,
        ]}>
          <Ionicons name="search-outline" size={32} color={t.colors.textMuted} />
          <Text style={[styles.noResultsText, { color: t.colors.textSecondary }]}>
            No results for "{query}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },
  resultsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    maxHeight: 320,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noResults: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  noResultsText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
});
