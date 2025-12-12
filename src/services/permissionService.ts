/**
 * Permission Service - Role-based access control
 */
import { UserProfile, UserRole } from '../types';

// Permission definitions
export interface Permissions {
    canViewAdmin: boolean;
    canEditContent: boolean;
    canDeleteContent: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
    canRestoreVersions: boolean;
}

// Get permissions for a user role
export function getPermissions(role: UserRole | undefined): Permissions {
    const isAdmin = role === 'admin';

    return {
        canViewAdmin: isAdmin,
        canEditContent: isAdmin,
        canDeleteContent: isAdmin,
        canManageUsers: isAdmin,
        canViewAuditLogs: isAdmin,
        canRestoreVersions: isAdmin,
    };
}

// Check if user is admin
export function isAdmin(user: UserProfile | null): boolean {
    return user?.role === 'admin';
}

// Check specific permission
export function hasPermission(
    user: UserProfile | null,
    permission: keyof Permissions
): boolean {
    if (!user) return false;
    const permissions = getPermissions(user.role);
    return permissions[permission];
}

// Hook-friendly permission check
export function usePermissions(user: UserProfile | null): Permissions {
    if (!user) {
        return {
            canViewAdmin: false,
            canEditContent: false,
            canDeleteContent: false,
            canManageUsers: false,
            canViewAuditLogs: false,
            canRestoreVersions: false,
        };
    }
    return getPermissions(user.role);
}
