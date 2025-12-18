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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components';
import { spacing, fontSize, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ResetPasswordRouteProp>();
    const insets = useSafeAreaInsets();
    const { theme: t } = useTheme();

    // Get email from route params (passed from ForgotPasswordScreen)
    const emailFromRoute = route.params?.email || '';

    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async () => {
        if (!otpCode.trim()) {
            setError('Please enter the verification code from your email');
            return;
        }

        if (!newPassword.trim()) {
            setError('Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isSupabaseConfigured() || !supabase) {
            setError('Authentication not configured');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Verify OTP and update password
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: emailFromRoute,
                token: otpCode.trim(),
                type: 'recovery',
            });

            if (verifyError) {
                setError(verifyError.message);
                setLoading(false);
                return;
            }

            // Now update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }

        setLoading(false);
    };

    const cardStyle = {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    };

    if (success) {
        return (
            <View style={[styles.container, styles.successContainer, { backgroundColor: t.colors.background }]}>
                <Ionicons name="checkmark-circle" size={64} color={t.colors.success} />
                <Text style={[styles.title, { color: t.colors.text }]}>Password Updated!</Text>
                <Text style={[styles.subtitle, { color: t.colors.textSecondary, textAlign: 'center' }]}>
                    Your password has been successfully reset. You can now log in with your new password.
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
                    <Ionicons name="shield-checkmark-outline" size={48} color={t.colors.primary} />
                    <Text style={[styles.title, { color: t.colors.text }]}>Enter Code</Text>
                    <Text style={[styles.subtitle, { color: t.colors.textSecondary }]}>
                        Enter the 6-digit code from your email and create a new password
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

                    {/* OTP Code Input */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: t.colors.textSecondary }]}>Verification Code</Text>
                        <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
                            <Ionicons name="keypad-outline" size={20} color={t.colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: t.colors.text, letterSpacing: 8, fontSize: 20 }]}
                                placeholder="000000"
                                placeholderTextColor={t.colors.textMuted}
                                value={otpCode}
                                onChangeText={setOtpCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                textAlign="center"
                            />
                        </View>
                    </View>

                    {/* New Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: t.colors.textSecondary }]}>New Password</Text>
                        <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={t.colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: t.colors.text }]}
                                placeholder="Enter new password"
                                placeholderTextColor={t.colors.textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                // @ts-ignore - tabIndex is valid for web
                                tabIndex={-1}
                                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={t.colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: t.colors.textSecondary }]}>Confirm Password</Text>
                        <View style={[styles.inputContainer, { borderColor: t.colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={t.colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: t.colors.text }]}
                                placeholder="Confirm new password"
                                placeholderTextColor={t.colors.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                    </View>

                    <Button
                        title="Reset Password"
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
