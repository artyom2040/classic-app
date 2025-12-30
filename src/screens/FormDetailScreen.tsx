import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, MusicalForm } from '../types';
import { AnimatedScreen } from '../design-system';
import { markFormViewed } from '../utils/storage';

import formsData from '../data/forms.json';

type FormDetailRouteProp = RouteProp<RootStackParamList, 'FormDetail'>;

export default function FormDetailScreen() {
  const route = useRoute<FormDetailRouteProp>();
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const isBrutal = false;
  const formId = route.params?.formId ?? '';
  const form = formsData.forms.find(f => f.id === formId) as MusicalForm | undefined;

  useEffect(() => {
    if (formId) markFormViewed(formId);
  }, [formId]);

  if (!form) {
    return <View style={[styles.container, { backgroundColor: t.colors.background }]}><Text style={[styles.errorText, { color: t.colors.error }]}>Form not found</Text></View>;
  }

  return (
    <AnimatedScreen animation="fadeSlideUp" delay={50}>
      <ScrollView style={[styles.container, { backgroundColor: t.colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.colors.text }]}>{form.name}</Text>
          <Text style={[styles.category, { color: t.colors.primary }]}>{form.category} • {form.period}</Text>
        </View>

        <Text style={[styles.description, { color: t.colors.textSecondary }]}>{form.description}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Structure</Text>
          {form.structure.map((item, idx) => (
            <View key={idx} style={styles.structureItem}>
              <View style={[styles.structureNumber, { backgroundColor: t.colors.primary + '30' }]}>
                <Text style={[styles.structureNumberText, { color: t.colors.primary }]}>{idx + 1}</Text>
              </View>
              <View style={styles.structureContent}>
                <Text style={[styles.structureTitle, { color: t.colors.text }]}>
                  {item.movement ? `Movement ${item.movement}` : item.section || item.component || item.aspect}
                </Text>
                <Text style={[styles.structureSubtitle, { color: t.colors.textSecondary }]}>
                  {item.typical || item.description || item.form || item.text || ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Key Works</Text>
          {form.keyWorks.map((work, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.workCard, { backgroundColor: t.colors.surface }, isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.sm]}
              onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(work.composer + ' ' + work.work)}`)}
              accessibilityRole="button"
              accessibilityLabel={`Play ${work.work} by ${work.composer} on YouTube`}
            >
              <View style={styles.workInfo}>
                <Text style={[styles.workTitle, { color: t.colors.text }]}>{work.work}</Text>
                <Text style={[styles.workComposer, { color: t.colors.primary }]}>{work.composer}</Text>
                <Text style={[styles.workWhy, { color: t.colors.textSecondary }]}>{work.why}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color={t.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.colors.text }]}>What to Listen For</Text>
          {form.listenFor.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <Ionicons name="ear" size={16} color={t.colors.primary} />
              <Text style={[styles.tipText, { color: t.colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
  errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold' },
  category: { fontSize: fontSize.md, marginTop: spacing.xs },
  description: { fontSize: fontSize.md, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  structureItem: { flexDirection: 'row', marginBottom: spacing.md },
  structureNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  structureNumberText: { fontSize: fontSize.md, fontWeight: 'bold' },
  structureContent: { flex: 1 },
  structureTitle: { fontSize: fontSize.md, fontWeight: '600' },
  structureSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
  workCard: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  workInfo: { flex: 1 },
  workTitle: { fontSize: fontSize.md, fontWeight: '600' },
  workComposer: { fontSize: fontSize.sm, marginTop: 2 },
  workWhy: { fontSize: fontSize.sm, marginTop: 4, fontStyle: 'italic' },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  tipText: { flex: 1, fontSize: fontSize.md, lineHeight: 22 },
});
