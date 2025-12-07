import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { HamburgerMenu } from './HamburgerMenu';
import { spacing, fontSize } from '../theme';

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
}

export function AppHeader({ title, showMenu = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: t.colors.background,
          paddingTop: insets.top,
          borderBottomColor: t.colors.border,
        },
      ]}
    >
      <View style={styles.headerContent}>
        {showMenu && <HamburgerMenu />}
        <Text style={[styles.title, { color: t.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
