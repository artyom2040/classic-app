/**
 * KickstartHeroCard - Large hero card for 5-Day Kickstart with progress
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
import { MiniProgressRing } from '../molecules/ProgressRing';
import { H2, Body, Label, Tiny } from '../atoms/Typography';
import { EnhancedButton } from '../atoms/Button';

interface KickstartHeroCardProps {
    currentDay: number; // 0-5, 0 means not started
    totalDays?: number;
    title: string;
    subtitle: string;
    timeRemaining?: string; // e.g., "15 mins left"
    imageSource?: ImageSourcePropType;
    onPress: () => void;
    isCompleted?: boolean;
}

export function KickstartHeroCard({
    currentDay,
    totalDays = 5,
    title,
    subtitle,
    timeRemaining = '15 mins',
    imageSource,
    onPress,
    isCompleted = false,
}: KickstartHeroCardProps) {
    const { theme, isDark } = useTheme();
    const t = theme;

    const displayDay = isCompleted ? totalDays : Math.min(currentDay + 1, totalDays);
    const progressPercent = isCompleted ? 100 : Math.round((currentDay / totalDays) * 100);

    const buttonLabel = isCompleted
        ? 'Review Course'
        : currentDay === 0
            ? 'Start Now'
            : 'Resume Session';

    // Theme-adaptive gradient overlays
    const imageOverlay: [string, string, string] = isDark
        ? ['rgba(22, 17, 33, 0.3)', 'rgba(22, 17, 33, 0.7)', '#161121']
        : ['rgba(250, 250, 250, 0.1)', 'rgba(250, 250, 250, 0.6)', '#FAFAFA'];

    const textColor = isDark ? '#FFFFFF' : t.colors.text;
    const mutedTextColor = isDark ? 'rgba(255,255,255,0.7)' : t.colors.textSecondary;
    const dimTextColor = isDark ? 'rgba(255,255,255,0.6)' : t.colors.textMuted;

    const content = (
        <View style={styles.content}>
            {/* Top badges row */}
            <View style={styles.badgeRow}>
                <View style={[styles.dayBadge, { backgroundColor: t.colors.primary }]}>
                    <Tiny color="#FFFFFF" weight="bold" style={styles.dayBadgeText}>
                        DAY {displayDay} OF {totalDays}
                    </Tiny>
                </View>
                {timeRemaining && !isCompleted && (
                    <View style={[styles.timeBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : t.colors.surfaceLight }]}>
                        <Ionicons name="time-outline" size={12} color={mutedTextColor} />
                        <Tiny color={mutedTextColor}>{timeRemaining}</Tiny>
                    </View>
                )}
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleSection}>
                <H2 color={textColor}>{title}</H2>
                <Body color={mutedTextColor} style={styles.subtitle}>{subtitle}</Body>
            </View>

            {/* Progress Section with Ring + Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressSectionInner}>
                    <MiniProgressRing
                        progress={progressPercent}
                        size={52}
                        strokeWidth={5}
                        color={t.colors.primary}
                    />

                    <View style={styles.progressBarSection}>
                        <View style={styles.progressRow}>
                            <Label color={dimTextColor}>5-Day Kickstart</Label>
                            <Label color={mutedTextColor} weight="bold">{progressPercent}%</Label>
                        </View>
                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : t.colors.surfaceLight }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${progressPercent}%`,
                                        backgroundColor: t.colors.primary,
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* CTA Button */}
            <EnhancedButton
                title={buttonLabel}
                onPress={onPress}
                variant="primary"
                icon={isCompleted ? 'checkmark-circle' : 'play'}
                fullWidth
                style={styles.ctaButton}
            />
        </View>
    );

    return (
        <TouchableOpacity
            style={[styles.container, { borderRadius: t.borderRadius.xl }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {imageSource ? (
                <ImageBackground
                    source={imageSource}
                    style={styles.imageBackground}
                    imageStyle={{ borderRadius: t.borderRadius.xl }}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={imageOverlay}
                        locations={[0, 0.5, 1]}
                        style={[styles.gradient, { borderRadius: t.borderRadius.xl }]}
                    >
                        {content}
                    </LinearGradient>
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={[t.colors.gradientStart, t.colors.gradientEnd]}
                    style={[styles.gradient, { borderRadius: t.borderRadius.xl }]}
                >
                    {content}
                </LinearGradient>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        marginBottom: 24,
    },
    imageBackground: {
        width: '100%',
        minHeight: 300,
    },
    gradient: {
        flex: 1,
        minHeight: 300,
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dayBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    dayBadgeText: {
        letterSpacing: 1,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    titleSection: {
        marginTop: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    progressSection: {
        marginTop: 20,
    },
    progressSectionInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    progressBarSection: {
        flex: 1,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    ctaButton: {
        marginTop: 20,
    },
});
