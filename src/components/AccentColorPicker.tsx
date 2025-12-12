/**
 * AccentColorPicker - Color picker for accent color customization
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AccentColorName, accentColorList } from '../theme/accentColors';

interface AccentColorPickerProps {
    style?: object;
}

export function AccentColorPicker({ style }: AccentColorPickerProps) {
    const { theme, accentColorName, setAccentColor } = useTheme();
    const t = theme;

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>
                ACCENT COLOR
            </Text>
            <View style={styles.colorGrid}>
                {accentColorList.map((accent) => {
                    const isSelected = accent.name === accentColorName;
                    return (
                        <TouchableOpacity
                            key={accent.name}
                            style={[
                                styles.colorOption,
                                { borderColor: isSelected ? accent.primary : 'transparent' },
                            ]}
                            onPress={() => setAccentColor(accent.name as AccentColorName)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.colorSwatch,
                                    { backgroundColor: accent.primary },
                                ]}
                            >
                                {isSelected && (
                                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                                )}
                            </View>
                            <Text style={[styles.colorName, { color: t.colors.text }]}>
                                {accent.displayName}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        borderWidth: 2,
        minWidth: 80,
    },
    colorSwatch: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    colorName: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
});
