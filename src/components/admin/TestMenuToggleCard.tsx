'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlaskConical, ExternalLink, Loader2, CheckCircle2, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getApiUrl } from '@/lib/api';

export default function TestMenuToggleCard() {
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    // Listen to real-time status of test-menu-1pound in Firestore
    const unsub = onSnapshot(
      doc(db, 'menuItems', 'test-menu-1pound'),
      (snap) => {
        if (snap.exists()) {
          setIsActive(Boolean(snap.data()?.active));
        } else {
          setIsActive(false);
        }
        setInitialLoaded(true);
      },
      (err) => {
        console.warn('Realtime listener error for test menu:', err);
        setInitialLoaded(true);
      }
    );

    return () => unsub();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/toggle-test-menu'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsActive(data.active);
        if (data.active) {
          toast.success('£1 Test Subscription Menu is now ACTIVE on /menu! 🎉');
        } else {
          toast.info('£1 Test Subscription Menu is now HIDDEN from customers. 🔒');
        }
      } else {
        toast.error(data.error || 'Failed to update test menu status.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-emerald-50/80 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Icon & Details */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
            <FlaskConical size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-800 text-foreground text-base tracking-tight">
                £1 Test Subscription Menu (Worldpay Testing)
              </h3>
              <span className="text-xs font-800 px-2.5 py-0.5 rounded-full bg-primary text-white shadow-xs">
                £1.00 / plan
              </span>
              {initialLoaded && (
                <span
                  className={`text-xs font-700 px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Live on /menu
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} className="text-gray-500" />
                      Hidden from Menu
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Enables a £1.00 meal plan on the customer menu with the full subscription & checkout flow.
              Allows you to safely test live Worldpay card payments, recurring renewals, and confirmation emails
              for only <strong>£1.00</strong> (all delivery & container fees are automatically waived).
            </p>
          </div>
        </div>

        {/* Right Side: Toggle & Actions */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-amber-200/60">
          {isActive && (
            <Link
              href="/menu"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-700 text-primary bg-white border border-primary/30 px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-xs"
            >
              <span>Test on /menu</span>
              <ExternalLink size={13} />
            </Link>
          )}

          <button
            type="button"
            onClick={handleToggle}
            disabled={loading || !initialLoaded}
            className={`flex items-center gap-2 font-800 text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive ? 'bg-white' : 'bg-emerald-200 animate-ping'
                }`}
              />
            )}
            <span>{isActive ? 'Turn OFF (£1 Menu)' : 'Turn ON (£1 Menu)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
