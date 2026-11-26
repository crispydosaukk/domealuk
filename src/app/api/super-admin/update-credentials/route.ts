import { NextResponse } from 'next/server';
import { dbAdmin, authAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (dbAdmin) {
      const staffDocRef = dbAdmin.collection('settings').doc('superAdminStaff');
      const snap = await staffDocRef.get();
      if (snap.exists) {
        const data = snap.data();
        return NextResponse.json({
          success: true,
          staff: Array.isArray(data?.staff) ? data.staff : [],
          updatedAt: data?.updatedAt || null,
        });
      }
    }
    return NextResponse.json({ success: true, staff: [] });
  } catch (error: any) {
    console.error('Error fetching staff list in update-credentials:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      oldEmail,
      newEmail,
      password,
      role,
      permissions,
      status,
      staffList,
      updatedBy,
    } = body;

    // 1. Sync full staff list directly
    if (action === 'sync_all' || (Array.isArray(staffList) && !oldEmail)) {
      if (dbAdmin) {
        const staffDocRef = dbAdmin.collection('settings').doc('superAdminStaff');
        await staffDocRef.set(
          {
            staff: staffList,
            updatedAt: new Date(),
            updatedBy: updatedBy || 'Super Admin',
          },
          { merge: true }
        );
      }
      return NextResponse.json({
        success: true,
        staff: staffList,
        message: 'Staff list successfully persisted in Firestore settings',
      });
    }

    const cleanOldEmail = (oldEmail || '').trim().toLowerCase();
    const cleanNewEmail = (newEmail || oldEmail || '').trim().toLowerCase();

    // 2. Handle account deletion / revocation
    if (action === 'delete') {
      if (!cleanOldEmail) {
        return NextResponse.json({ error: 'oldEmail is required for deletion' }, { status: 400 });
      }

      if (authAdmin) {
        try {
          const userRecord = await authAdmin.getUserByEmail(cleanOldEmail);
          await authAdmin.deleteUser(userRecord.uid);
        } catch (e: any) {
          console.warn('Note deleting user from Firebase Auth:', e.message);
        }
      }

      let updatedStaff: any[] = [];
      if (dbAdmin) {
        try {
          const staffDocRef = dbAdmin.collection('settings').doc('superAdminStaff');
          const snap = await staffDocRef.get();
          if (snap.exists) {
            const existingStaff = Array.isArray(snap.data()?.staff) ? snap.data().staff : [];
            updatedStaff = existingStaff.filter(
              (s: any) => s.email?.toLowerCase() !== cleanOldEmail
            );
            await staffDocRef.set({ staff: updatedStaff, updatedAt: new Date() }, { merge: true });
          }
        } catch (e: any) {
          console.warn('Note updating Firestore on delete:', e.message);
        }
      }

      return NextResponse.json({
        success: true,
        staff: updatedStaff,
        message: `Access revoked for ${cleanOldEmail}`,
      });
    }

    // 3. Add or update staff credentials
    if (!cleanOldEmail && !cleanNewEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const targetEmail = cleanNewEmail || cleanOldEmail;
    let authUpdated = false;
    let authCreated = false;
    let authError: string | null = null;

    if (authAdmin) {
      try {
        const userRecord = await authAdmin.getUserByEmail(cleanOldEmail);
        const updatePayload: any = {};

        if (cleanNewEmail && cleanNewEmail !== cleanOldEmail) {
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
          // If the admin user does not exist in Firebase Auth yet and a password was supplied, create it
          if (password && password.trim().length >= 6) {
            try {
              await authAdmin.createUser({
                email: targetEmail,
                password: password.trim(),
                displayName: targetEmail.split('@')[0],
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

    // Synchronize single staff record in Firestore settings/superAdminStaff if dbAdmin available
    let existingStaff: any[] = [];
    if (dbAdmin) {
      try {
        const staffDocRef = dbAdmin.collection('settings').doc('superAdminStaff');
        const snap = await staffDocRef.get();

        if (snap.exists) {
          const data = snap.data();
          existingStaff = Array.isArray(data?.staff) ? [...data.staff] : [];
        }

        const memberIndex = existingStaff.findIndex(
          (s: any) =>
            s.email?.toLowerCase() === cleanOldEmail || s.email?.toLowerCase() === targetEmail
        );

        if (memberIndex >= 0) {
          existingStaff[memberIndex] = {
            ...existingStaff[memberIndex],
            email: targetEmail,
            role: role || existingStaff[memberIndex].role || 'Operations Admin',
            status: status || existingStaff[memberIndex].status || 'Active',
            permissions:
              permissions ||
              existingStaff[memberIndex].permissions || [
                'Orders & Dispatch',
                'Customer Support',
              ],
            lastEdited: new Date().toISOString(),
            ...(password && password.trim().length >= 6
              ? {
                  initialPassword: password.trim(),
                  passwordLastChanged: new Date().toISOString(),
                }
              : {}),
          };
        } else {
          // New member insertion
          existingStaff.push({
            email: targetEmail,
            role: role || 'Operations Admin',
            status: status || 'Active',
            permissions: permissions || ['Orders & Dispatch', 'Customer Support'],
            addedDate: new Date().toISOString().split('T')[0],
            lastActive: 'Never',
            ...(password && password.trim().length >= 6
              ? {
                  initialPassword: password.trim(),
                  passwordLastChanged: new Date().toISOString(),
                }
              : {}),
          });
        }

        await staffDocRef.set(
          {
            staff: existingStaff,
            updatedAt: new Date(),
            updatedBy: updatedBy || 'Super Admin',
          },
          { merge: true }
        );
      } catch (dbErr: any) {
        console.warn('Firestore update warning in update-credentials:', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      staff: existingStaff,
      authUpdated,
      authCreated,
      authError,
      message: authUpdated
        ? `Credentials for ${targetEmail} updated successfully in Firebase Auth.`
        : authCreated
        ? `Created new Firebase Auth credentials for ${targetEmail}.`
        : `Staff settings and permissions saved for ${targetEmail}.`,
    });
  } catch (error: any) {
    console.error('Error in /api/super-admin/update-credentials:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
