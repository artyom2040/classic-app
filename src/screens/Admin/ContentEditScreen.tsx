/**
 * ContentEditScreen - Form-based editor for creating/updating content
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
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

// Field configuration for each entity type
interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'url' | 'array';
    required?: boolean;
    placeholder?: string;
    multiline?: boolean;
}

const ENTITY_FIELDS: Record<EntityType, FieldConfig[]> = {
    composer: [
        { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Wolfgang Amadeus Mozart' },
        { key: 'years', label: 'Years', type: 'text', required: true, placeholder: '1756-1791' },
        { key: 'period', label: 'Period', type: 'text', required: true, placeholder: 'Classical' },
        { key: 'nationality', label: 'Nationality', type: 'text', placeholder: 'Austrian' },
        { key: 'shortBio', label: 'Short Bio', type: 'textarea', placeholder: 'A brief description...' },
        { key: 'fullBio', label: 'Full Bio', type: 'textarea', multiline: true, placeholder: 'Full biography...' },
        { key: 'portrait', label: 'Portrait URL', type: 'url', placeholder: 'https://...' },
        { key: 'funFact', label: 'Fun Fact', type: 'textarea', placeholder: 'An interesting fact...' },
        { key: 'listenFirst', label: 'Listen First', type: 'text', placeholder: 'Recommended first piece' },
    ],
    term: [
        { key: 'term', label: 'Term', type: 'text', required: true, placeholder: 'Allegro' },
        { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Tempo' },
        { key: 'shortDefinition', label: 'Short Definition', type: 'text', placeholder: 'Brief explanation' },
        { key: 'longDefinition', label: 'Full Definition', type: 'textarea', multiline: true, placeholder: 'Detailed explanation...' },
        { key: 'example', label: 'Example', type: 'text', placeholder: 'Example usage...' },
    ],
    period: [
        { key: 'name', label: 'Period Name', type: 'text', required: true, placeholder: 'Baroque' },
        { key: 'years', label: 'Years', type: 'text', required: true, placeholder: '1600-1750' },
        { key: 'description', label: 'Description', type: 'textarea', multiline: true, placeholder: 'About this era...' },
        { key: 'color', label: 'Color Code', type: 'text', placeholder: '#8B4513' },
    ],
    form: [
        { key: 'name', label: 'Form Name', type: 'text', required: true, placeholder: 'Sonata' },
        { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'Instrumental' },
        { key: 'period', label: 'Period', type: 'text', placeholder: 'Classical' },
        { key: 'description', label: 'Description', type: 'textarea', multiline: true, placeholder: 'About this form...' },
    ],
    concert_hall: [
        { key: 'name', label: 'Hall Name', type: 'text', required: true, placeholder: 'Carnegie Hall' },
        { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'New York' },
        { key: 'description', label: 'Description', type: 'textarea', multiline: true, placeholder: 'About this venue...' },
        { key: 'signatureSound', label: 'Signature Sound', type: 'text', placeholder: 'Known for...' },
        { key: 'mapUrl', label: 'Map URL', type: 'url', placeholder: 'https://maps.google.com/...' },
    ],
    weekly_album: [
        { key: 'title', label: 'Album Title', type: 'text', required: true, placeholder: 'Symphony No. 9' },
        { key: 'artist', label: 'Artist/Performer', type: 'text', required: true, placeholder: 'Berlin Philharmonic' },
        { key: 'year', label: 'Year', type: 'number', placeholder: '2023' },
        { key: 'week', label: 'Week Number', type: 'number', required: true, placeholder: '1' },
        { key: 'description', label: 'Description', type: 'textarea', multiline: true, placeholder: 'About this album...' },
        { key: 'whyListen', label: 'Why Listen', type: 'textarea', placeholder: 'What makes it special...' },
        { key: 'spotifyUri', label: 'Spotify URI', type: 'url', placeholder: 'spotify:album:...' },
    ],
    monthly_spotlight: [
        { key: 'title', label: 'Spotlight Title', type: 'text', required: true, placeholder: 'The Requiem' },
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'composer' },
        { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Short tagline' },
        { key: 'month', label: 'Month (1-12)', type: 'number', required: true, placeholder: '12' },
        { key: 'description', label: 'Description', type: 'textarea', multiline: true, placeholder: 'Full description...' },
        { key: 'challenge', label: 'Listening Challenge', type: 'textarea', placeholder: 'Challenge description...' },
    ],
};

interface ContentEditScreenParams {
    entityType: EntityType;
    entityId: string | null;
}

export function ContentEditScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<{ params: ContentEditScreenParams }, 'params'>>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const t = theme;

    const entityType = route.params?.entityType || 'composer';
    const entityId = route.params?.entityId;
    const isEditing = !!entityId;
    const fields = ENTITY_FIELDS[entityType];

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Permission check
    const canEdit = hasPermission(user, 'canEditContent');

    // Load existing data if editing
    useEffect(() => {
        if (isEditing && entityId) {
            const loadData = async () => {
                const data = await adminService.getById(entityType, entityId);
                if (data) {
                    setFormData(data as Record<string, any>);
                }
                setLoading(false);
            };
            loadData();
        }
    }, [entityId, entityType, isEditing]);

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!canEdit || !user) return;

        // Validate required fields
        const missingFields = fields
            .filter((f) => f.required && !formData[f.key])
            .map((f) => f.label);

        if (missingFields.length > 0) {
            Alert.alert('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        setSaving(true);

        try {
            if (isEditing && entityId) {
                const { error } = await adminService.update(entityType, entityId, formData, {
                    id: user.id,
                    email: user.email,
                });
                if (error) throw error;
            } else {
                const { error } = await adminService.create(entityType, formData, {
                    id: user.id,
                    email: user.email,
                });
                if (error) throw error;
            }

            Alert.alert('Success', `${isEditing ? 'Updated' : 'Created'} successfully!`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field: FieldConfig) => {
        const value = formData[field.key];
        const isMultiline = field.type === 'textarea' || field.multiline;

        return (
            <View key={field.key} style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: t.colors.text }]}>
                    {field.label}
                    {field.required && <Text style={{ color: t.colors.error }}> *</Text>}
                </Text>
                <TextInput
                    style={[
                        styles.fieldInput,
                        isMultiline && styles.fieldInputMultiline,
                        {
                            backgroundColor: t.colors.surfaceLight,
                            color: t.colors.text,
                            borderColor: t.colors.border,
                        },
                    ]}
                    value={value?.toString() || ''}
                    onChangeText={(text) => handleChange(field.key, field.type === 'number' ? Number(text) : text)}
                    placeholder={field.placeholder}
                    placeholderTextColor={t.colors.textMuted}
                    multiline={isMultiline}
                    numberOfLines={isMultiline ? 4 : 1}
                    textAlignVertical={isMultiline ? 'top' : 'center'}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    autoCapitalize={field.type === 'url' ? 'none' : 'sentences'}
                    editable={canEdit}
                />
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Loading..." />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={t.colors.primary} />
                </View>
            </ScreenContainer>
        );
    }

    const entityLabel = ENTITY_FIELDS[entityType]?.[0]?.label?.split(' ')[0] || 'Item';

    return (
        <ScreenContainer>
            <ScreenHeader
                title={isEditing ? `Edit ${entityLabel}` : `New ${entityLabel}`}
                rightAction={
                    canEdit && (
                        <TouchableOpacity
                            style={[styles.saveButton, {
                                backgroundColor: t.colors.primary,
                                opacity: saving ? 0.6 : 1,
                            }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    )
                }
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {fields.map(renderField)}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: spacing.md,
    },
    fieldContainer: {
        marginBottom: spacing.md,
    },
    fieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    fieldInput: {
        fontSize: fontSize.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    fieldInputMultiline: {
        minHeight: 100,
        paddingTop: spacing.sm,
    },
    saveButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
