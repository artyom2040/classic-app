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
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button, useToast } from '../../components';
import { spacing, fontSize, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_FORM_WIDTH = 400;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  const { signInWithEmail, signInWithApple, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await signInWithEmail(email.trim(), password);

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      showToast('Welcome back!', 'success');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await signInWithApple();
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      showToast('Welcome back!', 'success');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await signInWithGoogle();
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      showToast('Welcome back!', 'success');
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl },
          isDesktop && styles.scrollContentDesktop,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isDesktop && { maxWidth: MAX_FORM_WIDTH, width: '100%' }]}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="musical-notes" size={48} color={t.colors.primary} />
            <Text style={[styles.title, { color: t.colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
              Sign in to continue your musical journey
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
              <Text style={[styles.label, { color: t.colors.textSecondary }]}>Email</Text>
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
              <Text style={[styles.label, { color: t.colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={t.colors.textMuted} />
                <TextInput
                  style={[styles.input, { color: t.colors.text }]}
                  placeholder="••••••••"
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

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: t.colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleEmailLogin}
              loading={loading}
              fullWidth
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: t.colors.border }]} />
            <Text style={[styles.dividerText, { color: t.colors.textMuted }]}>or continue with</Text>
            <View style={[styles.dividerLine, { backgroundColor: t.colors.border }]} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#000' }]}
                onPress={handleAppleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={24} color="#fff" />
                <Text style={[styles.socialButtonText, { color: '#fff' }]}>Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={24} color={t.colors.text} />
              <Text style={[styles.socialButtonText, { color: t.colors.text }]}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerLink, { color: t.colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Skip Login */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={[styles.skipText, { color: t.colors.textMuted }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scrollContentDesktop: { alignItems: 'center' },
  content: { width: '100%' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.md },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs, textAlign: 'center' },
  form: { padding: spacing.lg, borderRadius: borderRadius.lg },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.md, gap: spacing.xs },
  errorText: { fontSize: fontSize.sm, flex: 1 },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotPasswordText: { fontSize: fontSize.sm, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: spacing.md, fontSize: fontSize.sm },
  socialButtons: { flexDirection: 'row', gap: spacing.md },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: borderRadius.md, gap: spacing.sm },
  socialButtonText: { fontSize: fontSize.md, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: fontSize.md },
  footerLink: { fontSize: fontSize.md, fontWeight: '600' },
  skipButton: { alignItems: 'center', marginTop: spacing.lg },
  skipText: { fontSize: fontSize.sm },
});

