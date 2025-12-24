/**
 * Web Interaction Utilities
 * Provides props for hover effects via CSS data attributes
 */
import { Platform, ViewStyle } from 'react-native';

/**
 * Props to add to TouchableOpacity/Pressable for web hover effects
 * Uses data attributes that are styled in /web/global.css
 */
export const webClickableProps = Platform.OS === 'web' ? {
    'data-clickable': 'true',
} : {};

export const webCardProps = Platform.OS === 'web' ? {
    'data-card': 'true',
} : {};

export const webLinkProps = Platform.OS === 'web' ? {
    'data-link': 'true',
} : {};

/**
 * Hook for getting web interaction props
 */
export function useWebInteraction() {
    const isWeb = Platform.OS === 'web';

    return {
        isWeb,
        clickableProps: webClickableProps,
        cardProps: webCardProps,
        linkProps: webLinkProps,
    };
}

/**
 * Static web styles for use in StyleSheet.create
 * These provide cursor pointer - actual hover effects come from CSS
 */
export const webStyles: { clickable: ViewStyle; card: ViewStyle; link: ViewStyle } = Platform.OS === 'web' ? {
    clickable: {
        cursor: 'pointer',
    } as any as ViewStyle,
    card: {
        cursor: 'pointer',
    } as any as ViewStyle,
    link: {
        cursor: 'pointer',
    } as any as ViewStyle,
} : {
    clickable: {},
    card: {},
    link: {},
};
