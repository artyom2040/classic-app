import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

// Floating quick navigation for detail screens
export function QuickNav() {
  const navigation = useNavigation();
  const { theme, themeName, isDark } = useTheme();
  const t = theme;
  const insets = useSafeAreaInsets();
  const isBrutal = false;
  
  // Get current route name to determine if we're on a detail screen
  const routeName = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });
  
  // Only show on detail screens, not on MainTabs or Kickstart
  const shouldShow = !['MainTabs', 'Kickstart'].includes(routeName);
  
  if (!shouldShow) return null;
  
  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' as never }],
    });
  };
  
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[
      styles.container, 
      { bottom: insets.bottom + 16 },
    ]}>
      <View style={[
        styles.navBar,
        { backgroundColor: t.colors.surface },
        isBrutal ? { borderRadius: 0, borderWidth: 2, borderColor: t.colors.border } : { borderRadius: 28 },
        !isBrutal && t.shadows.md,
      ]}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={goBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={t.colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={[styles.divider, { backgroundColor: t.colors.border }]} />
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={goHome}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home" size={22} color={t.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  navButton: {
    padding: 4,
  },
  divider: {
    width: 1,
    height: 20,
  },
});
