/**
 * ContentListScreen - Generic list view for admin content management
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { spacing, fontSize, borderRadius } from '../../theme';
import { EntityType, ContentData, RootStackParamList } from '../../types';
import { adminService } from '../../services/adminService';
import { hasPermission } from '../../services/permissionService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Entity display configuration
const ENTITY_CONFIG: Record<EntityType, {
    label: string;
    labelPlural: string;
    icon: keyof typeof Ionicons.glyphMap;
    nameField: string;
    subtitleField?: string;
}> = {
    composer: {
        label: 'Composer',
        labelPlural: 'Composers',
        icon: 'person',
        nameField: 'name',
        subtitleField: 'years',
    },
    term: {
        label: 'Term',
        labelPlural: 'Terms',
        icon: 'book',
        nameField: 'term',
        subtitleField: 'category',
    },
    period: {
        label: 'Period',
        labelPlural: 'Periods',
        icon: 'time',
        nameField: 'name',
        subtitleField: 'years',
    },
    form: {
        label: 'Form',
        labelPlural: 'Forms',
        icon: 'musical-notes',
        nameField: 'name',
        subtitleField: 'category',
    },
    concert_hall: {
        label: 'Concert Hall',
        labelPlural: 'Concert Halls',
        icon: 'business',
        nameField: 'name',
        subtitleField: 'city',
    },
    weekly_album: {
        label: 'Weekly Album',
        labelPlural: 'Weekly Albums',
        icon: 'disc',
        nameField: 'title',
        subtitleField: 'artist',
    },
    monthly_spotlight: {
        label: 'Spotlight',
        labelPlural: 'Spotlights',
        icon: 'star',
        nameField: 'title',
        subtitleField: 'type',
    },
};

interface ContentListScreenParams {
    entityType: EntityType;
}

export function ContentListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<{ params: ContentListScreenParams }, 'params'>>();
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const t = theme;

    const entityType = route.params?.entityType || 'composer';
    const config = ENTITY_CONFIG[entityType];

    const [items, setItems] = useState<ContentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Permission check
    const canEdit = hasPermission(user, 'canEditContent');
    const canDelete = hasPermission(user, 'canDeleteContent');

    const fetchItems = useCallback(async () => {
        const data = await adminService.getAll(entityType);
        setItems(data);
        setLoading(false);
    }, [entityType]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchItems();
        setRefreshing(false);
    };

    const handleEdit = (item: ContentData) => {
        (navigation as any).navigate('ContentEdit', {
            entityType,
            entityId: item.id
        });
    };

    const handleDelete = (item: ContentData) => {
        if (!canDelete || !user) return;

        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${(item as any)[config.nameField]}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await adminService.remove(entityType, item.id, {
                            id: user.id,
                            email: user.email,
                        });
                        if (!error) {
                            fetchItems();
                        } else {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCreate = () => {
        (navigation as any).navigate('ContentEdit', {
            entityType,
            entityId: null
        });
    };

    // Filter items by search query
    const filteredItems = items.filter((item) => {
        const name = ((item as any)[config.nameField] || '').toLowerCase();
        const subtitle = config.subtitleField
            ? ((item as any)[config.subtitleField] || '').toLowerCase()
            : '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || subtitle.includes(query);
    });

    const renderItem = ({ item }: { item: ContentData }) => {
        const name = (item as any)[config.nameField];
        const subtitle = config.subtitleField ? (item as any)[config.subtitleField] : null;

        return (
            <TouchableOpacity
                style={[styles.itemCard, {
                    backgroundColor: t.colors.surface,
                    borderColor: t.colors.border,
                }]}
                onPress={() => handleEdit(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.itemIcon, { backgroundColor: `${t.colors.primary}20` }]}>
                    <Ionicons name={config.icon} size={20} color={t.colors.primary} />
                </View>

                <View style={styles.itemContent}>
                    <Text style={[styles.itemName, { color: t.colors.text }]} numberOfLines={1}>
                        {name}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.itemSubtitle, { color: t.colors.textMuted }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                <View style={styles.itemActions}>
                    {canEdit && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: `${t.colors.primary}15` }]}
                            onPress={() => handleEdit(item)}
                        >
                            <Ionicons name="pencil" size={16} color={t.colors.primary} />
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: `${t.colors.error}15` }]}
                            onPress={() => handleDelete(item)}
                        >
                            <Ionicons name="trash" size={16} color={t.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title={config.labelPlural}
                rightAction={canEdit ? (
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: t.colors.primary }]}
                        onPress={handleCreate}
                    >
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                ) : undefined}
            />

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: t.colors.surfaceLight }]}>
                <Ionicons name="search" size={18} color={t.colors.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: t.colors.text }]}
                    placeholder={`Search ${config.labelPlural.toLowerCase()}...`}
                    placeholderTextColor={t.colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={t.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, { borderBottomColor: t.colors.border }]}>
                <Text style={[styles.statsText, { color: t.colors.textMuted }]}>
                    {filteredItems.length} {filteredItems.length === 1 ? config.label : config.labelPlural}
                </Text>
            </View>

            {/* List */}
            <FlatList
                data={filteredItems}
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
                        <Ionicons name={config.icon} size={48} color={t.colors.textMuted} />
                        <Text style={[styles.emptyText, { color: t.colors.textMuted }]}>
                            {searchQuery
                                ? `No ${config.labelPlural.toLowerCase()} match your search`
                                : `No ${config.labelPlural.toLowerCase()} yet`
                            }
                        </Text>
                        {canEdit && !searchQuery && (
                            <TouchableOpacity
                                style={[styles.emptyButton, { backgroundColor: t.colors.primary }]}
                                onPress={handleCreate}
                            >
                                <Text style={styles.emptyButtonText}>Create First {config.label}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.md,
        paddingVertical: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        marginTop: spacing.sm,
    },
    statsText: {
        fontSize: fontSize.sm,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    itemActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
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
    emptyButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
