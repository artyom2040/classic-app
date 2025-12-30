import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
  warning: 'warning',
};

const { width: _width } = Dimensions.get('window');

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
}: ToastProps) {
  const { theme } = useTheme();
  const t = theme;
  const isBrutal = false;
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Memoize hideToast to prevent unnecessary re-renders and stale closures
  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [onDismiss, translateY, opacity]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, hideToast, translateY, opacity]);

  const getColor = () => {
    switch (type) {
      case 'success': return t.colors.success;
      case 'error': return t.colors.error;
      case 'warning': return t.colors.warning;
      default: return t.colors.primary;
    }
  };

  if (!visible) return null;

  const color = getColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View style={[
        styles.toast,
        {
          backgroundColor: t.colors.surface,
          borderLeftColor: color,
        },
        isBrutal
          ? { borderRadius: 0, borderWidth: 2, borderColor: t.colors.border }
          : { borderRadius: borderRadius.lg, ...t.shadows.lg },
      ]}
      accessible={true}
      accessibilityLabel={`${type} notification: ${message}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={ICONS[type]} size={24} color={color} />
        </View>

        <Text style={[styles.message, { color: t.colors.text }]} numberOfLines={2}>
          {message}
        </Text>

        {action && (
          <TouchableOpacity
            style={[styles.action, { backgroundColor: color + '15' }]}
            onPress={() => {
              action.onPress();
              hideToast();
            }}
          >
            <Text style={[styles.actionText, { color }]}>{action.label}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Ionicons name="close" size={20} color={t.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Toast context for global usage
import { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: { label: string; onPress: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as ToastType,
    action: undefined as { label: string; onPress: () => void } | undefined,
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    action?: { label: string; onPress: () => void }
  ) => {
    setToast({ visible: true, message, type, action });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        action={toast.action}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderLeftWidth: 4,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
});
