/**
 * FormCard - Visual card for musical forms
 * Part of the design-system organisms
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { ERA_IMAGES } from '../../utils/images';
import { H3, BodySmall, Label } from '../atoms/Typography';

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
                            <Label color="#FFFFFF" weight="medium">{badge}</Label>
                        </View>
                    )}
                </ImageBackground>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <H3 color="#FFFFFF" numberOfLines={1} style={styles.title}>{name}</H3>
                    <Ionicons name="arrow-forward" size={20} color="#5417cf" />
                </View>
                <BodySmall color="rgba(255, 255, 255, 0.5)" italic numberOfLines={2}>
                    {description}
                </BodySmall>
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
        flex: 1,
    },
});
