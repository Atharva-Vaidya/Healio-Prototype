/**
 * Role definitions and configuration for the Healio platform.
 *
 * TODO: When Gemini backend is integrated, roles will be returned
 * from the authentication API. This file will serve as the
 * frontend source of truth for role-related UI configuration.
 */

export const ROLES = {
  EMPLOYEE: 'employee',
  HR_MANAGER: 'hr',
  CLINIC: 'clinic',
  TPA: 'tpa',
  ADMIN: 'admin',
};

/**
 * Configuration map for each role — display name, dashboard path,
 * icon emoji, and accent color for the dashboard UI.
 */
export const ROLE_CONFIG = {
  [ROLES.EMPLOYEE]: {
    label: 'Employee',
    path: '/dashboard/employee',
    icon: '👤',
    color: 'teal',
    description: 'View your health wallet, submit claims, and track benefits.',
  },
  [ROLES.HR_MANAGER]: {
    label: 'HR Manager',
    path: '/dashboard/hr',
    icon: '🏢',
    color: 'indigo',
    description: 'Manage employee benefits, review claims, and generate reports.',
  },
  [ROLES.CLINIC]: {
    label: 'Clinic / Hospital',
    path: '/dashboard/clinic',
    icon: '🏥',
    color: 'emerald',
    description: 'Process patient claims, manage appointments, and view settlements.',
  },
  [ROLES.TPA]: {
    label: 'TPA',
    path: '/dashboard/tpa',
    icon: '📋',
    color: 'amber',
    description: 'Adjudicate claims, manage provider networks, and track payouts.',
  },
  [ROLES.ADMIN]: {
    label: 'Platform Admin',
    path: '/dashboard/admin',
    icon: '⚙️',
    color: 'rose',
    description: 'System configuration, user management, and platform analytics.',
  },
};

/**
 * Map demo emails to their corresponding role.
 * Used by the login page to auto-select role when a demo account is clicked.
 */
const EMAIL_ROLE_MAP = {
  'employee@demo.com': ROLES.EMPLOYEE,
  'hr@demo.com': ROLES.HR_MANAGER,
  'clinic@demo.com': ROLES.CLINIC,
  'tpa@demo.com': ROLES.TPA,
  'admin@demo.com': ROLES.ADMIN,
};

export function getRoleFromEmail(email) {
  return EMAIL_ROLE_MAP[email] || null;
}
