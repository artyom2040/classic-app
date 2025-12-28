/**
 * AuditLogScreen - View history of content changes
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { spacing, fontSize, borderRadius } from '../../theme';
import { AuditLog, AuditAction, EntityType } from '../../types';
import { adminService } from '../../services/adminService';
import { hasPermission } from '../../services/permissionService';

// Action styling
const ACTION_STYLES: Record<AuditAction, {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    label: string;
}> = {
    create: { icon: 'add-circle', color: '#10B981', label: 'Created' },
    update: { icon: 'pencil', color: '#3B82F6', label: 'Updated' },
    delete: { icon: 'trash', color: '#EF4444', label: 'Deleted' },
    restore: { icon: 'refresh', color: '#8B5CF6', label: 'Restored' },
};

export function AuditLogScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const t = theme;

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<EntityType | null>(null);

    const canView = hasPermission(user, 'canViewAuditLogs');

    const fetchLogs = useCallback(async () => {
        if (!canView) return;

        const data = await adminService.getAuditLogs({
            entityType: filter || undefined,
            limit: 100,
        });
        setLogs(data);
        setLoading(false);
    }, [canView, filter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLogs();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US');
    };

    const renderChanges = (changes: AuditLog['changes']) => {
        if (!changes || Object.keys(changes).length === 0) return null;

        const changedFields = Object.keys(changes).slice(0, 3);
        const moreCount = Object.keys(changes).length - 3;

        return (
            <View style={styles.changesContainer}>
                {changedFields.map((field) => (
                    <View key={field} style={[styles.changeBadge, { backgroundColor: `${t.colors.primary}10` }]}>
                        <Text style={[styles.changeText, { color: t.colors.primary }]}>
                            {field}
                        </Text>
                    </View>
                ))}
                {moreCount > 0 && (
                    <Text style={[styles.moreText, { color: t.colors.textMuted }]}>
                        +{moreCount} more
                    </Text>
                )}
            </View>
        );
    };

    const renderItem = ({ item }: { item: AuditLog }) => {
        const actionStyle = ACTION_STYLES[item.action];

        return (
            <View style={[styles.logCard, {
                backgroundColor: t.colors.surface,
                borderColor: t.colors.border,
            }]}>
                <View style={[styles.actionIcon, { backgroundColor: `${actionStyle.color}15` }]}>
                    <Ionicons name={actionStyle.icon} size={18} color={actionStyle.color} />
                </View>

                <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                        <Text style={[styles.actionLabel, { color: actionStyle.color }]}>
                            {actionStyle.label}
                        </Text>
                        <Text style={[styles.entityType, { color: t.colors.textMuted }]}>
                            {item.entityType}
                        </Text>
                    </View>

                    <Text style={[styles.entityName, { color: t.colors.text }]} numberOfLines={1}>
                        {item.entityName || item.entityId}
                    </Text>

                    {item.action === 'update' && renderChanges(item.changes)}

                    <View style={styles.logFooter}>
                        <Text style={[styles.userEmail, { color: t.colors.textMuted }]}>
                            {item.userEmail || 'System'}
                        </Text>
                        <Text style={[styles.timestamp, { color: t.colors.textMuted }]}>
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (!canView) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Audit Log" />
                <View style={styles.emptyState}>
                    <Ionicons name="lock-closed" size={48} color={t.colors.textMuted} />
                    <Text style={[styles.emptyText, { color: t.colors.textMuted }]}>
                        You don't have permission to view audit logs
                    </Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Activity Log" />

            {/* Filter Chips */}
            <FlatList
                horizontal
                data={[null, 'composer', 'term', 'period', 'form', 'concert_hall'] as (EntityType | null)[]}
                keyExtractor={(item) => item || 'all'}
                contentContainerStyle={styles.filterContainer}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: filter === item ? t.colors.primary : t.colors.surfaceLight,
                            },
                        ]}
                        onPress={() => setFilter(item)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === item ? '#FFFFFF' : t.colors.text },
                            ]}
                        >
                            {item ? item.replace('_', ' ') : 'All'}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Logs List */}
            <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={t.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color={t.colors.textMuted} />
                        <Text style={[styles.emptyText, { color: t.colors.textMuted }]}>
                            No activity yet
                        </Text>
                    </View>
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        marginRight: spacing.xs,
    },
    filterText: {
        fontSize: fontSize.sm,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    logCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    actionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logContent: {
        flex: 1,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 4,
    },
    actionLabel: {
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    entityType: {
        fontSize: fontSize.xs,
        textTransform: 'capitalize',
    },
    entityName: {
        fontSize: fontSize.md,
        fontWeight: '500',
        marginBottom: 4,
    },
    changesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: 4,
        marginBottom: 8,
    },
    changeBadge: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    changeText: {
        fontSize: fontSize.xs,
        fontWeight: '500',
    },
    moreText: {
        fontSize: fontSize.xs,
        marginLeft: 4,
    },
    logFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    userEmail: {
        fontSize: fontSize.xs,
    },
    timestamp: {
        fontSize: fontSize.xs,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.md,
        textAlign: 'center',
    },
});
