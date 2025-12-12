/**
 * DailyMixGrid - 2x2 grid for quick access to main features
 * Enhanced with gradients and visual polish
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DailyMixItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconFilled: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle: string;
    color: string;
    gradientColors: [string, string];
    screen: 'Quiz' | 'Timeline' | 'MonthlySpotlight' | 'Badges';
}

interface DailyMixGridProps {
    badgesCount?: number;
}

export function DailyMixGrid({ badgesCount = 0 }: DailyMixGridProps) {
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const t = theme;

    const items: DailyMixItem[] = [
        {
            id: 'quiz',
            icon: 'help-circle-outline',
            iconFilled: 'help-circle',
            label: 'Daily Quiz',
            subtitle: 'Test your ear',
            color: t.colors.primary,
            gradientColors: [`${t.colors.primary}25`, `${t.colors.primary}05`],
            screen: 'Quiz',
        },
        {
            id: 'timeline',
            icon: 'time-outline',
            iconFilled: 'time',
            label: 'Timeline',
            subtitle: 'Baroque to Now',
            color: '#6B8E23',
            gradientColors: ['#6B8E2325', '#6B8E2305'],
            screen: 'Timeline' as any,
        },
        {
            id: 'spotlight',
            icon: 'star-outline',
            iconFilled: 'star',
            label: 'Spotlight',
            subtitle: 'Hidden Gems',
            color: t.colors.warning,
            gradientColors: [`${t.colors.warning}25`, `${t.colors.warning}05`],
            screen: 'MonthlySpotlight',
        },
        {
            id: 'badges',
            icon: 'ribbon-outline',
            iconFilled: 'ribbon',
            label: 'Badges',
            subtitle: badgesCount > 0 ? `${badgesCount} Earned` : 'Achievements',
            color: '#EC4899',
            gradientColors: ['#EC489925', '#EC489905'],
            screen: 'Badges',
        },
    ];

    const handlePress = (item: DailyMixItem) => {
        if (item.id === 'timeline') {
            (navigation as any).navigate('MainTabs', { screen: 'Timeline' });
        } else {
            (navigation as any).navigate(item.screen);
        }
    };

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: t.colors.text }]}>Daily Mix</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={t.colors.textMuted} />
                </TouchableOpacity>
            </View>

            {/* 2x2 Grid */}
            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.cardWrapper}
                        onPress={() => handlePress(item)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={item.gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.card,
                                { borderColor: `${item.color}20` },
                            ]}
                        >
                            {/* Decorative element */}
                            <View style={[styles.decorativeDot, { backgroundColor: `${item.color}15` }]} />

                            {/* Icon with glow effect */}
                            <View style={styles.iconWrapper}>
                                <View style={[styles.iconGlow, { backgroundColor: `${item.color}30` }]} />
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}25` }]}>
                                    <Ionicons name={item.iconFilled} size={24} color={item.color} />
                                </View>
                            </View>

                            {/* Text content */}
                            <Text style={[styles.label, { color: t.colors.text }]}>{item.label}</Text>
                            <Text style={[styles.subtitle, { color: t.colors.textMuted }]}>{item.subtitle}</Text>

                            {/* Arrow indicator */}
                            <View style={[styles.arrowContainer, { backgroundColor: `${item.color}15` }]}>
                                <Ionicons name="chevron-forward" size={14} color={item.color} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    moreButton: {
        padding: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cardWrapper: {
        width: '48%',
        flexGrow: 1,
    },
    card: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 140,
    },
    decorativeDot: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: 14,
    },
    iconGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 56,
        height: 56,
        borderRadius: 16,
        opacity: 0.5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        opacity: 0.8,
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 14,
        right: 14,
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
