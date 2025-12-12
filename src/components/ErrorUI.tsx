/**
 * ErrorUI Component
 *
 * Standardized error fallback UI displayed when data fetch fails.
 * Shows error message and provides retry capability.
 *
 * Usage:
 * <ErrorUI
 *   title="Failed to load composers"
 *   message={error.message}
 *   onRetry={() => refetch()}
 * />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';
import { haptic } from '../utils/haptics';

export interface ErrorUIProps {
  /**
   * Error title (e.g., "Failed to load composers")
   */
  title: string;

  /**
   * Optional error message details
   */
  message?: string;

  /**
   * Called when user taps retry button
   */
  onRetry: () => void;

  /**
   * Optional secondary action button
   */
  action?: {
    label: string;
    onPress: () => void;
  };

  /**
   * Whether retry is in progress
   */
  isRetrying?: boolean;
}

/**
 * Error UI Component
 *
 * Displays a user-friendly error message with retry option.
 *
 * @example
 * if (error) {
 *   return <ErrorUI title="Failed to load" onRetry={retry} />;
 * }
 */
export function ErrorUI({
  title,
  message,
  onRetry,
  action,
  isRetrying = false,
}: ErrorUIProps) {
  const { theme } = useTheme();
  const t = theme;

  const handleRetry = () => {
    haptic('selection');
    onRetry();
  };

  const handleAction = () => {
    haptic('selection');
    action?.onPress();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: t.colors.background },
      ]}
    >
      {/* Error Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${t.colors.error}10` },
        ]}
      >
        <Ionicons
          name="alert-circle"
          size={56}
          color={t.colors.error}
        />
      </View>

      {/* Error Title */}
      <Text
        style={[
          styles.title,
          { color: t.colors.text },
        ]}
      >
        {title}
      </Text>

      {/* Error Message */}
      {message && (
        <Text
          style={[
            styles.message,
            { color: t.colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      )}

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        {/* Retry Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: t.colors.primary },
            isRetrying && styles.buttonDisabled,
          ]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.7}
        >
          {isRetrying ? (
            <>
              <Ionicons
                name="reload"
                size={18}
                color="white"
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.buttonText}>Retrying...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="refresh"
                size={18}
                color="white"
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.buttonText}>Try Again</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Action Button */}
        {action && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: t.colors.border },
            ]}
            onPress={handleAction}
            disabled={isRetrying}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: t.colors.primary }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      <Text
        style={[
          styles.helpText,
          { color: t.colors.textMuted },
        ]}
      >
        Please check your connection and try again
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  message: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: '90%',
    lineHeight: 20,
  },

  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  secondaryButton: {
    borderWidth: 1,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'white',
  },

  helpText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
