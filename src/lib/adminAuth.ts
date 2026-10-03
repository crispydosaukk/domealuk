/**
 * Admin authorization configuration and helpers.
 */

const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();

export const ADMIN_EMAILS: string[] = Array.from(
  new Set([
    'admin@vegchennaisrilalitha.co.uk',
    ...(envAdmin ? [envAdmin] : []),
    'domealuk79812@gmail.com',
  ])
);

export const PRIMARY_ADMIN_EMAIL = envAdmin || 'admin@vegchennaisrilalitha.co.uk';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}
