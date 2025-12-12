/**
 * FloatingTabBar - Floating bottom navigation bar
 * Inspired by Google Stitch design
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface TabItem {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconFilled?: keyof typeof Ionicons.glyphMap;
}

interface FloatingTabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabPress: (tabName: string) => void;
}

export function FloatingTabBar({
    tabs,
    activeTab,
    onTabPress,
}: FloatingTabBarProps) {
    const { theme, themeName, isDark } = useTheme();
    const isStitch = isDark;
    const isGlass = false;

    // Use standard tab bar for non-Stitch themes
    if (!isStitch && !isGlass) {
        return (
            <View
                style={[
                    styles.standardContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopColor: theme.colors.border,
                    },
                ]}
            >
                {tabs.map((tab) => {
                    const isActive = tab.name === activeTab;
                    const iconName = isActive && tab.iconFilled ? tab.iconFilled : tab.icon;

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.tab}
                            onPress={() => onTabPress(tab.name)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isActive ? theme.colors.primary : theme.colors.textMuted}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: isActive ? theme.colors.primary : theme.colors.textMuted },
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    // Floating tab bar for Stitch and Glass themes
    return (
        <View style={styles.floatingWrapper}>
            <View
                style={[
                    styles.floatingContainer,
                    {
                        backgroundColor: isStitch
                            ? `${theme.colors.surface}CC`
                            : 'rgba(255, 255, 255, 0.8)',
                        borderColor: theme.colors.border,
                    },
                    isStitch && {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 24,
                        elevation: 12,
                    },
                ]}
            >
                {Platform.OS === 'ios' && isGlass && (
                    <BlurView
                        intensity={80}
                        tint="light"
                        style={StyleSheet.absoluteFill}
                    />
                )}

                <View style={styles.tabsRow}>
                    {tabs.map((tab) => {
                        const isActive = tab.name === activeTab;
                        const iconName = isActive && tab.iconFilled ? tab.iconFilled : tab.icon;

                        return (
                            <TouchableOpacity
                                key={tab.name}
                                style={styles.floatingTab}
                                onPress={() => onTabPress(tab.name)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={
                                        isActive
                                            ? theme.colors.primary
                                            : isStitch
                                                ? 'rgba(255, 255, 255, 0.5)'
                                                : theme.colors.textMuted
                                    }
                                />
                                <Text
                                    style={[
                                        styles.floatingTabLabel,
                                        {
                                            color: isActive
                                                ? theme.colors.primary
                                                : isStitch
                                                    ? 'rgba(255, 255, 255, 0.5)'
                                                    : theme.colors.textMuted,
                                            fontWeight: isActive ? '700' : '500',
                                        },
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Standard tab bar styles
    standardContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingHorizontal: 16,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
    },

    // Floating tab bar styles
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
    },
    tabsRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    floatingTab: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    floatingTabLabel: {
        fontSize: 10,
    },
});
