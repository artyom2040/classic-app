/**
 * SpotlightCard - Card for monthly spotlight carousel
 * Tall card with image overlay and gradient
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
import { H3, Caption } from '../atoms/Typography';

interface SpotlightCardProps {
    title: string;
    subtitle?: string;
    imageSource?: ImageSourcePropType;
    imageUri?: string;
    onPress?: () => void;
    showPlayIcon?: boolean;
}

export function SpotlightCard({
    title,
    subtitle,
    imageSource,
    imageUri,
    onPress,
    showPlayIcon = true,
}: SpotlightCardProps) {
    const { theme, isDark } = useTheme();

    if (!isDark) return null;

    const backgroundSource = imageSource || (imageUri ? { uri: imageUri } : undefined);

    const content = (
        <View style={[styles.container, theme.shadows.md]}>
            {backgroundSource ? (
                <ImageBackground
                    source={backgroundSource}
                    style={styles.imageBackground}
                    imageStyle={styles.image}
                    resizeMode="cover"
                >
                    {/* Gradient overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.8)']}
                        locations={[0, 0.5, 1]}
                        style={styles.gradient}
                    >
                        {/* Play button */}
                        {showPlayIcon && (
                            <View style={styles.playButtonWrapper}>
                                <View style={styles.playButton}>
                                    <Ionicons name="play" size={20} color="#FFFFFF" />
                                </View>
                            </View>
                        )}

                        {/* Bottom text content */}
                        <View style={styles.textContent}>
                            <H3 color="#FFFFFF" numberOfLines={2}>{title}</H3>
                            {subtitle && (
                                <Caption color="rgba(255, 255, 255, 0.7)" numberOfLines={1}>
                                    {subtitle}
                                </Caption>
                            )}
                        </View>
                    </LinearGradient>
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={['#2d2442', '#221a32']}
                    style={[styles.imageBackground, styles.fallback]}
                >
                    {/* Play button */}
                    {showPlayIcon && (
                        <View style={styles.playButtonWrapper}>
                            <View style={styles.playButton}>
                                <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                            </View>
                        </View>
                    )}

                    {/* Bottom text content */}
                    <View style={styles.textContent}>
                        <H3 color="#FFFFFF" numberOfLines={2}>{title}</H3>
                        {subtitle && (
                            <Caption color="rgba(255, 255, 255, 0.7)" numberOfLines={1}>
                                {subtitle}
                            </Caption>
                        )}
                    </View>
                </LinearGradient>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
    wrapper: {
        width: 280,
        height: 360,
    },
    container: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#221a32',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'space-between',
    },
    image: {
        opacity: 0.8,
    },
    fallback: {
        justifyContent: 'space-between',
        padding: 20,
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    playButtonWrapper: {
        alignItems: 'flex-start',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContent: {
        gap: 4,
    },
});
