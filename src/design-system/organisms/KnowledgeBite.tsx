/**
 * KnowledgeBite - Knowledge/Term of the Day Card
 * Split layout with visual on left, content on right
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
import { H3, Body, Label, Tiny, BodySmall } from '../atoms/Typography';

interface KnowledgeBiteProps {
    label: string; // e.g., "TERM OF THE DAY"
    title: string;
    description: string;
    imageSource?: ImageSourcePropType;
    onPress?: () => void;
    showArchiveLink?: boolean;
    onArchivePress?: () => void;
}

export function KnowledgeBite({
    label,
    title,
    description,
    imageSource,
    onPress,
    showArchiveLink = true,
    onArchivePress,
}: KnowledgeBiteProps) {
    const { theme, isDark } = useTheme();

    if (!isDark) return null;

    return (
        <View>
            {/* Header with title and archive link */}
            <View style={styles.header}>
                <H3 color={theme.colors.text}>Knowledge Bite</H3>
                {showArchiveLink && (
                    <TouchableOpacity onPress={onArchivePress}>
                        <Tiny color={theme.colors.primary} weight="medium" style={styles.archiveLink}>
                            View Archive
                        </Tiny>
                    </TouchableOpacity>
                )}
            </View>

            {/* Knowledge Bite Card */}
            <TouchableOpacity
                style={[styles.card, { borderColor: theme.colors.borderLight }]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {/* Left: Visual (1/3 width) */}
                <View style={styles.visual}>
                    {imageSource ? (
                        <ImageBackground
                            source={imageSource}
                            style={styles.imageBackground}
                            imageStyle={styles.image}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={[
                                    'rgba(84, 23, 207, 0.1)',
                                    'rgba(84, 23, 207, 0.4)',
                                    'rgba(38, 30, 53, 0.8)',
                                ]}
                                locations={[0, 0.5, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.overlay}
                            >
                                <Ionicons
                                    name="musical-notes"
                                    size={28}
                                    color="rgba(255,255,255,0.9)"
                                />
                            </LinearGradient>
                        </ImageBackground>
                    ) : (
                        <LinearGradient
                            colors={[
                                'rgba(84, 23, 207, 0.2)',
                                'rgba(84, 23, 207, 0.1)',
                                'rgba(38, 30, 53, 0.6)',
                            ]}
                            style={styles.overlay}
                        >
                            <Ionicons
                                name="musical-notes"
                                size={28}
                                color="rgba(255,255,255,0.9)"
                            />
                        </LinearGradient>
                    )}
                </View>

                {/* Right: Content (2/3 width) */}
                <View style={styles.content}>
                    <Tiny color={theme.colors.textSecondary} weight="medium" style={styles.label}>
                        {label}
                    </Tiny>
                    <H3 color={theme.colors.text} style={styles.title}>{title}</H3>
                    <BodySmall color="rgba(255,255,255,0.6)" numberOfLines={2} style={styles.description}>
                        {description}
                    </BodySmall>
                    <View style={styles.link}>
                        <Label color={theme.colors.primary} weight="bold">Reveal & Listen</Label>
                        <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    archiveLink: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#261e35',
        borderWidth: 1,
        marginBottom: 24,
    },
    visual: {
        width: '33%',
        minHeight: 140,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageBackground: {
        flex: 1,
        width: '100%',
    },
    image: {
        opacity: 0.7,
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 16,
        paddingLeft: 20,
        justifyContent: 'center',
    },
    label: {
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        marginBottom: 6,
    },
    description: {
        lineHeight: 18,
        marginBottom: 10,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
