/**
 * ExpandableAccordion - Expandable/collapsible term cards
 * Part of the design-system molecules
 */
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { H3, Body, Tiny } from '../atoms/Typography';

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
    const { theme, isDark } = useTheme();
    const [expanded, setExpanded] = useState(initialExpanded);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const effectiveBadgeColor = badgeColor || theme.colors.primary;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.lg,
                },
                isDark && {
                    borderLeftWidth: 3,
                    borderLeftColor: expanded ? theme.colors.primary : 'transparent',
                },
                theme.shadows.sm,
            ]}
        >
            <TouchableOpacity
                style={styles.header}
                onPress={onPress || toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <H3 color={theme.colors.text}>{title}</H3>
                        {badge && (
                            <View
                                style={[
                                    styles.badge,
                                    { backgroundColor: effectiveBadgeColor + '20' },
                                ]}
                            >
                                <Tiny color={effectiveBadgeColor} weight="semibold">
                                    {badge}
                                </Tiny>
                            </View>
                        )}
                    </View>
                    {subtitle && !expanded && (
                        <Body
                            color={theme.colors.textSecondary}
                            numberOfLines={2}
                            style={styles.subtitle}
                        >
                            {subtitle}
                        </Body>
                    )}
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.textMuted}
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
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    subtitle: {
        marginTop: 4,
        lineHeight: 20,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
});
