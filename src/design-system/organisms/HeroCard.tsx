/**
 * HeroCard - Large hero card with background image and gradient overlay
 * Part of the design-system organisms
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    ImageBackground,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Display1, H3, Body, Label, ButtonText } from '../atoms/Typography';

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
    const { theme, isDark } = useTheme();

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
                    {/* Gradient Overlay */}
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
                                        backgroundColor: `${theme.colors.primary}E6`,
                                        borderRadius: 10,
                                    },
                                ]}
                            >
                                <Label color="#FFFFFF" weight="bold" style={styles.badgeText}>
                                    {badge}
                                </Label>
                            </View>
                        )}

                        {/* Title & Description */}
                        <Display1 color="#FFFFFF" style={styles.title}>
                            {title}
                        </Display1>
                        {subtitle && (
                            <Body color={theme.colors.textSecondary}>{subtitle}</Body>
                        )}
                        {description && (
                            <Body color="#e5e7eb" numberOfLines={2} style={styles.description}>
                                {description}
                            </Body>
                        )}

                        {/* Actions */}
                        <View style={styles.actions}>
                            {onPress && (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#FFFFFF' }]}
                                    onPress={onPress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name={actionIcon} size={20} color={theme.colors.background} />
                                    <ButtonText color={theme.colors.background}>{actionLabel}</ButtonText>
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
                            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                                <Label color="#FFFFFF" weight="bold" style={styles.badgeText}>
                                    {badge}
                                </Label>
                            </View>
                        )}
                        <Display1 color="#FFFFFF" style={styles.title}>{title}</Display1>
                        {subtitle && (
                            <Body color={theme.colors.textSecondary}>{subtitle}</Body>
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
        opacity: 0.6,
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    contentContainer: {
        padding: 24,
        paddingTop: 0,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    title: {
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    description: {
        lineHeight: 24,
        marginBottom: 24,
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
    bookmarkButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
