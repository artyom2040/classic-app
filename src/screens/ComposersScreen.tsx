import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, Composer, Period } from '../types';
import { hapticSelection } from '../utils/haptics';

import composersData from '../data/composers.json';
import periodsData from '../data/periods.json';

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

  const periods: Period[] = periodsData.periods;
  const composers: Composer[] = composersData.composers;

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

  const renderComposer = ({ item, section }: { item: Composer; section: ComposerSection }) => {
    const cardStyle = [
      styles.card,
      { backgroundColor: t.colors.surface },
      isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm,
    ];

    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ComposerDetail', { composerId: item.id })}
      >
        <View style={[styles.avatar, { backgroundColor: section.color + '25' }]}>
          <Text style={[styles.avatarText, { color: section.color }]}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: t.colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardMeta, { color: t.colors.textMuted }]} numberOfLines={1}>
            {item.years} • {item.nationality}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: ComposerSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>{section.periodName}</Text>
      <Text style={[styles.sectionCount, { color: section.color }]}>{section.data.length} composers</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, padding: spacing.md, paddingBottom: 0 },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.lg },
  filterText: { fontSize: fontSize.sm, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  sectionCount: { fontSize: fontSize.sm, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.lg, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700' },
  cardMeta: { fontSize: fontSize.sm, marginTop: 2 },
});
