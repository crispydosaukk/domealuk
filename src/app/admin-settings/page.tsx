'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-dashboard/components/AdminLayout';
import { Package } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [referralAmount, setReferralAmount] = useState<number>(10);
  const [savingSetting, setSavingSetting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'referral');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().amount) {
          setReferralAmount(snap.data().amount);
        }
      } catch (error) {
        // Silently catch error to prevent Next.js overlay.
        // This happens if Firestore rules are not set up yet.
        console.warn("Could not fetch settings. Check Firestore rules.");
      }
    };
    fetchSettings();
  }, [user]);

  const handleSaveReferral = async () => {
    setSavingSetting(true);
    try {
      await setDoc(doc(db, 'settings', 'referral'), { amount: referralAmount }, { merge: true });
      toast.success('Referral amount updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update referral amount. Check Firestore rules.');
    }
    setSavingSetting(false);
  };

  return (
    <AdminLayout activeRoute="/admin-settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage application settings and rewards</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
            <div>
              <h2 className="font-700 text-base text-foreground flex items-center gap-2"><Package size={18} className="text-primary" /> Global Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Configuration for public-facing features</p>
            </div>
          </div>
          
          <div className="max-w-md bg-gray-50 p-5 rounded-xl border border-border">
            <label className="block text-sm font-800 text-foreground mb-3">Refer a Friend Reward (£)</label>
            <div className="flex gap-3">
              <input 
                type="number" 
                value={referralAmount} 
                onChange={(e) => setReferralAmount(Number(e.target.value))}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
              <button 
                onClick={handleSaveReferral}
                disabled={savingSetting}
                className="bg-primary text-white font-800 px-6 py-2.5 rounded-xl hover:bg-[#10261A] transition-all whitespace-nowrap disabled:opacity-50 shadow-sm"
              >
                {savingSetting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">This is the reward amount that both the referrer and the referee will receive. It updates dynamically across the entire website.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
