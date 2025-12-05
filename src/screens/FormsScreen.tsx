import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, MusicalForm } from '../types';

import formsData from '../data/forms.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  Orchestral: 'people',
  Chamber: 'musical-note',
  Contrapuntal: 'git-branch',
  'Vocal/Theatrical': 'mic',
  'Solo/Short Form': 'musical-notes',
  Choral: 'people-outline',
  Form: 'layers',
  Theatrical: 'film',
};


export default function FormsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';
  const forms: MusicalForm[] = formsData.forms;

  const categoryColors: { [key: string]: string } = {
    Orchestral: '#C0392B', Chamber: '#27AE60', Contrapuntal: '#8E44AD',
    'Vocal/Theatrical': '#2980B9', 'Solo/Short Form': t.colors.primary,
    Choral: '#16A085', Form: t.colors.secondary, Theatrical: '#C0392B',
  };

  // Group forms by category
  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as { [key: string]: MusicalForm[] });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.intro, { color: t.colors.textSecondary }]}>
        Understanding musical forms is like knowing the blueprint of a building. 
        Once you recognize the structure, the music becomes easier to follow.
      </Text>

      {Object.entries(groupedForms).map(([category, categoryForms]) => (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBox, { backgroundColor: (categoryColors[category] || t.colors.primary) + '30' }]}>
              <Ionicons 
                name={categoryIcons[category] || 'musical-notes'} 
                size={20} 
                color={categoryColors[category] || t.colors.primary} 
              />
            </View>
            <Text style={[styles.categoryTitle, { color: t.colors.text }]}>{category}</Text>
          </View>

          <View style={styles.formsGrid}>
            {categoryForms.map(form => (
              <TouchableOpacity
                key={form.id}
                style={[styles.formCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
                onPress={() => navigation.navigate('FormDetail', { formId: form.id })}
                activeOpacity={0.7}
              >
                <Text style={[styles.formName, { color: t.colors.text }]}>{form.name}</Text>
                <Text style={[styles.formPeriod, { color: t.colors.primary }]}>{form.period}</Text>
                <Text style={[styles.formDescription, { color: t.colors.textSecondary }]} numberOfLines={2}>
                  {form.description}
                </Text>
                <View style={styles.formMeta}>
                  <View style={styles.workCount}>
                    <Ionicons name="musical-note" size={12} color={t.colors.textMuted} />
                    <Text style={[styles.workCountText, { color: t.colors.textMuted }]}>
                      {form.keyWorks.length} key works
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={t.colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  intro: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.lg },
  categorySection: { marginBottom: spacing.lg },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  categoryIconBox: { width: 36, height: 36, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  categoryTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  formsGrid: { gap: spacing.sm },
  formCard: { borderRadius: borderRadius.md, padding: spacing.md },
  formName: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: 2 },
  formPeriod: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  formDescription: { fontSize: fontSize.sm, lineHeight: 18, marginBottom: spacing.sm },
  formMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workCountText: { fontSize: fontSize.xs },
});
