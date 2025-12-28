import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCardStyle } from '../hooks/useCardStyle';
import { spacing, fontSize, borderRadius } from '../theme';
import { RootStackParamList, UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserListItem extends UserProfile {
  lastActive?: string;
}

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t, themeName } = useTheme();
  const { user, isAdmin } = useAuth();
  const { cardStyle } = useCardStyle();
  const isBrutal = false;

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    newThisWeek: 0,
  });

  const fetchUsers = async () => {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers: UserListItem[] = (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        role: u.role as UserRole,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      }));

      setUsers(mappedUsers);

      // Calculate stats
      const adminCount = mappedUsers.filter(u => u.role === 'admin').length;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newThisWeek = mappedUsers.filter(u => new Date(u.createdAt) > oneWeekAgo).length;

      setStats({
        totalUsers: mappedUsers.length,
        adminCount,
        newThisWeek,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleToggleRole = async (targetUser: UserListItem) => {
    if (!supabase) return;
    if (targetUser.id === user?.id) {
      Alert.alert('Error', 'You cannot change your own role');
      return;
    }

    const newRole: UserRole = targetUser.role === 'admin' ? 'user' : 'admin';

    Alert.alert(
      'Change Role',
      `Make ${targetUser.displayName || targetUser.email} ${newRole === 'admin' ? 'an admin' : 'a regular user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (!supabase) return;
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', targetUser.id);

              if (error) throw error;

              setUsers(prev =>
                prev.map(u => (u.id === targetUser.id ? { ...u, role: newRole } : u))
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to update user role');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Access control
  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.accessDenied, { backgroundColor: t.colors.background }]}>
        <Ionicons name="lock-closed" size={64} color={t.colors.error} />
        <Text style={[styles.accessDeniedTitle, { color: t.colors.text }]}>Access Denied</Text>
        <Text style={[styles.accessDeniedText, { color: t.colors.textSecondary }]}>
          You don't have permission to view this page.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: t.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderUserItem = ({ item }: { item: UserListItem }) => (
    <View style={[styles.userCard, cardStyle]}>
      <View style={[styles.userAvatar, { backgroundColor: t.colors.primary + '30' }]}>
        <Text style={[styles.userAvatarText, { color: t.colors.primary }]}>
          {(item.displayName || item.email).charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: t.colors.text }]}>
          {item.displayName || 'No name'}
        </Text>
        <Text style={[styles.userEmail, { color: t.colors.textSecondary }]}>{item.email}</Text>
        <Text style={[styles.userDate, { color: t.colors.textMuted }]}>
          Joined {formatDate(item.createdAt)}
        </Text>
      </View>
      <View style={styles.userActions}>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: item.role === 'admin' ? t.colors.warning + '20' : t.colors.surfaceLight },
          ]}
        >
          <Text
            style={[
              styles.roleBadgeText,
              { color: item.role === 'admin' ? t.colors.warning : t.colors.textMuted },
            ]}
          >
            {item.role}
          </Text>
        </View>
        {item.id !== user?.id && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.colors.surfaceLight }]}
            onPress={() => handleToggleRole(item)}
          >
            <Ionicons name="swap-horizontal" size={16} color={t.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.colors.text }]}>Admin Dashboard</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={t.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, cardStyle]}>
          <Text style={[styles.statValue, { color: t.colors.primary }]}>{stats.totalUsers}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Total Users</Text>
        </View>
        <View style={[styles.statCard, cardStyle]}>
          <Text style={[styles.statValue, { color: t.colors.warning }]}>{stats.adminCount}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Admins</Text>
        </View>
        <View style={[styles.statCard, cardStyle]}>
          <Text style={[styles.statValue, { color: t.colors.success }]}>{stats.newThisWeek}</Text>
          <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>New This Week</Text>
        </View>
      </View>

      {/* Content Management */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>Content Management</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentTiles}
      >
        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('ContentList', { entityType: 'composer' })}
        >
          <View style={[styles.tileIcon, { backgroundColor: `${t.colors.primary}20` }]}>
            <Ionicons name="person" size={22} color={t.colors.primary} />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Composers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('ContentList', { entityType: 'term' })}
        >
          <View style={[styles.tileIcon, { backgroundColor: `${t.colors.success}20` }]}>
            <Ionicons name="book" size={22} color={t.colors.success} />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Terms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('ContentList', { entityType: 'period' })}
        >
          <View style={[styles.tileIcon, { backgroundColor: `${t.colors.warning}20` }]}>
            <Ionicons name="time" size={22} color={t.colors.warning} />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Eras</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('ContentList', { entityType: 'form' })}
        >
          <View style={[styles.tileIcon, { backgroundColor: `#EC489920` }]}>
            <Ionicons name="musical-notes" size={22} color="#EC4899" />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Forms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('ContentList', { entityType: 'concert_hall' })}
        >
          <View style={[styles.tileIcon, { backgroundColor: `#6B8E2320` }]}>
            <Ionicons name="business" size={22} color="#6B8E23" />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Halls</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contentTile, cardStyle]}
          onPress={() => navigation.navigate('AuditLog')}
        >
          <View style={[styles.tileIcon, { backgroundColor: `#8B5CF620` }]}>
            <Ionicons name="document-text" size={22} color="#8B5CF6" />
          </View>
          <Text style={[styles.tileLabel, { color: t.colors.text }]}>Audit Log</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Users List */}
      <Text style={[styles.sectionTitle, { color: t.colors.text }]}>All Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={t.colors.textMuted} />
            <Text style={[styles.emptyText, { color: t.colors.textMuted }]}>
              {loading ? 'Loading users...' : 'No users found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  accessDenied: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  accessDeniedTitle: { fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.lg },
  accessDeniedText: { fontSize: fontSize.md, marginTop: spacing.sm, textAlign: 'center' },
  backButton: { marginTop: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  backButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  usersList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.sm },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: spacing.md },
  userName: { fontSize: fontSize.md, fontWeight: '600' },
  userEmail: { fontSize: fontSize.sm, marginTop: 2 },
  userDate: { fontSize: fontSize.xs, marginTop: 2 },
  userActions: { alignItems: 'flex-end', gap: spacing.xs },
  roleBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  roleBadgeText: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  actionButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: fontSize.md, marginTop: spacing.md },
  contentTiles: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  contentTile: { width: 100, padding: spacing.md, alignItems: 'center', borderRadius: borderRadius.lg },
  tileIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  tileLabel: { fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center' },
});
