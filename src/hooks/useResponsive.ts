/**
 * Responsive Design Utilities
 * Provides hooks and constants for adapting UI to different screen sizes
 */

import { useWindowDimensions, Platform } from 'react-native';

// Breakpoints (in dp/pixels)
export const breakpoints = {
    mobile: 0,      // 0-767
    tablet: 768,    // 768-1023
    desktop: 1024,  // 1024-1439
    wide: 1440,     // 1440+
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Hook to get current device type based on screen width
 */
export function useDeviceType(): DeviceType {
    const { width } = useWindowDimensions();

    if (width >= breakpoints.wide) return 'wide';
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'mobile';
}

/**
 * Hook to get responsive values based on device type
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const deviceType = useDeviceType();
    const isWeb = Platform.OS === 'web';

    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop' || deviceType === 'wide';
    const isLandscape = width > height;

    // Content width constraints for larger screens
    const maxContentWidth = isDesktop ? 1200 : isTablet ? 900 : width;
    const contentPadding = isDesktop ? 32 : isTablet ? 24 : 16;

    // Grid columns for list layouts
    const gridColumns = deviceType === 'wide' ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;

    // Card sizes for grid layouts
    const cardMinWidth = isDesktop ? 280 : isTablet ? 240 : width - 32;

    return {
        width,
        height,
        deviceType,
        isWeb,
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        maxContentWidth,
        contentPadding,
        gridColumns,
        cardMinWidth,
    };
}

/**
 * Responsive spacing multiplier
 */
export function useResponsiveSpacing() {
    const { deviceType } = useResponsive();

    const multiplier = deviceType === 'wide' ? 1.5 :
        deviceType === 'desktop' ? 1.25 :
            deviceType === 'tablet' ? 1.1 : 1;

    return {
        multiplier,
        xs: 4 * multiplier,
        sm: 8 * multiplier,
        md: 16 * multiplier,
        lg: 24 * multiplier,
        xl: 32 * multiplier,
        xxl: 48 * multiplier,
    };
}

/**
 * Responsive font size multiplier
 */
export function useResponsiveFontSize() {
    const { deviceType } = useResponsive();

    const multiplier = deviceType === 'wide' ? 1.2 :
        deviceType === 'desktop' ? 1.1 :
            deviceType === 'tablet' ? 1.05 : 1;

    return {
        multiplier,
        xs: Math.round(12 * multiplier),
        sm: Math.round(14 * multiplier),
        md: Math.round(16 * multiplier),
        lg: Math.round(18 * multiplier),
        xl: Math.round(20 * multiplier),
        xxl: Math.round(24 * multiplier),
        xxxl: Math.round(32 * multiplier),
        display: Math.round(40 * multiplier),
    };
}
