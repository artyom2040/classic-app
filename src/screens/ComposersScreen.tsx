import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { ScreenContainer, ScreenHeader, ListCard, ListCardAvatar, ErrorUI, SkeletonGrid } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Composer, Period } from '../types';
import { hapticSelection } from '../utils/haptics';
import { useAsyncData } from '../hooks';
import { DataService } from '../services/dataService';
import { createLogger } from '../utils/logger';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';

const log = createLogger('ComposersScreen');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ComposerSection {
  periodId: string;
  periodName: string;
  color: string;
  data: Composer[];
}

export default function ComposersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch composers and periods with error handling
  const fetchComposers = useCallback(() => DataService.getComposers(), []);
  const fetchPeriods = useCallback(() => DataService.getPeriods(), []);

  const {
    data: composers,
    error: composersError,
    isLoading: composersLoading,
    retry: retryComposers,
  } = useAsyncData(fetchComposers, composersData.composers as Composer[], {
    onError: (err) => log.error('Failed to load composers', { error: err.message }),
  });

  const {
    data: periods,
    error: periodsError,
    isLoading: periodsLoading,
    retry: retryPeriods,
  } = useAsyncData(fetchPeriods, periodsData.periods as Period[], {
    onError: (err) => log.error('Failed to load periods', { error: err.message }),
  });

  const isLoading = composersLoading || periodsLoading;
  const error = composersError || periodsError;
  const handleRetry = () => {
    if (composersError) retryComposers();
    if (periodsError) retryPeriods();
  };

  const sections: ComposerSection[] = useMemo(() => {
    const byPeriod = periods.map(period => ({
      periodId: period.id,
      periodName: period.name,
      color: period.color,
      data: composers
        .filter(c => c.period === period.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));

    const filtered = selectedPeriod === 'all'
      ? byPeriod
      : byPeriod.filter(s => s.periodId === selectedPeriod);

    return filtered.filter(s => s.data.length > 0);
  }, [composers, periods, selectedPeriod]);

  const onRefresh = () => {
    hapticSelection();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 250);
  };

  const renderComposer = ({ item, section }: { item: Composer; section: ComposerSection }) => (
    <ListCard
      title={item.name}
      subtitle={`${item.years} • ${item.nationality}`}
      leftContent={
        <ListCardAvatar
          letter={item.name.charAt(0)}
          color={section.color}
        />
      }
      onPress={() => navigation.navigate('ComposerDetail', { composerId: item.id })}
      accessibilityLabel={`${item.name}, ${item.years}, ${item.nationality}`}
    />
  );

  const renderSectionHeader = ({ section }: { section: ComposerSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>{section.periodName}</Text>
      <Text style={[styles.sectionCount, { color: section.color }]}>{section.data.length} composers</Text>
    </View>
  );

  // Show error UI if fetch failed
  if (error) {
    return (
      <ScreenContainer padded={false}>
        <ScreenHeader title="Composers" />
        <ErrorUI
          title="Failed to load composers"
          message={error.message}
          onRetry={handleRetry}
        />
      </ScreenContainer>
    );
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <ScreenContainer padded={false}>
        <ScreenHeader title="Composers" />
        <SkeletonGrid count={8} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <ScreenHeader title="Composers" />

      {/* Period Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedPeriod === 'all' ? t.colors.primary + '20' : t.colors.surface },
            isBrutal && { borderWidth: 2, borderColor: t.colors.border },
          ]}
          onPress={() => {
            hapticSelection();
            setSelectedPeriod('all');
          }}
        >
          <Text style={[styles.filterText, { color: t.colors.text }]}>All</Text>
        </TouchableOpacity>
        {periods.map(period => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.filterChip,
              { backgroundColor: selectedPeriod === period.id ? period.color + '25' : t.colors.surface },
              isBrutal && { borderWidth: 2, borderColor: t.colors.border },
            ]}
            onPress={() => {
              hapticSelection();
              setSelectedPeriod(period.id);
            }}
          >
            <Text style={[styles.filterText, { color: selectedPeriod === period.id ? period.color : t.colors.text }]}>{period.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderComposer}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        SectionSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
            colors={[t.colors.primary]}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.md,
    paddingBottom: 0
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xs
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700'
  },
  sectionCount: {
    fontSize: fontSize.sm,
    fontWeight: '600'
  },
});
