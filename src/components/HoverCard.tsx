/**
 * HoverCard Component
 * A card wrapper with built-in hover effects for web
 * Uses Pressable with onHoverIn/onHoverOut for cross-browser support
 */
import React, { useState } from 'react';
import {
    Pressable,
    PressableProps,
    View,
    ViewStyle,
    StyleSheet,
    Animated,
    Platform,
} from 'react-native';

interface HoverCardProps extends Omit<PressableProps, 'style'> {
    children: React.ReactNode;
    style?: ViewStyle;
    hoverScale?: number;
    hoverElevation?: boolean;
}

/**
 * A Pressable wrapper that provides hover effects on web
 * On mobile, it just passes through with normal press opacity
 */
export function HoverCard({
    children,
    style,
    hoverScale = 1.02,
    hoverElevation = true,
    ...props
}: HoverCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const animatedScale = isPressed ? 0.98 : isHovered ? hoverScale : 1;

    const hoverStyle: ViewStyle = Platform.OS === 'web' && isHovered ? {
        transform: [{ translateY: -2 }, { scale: animatedScale }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        ...({
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        } as any),
    } : {};

    const pressedStyle: ViewStyle = isPressed ? {
        transform: [{ scale: 0.98 }],
    } : {};

    const webCursor: ViewStyle = Platform.OS === 'web' ? {
        ...({
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        } as any),
    } : {};

    return (
        <Pressable
            {...props}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[
                styles.container,
                webCursor,
                style,
                hoverStyle,
                pressedStyle,
            ]}
        >
            {children}
        </Pressable>
    );
}

/**
 * Simple clickable wrapper with cursor pointer for web
 */
export function Clickable({
    children,
    style,
    ...props
}: PressableProps & { children: React.ReactNode }) {
    const [isPressed, setIsPressed] = useState(false);

    const webStyles: ViewStyle = Platform.OS === 'web' ? {
        ...({
            cursor: 'pointer',
        } as any),
    } : {};

    const pressedOpacity = isPressed ? { opacity: 0.7 } : {};

    return (
        <Pressable
            {...props}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[webStyles, style as ViewStyle, pressedOpacity]}
        >
            {children}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        // Base styles for cards
    },
});
