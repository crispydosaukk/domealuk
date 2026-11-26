/**
 * Admin & Super Admin authorization configuration and helpers.
 */

const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
const envSuperAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.trim();

export const ADMIN_EMAILS: string[] = Array.from(
  new Set([
    'superadmin@domeal.co.uk',
    'admin@vegchennaisrilalitha.co.uk',
    ...(envAdmin ? [envAdmin] : []),
  ])
);

export const SUPER_ADMIN_EMAILS: string[] = Array.from(
  new Set([
    'superadmin@domeal.co.uk',
    ...(envSuperAdmin ? [envSuperAdmin] : []),
  ])
);

export const PRIMARY_ADMIN_EMAIL = 'admin@vegchennaisrilalitha.co.uk';
export const PRIMARY_SUPER_ADMIN_EMAIL = 'superadmin@domeal.co.uk';

// Dynamic registries synced from settings/superAdminStaff
const dynamicAdminEmails: Set<string> = new Set();
const dynamicSuperAdminEmails: Set<string> = new Set();

export function registerDynamicAdminEmails(
  staffList: { email: string; role?: string; status?: string }[]
) {
  dynamicAdminEmails.clear();
  dynamicSuperAdminEmails.clear();
  staffList.forEach((s) => {
    if (s.status !== 'Suspended' && s.email) {
      const email = s.email.toLowerCase().trim();
      dynamicAdminEmails.add(email);
      // Standard admin must never become dynamic super admin
      if (s.role === 'Super Admin' && email !== 'admin@vegchennaisrilalitha.co.uk') {
        dynamicSuperAdminEmails.add(email);
      }
    }
  });
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized)) return true;
  if (dynamicAdminEmails.has(normalized)) return true;
  return false;
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  // Operational admins are never super admin
  if (normalized === 'admin@vegchennaisrilalitha.co.uk' || normalized === 'admin@domeal.co.uk') return false;
  if (SUPER_ADMIN_EMAILS.some((superAdmin) => superAdmin.toLowerCase() === normalized)) return true;
  if (dynamicSuperAdminEmails.has(normalized)) return true;
  return false;
}

/**
 * Returns dynamic system greeting based on current local time:
 * - 05:00 - 11:59: 'Good morning'
 * - 12:00 - 16:59: 'Good afternoon'
 * - 17:00 - 04:59: 'Good evening'
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}
