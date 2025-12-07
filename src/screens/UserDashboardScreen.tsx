import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCardStyle } from '../hooks/useCardStyle';
import { spacing, fontSize, borderRadius } from '../theme';
import { RootStackParamList } from '../types';
import { getProgress } from '../utils/storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UserDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  const { user, signOut, isAdmin } = useAuth();
  const { favorites } = useFavorites();
  const { cardStyle } = useCardStyle();
  
  const [progress, setProgress] = React.useState<any>(null);

  React.useEffect(() => {
    getProgress().then(setProgress);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const stats = [
    { label: 'Terms Learned', value: progress?.viewedTerms?.length || 0, icon: 'book', color: t.colors.primary },
    { label: 'Composers', value: progress?.viewedComposers?.length || 0, icon: 'people', color: t.colors.secondary },
    { label: 'Favorites', value: favorites.length, icon: 'heart', color: t.colors.error },
    { label: 'Badges', value: progress?.badges?.length || 0, icon: 'ribbon', color: t.colors.warning },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'shield-checkmark-outline', label: 'Privacy', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.colors.text }]}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={t.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, cardStyle]}>
        <View style={[styles.avatar, { backgroundColor: t.colors.primary + '30' }]}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: t.colors.primary }]}>
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.displayName, { color: t.colors.text }]}>
          {user?.displayName || 'Music Enthusiast'}
        </Text>
        <Text style={[styles.email, { color: t.colors.textSecondary }]}>
          {user?.email}
        </Text>
        {isAdmin && (
          <View style={[styles.adminBadge, { backgroundColor: t.colors.warning + '20' }]}>
            <Ionicons name="shield-checkmark" size={14} color={t.colors.warning} />
            <Text style={[styles.adminBadgeText, { color: t.colors.warning }]}>Admin</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Your Progress</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, cardStyle]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: t.colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Kickstart Progress */}
      {progress && !progress.kickstartCompleted && (
        <TouchableOpacity
          style={[styles.kickstartCard, cardStyle, { borderColor: t.colors.primary }]}
          onPress={() => navigation.navigate('Kickstart')}
        >
          <View style={styles.kickstartContent}>
            <Text style={[styles.kickstartTitle, { color: t.colors.text }]}>5-Day Kickstart</Text>
            <Text style={[styles.kickstartProgress, { color: t.colors.textSecondary }]}>
              Day {(progress.kickstartDay || 0) + 1} of 5
            </Text>
          </View>
          <View style={styles.kickstartDots}>
            {[0, 1, 2, 3, 4].map((day) => (
              <View
                key={day}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      day < (progress.kickstartDay || 0)
                        ? t.colors.success
                        : day === (progress.kickstartDay || 0)
                        ? t.colors.primary
                        : t.colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Menu Items */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Account</Text>
      <View style={[styles.menuCard, cardStyle]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.colors.border },
            ]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon as any} size={22} color={t.colors.text} />
            <Text style={[styles.menuLabel, { color: t.colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Admin Link */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminLink, cardStyle, { borderColor: t.colors.warning }]}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Ionicons name="shield" size={22} color={t.colors.warning} />
          <Text style={[styles.adminLinkText, { color: t.colors.text }]}>Admin Dashboard</Text>
          <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { borderColor: t.colors.error }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out-outline" size={20} color={t.colors.error} />
        <Text style={[styles.signOutText, { color: t.colors.error }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  profileCard: { alignItems: 'center', padding: spacing.xl, marginBottom: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 32, fontWeight: '700' },
  displayName: { fontSize: fontSize.xl, fontWeight: '700' },
  email: { fontSize: fontSize.sm, marginTop: spacing.xs },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, marginTop: spacing.sm },
  adminBadgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { width: '48%', padding: spacing.md, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  kickstartCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3 },
  kickstartContent: { flex: 1 },
  kickstartTitle: { fontSize: fontSize.md, fontWeight: '600' },
  kickstartProgress: { fontSize: fontSize.sm, marginTop: spacing.xs },
  kickstartDots: { flexDirection: 'row', gap: 4, marginRight: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  menuCard: { marginBottom: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, gap: spacing.md },
  menuLabel: { flex: 1, fontSize: fontSize.md },
  adminLink: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 3, gap: spacing.md },
  adminLinkText: { flex: 1, fontSize: fontSize.md, fontWeight: '500' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderWidth: 1, borderRadius: borderRadius.md, gap: spacing.sm },
  signOutText: { fontSize: fontSize.md, fontWeight: '600' },
});
