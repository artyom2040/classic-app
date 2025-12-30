import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { RootStackParamList } from '../types';
import { ScreenContainer, ScreenHeader } from '../components/ui';

import conductorsData from '../data/conductors.json';

type ConductorDetailRouteProp = RouteProp<RootStackParamList, 'ConductorDetail'>;

interface Conductor {
    id: string;
    name: string;
    birthYear: number;
    deathYear: number | null;
    nationality: string;
    shortBio: string;
}

export default function ConductorDetailScreen() {
    const route = useRoute<ConductorDetailRouteProp>();
    const { theme, isDark } = useTheme();
    const t = theme;
    const conductorId = route.params?.conductorId ?? '';
    const conductor = conductorsData.conductors.find(c => c.id === conductorId) as Conductor | undefined;

    const { isDesktop, maxContentWidth } = useResponsive();

    if (!conductor) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Conductor" />
                <Text style={[styles.errorText, { color: t.colors.error }]}>Conductor not found</Text>
            </ScreenContainer>
        );
    }

    const yearsText = conductor.deathYear
        ? `${conductor.birthYear}–${conductor.deathYear}`
        : `Born ${conductor.birthYear}`;

    const openSpotify = () => {
        const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(conductor.name + ' conductor')}`;
        Linking.openURL(searchUrl);
    };

    const openYouTube = () => {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(conductor.name + ' conductor')}`;
        Linking.openURL(searchUrl);
    };

    return (
        <ScreenContainer padded={false}>
            <ScreenHeader title={conductor.name} />
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatarCircle, { backgroundColor: t.colors.accent + '30' }]}>
                        <Ionicons name="radio" size={48} color={t.colors.accent} />
                    </View>
                    <Text style={[styles.name, { color: t.colors.text }]}>{conductor.name}</Text>
                    <Text style={[styles.years, { color: t.colors.textSecondary }]}>{yearsText}</Text>
                    <View style={styles.tags}>
                        <View style={[styles.tag, { backgroundColor: t.colors.accent + '30' }]}>
                            <Text style={[styles.tagText, { color: t.colors.accent }]}>Conductor</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: t.colors.surface }]}>
                            <Text style={[styles.tagText, { color: t.colors.textSecondary }]}>{conductor.nationality}</Text>
                        </View>
                    </View>
                </View>

                {/* Biography */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: t.colors.text }]}>About</Text>
                    <Text style={[styles.bio, { color: t.colors.textSecondary }]}>{conductor.shortBio}</Text>
                </View>

                {/* Listen Section */}
                <View style={[styles.listenCard, { backgroundColor: t.colors.surface }, t.shadows.sm]}>
                    <Text style={[styles.listenTitle, { color: t.colors.text }]}>🎧 Listen to Performances</Text>
                    <Text style={[styles.listenText, { color: t.colors.textSecondary }]}>
                        Discover {conductor.name}'s legendary interpretations and recordings.
                    </Text>
                    <View style={styles.listenButtons}>
                        <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openSpotify}>
                            <Ionicons name="play-circle" size={20} color="#1DB954" />
                            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>Spotify</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.listenButton, { backgroundColor: t.colors.surfaceLight }]} onPress={openYouTube}>
                            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                            <Text style={[styles.listenButtonText, { color: t.colors.text }]}>YouTube</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: spacing.xxl }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.md },
    errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },
    header: { alignItems: 'center', marginBottom: spacing.lg },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    name: { fontSize: fontSize.xxl, fontWeight: 'bold', textAlign: 'center' },
    years: { fontSize: fontSize.md, marginTop: spacing.xs },
    tags: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
    tagText: { fontSize: fontSize.sm },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
    bio: { fontSize: fontSize.md, lineHeight: 24 },
    listenCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
    listenTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
    listenText: { fontSize: fontSize.md, lineHeight: 22, marginBottom: spacing.md },
    listenButtons: { flexDirection: 'row', gap: spacing.sm },
    listenButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, gap: spacing.xs },
    listenButtonText: { fontSize: fontSize.md, fontWeight: '500' },
});
