/**
 * CategoryChips - Horizontal scrolling filter chips
 * Part of the design-system molecules
 */
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Tiny } from '../atoms/Typography';

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
    const { theme, isDark } = useTheme();

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
                                    : isDark
                                        ? theme.colors.surface
                                        : theme.colors.surfaceLight,
                                borderColor: isSelected
                                    ? 'transparent'
                                    : theme.colors.border,
                            },
                            isSelected && isDark && {
                                shadowColor: theme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            },
                        ]}
                    >
                        <Tiny
                            color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                            weight={isSelected ? 'bold' : 'medium'}
                            style={styles.chipText}
                        >
                            {item.label}
                        </Tiny>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        gap: 12,
    },
    chip: {
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 9999,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
