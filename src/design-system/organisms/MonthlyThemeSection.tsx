/**
 * MonthlyThemeSection - Monthly theme card with enhanced composer spotlights
 * Part of the design-system organisms
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Display1, H3, Body, Label, Tiny, BodySmall } from '../atoms/Typography';
import { EnhancedButton } from '../atoms/Button';

interface ComposerSpotlight {
    name: string;
    subtitle: string;
    imageSource?: ImageSourcePropType;
    onPress?: () => void;
}

interface MonthlyThemeSectionProps {
    monthLabel?: string;
    title: string;
    subtitle: string;
    description?: string;
    imageSource?: ImageSourcePropType;
    onExplorePress: () => void;
    composerSpotlights?: ComposerSpotlight[];
}

export function MonthlyThemeSection({
    monthLabel = 'MONTHLY THEME',
    title,
    subtitle,
    description,
    imageSource,
    onExplorePress,
    composerSpotlights = [],
}: MonthlyThemeSectionProps) {
    const { theme, isDark } = useTheme();
    const t = theme;

    // Theme-adaptive colors
    const cardBgColor = isDark ? '#1e1a2e' : t.colors.surface;

    return (
        <View style={styles.container}>
            {/* Section Label */}
            <View style={styles.sectionHeader}>
                <View style={[styles.sparkleIcon, { backgroundColor: `${t.colors.primary}20` }]}>
                    <Ionicons name="sparkles" size={12} color={t.colors.primary} />
                </View>
                <Tiny color={t.colors.textMuted} weight="bold" style={styles.sectionLabel}>
                    {monthLabel}
                </Tiny>
            </View>

            {/* Main Theme Card */}
            <TouchableOpacity
                style={styles.themeCard}
                onPress={onExplorePress}
                activeOpacity={0.9}
            >
                {imageSource ? (
                    <ImageBackground
                        source={imageSource}
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 24 }}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                            locations={[0, 0.4, 1]}
                            style={styles.gradient}
                        >
                            {renderThemeContent()}
                        </LinearGradient>
                    </ImageBackground>
                ) : (
                    <LinearGradient
                        colors={[`${t.colors.primary}40`, t.colors.background]}
                        style={[styles.gradient, { borderRadius: 24 }]}
                    >
                        {renderThemeContent()}
                    </LinearGradient>
                )}
            </TouchableOpacity>

            {/* Composer Spotlights - Enhanced */}
            {composerSpotlights.length > 0 && (
                <View style={styles.spotlightsRow}>
                    {composerSpotlights.map((composer, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.composerCard}
                            onPress={composer.onPress}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[
                                    index === 0 ? `${t.colors.primary}20` : `${t.colors.accent}20`,
                                    cardBgColor,
                                    cardBgColor,
                                ]}
                                locations={[0, 0.4, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.composerGradient}
                            >
                                {/* Decorative circles */}
                                <View style={[
                                    styles.decorativeCircleLarge,
                                    { borderColor: index === 0 ? `${t.colors.primary}15` : `${t.colors.accent}15` }
                                ]} />
                                <View style={[
                                    styles.decorativeCircleSmall,
                                    { backgroundColor: index === 0 ? `${t.colors.primary}10` : `${t.colors.accent}10` }
                                ]} />

                                {/* Icon badge */}
                                <View style={[
                                    styles.composerIcon,
                                    { backgroundColor: index === 0 ? `${t.colors.primary}25` : `${t.colors.accent}25` }
                                ]}>
                                    <Ionicons
                                        name={index === 0 ? 'musical-notes' : 'radio'}
                                        size={16}
                                        color={index === 0 ? t.colors.primary : t.colors.accent}
                                    />
                                </View>

                                {/* Label */}
                                <Tiny
                                    color={index === 0 ? t.colors.primary : t.colors.accent}
                                    weight="bold"
                                    style={styles.composerLabel}
                                >
                                    {index === 0 ? 'COMPOSER' : 'CONDUCTOR'}
                                </Tiny>

                                {/* Name with underline */}
                                <View style={styles.composerNameContainer}>
                                    <Label color={t.colors.text} weight="bold" style={styles.composerName}>
                                        {composer.name}
                                    </Label>
                                    <LinearGradient
                                        colors={[
                                            index === 0 ? t.colors.primary : t.colors.accent,
                                            'transparent'
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.composerUnderline}
                                    />
                                </View>

                                <BodySmall color={t.colors.textMuted} style={styles.composerSubtitle}>
                                    {composer.subtitle}
                                </BodySmall>

                                {/* Arrow */}
                                <View style={[
                                    styles.composerArrow,
                                    { backgroundColor: index === 0 ? `${t.colors.primary}15` : `${t.colors.accent}15` }
                                ]}>
                                    <Ionicons
                                        name="arrow-forward"
                                        size={14}
                                        color={index === 0 ? t.colors.primary : t.colors.accent}
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    function renderThemeContent() {
        return (
            <View style={styles.themeContent}>
                <View style={[styles.themeBadge, { backgroundColor: t.colors.primary }]}>
                    <Tiny color="#FFFFFF" weight="bold" style={styles.themeBadgeText}>
                        {monthLabel}
                    </Tiny>
                </View>
                <Display1 color="#FFFFFF" italic style={styles.themeTitle}>
                    {title}
                </Display1>
                {description && (
                    <BodySmall color="rgba(255,255,255,0.75)" style={styles.themeDescription}>
                        {description}
                    </BodySmall>
                )}
                <EnhancedButton
                    title="EXPLORE"
                    onPress={onExplorePress}
                    variant="ghost"
                    size="small"
                    icon="arrow-forward"
                    iconPosition="right"
                    style={styles.exploreButton}
                    textStyle={styles.exploreText}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sparkleIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionLabel: {
        letterSpacing: 2,
    },
    themeCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
    },
    imageBackground: {
        width: '100%',
        height: 240,
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    themeContent: {
        padding: 24,
    },
    themeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 14,
    },
    themeBadgeText: {
        letterSpacing: 1.5,
    },
    themeTitle: {
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    themeDescription: {
        marginBottom: 20,
    },
    exploreButton: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1,
    },
    exploreText: {
        color: '#FFFFFF',
        letterSpacing: 1.5,
    },
    spotlightsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    composerCard: {
        flex: 1,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    composerGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircleLarge: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
    },
    decorativeCircleSmall: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    composerIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    composerLabel: {
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    composerNameContainer: {
        marginBottom: 4,
    },
    composerName: {
        letterSpacing: -0.3,
    },
    composerUnderline: {
        height: 2,
        width: '60%',
        marginTop: 4,
        borderRadius: 1,
    },
    composerSubtitle: {
        marginTop: 2,
    },
    composerArrow: {
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
