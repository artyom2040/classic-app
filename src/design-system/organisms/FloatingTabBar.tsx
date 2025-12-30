/**
 * FloatingTabBar - Floating bottom navigation bar with blur effect
 * Modern Telegram-style design for both light and dark modes
 * Part of the design-system organisms
 */
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Tiny } from '../atoms/Typography';

export interface TabItem {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconFilled?: keyof typeof Ionicons.glyphMap;
}

interface FloatingTabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabPress: (tabName: string) => void;
    style?: ViewStyle;
}

export function FloatingTabBar({
    tabs,
    activeTab,
    onTabPress,
    style,
}: FloatingTabBarProps) {
    const { theme, isDark } = useTheme();

    // Always use the floating blur tab bar for both themes
    return (
        <View style={[styles.floatingWrapper, style]}>
            <View
                style={[
                    styles.floatingContainer,
                    {
                        borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(90, 70, 130, 0.15)',
                        backgroundColor: Platform.OS !== 'ios' ? (isDark
                            ? 'rgba(34, 26, 50, 0.92)'
                            : 'rgba(255, 255, 255, 0.88)') : 'transparent'
                    },
                ]}
            >
                {/* Blur background - works on iOS */}
                {Platform.OS === 'ios' && (
                    <BlurView
                        intensity={isDark ? 80 : 60}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                <View style={styles.tabsRow} accessibilityRole="tablist">
                    {tabs.map((tab, index) => {
                        const isActive = tab.name === activeTab;
                        const iconName = isActive && tab.iconFilled ? tab.iconFilled : tab.icon;
                        const activeColor = theme.colors.primary;
                        const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.5)' : theme.colors.textMuted;

                        return (
                            <TouchableOpacity
                                key={tab.name}
                                style={styles.floatingTab}
                                onPress={() => onTabPress(tab.name)}
                                activeOpacity={0.7}
                                accessibilityRole="tab"
                                accessibilityLabel={tab.label}
                                accessibilityState={{ selected: isActive }}
                                accessibilityHint={`Navigate to ${tab.label} tab`}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isActive ? activeColor : inactiveColor}
                                />
                                <Tiny
                                    color={isActive ? activeColor : inactiveColor}
                                    weight={isActive ? 'bold' : 'medium'}
                                    style={styles.label}
                                >
                                    {tab.label}
                                </Tiny>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    floatingWrapper: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    floatingContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    },
    tabsRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    floatingTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 40,
    },
    label: {
        marginTop: 2,
    }
});
