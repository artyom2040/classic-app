/**
 * TermOfDayCard - Enhanced Term of the Day with pronunciation, speaker, and visual polish
 * Based on friend's design mockups - with gradient and decorative elements
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
import { useTheme } from '../../context/ThemeContext';

interface TermOfDayCardProps {
    term: string;
    pronunciation?: string;
    definition: string;
    category?: string;
    onPress: () => void;
    onPlayAudio?: () => void;
}

export function TermOfDayCard({
    term,
    pronunciation,
    definition,
    category,
    onPress,
    onPlayAudio,
}: TermOfDayCardProps) {
    const { theme, isDark } = useTheme();
    const t = theme;

    // Theme-adaptive colors
    const cardBgColor = isDark ? '#1e1a2e' : t.colors.surface;
    const textColor = isDark ? 'rgba(255,255,255,0.8)' : t.colors.textSecondary;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <LinearGradient
                colors={[`${t.colors.primary}15`, cardBgColor, cardBgColor]}
                locations={[0, 0.3, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Decorative circle in top right */}
                <View style={[styles.decorativeCircle, { borderColor: `${t.colors.primary}20` }]} />

                {/* Header row */}
                <View style={styles.header}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.labelIcon, { backgroundColor: `${t.colors.primary}30` }]}>
                            <Ionicons name="book" size={12} color={t.colors.primary} />
                        </View>
                        <Text style={[styles.label, { color: t.colors.primary }]}>TERM OF THE DAY</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.speakerButton, {
                            backgroundColor: `${t.colors.primary}20`,
                            borderWidth: 1,
                            borderColor: `${t.colors.primary}30`,
                        }]}
                        onPress={onPlayAudio || onPress}
                    >
                        <Ionicons name="volume-high" size={18} color={t.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Term name - large italic with gradient underline */}
                <View style={styles.termContainer}>
                    <Text style={[styles.term, { color: t.colors.text }]}>{term}</Text>
                    <LinearGradient
                        colors={[t.colors.primary, `${t.colors.primary}00`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.termUnderline}
                    />
                </View>

                {/* Pronunciation */}
                {pronunciation && (
                    <Text style={[styles.pronunciation, { color: t.colors.textSecondary }]}>
                        {pronunciation}
                    </Text>
                )}

                {/* Definition with stylized quote marks */}
                <View style={styles.definitionContainer}>
                    <LinearGradient
                        colors={[t.colors.primary, `${t.colors.primary}50`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.quoteLine}
                    />
                    <Text style={[styles.definition, { color: textColor }]}>
                        {definition}
                    </Text>
                </View>

                {/* Listen to Example button */}
                <TouchableOpacity
                    style={[styles.listenButton, {
                        backgroundColor: `${t.colors.primary}15`,
                        borderColor: `${t.colors.primary}30`,
                    }]}
                    onPress={onPress}
                >
                    <View style={[styles.listenIconBg, { backgroundColor: t.colors.primary }]}>
                        <Ionicons name="musical-note" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.listenText, { color: t.colors.text }]}>
                        Listen to Example
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={t.colors.textSecondary} />
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    gradient: {
        padding: 20,
        position: 'relative',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    speakerButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    termContainer: {
        marginBottom: 6,
    },
    term: {
        fontSize: 36,
        fontWeight: '300',
        fontStyle: 'italic',
        letterSpacing: -0.5,
    },
    termUnderline: {
        height: 2,
        width: '40%',
        borderRadius: 1,
        marginTop: 4,
    },
    pronunciation: {
        fontSize: 15,
        fontStyle: 'italic',
        marginBottom: 16,
        opacity: 0.8,
    },
    definitionContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    quoteLine: {
        width: 3,
        borderRadius: 2,
        marginRight: 14,
    },
    definition: {
        flex: 1,
        fontSize: 15,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    listenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
    },
    listenIconBg: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listenText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
});
