import { NextResponse } from 'next/server';
import { dbAdmin, authAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { oldEmail, newEmail, password, role, permissions, status } = await req.json();

    if (!oldEmail) {
      return NextResponse.json({ error: 'oldEmail is required' }, { status: 400 });
    }

    const cleanOldEmail = oldEmail.trim().toLowerCase();
    const cleanNewEmail = (newEmail || oldEmail).trim().toLowerCase();

    let authUpdated = false;
    let authCreated = false;
    let authError: string | null = null;

    // 1. Update Firebase Auth credentials if Firebase Admin Auth is initialized
    if (authAdmin) {
      try {
        const userRecord = await authAdmin.getUserByEmail(cleanOldEmail);
        const updatePayload: any = {};

        if (cleanNewEmail !== cleanOldEmail) {
          updatePayload.email = cleanNewEmail;
        }
        if (password && password.trim().length >= 6) {
          updatePayload.password = password.trim();
        }

        if (Object.keys(updatePayload).length > 0) {
          await authAdmin.updateUser(userRecord.uid, updatePayload);
          authUpdated = true;
        }
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          // If the admin user did not exist in Firebase Auth yet and a password was supplied, create it
          if (password && password.trim().length >= 6) {
            try {
              await authAdmin.createUser({
                email: cleanNewEmail,
                password: password.trim(),
                displayName: cleanNewEmail.split('@')[0],
              });
              authCreated = true;
            } catch (createErr: any) {
              authError = createErr.message;
            }
          }
        } else {
          authError = err.message;
        }
      }
    }

    // 2. Synchronize staff in Firestore settings/superAdminStaff
    if (dbAdmin) {
      try {
        const staffDocRef = dbAdmin.collection('settings').doc('superAdminStaff');
        const snap = await staffDocRef.get();
        if (snap.exists) {
          const data = snap.data();
          const existingStaff = Array.isArray(data?.staff) ? data.staff : [];
          const updatedStaff = existingStaff.map((s: any) => {
            if (s.email && s.email.toLowerCase() === cleanOldEmail) {
              return {
                ...s,
                email: cleanNewEmail,
                role: role || s.role,
                status: status || s.status || 'Active',
                permissions: permissions || s.permissions || [],
                lastEdited: new Date().toISOString(),
                ...(password && password.trim().length >= 6
                  ? { passwordLastChanged: new Date().toISOString() }
                  : {}),
              };
            }
            return s;
          });
          await staffDocRef.set({ staff: updatedStaff, updatedAt: new Date() }, { merge: true });
        }
      } catch (dbErr: any) {
        console.warn('Firestore update warning in update-credentials:', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      authUpdated,
      authCreated,
      authError,
      message: authUpdated
        ? `Credentials for ${cleanNewEmail} updated successfully in Firebase Auth.`
        : authCreated
        ? `Created new Firebase Auth credentials for ${cleanNewEmail}.`
        : `Staff settings and permissions saved for ${cleanNewEmail}.`,
    });
  } catch (error: any) {
    console.error('Error in /api/super-admin/update-credentials:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
