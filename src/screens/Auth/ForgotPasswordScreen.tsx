import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme: t, themeName } = useTheme();
  const { resetPassword } = useAuth();
  const isBrutal = false;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await resetPassword(email.trim());
    
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
        <Ionicons name="mail" size={64} color={t.colors.primary} />
        <Text style={[styles.title, { color: t.colors.text }]}>Check Your Email</Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary, textAlign: 'center' }]}>
          We've sent password reset instructions to {email}
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
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={t.colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="key-outline" size={48} color={t.colors.primary} />
          <Text style={[styles.title, { color: t.colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
            Enter your email and we'll send you instructions to reset your password
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

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
          />
        </View>

        {/* Back to Login Link */}
        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={16} color={t.colors.primary} />
          <Text style={[styles.footerLink, { color: t.colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successContainer: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  content: { flex: 1, padding: spacing.lg },
  backButton: { marginBottom: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.md },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.lg },
  form: { padding: spacing.lg, borderRadius: borderRadius.lg },
  errorBox: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.md, gap: spacing.xs },
  errorText: { fontSize: fontSize.sm, flex: 1 },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48, gap: spacing.sm },
  input: { flex: 1, fontSize: fontSize.md },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, gap: spacing.xs },
  footerLink: { fontSize: fontSize.md, fontWeight: '600' },
});
