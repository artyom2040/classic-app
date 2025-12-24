/**
 * KickstartHeroCard - Large hero card for 5-Day Kickstart with progress
 * Based on friend's design mockups
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { MiniProgressRing } from '../../design-system';

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
                        {renderContent()}
                    </LinearGradient>
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={[t.colors.gradientStart, t.colors.gradientEnd]}
                    style={[styles.gradient, { borderRadius: t.borderRadius.xl }]}
                >
                    {renderContent()}
                </LinearGradient>
            )}
        </TouchableOpacity>
    );

    function renderContent() {
        return (
            <View style={styles.content}>
                {/* Top badges row */}
                <View style={styles.badgeRow}>
                    <View style={[styles.dayBadge, { backgroundColor: t.colors.primary }]}>
                        <Text style={styles.dayBadgeText}>
                            DAY {displayDay} OF {totalDays}
                        </Text>
                    </View>
                    {timeRemaining && !isCompleted && (
                        <View style={[styles.timeBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : t.colors.surfaceLight }]}>
                            <Ionicons name="time-outline" size={12} color={mutedTextColor} />
                            <Text style={[styles.timeText, { color: mutedTextColor }]}>{timeRemaining}</Text>
                        </View>
                    )}
                </View>

                {/* Title & Subtitle */}
                <View style={styles.titleSection}>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                    <Text style={[styles.subtitle, { color: mutedTextColor }]}>{subtitle}</Text>
                </View>

                {/* Progress Section with Ring + Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressSectionInner}>
                        {/* Mini Progress Ring */}
                        <MiniProgressRing
                            progress={progressPercent}
                            size={52}
                            strokeWidth={5}
                            color={t.colors.primary}
                        />

                        {/* Progress bar and labels */}
                        <View style={styles.progressBarSection}>
                            <View style={styles.progressRow}>
                                <Text style={[styles.progressLabel, { color: dimTextColor }]}>5-Day Kickstart</Text>
                                <Text style={[styles.progressPercent, { color: mutedTextColor }]}>{progressPercent}%</Text>
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
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: t.colors.primary }]}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isCompleted ? 'checkmark-circle' : 'play'}
                        size={18}
                        color="#FFFFFF"
                    />
                    <Text style={styles.ctaText}>{buttonLabel}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        marginBottom: 24,
    },
    imageBackground: {
        width: '100%',
        minHeight: 280,
    },
    gradient: {
        flex: 1,
        minHeight: 280,
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
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    timeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '500',
    },
    titleSection: {
        marginTop: 16,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        lineHeight: 20,
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
    progressLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '500',
    },
    progressPercent: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 20,
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
