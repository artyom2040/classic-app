/**
 * HorizontalCarousel - Snap-scrolling horizontal carousel for cards
 * Part of the design-system molecules
 */
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    ViewStyle,
} from 'react-native';

interface HorizontalCarouselProps {
    children: React.ReactNode;
    cardWidth?: number;
    gap?: number;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
}

export function HorizontalCarousel({
    children,
    cardWidth = 288,
    gap = 16,
    style,
    contentContainerStyle,
}: HorizontalCarouselProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + gap}
            snapToAlignment="start"
            contentContainerStyle={[
                styles.container,
                { gap },
                contentContainerStyle,
            ]}
            style={style}
        >
            {children}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
});
