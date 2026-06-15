import type { UserRole } from '@/lib/apiSchemas';

export const rolePermissions = {
  admin: {
    canAccessAdmin: true,
    canAccessModeration: true,
  },
  moderator: {
    canAccessAdmin: false,
    canAccessModeration: true,
  },
  user: {
    canAccessAdmin: false,
    canAccessModeration: false,
  },
} as const satisfies Record<UserRole, {
  canAccessAdmin: boolean;
  canAccessModeration: boolean;
}>;

export const baseHomeTabs = [
  'Home',
  'Explore',
  'Notifications',
  'Messages',
  'Support',
  'Profile',
];

export const primaryMobileTabs = ['Home', 'Explore', 'Messages'];

function getRolePermissions(role?: UserRole | string | null) {
  if (role === 'admin' || role === 'moderator' || role === 'user') {
    return rolePermissions[role];
  }

  return rolePermissions.user;
}

export function canAccessModeration(role?: UserRole | string | null) {
  return getRolePermissions(role).canAccessModeration;
}

export function canAccessAdmin(role?: UserRole | string | null) {
  return getRolePermissions(role).canAccessAdmin;
}

export function canModerateRole(role?: UserRole | string | null) {
  return canAccessModeration(role);
}

export function canAdminRole(role?: UserRole | string | null) {
  return canAccessAdmin(role);
}

export function buildHomeTabsForRole(role?: UserRole | string | null) {
  return [
    ...baseHomeTabs,
    ...(canAccessModeration(role) ? ['Moderation'] : []),
    ...(canAccessAdmin(role) ? ['Admin'] : []),
  ];
}
