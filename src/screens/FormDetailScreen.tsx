import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import { RootStackParamList, MusicalForm } from '../types';
import { markFormViewed } from '../utils/storage';

import formsData from '../data/forms.json';

type FormDetailRouteProp = RouteProp<RootStackParamList, 'FormDetail'>;

export default function FormDetailScreen() {
  const route = useRoute<FormDetailRouteProp>();
  const { formId } = route.params;
  const form = formsData.forms.find(f => f.id === formId) as MusicalForm | undefined;

  useEffect(() => {
    if (formId) markFormViewed(formId);
  }, [formId]);

  if (!form) {
    return <View style={styles.container}><Text style={styles.errorText}>Form not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{form.name}</Text>
        <Text style={styles.category}>{form.category} • {form.period}</Text>
      </View>
      
      <Text style={styles.description}>{form.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Structure</Text>
        {form.structure.map((item, idx) => (
          <View key={idx} style={styles.structureItem}>
            <View style={styles.structureNumber}>
              <Text style={styles.structureNumberText}>{idx + 1}</Text>
            </View>
            <View style={styles.structureContent}>
              <Text style={styles.structureTitle}>
                {item.movement ? `Movement ${item.movement}` : item.section || item.component || item.aspect}
              </Text>
              <Text style={styles.structureSubtitle}>
                {item.typical || item.description || item.form || item.text || ''}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Works</Text>
        {form.keyWorks.map((work, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.workCard}
            onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(work.composer + ' ' + work.work)}`)}
          >
            <View style={styles.workInfo}>
              <Text style={styles.workTitle}>{work.work}</Text>
              <Text style={styles.workComposer}>{work.composer}</Text>
              <Text style={styles.workWhy}>{work.why}</Text>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What to Listen For</Text>
        {form.listenFor.map((tip, idx) => (
          <View key={idx} style={styles.tipItem}>
            <Ionicons name="ear" size={16} color={colors.primary} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSize.xxxl, fontWeight: 'bold', color: colors.text },
  category: { fontSize: fontSize.md, color: colors.primary, marginTop: spacing.xs },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  structureItem: { flexDirection: 'row', marginBottom: spacing.md },
  structureNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  structureNumberText: { fontSize: fontSize.md, fontWeight: 'bold', color: colors.primary },
  structureContent: { flex: 1 },
  structureTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  structureSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  workCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  workInfo: { flex: 1 },
  workTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  workComposer: { fontSize: fontSize.sm, color: colors.primary, marginTop: 2 },
  workWhy: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  tipText: { flex: 1, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
});
