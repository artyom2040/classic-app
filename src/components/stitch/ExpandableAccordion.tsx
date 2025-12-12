/**
 * ExpandableAccordion - Expandable/collapsible term cards
 * Inspired by Google Stitch glossary design
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: string;
    children: React.ReactNode;
    initialExpanded?: boolean;
    onPress?: () => void;
}

export function ExpandableAccordion({
    title,
    subtitle,
    badge,
    badgeColor,
    children,
    initialExpanded = false,
    onPress,
}: AccordionItemProps) {
    const { theme, themeName } = useTheme();
    const t = theme;
    const isStitch = themeName === 'stitch';
    const [expanded, setExpanded] = useState(initialExpanded);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: t.colors.surface,
                    borderRadius: t.borderRadius.lg,
                },
                isStitch && {
                    borderLeftWidth: 3,
                    borderLeftColor: expanded ? t.colors.primary : 'transparent',
                },
                t.shadows.sm,
            ]}
        >
            <TouchableOpacity
                style={styles.header}
                onPress={onPress || toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: t.colors.text }]}>{title}</Text>
                        {badge && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: (badgeColor || t.colors.primary) + '20' },
                                ]}
                            >
                                <Text
                                    style={[styles.badgeText, { color: badgeColor || t.colors.primary }]}
                                >
                                    {badge}
                                </Text>
                            </View>
                        )}
                    </View>
                    {subtitle && !expanded && (
                        <Text
                            style={[styles.subtitle, { color: t.colors.textSecondary }]}
                            numberOfLines={2}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={t.colors.textMuted}
                />
            </TouchableOpacity>

            {expanded && <View style={styles.content}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    headerContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        lineHeight: 20,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
});
