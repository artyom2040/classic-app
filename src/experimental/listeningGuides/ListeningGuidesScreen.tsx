import React, { useCallback } from 'react';
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
import { RootStackParamList } from '../../types';
import { listeningGuides, ListeningGuide } from './data';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const difficultyColors = {
    beginner: '#22C55E',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
};

const difficultyLabels = {
    beginner: '🌱 Beginner',
    intermediate: '🌿 Intermediate',
    advanced: '🌳 Advanced',
};

export default function ListeningGuidesScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { theme, themeName, isDark } = useTheme();
    const t = theme;
    const isBrutal = false;

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderGuideCard = useCallback(({ item }: { item: ListeningGuide }) => {
        const color = difficultyColors[item.difficulty];

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: t.colors.surface },
                    isBrutal ? { borderWidth: 2, borderColor: t.colors.text } : {},
                ]}
                activeOpacity={0.7}
                accessibilityLabel={`${item.workTitle} listening guide`}
                onPress={() => navigation.navigate('ListeningGuidePlayer', { guideId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.difficultyBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.difficultyText, { color }]}>
                            {difficultyLabels[item.difficulty]}
                        </Text>
                    </View>
                    <Text style={[styles.duration, { color: t.colors.textMuted }]}>
                        {formatDuration(item.duration)}
                    </Text>
                </View>

                <Text style={[styles.workTitle, { color: t.colors.text }]}>
                    {item.workTitle}
                </Text>
                <Text style={[styles.composer, { color: t.colors.textSecondary }]}>
                    {item.composerName}
                </Text>

                <View style={styles.annotationsPreview}>
                    <Ionicons name="bookmark" size={14} color={t.colors.primary} />
                    <Text style={[styles.annotationCount, { color: t.colors.textSecondary }]}>
                        {item.annotations.length} listening points
                    </Text>
                </View>

                <View style={[styles.startButton, { backgroundColor: t.colors.primary }]}>
                    <Ionicons name="headset" size={16} color="#fff" />
                    <Text style={styles.startButtonText}>Start Guide</Text>
                </View>
            </TouchableOpacity>
        );
    }, [t, isBrutal]);

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
                    <Text style={[styles.title, { color: t.colors.text }]}>Listening Guides</Text>
                    <View style={styles.labsBadge}>
                        <Ionicons name="flask" size={12} color="#8B5CF6" />
                        <Text style={styles.labsBadgeText}>Labs</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                Learn what to listen for in famous works
            </Text>

            <FlatList
                data={listeningGuides}
                keyExtractor={(item) => item.id}
                renderItem={renderGuideCard}
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    difficultyBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    difficultyText: { fontSize: fontSize.xs, fontWeight: '600' },
    duration: { fontSize: fontSize.sm },
    workTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: 4 },
    composer: { fontSize: fontSize.md, marginBottom: spacing.md },
    annotationsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    annotationCount: { fontSize: fontSize.sm },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    startButtonText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '600' },
});
