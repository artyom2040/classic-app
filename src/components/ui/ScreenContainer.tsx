/**
 * ScreenContainer
 * Responsive wrapper component for all screens
 * - Constrains content width on desktop
 * - Centers content
 * - Provides consistent padding
 * - Handles safe area insets
 */
import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ViewStyle,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../theme';

interface ScreenContainerProps {
    children: React.ReactNode;
    /** Use ScrollView instead of View */
    scroll?: boolean;
    /** Add horizontal padding */
    padded?: boolean;
    /** Apply safe area insets */
    safeArea?: boolean;
    /** Custom background color */
    backgroundColor?: string;
    /** Custom style for the container */
    style?: ViewStyle;
    /** Custom style for the content */
    contentStyle?: ViewStyle;
    /** ScrollView props when scroll=true */
    scrollProps?: React.ComponentProps<typeof ScrollView>;
}

export function ScreenContainer({
    children,
    scroll = false,
    padded = true,
    safeArea = true,
    backgroundColor,
    style,
    contentStyle,
    scrollProps,
}: ScreenContainerProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { isDesktop, maxContentWidth } = useResponsive();

    const bgColor = backgroundColor || theme.colors.background;

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: bgColor,
        ...(safeArea && { paddingTop: insets.top }),
    };

    const contentWrapperStyle: ViewStyle = {
        flex: scroll ? undefined : 1,
        flexGrow: scroll ? 1 : undefined,
        width: '100%',
        maxWidth: isDesktop ? maxContentWidth : undefined,
        alignSelf: 'center',
        ...(padded && { paddingHorizontal: spacing.md }),
    };

    if (scroll) {
        return (
            <View style={[containerStyle, style]}>
                <ScrollView
                    contentContainerStyle={[contentWrapperStyle, contentStyle]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    {...scrollProps}
                >
                    {children}
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={[containerStyle, style]}>
            <View style={[contentWrapperStyle, contentStyle]}>
                {children}
            </View>
        </View>
    );
}
