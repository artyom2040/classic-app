import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { RootStackParamList } from '../types';
import { spacing, fontSize, borderRadius } from '../theme';
import { hasAnyLabsEnabled } from '../experimental/labs.config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: string;
  color?: string;
  badge?: string;
}

const navigationItems: MenuItem[] = [
  { icon: 'home-outline', label: 'Home', action: 'home' },
  { icon: 'time-outline', label: 'Timeline', action: 'timeline' },
  { icon: 'book-outline', label: 'Glossary', action: 'glossary' },
  { icon: 'musical-notes-outline', label: 'Forms', action: 'forms' },
];

const exploreItems: MenuItem[] = [
  { icon: 'planet-outline', label: 'Discover', action: 'discover' },
  { icon: 'ribbon-outline', label: 'Badges', action: 'badges' },
  { icon: 'search-outline', label: 'Search', action: 'search' },
];

const settingsItems: MenuItem[] = [
  { icon: 'settings-outline', label: 'Settings', action: 'settings' },
];

export function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t, themeName, setTheme, isDark } = useTheme();
  const { isAuthenticated, isLoading, user, signOut, isAdmin } = useAuth();
  const { showToast } = useToast();

  const handleMenuPress = (action: string) => {
    setMenuOpen(false);

    switch (action) {
      case 'home':
        navigation.navigate('MainTabs', { screen: 'Home' } as never);
        break;
      case 'timeline':
        navigation.navigate('MainTabs', { screen: 'Timeline' } as never);
        break;
      case 'glossary':
        navigation.navigate('MainTabs', { screen: 'Glossary' } as never);
        break;
      case 'forms':
        navigation.navigate('MainTabs', { screen: 'Forms' } as never);
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'badges':
        navigation.navigate('Badges');
        break;
      case 'search':
        navigation.navigate('Search');
        break;
      case 'discover':
        navigation.navigate('Discover');
        break;
      case 'labs':
        navigation.navigate('Labs');
        break;
    }
  };

  const handleSignIn = () => {
    setMenuOpen(false);
    navigation.navigate('Login');
  };

  const handleSignOut = async () => {
    const doSignOut = async () => {
      setSigningOut(true);
      await signOut();
      setSigningOut(false);
      setMenuOpen(false);
      showToast('Signed out successfully', 'success');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    };

    // Alert.alert doesn't work on web, use window.confirm instead
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await doSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: doSignOut,
          },
        ]
      );
    }
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  const handleAdminDashboard = () => {
    setMenuOpen(false);
    navigation.navigate('AdminDashboard');
  };

  return (
    <>
      {/* Hamburger Icon */}
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={24} color={t.colors.text} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          {/* Menu Drawer (on LEFT side) */}
          <View
            style={[
              styles.drawer,
              { backgroundColor: t.colors.surface, paddingTop: insets.top },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity onPress={() => setMenuOpen(false)}>
                  <Ionicons name="close" size={24} color={t.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.drawerTitle, { color: t.colors.text }]}>
                  Menu
                </Text>
                <View style={{ width: 24 }} />
              </View>

              {/* User Section */}
              {isLoading ? (
                <View style={[styles.userSection, { borderBottomColor: t.colors.border }]}>
                  <Text style={[styles.loadingText, { color: t.colors.textMuted }]}>
                    Loading...
                  </Text>
                </View>
              ) : isAuthenticated && user ? (
                <>
                  <View
                    style={[
                      styles.userSection,
                      {
                        borderBottomColor: t.colors.border,
                        backgroundColor: t.colors.background,
                      },
                    ]}
                  >
                    <View style={styles.userInfo}>
                      <View
                        style={[
                          styles.userAvatar,
                          { backgroundColor: t.colors.primary + '30' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarText,
                            { color: t.colors.primary },
                          ]}
                        >
                          {(user.displayName || user.email || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.userName, { color: t.colors.text }]}
                          numberOfLines={1}
                        >
                          {user.displayName || 'User'}
                        </Text>
                        <Text
                          style={[
                            styles.userEmail,
                            { color: t.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {user.email}
                        </Text>
                        {isAdmin && (
                          <View
                            style={[
                              styles.adminBadge,
                              { backgroundColor: t.colors.warning + '20' },
                            ]}
                          >
                            <Ionicons
                              name="shield-checkmark"
                              size={12}
                              color={t.colors.warning}
                            />
                            <Text
                              style={[
                                styles.adminBadgeText,
                                { color: t.colors.warning },
                              ]}
                            >
                              Admin
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.viewProfileButton,
                        { backgroundColor: t.colors.primary },
                      ]}
                      onPress={handleProfile}
                    >
                      <Text
                        style={[styles.viewProfileText, { color: '#fff' }]}
                      >
                        View Profile
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Admin Dashboard Link */}
                  {isAdmin && (
                    <TouchableOpacity
                      style={[
                        styles.menuItem,
                        {
                          backgroundColor: t.colors.warning + '10',
                          borderLeftColor: t.colors.warning,
                          borderLeftWidth: 3,
                        },
                      ]}
                      onPress={handleAdminDashboard}
                    >
                      <Ionicons
                        name="shield"
                        size={20}
                        color={t.colors.warning}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          { color: t.colors.warning, fontWeight: '600' },
                        ]}
                      >
                        Admin Dashboard
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={t.colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View
                  style={[
                    styles.userSection,
                    {
                      borderBottomColor: t.colors.border,
                      backgroundColor: t.colors.background,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.authButton,
                      { backgroundColor: t.colors.primary },
                    ]}
                    onPress={handleSignIn}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                    <Text
                      style={[styles.authButtonText, { color: '#fff' }]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.signUpPrompt,
                      { color: t.colors.textSecondary },
                    ]}
                  >
                    Don't have an account?
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.authButtonSecondary,
                      {
                        borderColor: t.colors.border,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => {
                      setMenuOpen(false);
                      navigation.navigate('Register');
                    }}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color={t.colors.primary}
                    />
                    <Text
                      style={[
                        styles.authButtonSecondaryText,
                        { color: t.colors.primary },
                      ]}
                    >
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Navigation Items */}
              <View style={styles.navigationSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: t.colors.textSecondary },
                  ]}
                >
                  NAVIGATION
                </Text>
                {navigationItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomColor: t.colors.border,
                        borderBottomWidth:
                          index < navigationItems.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => handleMenuPress(item.action)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={t.colors.primary}
                    />
                    <Text
                      style={[styles.menuItemText, { color: t.colors.text }]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={t.colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Explore Section */}
              <View style={styles.navigationSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: t.colors.textSecondary },
                  ]}
                >
                  EXPLORE
                </Text>
                {exploreItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomColor: t.colors.border,
                        borderBottomWidth:
                          index < exploreItems.length - 1 ? 1 : 0,
                      },
                    ]}
                    onPress={() => handleMenuPress(item.action)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={t.colors.secondary || t.colors.primary}
                    />
                    <Text
                      style={[styles.menuItemText, { color: t.colors.text }]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={t.colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Labs Section */}
              {hasAnyLabsEnabled() && (
                <View style={styles.navigationSection}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: t.colors.textSecondary },
                    ]}
                  >
                    LABS
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.labsMenuItem,
                      { backgroundColor: '#8B5CF610' },
                    ]}
                    onPress={() => handleMenuPress('labs')}
                  >
                    <Ionicons
                      name="flask"
                      size={20}
                      color="#8B5CF6"
                    />
                    <Text
                      style={[styles.menuItemText, { color: t.colors.text }]}
                    >
                      Experimental Features
                    </Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={t.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Settings Section */}
              <View style={styles.navigationSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: t.colors.textSecondary },
                  ]}
                >
                  SETTINGS
                </Text>
                {settingsItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomColor: t.colors.border,
                        borderBottomWidth: 0,
                      },
                    ]}
                    onPress={() => handleMenuPress(item.action)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={t.colors.textMuted}
                    />
                    <Text
                      style={[styles.menuItemText, { color: t.colors.text }]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={t.colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dark/Light Mode Toggle */}
              <View style={styles.themeToggleSection}>
                <View style={styles.themeToggleRow}>
                  <View style={styles.themeToggleInfo}>
                    <Ionicons
                      name={isDark ? 'moon' : 'sunny'}
                      size={20}
                      color={t.colors.primary}
                    />
                    <Text style={[styles.themeToggleLabel, { color: t.colors.text }]}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.themeToggleButton,
                      { backgroundColor: isDark ? t.colors.primary : t.colors.surfaceLight },
                    ]}
                    onPress={() => {
                      setTheme(isDark ? 'light' : 'dark');
                    }}
                  >
                    <View
                      style={[
                        styles.themeToggleThumb,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : t.colors.primary,
                          transform: [{ translateX: isDark ? 20 : 0 }],
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Out (only if authenticated) */}
              {isAuthenticated && !isLoading && (
                <TouchableOpacity
                  style={[
                    styles.signOutItem,
                    { borderColor: t.colors.error },
                  ]}
                  onPress={handleSignOut}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={t.colors.error}
                  />
                  <Text
                    style={[styles.signOutText, { color: t.colors.error }]}
                  >
                    Sign Out
                  </Text>
                </TouchableOpacity>
              )}

              {/* Footer */}
              <View style={[styles.footer, { borderTopColor: t.colors.border }]}>
                <Text
                  style={[styles.appName, { color: t.colors.textSecondary }]}
                >
                  Context Composer
                </Text>
                <Text style={[styles.version, { color: t.colors.textMuted }]}>
                  v1.0.0
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Overlay touch to close (on RIGHT side of drawer) */}
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={() => setMenuOpen(false)}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: spacing.md,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    width: '75%',
    backgroundColor: '#fff',
    maxWidth: 320,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  userSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
  userInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  viewProfileText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  authButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  signUpPrompt: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginVertical: spacing.sm,
  },
  authButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  authButtonSecondaryText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  navigationSection: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  signOutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    marginTop: spacing.lg,
  },
  appName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  version: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  labsMenuItem: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  newBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  newBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  // Theme toggle styles
  themeToggleSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(84, 23, 207, 0.1)',
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeToggleLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  themeToggleButton: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  themeToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
