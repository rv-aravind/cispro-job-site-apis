// utils/roleHelper.js

// Roles that can act like "employer" (post jobs, manage applicants)
export const EMPLOYER_LIKE_ROLES = ['employer', 'hr-admin', 'superadmin'];

// Roles that can manage users/system
export const PLATFORM_ADMIN_ROLES = ['superadmin'];

export const isEmployerLike = (role) => EMPLOYER_LIKE_ROLES.includes(role);
export const isPlatformAdmin = (role) => PLATFORM_ADMIN_ROLES.includes(role);