/**
 * Paywall Component
 * Beautiful subscription selection UI
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePurchases } from '../context/PurchasesContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../theme';
import { SubscriptionPackage } from '../services/purchases';

interface PaywallProps {
    visible: boolean;
    onClose: () => void;
    feature?: string; // e.g., "Offline Mode" - shows what feature triggered the paywall
}

export function Paywall({ visible, onClose, feature }: PaywallProps) {
    const { theme } = useTheme();
    const t = theme;
    const { packages, purchase, restore, isLoading } = usePurchases();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async () => {
        if (!selectedPackage) return;
        setError(null);
        const result = await purchase(selectedPackage);
        if (result.success) {
            onClose();
        } else if (result.error) {
            setError(result.error);
        }
    };

    const handleRestore = async () => {
        setError(null);
        const result = await restore();
        if (result.success && result.isPremium) {
            onClose();
        } else if (!result.isPremium) {
            setError('No previous purchases found');
        } else if (result.error) {
            setError(result.error);
        }
    };

    const features = [
        { icon: 'musical-notes', text: 'Unlimited audio samples' },
        { icon: 'download', text: 'Offline access' },
        { icon: 'sparkles', text: 'Exclusive content' },
        { icon: 'notifications-off', text: 'Ad-free experience' },
        { icon: 'analytics', text: 'Advanced quiz stats' },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: t.colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={t.colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={[styles.iconCircle, { backgroundColor: t.colors.primary + '20' }]}>
                            <Ionicons name="diamond" size={48} color={t.colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: t.colors.text }]}>
                            Upgrade to Premium
                        </Text>
                        {feature && (
                            <Text style={[styles.featureNote, { color: t.colors.warning }]}>
                                {feature} requires Premium
                            </Text>
                        )}
                    </View>

                    {/* Features */}
                    <View style={[styles.featuresCard, { backgroundColor: t.colors.surface }]}>
                        {features.map((item, index) => (
                            <View key={index} style={styles.featureRow}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={20}
                                    color={t.colors.primary}
                                />
                                <Text style={[styles.featureText, { color: t.colors.text }]}>
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Packages */}
                    <View style={styles.packages}>
                        {packages.map((pkg) => (
                            <TouchableOpacity
                                key={pkg.identifier}
                                style={[
                                    styles.packageCard,
                                    {
                                        backgroundColor: t.colors.surface,
                                        borderColor: selectedPackage === pkg.identifier
                                            ? t.colors.primary
                                            : t.colors.border,
                                    },
                                    selectedPackage === pkg.identifier && {
                                        borderWidth: 2,
                                        backgroundColor: t.colors.primary + '10',
                                    },
                                ]}
                                onPress={() => setSelectedPackage(pkg.identifier)}
                            >
                                {pkg.productType === 'yearly' && (
                                    <View style={[styles.saveBadge, { backgroundColor: t.colors.success }]}>
                                        <Text style={styles.saveBadgeText}>Save 33%</Text>
                                    </View>
                                )}
                                <Text style={[styles.packageTitle, { color: t.colors.text }]}>
                                    {pkg.title}
                                </Text>
                                <Text style={[styles.packagePrice, { color: t.colors.primary }]}>
                                    {pkg.priceString}
                                </Text>
                                <Text style={[styles.packageDesc, { color: t.colors.textSecondary }]}>
                                    {pkg.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Error */}
                    {error && (
                        <Text style={[styles.error, { color: t.colors.error }]}>
                            {error}
                        </Text>
                    )}

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={[
                            styles.purchaseButton,
                            { backgroundColor: t.colors.primary },
                            (!selectedPackage || isLoading) && { opacity: 0.6 },
                        ]}
                        onPress={handlePurchase}
                        disabled={!selectedPackage || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.purchaseButtonText}>
                                Continue
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Restore */}
                    <TouchableOpacity onPress={handleRestore} disabled={isLoading}>
                        <Text style={[styles.restoreText, { color: t.colors.textSecondary }]}>
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text style={[styles.terms, { color: t.colors.textMuted }]}>
                        Payment will be charged to your App Store/Play Store account.
                        Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
                    </Text>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: spacing.md,
    },
    closeButton: {
        padding: spacing.xs,
    },
    content: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    hero: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    featureNote: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    featuresCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    featureText: {
        fontSize: fontSize.md,
    },
    packages: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    packageCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        position: 'relative',
    },
    saveBadge: {
        position: 'absolute',
        top: -10,
        right: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    saveBadgeText: {
        color: '#fff',
        fontSize: fontSize.xs,
        fontWeight: '600',
    },
    packageTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    packagePrice: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    packageDesc: {
        fontSize: fontSize.sm,
    },
    error: {
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    purchaseButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    purchaseButtonText: {
        color: '#fff',
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    restoreText: {
        textAlign: 'center',
        fontSize: fontSize.sm,
        marginBottom: spacing.lg,
    },
    terms: {
        fontSize: fontSize.xs,
        textAlign: 'center',
        lineHeight: 16,
    },
});
