// utils/roleHelper.js

// Roles that can act like "employer" (post jobs, manage applicants)
export const EMPLOYER_LIKE_ROLES = ['employer', 'hr-admin', 'superadmin'];

// Roles that can manage users/system
export const PLATFORM_ADMIN_ROLES = ['superadmin'];

export const isEmployerLike = (role) => EMPLOYER_LIKE_ROLES.includes(role);
export const isPlatformAdmin = (role) => PLATFORM_ADMIN_ROLES.includes(role);


// permission checkers
export const canManageJob = (jobPost, user) => {

  if (!jobPost || !user) return false;

  if (user.role === 'superadmin') return true;

  if (user.role === 'employer' && jobPost.employer?.toString() === user.id.toString()) {
    return true;
  }
  // console.log("tetttt", user.id);

   // HR-Admin → manages jobs for assigned employer
  if (user.role === 'hr-admin' && user.employerIds?.some(eid => eid.toString() === jobPost.employer.toString())) {
    return true;
}

  return false;
};