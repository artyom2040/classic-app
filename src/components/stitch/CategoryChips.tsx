/**
 * CategoryChips - Horizontal scrolling filter chips
 * Inspired by Google Stitch design
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ChipItem {
    id: string;
    label: string;
}

interface CategoryChipsProps {
    items: ChipItem[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    style?: ViewStyle;
    showAll?: boolean;
    allLabel?: string;
}

export function CategoryChips({
    items,
    selectedId,
    onSelect,
    style,
    showAll = true,
    allLabel = 'All',
}: CategoryChipsProps) {
    const { theme, themeName, isDark } = useTheme();
    const isStitch = isDark;

    const allItems = showAll
        ? [{ id: 'all', label: allLabel }, ...items]
        : items;

    const effectiveSelected = selectedId || (showAll ? 'all' : items[0]?.id);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.container, style]}
        >
            {allItems.map((item) => {
                const isSelected = item.id === effectiveSelected;

                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onSelect?.(item.id)}
                        activeOpacity={0.7}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isSelected
                                    ? theme.colors.primary
                                    : isStitch
                                        ? theme.colors.surface
                                        : theme.colors.surfaceLight,
                                borderColor: isSelected
                                    ? 'transparent'
                                    : theme.colors.border,
                            },
                            isSelected && isStitch && {
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                {
                                    color: isSelected
                                        ? '#FFFFFF'
                                        : theme.colors.textSecondary,
                                    fontWeight: isSelected ? '700' : '500',
                                },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24, // px-6 from reference
        paddingVertical: 8,
        gap: 12, // gap-3 from reference
    },
    chip: {
        height: 36, // h-9 from reference
        paddingHorizontal: 20, // px-5 from reference
        borderRadius: 9999, // rounded-full from reference
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 11, // text-xs from reference
        textTransform: 'uppercase',
        letterSpacing: 1, // tracking-wider from reference
    },
});
