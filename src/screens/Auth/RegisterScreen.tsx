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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components';
import { spacing, fontSize, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t, themeName } = useTheme();
  const { signUpWithEmail } = useAuth();
  const isBrutal = false;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await signUpWithEmail(
      email.trim(),
      password,
      displayName.trim() || undefined
    );
    
    setLoading(false);
    
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  };

  const cardStyle = isBrutal
    ? { borderWidth: 2, borderColor: t.colors.border }
    : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 };

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: t.colors.background }]}>
        <Ionicons name="checkmark-circle" size={64} color={t.colors.success} />
        <Text style={[styles.title, { color: t.colors.text }]}>Check Your Email</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary, textAlign: 'center' }]}>
          We've sent a verification link to {email}. Please check your inbox.
        </Text>
        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={t.colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
            Join the classical music community
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: t.colors.surface }, cardStyle]}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: t.colors.error + '20' }]}>
              <Ionicons name="alert-circle" size={18} color={t.colors.error} />
              <Text style={[styles.errorText, { color: t.colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Display Name (optional)</Text>
            <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={t.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: t.colors.text }]}
                placeholder="Your name"
                placeholderTextColor={t.colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Email *</Text>
            <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={t.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: t.colors.text }]}
                placeholder="your@email.com"
                placeholderTextColor={t.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Password *</Text>
            <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={t.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: t.colors.text }]}
                placeholder="At least 6 characters"
                placeholderTextColor={t.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={t.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.colors.textSecondary }]}>Confirm Password *</Text>
            <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={t.colors.textMuted} />
              <TextInput
                style={[styles.input, { color: t.colors.text }]}
                placeholder="Repeat password"
                placeholderTextColor={t.colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerLink, { color: t.colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successContainer: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { marginBottom: spacing.md },
  header: { marginBottom: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: '700' },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
  form: { padding: spacing.lg, borderRadius: borderRadius.lg },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.md, gap: spacing.xs },
  errorText: { fontSize: fontSize.sm, flex: 1 },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: fontSize.md },
  footerLink: { fontSize: fontSize.md, fontWeight: '600' },
});
