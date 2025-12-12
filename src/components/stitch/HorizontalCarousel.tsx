/**
 * HorizontalCarousel - Snap-scrolling horizontal carousel for cards
 * Used in Form Explorer and other stitch screens
 */
import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    ViewStyle,
    Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
