/**
 * Role-Based Access Control (RBAC) Utility
 * Defines roles, permissions, and access control logic
 */

// =====================================================
// ROLE DEFINITIONS
// =====================================================

export const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer',
  STAFF: 'staff',
  CUSTOMER: 'customer',
};

// =====================================================
// PERMISSION DEFINITIONS
// =====================================================

export const PERMISSIONS = {
  // Asset Management
  VIEW_ASSETS: 'view_assets',
  CREATE_ASSET: 'create_asset',
  EDIT_ASSET: 'edit_asset',
  DELETE_ASSET: 'delete_asset',
  VIEW_ASSET_DETAILS: 'view_asset_details',
  EXPORT_ASSETS: 'export_assets',

  // Shipment Management
  VIEW_SHIPMENTS: 'view_shipments',
  CREATE_SHIPMENT: 'create_shipment',
  EDIT_SHIPMENT: 'edit_shipment',
  DELETE_SHIPMENT: 'delete_shipment',
  DISPATCH_SHIPMENT: 'dispatch_shipment',
  ASSIGN_OFFICER: 'assign_officer',

  // Location Tracking
  VIEW_LOCATIONS: 'view_locations',
  UPDATE_LOCATION: 'update_location',
  VIEW_LOCATION_HISTORY: 'view_location_history',

  // Custody Management
  VIEW_CUSTODY: 'view_custody',
  CREATE_CUSTODY_TRANSFER: 'create_custody_transfer',
  VERIFY_SEAL: 'verify_seal',
  REPORT_INCIDENT: 'report_incident',

  // Consignment Management
  VIEW_CONSIGNMENTS: 'view_consignments',
  CREATE_CONSIGNMENT: 'create_consignment',
  EDIT_CONSIGNMENT: 'edit_consignment',
  APPROVE_CONSIGNMENT: 'approve_consignment',

  // Customer Management
  VIEW_CUSTOMERS: 'view_customers',
  CREATE_CUSTOMER: 'create_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',

  // Staff Management
  VIEW_STAFF: 'view_staff',
  CREATE_STAFF: 'create_staff',
  EDIT_STAFF: 'edit_staff',
  DELETE_STAFF: 'delete_staff',

  // Reporting & Analytics
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORT: 'generate_report',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_REPORT: 'export_report',

  // Configuration
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_FEES: 'manage_fees',
  MANAGE_FACILITIES: 'manage_facilities',

  // Audit & Compliance
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_COMPLIANCE: 'view_compliance',

  // Account Management
  MANAGE_PROFILE: 'manage_profile',
  CHANGE_PASSWORD: 'change_password',
  ENABLE_2FA: 'enable_2fa',
};

// =====================================================
// ROLE TO PERMISSIONS MAPPING
// =====================================================

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to all permissions
    Object.values(PERMISSIONS),
  ].flat(),

  [ROLES.OFFICER]: [
    // Asset Management
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_ASSET_DETAILS,
    PERMISSIONS.EXPORT_ASSETS,

    // Shipment Management
    PERMISSIONS.VIEW_SHIPMENTS,
    PERMISSIONS.EDIT_SHIPMENT,
    PERMISSIONS.DISPATCH_SHIPMENT,

    // Location Tracking
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.UPDATE_LOCATION,
    PERMISSIONS.VIEW_LOCATION_HISTORY,

    // Custody Management
    PERMISSIONS.VIEW_CUSTODY,
    PERMISSIONS.CREATE_CUSTODY_TRANSFER,
    PERMISSIONS.VERIFY_SEAL,
    PERMISSIONS.REPORT_INCIDENT,

    // Consignment Management
    PERMISSIONS.VIEW_CONSIGNMENTS,

    // Reporting
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORT,

    // Account
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA,
  ],

  [ROLES.STAFF]: [
    // Asset Management
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_ASSET_DETAILS,

    // Location Tracking
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.UPDATE_LOCATION,
    PERMISSIONS.VIEW_LOCATION_HISTORY,

    // Custody Management
    PERMISSIONS.VIEW_CUSTODY,
    PERMISSIONS.VERIFY_SEAL,

    // Consignment Management
    PERMISSIONS.VIEW_CONSIGNMENTS,

    // Account
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA,
  ],

  [ROLES.CUSTOMER]: [
    // Asset Management
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_ASSET_DETAILS,

    // Location Tracking (Own assets only)
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.VIEW_LOCATION_HISTORY,

    // Consignment Management (Own consignments)
    PERMISSIONS.VIEW_CONSIGNMENTS,

    // Reporting
    PERMISSIONS.VIEW_REPORTS,

    // Account
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA,
  ],
};

// =====================================================
// ACCESS CONTROL FUNCTIONS
// =====================================================

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions to check
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a role
 * @param {string} userRole - User's role
 */
export const getPermissionsForRole = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if role is higher in hierarchy (for cascading permissions)
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 */
export const isRoleHigherThan = (role1, role2) => {
  const hierarchy = [ROLES.ADMIN, ROLES.OFFICER, ROLES.STAFF, ROLES.CUSTOMER];
  const role1Index = hierarchy.indexOf(role1);
  const role2Index = hierarchy.indexOf(role2);
  return role1Index < role2Index;
};

/**
 * Get role display name
 * @param {string} role - Role
 */
export const getRoleDisplayName = (role) => {
  const displayNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.OFFICER]: 'Logistics Officer',
    [ROLES.STAFF]: 'Staff Member',
    [ROLES.CUSTOMER]: 'Customer',
  };
  return displayNames[role] || role;
};

/**
 * Get role badge color for UI
 * @param {string} role - Role
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'bg-red-500/20 text-red-400 border-red-500',
    [ROLES.OFFICER]: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
    [ROLES.STAFF]: 'bg-blue-500/20 text-blue-400 border-blue-500',
    [ROLES.CUSTOMER]: 'bg-green-500/20 text-green-400 border-green-500',
  };
  return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500';
};

// =====================================================
// RESOURCE-LEVEL ACCESS CONTROL
// =====================================================

/**
 * Check if user can view resource (data isolation)
 * @param {Object} user - User object
 * @param {Object} resource - Resource to access
 */
export const canViewResource = (user, resource) => {
  if (!user || !resource) return false;

  // Admin can view everything
  if (user.role === ROLES.ADMIN) return true;

  // Officer can view all assets in shipments
  if (user.role === ROLES.OFFICER) return true;

  // Staff can view all assets
  if (user.role === ROLES.STAFF) return true;

  // Customers can only view their own consignments/assets
  if (user.role === ROLES.CUSTOMER) {
    return resource.customer_id === user.customer_id;
  }

  return false;
};

/**
 * Check if user can edit resource
 * @param {Object} user - User object
 * @param {Object} resource - Resource to edit
 */
export const canEditResource = (user, resource) => {
  if (!user || !resource) return false;

  // Admin can edit everything
  if (user.role === ROLES.ADMIN) return true;

  // Officer can edit shipments they're assigned to
  if (user.role === ROLES.OFFICER) {
    return (
      resource.assigned_officer_id === user.id ||
      resource.type === 'shipment'
    );
  }

  // Staff cannot edit
  if (user.role === ROLES.STAFF) return false;

  // Customers cannot edit
  if (user.role === ROLES.CUSTOMER) return false;

  return false;
};

/**
 * Check if user can delete resource
 * @param {Object} user - User object
 * @param {Object} resource - Resource to delete
 */
export const canDeleteResource = (user, resource) => {
  if (!user || !resource) return false;

  // Only admin can delete
  if (user.role === ROLES.ADMIN) return true;

  return false;
};

// =====================================================
// AUDIT & LOGGING
// =====================================================

/**
 * Get audit action permissions (track who can do what)
 */
export const getActionAuditPermissions = {
  [ROLES.ADMIN]: {
    CREATE: true,
    READ: true,
    UPDATE: true,
    DELETE: true,
    ASSIGN: true,
    APPROVE: true,
    REJECT: true,
    EXPORT: true,
  },

  [ROLES.OFFICER]: {
    READ: true,
    UPDATE: true,
    ASSIGN: false,
    APPROVE: false,
    REJECT: false,
    EXPORT: true,
  },

  [ROLES.STAFF]: {
    READ: true,
    UPDATE: true,
    ASSIGN: false,
    APPROVE: false,
    REJECT: false,
    EXPORT: false,
  },

  [ROLES.CUSTOMER]: {
    READ: true,
    UPDATE: false,
    ASSIGN: false,
    APPROVE: false,
    REJECT: false,
    EXPORT: true,
  },
};

/**
 * Check if user can perform action (for audit logging)
 * @param {string} userRole - User role
 * @param {string} action - Action to perform
 */
export const canPerformAction = (userRole, action) => {
  const permissions = getActionAuditPermissions[userRole] || {};
  return permissions[action] || false;
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  isRoleHigherThan,
  getRoleDisplayName,
  getRoleBadgeColor,
  canViewResource,
  canEditResource,
  canDeleteResource,
  canPerformAction,
};
