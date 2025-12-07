import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList, Composer } from '../../types';
import { recommendations, Recommendation } from './data';

import composersData from '../../data/composers.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const similarityIcons: Record<Recommendation['similarity'], string> = {
    style: 'brush',
    era: 'time',
    instrument: 'musical-notes',
    mood: 'heart',
    influence: 'arrow-forward-circle',
};

const similarityColors: Record<Recommendation['similarity'], string> = {
    style: '#8B5CF6',
    era: '#EC4899',
    instrument: '#F59E0B',
    mood: '#EF4444',
    influence: '#22C55E',
};

export default function RecommendationsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { theme, themeName } = useTheme();
    const t = theme;
    const isBrutal = themeName === 'neobrutalist';

    const allComposers = composersData.composers as Composer[];

    const getComposer = useCallback((id: string): Composer | undefined => {
        return allComposers.find(c => c.id === id);
    }, [allComposers]);

    const recommendationPairs = useMemo(() => {
        return recommendations.map(rec => ({
            ...rec,
            source: getComposer(rec.sourceComposerId),
            target: getComposer(rec.targetComposerId),
        })).filter(rec => rec.source && rec.target);
    }, [getComposer]);

    const renderRecommendation = useCallback(({ item }: { item: typeof recommendationPairs[0] }) => {
        const icon = similarityIcons[item.similarity] as keyof typeof Ionicons.glyphMap;
        const color = similarityColors[item.similarity];

        return (
            <View
                style={[
                    styles.card,
                    { backgroundColor: t.colors.surface },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.text } : {},
                ]}
            >
                <View style={[styles.similarityBadge, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={14} color={color} />
                    <Text style={[styles.similarityText, { color }]}>
                        {item.similarity.charAt(0).toUpperCase() + item.similarity.slice(1)}
                    </Text>
                </View>

                <View style={styles.composerPair}>
                    <TouchableOpacity
                        style={styles.composerBox}
                        onPress={() => navigation.navigate('ComposerDetail', { composerId: item.source!.id })}
                    >
                        <Text style={[styles.composerName, { color: t.colors.text }]}>
                            {item.source?.name.split(' ').pop()}
                        </Text>
                        <Text style={[styles.composerYears, { color: t.colors.textMuted }]}>
                            {item.source?.years}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={24} color={color} />
                    </View>

                    <TouchableOpacity
                        style={styles.composerBox}
                        onPress={() => navigation.navigate('ComposerDetail', { composerId: item.target!.id })}
                    >
                        <Text style={[styles.composerName, { color: t.colors.text }]}>
                            {item.target?.name.split(' ').pop()}
                        </Text>
                        <Text style={[styles.composerYears, { color: t.colors.textMuted }]}>
                            {item.target?.years}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.reason, { color: t.colors.textSecondary }]}>
                    {item.reason}
                </Text>
            </View>
        );
    }, [t, isBrutal, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: t.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: t.colors.text }]}>Recommendations</Text>
                    <View style={styles.labsBadge}>
                        <Ionicons name="flask" size={12} color="#8B5CF6" />
                        <Text style={styles.labsBadgeText}>Labs</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                Discover connections between composers
            </Text>

            <FlatList
                data={recommendationPairs}
                keyExtractor={(item) => item.id}
                renderItem={renderRecommendation}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: { fontSize: fontSize.xxl, fontWeight: 'bold' },
    labsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF620',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    labsBadgeText: { fontSize: fontSize.xs, color: '#8B5CF6', fontWeight: '600' },
    subtitle: {
        fontSize: fontSize.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    listContent: { padding: spacing.md, paddingTop: 0 },
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    similarityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        gap: 4,
        marginBottom: spacing.md,
    },
    similarityText: { fontSize: fontSize.xs, fontWeight: '600' },
    composerPair: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    composerBox: {
        flex: 1,
        alignItems: 'center',
    },
    composerName: { fontSize: fontSize.lg, fontWeight: '700' },
    composerYears: { fontSize: fontSize.xs, marginTop: 2 },
    arrowContainer: {
        paddingHorizontal: spacing.md,
    },
    reason: { fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20 },
});
