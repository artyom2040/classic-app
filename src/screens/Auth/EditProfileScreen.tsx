import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components';
import { EnhancedButton } from '../../design-system';
import { spacing, fontSize, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = displayName.trim() !== (user?.displayName || '');

  const handleSave = async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await updateProfile({
      displayName: displayName.trim() || null,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      showToast('Profile updated', 'success');
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={t.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: t.colors.text }]}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar Preview */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: t.colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: t.colors.primary }]}>
              {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.avatarHint, { color: t.colors.textMuted }]}>
            Avatar is generated from your name
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: t.colors.surface }]}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: t.colors.error + '20' }]}>
              <Ionicons name="alert-circle" size={18} color={t.colors.error} />
              <Text style={[styles.errorText, { color: t.colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Display Name</Text>
            <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={t.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: t.colors.text }]}
                placeholder="Your name"
                placeholderTextColor={t.colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {displayName.length > 0 && (
                <TouchableOpacity onPress={() => setDisplayName('')}>
                  <Ionicons name="close-circle" size={20} color={t.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.hint, { color: t.colors.textMuted }]}>
              This name will be displayed on your profile
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Email</Text>
            <View style={[styles.inputContainer, styles.disabledInput, { borderColor: t.colors.border, backgroundColor: t.colors.surfaceLight }]}>
              <Ionicons name="mail-outline" size={20} color={t.colors.textMuted} />
              <Text style={[styles.disabledText, { color: t.colors.textMuted }]}>
                {user?.email}
              </Text>
              <Ionicons name="lock-closed" size={16} color={t.colors.textMuted} />
            </View>
            <Text style={[styles.hint, { color: t.colors.textMuted }]}>
              Email cannot be changed
            </Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={[styles.infoCard, { backgroundColor: t.colors.surface }]}>
          <Text style={[styles.infoTitle, { color: t.colors.text }]}>Account Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={t.colors.textMuted} />
            <Text style={[styles.infoLabel, { color: t.colors.textSecondary }]}>Member since</Text>
            <Text style={[styles.infoValue, { color: t.colors.text }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={t.colors.textMuted} />
            <Text style={[styles.infoLabel, { color: t.colors.textSecondary }]}>Account type</Text>
            <Text style={[styles.infoValue, { color: user?.role === 'admin' ? t.colors.warning : t.colors.text }]}>
              {user?.role === 'admin' ? 'Admin' : 'Standard'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <EnhancedButton
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={!hasChanges || loading}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={[styles.cancelText, { color: t.colors.textMuted }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  backButton: { padding: spacing.xs },
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 32, fontWeight: '700' },
  avatarHint: { fontSize: fontSize.sm },
  form: { padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.lg },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.md, gap: spacing.xs },
  errorText: { fontSize: fontSize.sm, flex: 1 },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md },
  disabledInput: { opacity: 0.7 },
  disabledText: { flex: 1, fontSize: fontSize.md },
  hint: { fontSize: fontSize.xs, marginTop: spacing.xs },
  infoCard: { padding: spacing.lg, borderRadius: borderRadius.lg },
  infoTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  infoLabel: { flex: 1, fontSize: fontSize.sm },
  infoValue: { fontSize: fontSize.sm, fontWeight: '500' },
  cancelButton: { alignItems: 'center', marginTop: spacing.md, padding: spacing.md },
  cancelText: { fontSize: fontSize.md },
});
