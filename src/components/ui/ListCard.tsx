/**
 * ListCard
 * Standardized card component for list items
 * - Hover effects on web (via HoverCard)
 * - Consistent styling across the app
 * - Flexible layout with left/right content areas
 * - Memoized to prevent unnecessary re-renders
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HoverCard } from '../HoverCard';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../theme';

interface ListCardProps {
    /** Main content */
    children?: React.ReactNode;
    /** Title text */
    title?: string;
    /** Subtitle text */
    subtitle?: string;
    /** Description/meta text */
    meta?: string;
    /** Left side content (avatar, icon, etc.) */
    leftContent?: React.ReactNode;
    /** Right side content (chevron, badge, etc.) */
    rightContent?: React.ReactNode;
    /** Show chevron on right */
    showChevron?: boolean;
    /** On press handler */
    onPress?: () => void;
    /** Custom container style */
    style?: ViewStyle;
    /** Accessibility label */
    accessibilityLabel?: string;
    /** Accent color for avatar/icon background */
    accentColor?: string;
    /** Disabled state */
    disabled?: boolean;
}

export function ListCard({
     children,
     title,
     subtitle,
     meta,
     leftContent,
     rightContent,
     showChevron = true,
     onPress,
     style,
     accessibilityLabel,
     accentColor,
     disabled = false,
}: ListCardProps) {
     const { theme, themeName } = useTheme();
     const t = theme;
     const isBrutal = themeName === 'neobrutalist';

     const cardStyle: ViewStyle = {
         backgroundColor: t.colors.surface,
         borderRadius: borderRadius.lg,
         ...(isBrutal
             ? { borderWidth: 2, borderColor: t.colors.border }
             : t.shadows.sm
         ),
         ...(disabled && { opacity: 0.5 }),
     };

     const content = children || (
         <>
             {leftContent && (
                 <View style={styles.leftContent}>
                     {leftContent}
                 </View>
             )}
             <View style={styles.textContent}>
                 {title && (
                     <Text
                         style={[styles.title, { color: t.colors.text }]}
                         numberOfLines={1}
                     >
                         {title}
                     </Text>
                 )}
                 {subtitle && (
                     <Text
                         style={[styles.subtitle, { color: t.colors.textSecondary }]}
                         numberOfLines={1}
                     >
                         {subtitle}
                     </Text>
                 )}
                 {meta && (
                     <Text
                         style={[styles.meta, { color: t.colors.textMuted }]}
                         numberOfLines={1}
                     >
                         {meta}
                     </Text>
                 )}
             </View>
             {rightContent && (
                 <View style={styles.rightContent}>
                     {rightContent}
                 </View>
             )}
             {!rightContent && showChevron && (
                 <Ionicons
                     name="chevron-forward"
                     size={18}
                     color={t.colors.textMuted}
                 />
             )}
         </>
     );

     const mergedStyle: ViewStyle = {
         ...styles.card,
         ...cardStyle,
         ...style,
     };

     return (
         <HoverCard
             style={mergedStyle}
             onPress={onPress}
             disabled={disabled || !onPress}
             accessibilityRole="button"
             accessibilityLabel={accessibilityLabel || title}
         >
             {content}
         </HoverCard>
     );
}

/**
 * ListCardAvatar - Avatar for use in ListCard leftContent
 * Memoized to prevent unnecessary re-renders in list contexts
 */
interface ListCardAvatarProps {
    /** Single character or emoji */
    letter?: string;
    /** Icon name */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Background color */
    color: string;
    /** Size */
    size?: number;
}

export function ListCardAvatar({
     letter,
     icon,
     color,
     size = 44,
}: ListCardAvatarProps) {
     return (
         <View style={[
             styles.avatar,
             {
                 width: size,
                 height: size,
                 borderRadius: size / 2,
                 backgroundColor: color + '25',
             }
         ]}>
             {letter ? (
                 <Text style={[styles.avatarText, { color }]}>
                     {letter}
                 </Text>
             ) : icon ? (
                 <Ionicons name={icon} size={size * 0.5} color={color} />
             ) : null}
         </View>
     );
 }

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    leftContent: {
        marginRight: spacing.md,
    },
    textContent: {
        flex: 1,
    },
    rightContent: {
        marginLeft: spacing.sm,
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    meta: {
        fontSize: fontSize.xs,
        marginTop: 2,
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSize.lg,
        fontWeight: '700',
    },
});
