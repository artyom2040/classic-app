/**
 * Admin Service - CRUD operations with audit logging and versioning
 */
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import {
    EntityType,
    AuditAction,
    AuditLog,
    ContentVersion,
    ContentData,
    Composer,
    Term,
    Period,
    MusicalForm,
    ConcertHall,
    WeeklyAlbum,
    MonthlySpotlight,
} from '../types';

// ============================================
// Table Mapping
// ============================================

const ENTITY_TABLE_MAP: Record<EntityType, string> = {
    composer: 'composers',
    term: 'terms',
    period: 'periods',
    form: 'forms',
    concert_hall: 'concert_halls',
    weekly_album: 'weekly_albums',
    monthly_spotlight: 'monthly_spotlights',
};

// ============================================
// Audit Logging
// ============================================

interface LogAuditParams {
    action: AuditAction;
    entityType: EntityType;
    entityId: string;
    entityName?: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
    userId?: string;
    userEmail?: string;
}

async function logAudit(params: LogAuditParams): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseClient();

    try {
        await supabase.from('audit_logs').insert({
            user_id: params.userId || null,
            user_email: params.userEmail || null,
            action: params.action,
            entity_type: params.entityType,
            entity_id: params.entityId,
            entity_name: params.entityName || null,
            changes: params.changes || null,
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging shouldn't block operations
    }
}

// ============================================
// Version Management
// ============================================

async function saveVersion(
    entityType: EntityType,
    entityId: string,
    content: Record<string, unknown>,
    userId?: string
): Promise<void> {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseClient();

    try {
        // Get current max version
        const { data: versions } = await supabase
            .from('content_versions')
            .select('version_number')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('version_number', { ascending: false })
            .limit(1);

        const nextVersion = (versions?.[0]?.version_number || 0) + 1;

        await supabase.from('content_versions').insert({
            entity_type: entityType,
            entity_id: entityId,
            version_number: nextVersion,
            content,
            created_by: userId || null,
        });
    } catch (error) {
        console.error('Failed to save version:', error);
    }
}

// ============================================
// CRUD Operations
// ============================================

export interface AdminUser {
    id: string;
    email: string;
}

// Get all items of an entity type
export async function getAll<T extends ContentData>(
    entityType: EntityType
): Promise<T[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabaseClient();
    const table = ENTITY_TABLE_MAP[entityType];

    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Failed to fetch ${entityType}:`, error);
        return [];
    }

    return (data || []) as T[];
}

// Get single item by ID
export async function getById<T extends ContentData>(
    entityType: EntityType,
    id: string
): Promise<T | null> {
    if (!isSupabaseConfigured()) return null;

    const supabase = getSupabaseClient();
    const table = ENTITY_TABLE_MAP[entityType];

    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Failed to fetch ${entityType} ${id}:`, error);
        return null;
    }

    return data as T;
}

// Create new item
export async function create<T extends ContentData>(
    entityType: EntityType,
    data: Omit<T, 'id'>,
    user: AdminUser
): Promise<{ data: T | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: new Error('Supabase not configured') };
    }

    const supabase = getSupabaseClient();
    const table = ENTITY_TABLE_MAP[entityType];

    const { data: created, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

    if (error) {
        return { data: null, error: new Error(error.message) };
    }

    // Log audit
    await logAudit({
        action: 'create',
        entityType,
        entityId: created.id,
        entityName: getEntityName(entityType, created),
        userId: user.id,
        userEmail: user.email,
    });

    // Save initial version
    await saveVersion(entityType, created.id, created, user.id);

    return { data: created as T, error: null };
}

// Update existing item
export async function update<T extends ContentData>(
    entityType: EntityType,
    id: string,
    updates: Partial<T>,
    user: AdminUser
): Promise<{ data: T | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: new Error('Supabase not configured') };
    }

    const supabase = getSupabaseClient();
    const table = ENTITY_TABLE_MAP[entityType];

    // Get current state for diff
    const { data: current } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

    const { data: updated, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { data: null, error: new Error(error.message) };
    }

    // Calculate changes diff
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    if (current) {
        const currentTyped = current as Record<string, unknown>;
        const updatesTyped = updates as Record<string, unknown>;
        for (const key of Object.keys(updates)) {
            if (currentTyped[key] !== updatesTyped[key]) {
                changes[key] = { old: currentTyped[key], new: updatesTyped[key] };
            }
        }
    }

    // Log audit
    await logAudit({
        action: 'update',
        entityType,
        entityId: id,
        entityName: getEntityName(entityType, updated),
        changes,
        userId: user.id,
        userEmail: user.email,
    });

    // Save version
    await saveVersion(entityType, id, updated, user.id);

    return { data: updated as T, error: null };
}

// Delete item
export async function remove(
    entityType: EntityType,
    id: string,
    user: AdminUser
): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) {
        return { error: new Error('Supabase not configured') };
    }

    const supabase = getSupabaseClient();
    const table = ENTITY_TABLE_MAP[entityType];

    // Get current state before deletion
    const { data: current } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

    if (error) {
        return { error: new Error(error.message) };
    }

    // Log audit
    await logAudit({
        action: 'delete',
        entityType,
        entityId: id,
        entityName: current ? getEntityName(entityType, current) : undefined,
        userId: user.id,
        userEmail: user.email,
    });

    return { error: null };
}

// ============================================
// Version Operations
// ============================================

export async function getVersions(
    entityType: EntityType,
    entityId: string
): Promise<ContentVersion[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('version_number', { ascending: false });

    if (error) {
        console.error('Failed to fetch versions:', error);
        return [];
    }

    return (data || []).map(v => ({
        id: v.id,
        entityType: v.entity_type,
        entityId: v.entity_id,
        versionNumber: v.version_number,
        content: v.content,
        createdBy: v.created_by,
        createdAt: v.created_at,
    }));
}

export async function restoreVersion<T extends ContentData>(
    entityType: EntityType,
    entityId: string,
    versionNumber: number,
    user: AdminUser
): Promise<{ data: T | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: new Error('Supabase not configured') };
    }

    const supabase = getSupabaseClient();

    // Get the version to restore
    const { data: version } = await supabase
        .from('content_versions')
        .select('content')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('version_number', versionNumber)
        .single();

    if (!version) {
        return { data: null, error: new Error('Version not found') };
    }

    // Update with restored content
    const result = await update(entityType, entityId, version.content as Partial<T>, user);

    if (!result.error) {
        // Log restore action
        await logAudit({
            action: 'restore',
            entityType,
            entityId,
            entityName: getEntityName(entityType, version.content),
            changes: { version: { old: 'current', new: versionNumber } },
            userId: user.id,
            userEmail: user.email,
        });
    }

    return result;
}

// ============================================
// Audit Log Operations
// ============================================

export interface AuditLogFilters {
    entityType?: EntityType;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    limit?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) return [];

    const supabase = getSupabaseClient();

    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
    }
    if (filters.userId) {
        query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
        query = query.eq('action', filters.action);
    }
    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
    }

    return (data || []).map(log => ({
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        entityName: log.entity_name,
        changes: log.changes,
        createdAt: log.created_at,
    }));
}

// ============================================
// Helper Functions
// ============================================

function getEntityName(entityType: EntityType, data: Record<string, any>): string {
    switch (entityType) {
        case 'composer':
            return data.name || '';
        case 'term':
            return data.term || '';
        case 'period':
            return data.name || '';
        case 'form':
            return data.name || '';
        case 'concert_hall':
            return data.name || '';
        case 'weekly_album':
            return data.title || '';
        case 'monthly_spotlight':
            return data.title || '';
        default:
            return data.name || data.title || data.id || '';
    }
}

// Export for convenience
export const adminService = {
    getAll,
    getById,
    create,
    update,
    remove,
    getVersions,
    restoreVersion,
    getAuditLogs,
};
