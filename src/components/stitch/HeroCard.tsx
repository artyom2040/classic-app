/**
 * HeroCard - Large hero card with background image and gradient overlay
 * Inspired by Google Stitch design
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    ImageBackground,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface HeroCardProps {
    title: string;
    subtitle?: string;
    description?: string;
    badge?: string;
    imageSource?: ImageSourcePropType;
    imageUri?: string;
    onPress?: () => void;
    onBookmark?: () => void;
    actionLabel?: string;
    actionIcon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    height?: number;
}

export function HeroCard({
    title,
    subtitle,
    description,
    badge,
    imageSource,
    imageUri,
    onPress,
    onBookmark,
    actionLabel = 'Explore',
    actionIcon = 'play',
    style,
    height = 300,
}: HeroCardProps) {
    const { theme, themeName, isDark } = useTheme();
    const isStitch = isDark;

    const backgroundSource = imageSource || (imageUri ? { uri: imageUri } : undefined);

    const content = (
        <View
            style={[
                styles.container,
                {
                    height,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.xl,
                },
                theme.shadows.lg,
                style,
            ]}
        >
            {/* Background Image Layer */}
            {backgroundSource ? (
                <ImageBackground
                    source={backgroundSource}
                    style={styles.imageBackground}
                    imageStyle={[styles.image, { borderRadius: theme.borderRadius.xl }]}
                    resizeMode="cover"
                >
                    {/* Gradient Overlay - matching reference: from-background-dark via-background-dark/40 to-transparent */}
                    <LinearGradient
                        colors={['transparent', 'rgba(22, 17, 33, 0.4)', '#161121']}
                        locations={[0, 0.35, 1]}
                        style={[styles.gradient, { borderRadius: theme.borderRadius.xl }]}
                    />

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        {/* Badge */}
                        {badge && (
                            <View
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor: isStitch
                                            ? `${theme.colors.primary}E6`
                                            : theme.colors.primary,
                                        borderRadius: isStitch ? 10 : 8,
                                    },
                                ]}
                            >
                                <Text style={[styles.badgeText, isStitch && styles.badgeTextStitch]}>
                                    {badge}
                                </Text>
                            </View>
                        )}

                        {/* Title & Description */}
                        <Text style={[styles.title, { fontSize: theme.typography.sizes.xxl }]}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                {subtitle}
                            </Text>
                        )}
                        {description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {description}
                            </Text>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                            {onPress && (
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        { backgroundColor: '#FFFFFF' },
                                    ]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name={actionIcon} size={20} color={theme.colors.background} />
                                    <Text style={[styles.actionText, { color: theme.colors.background }]}>
                                        {actionLabel}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {onBookmark && (
                                <TouchableOpacity
                                    style={styles.bookmarkButton}
                                    onPress={onBookmark}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ImageBackground>
            ) : (
                /* Fallback without image */
                <LinearGradient
                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                    style={[styles.gradient, { borderRadius: theme.borderRadius.xl }]}
                >
                    <View style={styles.contentContainer}>
                        {badge && (
                            <View
                                style={[styles.badge, { backgroundColor: theme.colors.primary }]}
                            >
                                <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                        )}
                        <Text style={[styles.title, { fontSize: theme.typography.sizes.xxl }]}>
                            {title}
                        </Text>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            )}
        </View>
    );

    if (onPress && !backgroundSource) {
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    image: {
        opacity: 0.6, // Reference: opacity-60
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    contentContainer: {
        padding: 24, // Reference: p-6
        paddingTop: 0, // Content at bottom due to gradient
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12, // Reference: px-3
        paddingVertical: 4, // Reference: py-1
        borderRadius: 8, // Reference: rounded-lg
        marginBottom: 8, // Reference: mb-2
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10, // Reference: text-[10px]
        fontWeight: '700', // Reference: font-bold
        textTransform: 'uppercase',
        letterSpacing: 3, // Reference: tracking-widest
    },
    badgeTextStitch: {
        letterSpacing: 3,
        fontSize: 10,
    },
    title: {
        color: '#FFFFFF',
        fontWeight: '700', // Reference: font-bold
        marginBottom: 8, // Reference: mb-2
        letterSpacing: -0.5, // Reference: tracking-tight
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 8,
    },
    description: {
        color: '#e5e7eb', // Reference: text-gray-200
        fontSize: 16, // Reference: text-base
        fontWeight: '300', // Reference: font-light
        lineHeight: 24, // Reference: leading-relaxed
        marginBottom: 24, // Reference: mb-6
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '700',
    },
    bookmarkButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
