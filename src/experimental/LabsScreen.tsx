import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { LABS, hasAnyLabsEnabled } from './labs.config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LabFeature {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    route: keyof RootStackParamList;
    enabled: boolean;
}

const labFeatures: LabFeature[] = [
    {
        id: 'mood-playlists',
        name: 'Mood Playlists',
        description: 'Curated classical music for every moment',
        icon: 'sparkles',
        color: '#8B5CF6',
        route: 'MoodPlaylists',
        enabled: LABS.MOOD_PLAYLISTS,
    },
    {
        id: 'listening-guides',
        name: 'Listening Guides',
        description: 'Learn what to listen for in famous works',
        icon: 'headset',
        color: '#3B82F6',
        route: 'ListeningGuides',
        enabled: LABS.LISTENING_GUIDES,
    },
    {
        id: 'recommendations',
        name: 'Recommendations',
        description: 'Discover connections between composers',
        icon: 'git-network',
        color: '#22C55E',
        route: 'Recommendations',
        enabled: LABS.RECOMMENDATIONS,
    },
    {
        id: 'discover',
        name: 'MusicBrainz Discover',
        description: 'Explore composers with external data',
        icon: 'planet',
        color: '#EC4899',
        route: 'Discover',
        enabled: LABS.MUSICBRAINZ_DISCOVER,
    },
];

export default function LabsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { theme, themeName, isDark } = useTheme();
    const t = theme;
    const isBrutal = false;

    const enabledFeatures = labFeatures.filter(f => f.enabled);

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
                    <Ionicons name="flask" size={24} color="#8B5CF6" />
                    <Text style={[styles.title, { color: t.colors.text }]}>Labs</Text>
                </View>
            </View>

            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                Experimental features in development
            </Text>

            <View style={[styles.warningBanner, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="warning" size={18} color="#F59E0B" />
                <Text style={[styles.warningText, { color: '#F59E0B' }]}>
                    These features are experimental and may change or be removed.
                </Text>
            </View>

            <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
                {enabledFeatures.map((feature) => (
                    <TouchableOpacity
                        key={feature.id}
                        style={[
                            styles.featureCard,
                            { backgroundColor: t.colors.surface },
                            isBrutal ? { borderWidth: 2, borderColor: t.colors.text } : {},
                        ]}
                        onPress={() => navigation.navigate(feature.route as never)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                            <Ionicons name={feature.icon} size={24} color={feature.color} />
                        </View>
                        <View style={styles.featureInfo}>
                            <Text style={[styles.featureName, { color: t.colors.text }]}>
                                {feature.name}
                            </Text>
                            <Text style={[styles.featureDescription, { color: t.colors.textSecondary }]}>
                                {feature.description}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
                    </TouchableOpacity>
                ))}

                {!hasAnyLabsEnabled() && (
                    <View style={styles.emptyState}>
                        <Ionicons name="flask-outline" size={48} color={t.colors.textMuted} />
                        <Text style={[styles.emptyText, { color: t.colors.textMuted }]}>
                            No experimental features enabled
                        </Text>
                    </View>
                )}
            </ScrollView>
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
    subtitle: {
        fontSize: fontSize.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    warningText: { fontSize: fontSize.sm, flex: 1 },
    featureList: { flex: 1, paddingHorizontal: spacing.md },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureInfo: { flex: 1 },
    featureName: { fontSize: fontSize.md, fontWeight: '600' },
    featureDescription: { fontSize: fontSize.sm, marginTop: 2 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: { fontSize: fontSize.md, marginTop: spacing.md },
});
