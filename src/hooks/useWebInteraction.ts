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
    // @ts-ignore - data-* attributes work on web
    'data-clickable': 'true',
} : {};

export const webCardProps = Platform.OS === 'web' ? {
    // @ts-ignore - data-* attributes work on web
    'data-card': 'true',
} : {};

export const webLinkProps = Platform.OS === 'web' ? {
    // @ts-ignore - data-* attributes work on web
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
        // @ts-ignore - web-only property
        cursor: 'pointer',
    } as ViewStyle,
    card: {
        // @ts-ignore - web-only property
        cursor: 'pointer',
    } as ViewStyle,
    link: {
        // @ts-ignore - web-only property
        cursor: 'pointer',
    } as ViewStyle,
} : {
    clickable: {},
    card: {},
    link: {},
};
