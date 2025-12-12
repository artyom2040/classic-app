/**
 * FormCard - Visual card for musical forms
 * Inspired by stitch artful_form_explorer reference
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { ERA_IMAGES } from '../../utils/images';

interface FormCardProps {
    id: string;
    name: string;
    description: string;
    badge?: string;
    imageKey?: keyof typeof ERA_IMAGES;
    onPress: () => void;
    style?: ViewStyle;
}

export function FormCard({
    id,
    name,
    description,
    badge,
    imageKey = 'baroque',
    onPress,
    style,
}: FormCardProps) {
    const { theme } = useTheme();

    const imageSource = ERA_IMAGES[imageKey] || ERA_IMAGES.baroque;

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image Area */}
            <View style={styles.imageContainer}>
                <ImageBackground
                    source={imageSource}
                    style={styles.image}
                    imageStyle={{ opacity: 0.8 }}
                    resizeMode="cover"
                >
                    {/* Purple overlay */}
                    <LinearGradient
                        colors={['rgba(89, 13, 242, 0.1)', 'transparent']}
                        style={styles.overlay}
                    />

                    {/* Badge */}
                    {badge && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    )}
                </ImageBackground>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>{name}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#5417cf" />
                </View>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 288,
        borderRadius: 16,
        backgroundColor: '#231b33',
        overflow: 'hidden',
    },
    imageContainer: {
        aspectRatio: 4 / 3,
        backgroundColor: '#1a1428',
    },
    image: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    content: {
        padding: 20,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
    },
    description: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 20,
    },
});
