/**
 * ScreenHeader
 * Unified header component with back navigation
 * - Back button (always on web, conditional on mobile)
 * - Title
 * - Optional right actions
 * - Consistent styling
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../theme';

interface ScreenHeaderProps {
    /** Screen title */
    title: string;
    /** Show back button - defaults to true on web, canGoBack on mobile */
    showBack?: boolean;
    /** Custom back action */
    onBack?: () => void;
    /** Right side action component */
    rightAction?: React.ReactNode;
    /** Show border at bottom */
    bordered?: boolean;
    /** Additional style */
    style?: ViewStyle;
    /** Large title style */
    large?: boolean;
    /** Subtitle text */
    subtitle?: string;
    /** Badge next to title (e.g., "Labs") */
    badge?: { text: string; color: string };
    /** Transparent background (for overlay headers) */
    transparent?: boolean;
}

export function ScreenHeader({
    title,
    showBack,
    onBack,
    rightAction,
    bordered = false,
    style,
    large = false,
    subtitle,
    badge,
    transparent = false,
}: ScreenHeaderProps) {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const t = theme;

    // Default: show back on web always, on mobile only if can go back
    const canGoBack = navigation.canGoBack();
    const shouldShowBack = showBack !== undefined
        ? showBack
        : Platform.OS === 'web' || canGoBack;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (canGoBack) {
            navigation.goBack();
        }
    };

    return (
        <View style={[
            styles.header,
            bordered && { borderBottomWidth: 1, borderBottomColor: t.colors.border },
            style,
        ]}>
            {/* Left: Back button or spacer */}
            {shouldShowBack ? (
                <TouchableOpacity
                    style={[
                        styles.backButton,
                        { backgroundColor: transparent ? 'rgba(255,255,255,0.1)' : t.colors.surfaceLight }
                    ]}
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    accessibilityHint="Returns to the previous screen"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}

            {/* Center: Title */}
            <View style={styles.titleContainer}>
                <View style={styles.titleRow}>
                    <Text
                        style={[
                            large ? styles.titleLarge : styles.title,
                            { color: t.colors.text },
                        ]}
                        numberOfLines={1}
                        accessibilityRole="header"
                    >
                        {title}
                    </Text>
                    {badge && (
                        <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
                            <Text style={[styles.badgeText, { color: badge.color }]}>
                                {badge.text}
                            </Text>
                        </View>
                    )}
                </View>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Right: Action or spacer */}
            {rightAction ? (
                <View style={styles.rightAction}>{rightAction}</View>
            ) : (
                <View style={styles.spacer} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        width: 40,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    titleLarge: {
        fontSize: fontSize.xl,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    rightAction: {
        width: 40,
        alignItems: 'flex-end',
    },
});
