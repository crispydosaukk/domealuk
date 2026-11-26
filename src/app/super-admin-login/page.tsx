'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Crown,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { isSuperAdminEmail, isAdminEmail } from '@/lib/adminAuth';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const router = useRouter();
  const { login, signup, resetPassword, user, loading } = useAuth();

  useEffect(() => {
    // If already logged in as Super Admin, direct to super-admin dashboard
    if (!loading) {
      const activeUser = user || auth.currentUser;
      if (activeUser?.email) {
        if (isSuperAdminEmail(activeUser.email)) {
          try {
            sessionStorage.setItem('domeal_superadmin_session', activeUser.email);
          } catch {}
          router.push('/super-admin');
        } else if (isAdminEmail(activeUser.email)) {
          router.push('/admin-dashboard');
        }
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Please enter both Super Admin email and password.');
      return;
    }

    if (!isAdminEmail(cleanEmail)) {
      setError('Access Denied: This email does not hold administrative privileges.');
      return;
    }

    setLoadingAction(true);
    setError('');

    try {
      await login(cleanEmail, password);
      if (isSuperAdminEmail(cleanEmail)) {
        try {
          sessionStorage.setItem('domeal_superadmin_session', cleanEmail);
        } catch {}
        toast.success('Super Admin authenticated successfully');
        router.push('/super-admin');
      } else {
        toast.info('Signed in as Operations Admin — Redirecting to Admin Dashboard...');
        router.push('/admin-dashboard');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signup(cleanEmail, password, isSuperAdminEmail(cleanEmail) ? 'Super Admin' : 'DoMeal Admin', '');
          if (isSuperAdminEmail(cleanEmail)) {
            try {
              sessionStorage.setItem('domeal_superadmin_session', cleanEmail);
            } catch {}
            toast.success('Super Admin account created and authenticated!');
            router.push('/super-admin');
          } else {
            router.push('/admin-dashboard');
          }
        } catch (signupErr: any) {
          if (signupErr.code === 'auth/email-already-in-use') {
            setError('Incorrect password for this Super Admin account. If needed, click "Forgot password?" below to reset it.');
          } else {
            setError('Invalid credentials. Please check your password.');
          }
        }
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password for this Super Admin account. If needed, click "Forgot password?" below to reset it.');
      } else {
        setError('Failed to authenticate: ' + (err.message || 'Please check your password.'));
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResetError('Please enter your Super Admin email address.');
      return;
    }
    if (!isSuperAdminEmail(targetEmail)) {
      setResetError('This email is not registered as an authorized Super Administrator.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await resetPassword(targetEmail);
      setResetSuccess(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1E15] px-4 py-12 relative overflow-hidden text-stone-100">
      {/* Background ambient gold & green glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C39B54]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#16291E]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-800 p-8 relative z-10 space-y-6">
        {/* Header with Crown & Super Admin Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#C39B54] shadow-lg shadow-black/40 flex items-center justify-center bg-white p-1">
              <Image
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal logo"
                width={60}
                height={60}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#C39B54] text-[#1E3B2B] flex items-center justify-center shadow-md">
              <Crown size={15} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C39B54]/15 border border-[#C39B54]/30 text-[#C39B54] text-xs font-bold mb-2">
            <Crown size={12} />
            <span>Executive Super Admin Console</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            {isForgotPassword ? 'Reset Super Admin Password' : 'Super Admin Sign In'}
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xs leading-relaxed">
            {isForgotPassword
              ? 'Enter your executive email to receive password reset instructions'
              : 'Privileged executive access for DoMeal founders, directors & master controllers'}
          </p>
        </div>

        {isForgotPassword ? (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetSuccess(false);
                setResetError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Super Admin Sign In
            </button>

            {resetError && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-200">{resetError}</p>
              </div>
            )}

            {resetSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-extrabold text-white text-base">Check Your Inbox</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="text-[#C39B54] font-mono">{email}</strong>. Follow the instructions to reset your password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSuccess(false);
                  }}
                  className="w-full mt-2 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="superadmin@vegchennaisrilalitha.co.uk"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/80 border border-stone-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C39B54] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#C39B54] hover:bg-[#A98440] text-stone-950 font-black py-3 rounded-xl transition-all cursor-pointer disabled:opacity-60 text-xs flex items-center justify-center gap-2"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-2xl flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-200 leading-relaxed">{error}</p>
                </div>
                <Link
                  href="/admin-login"
                  className="text-xs font-bold text-[#C39B54] hover:underline flex items-center gap-1 mt-1 ml-6"
                >
                  <span>Go to Standard Admin Login &rarr;</span>
                </Link>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Super Admin Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@vegchennaisrilalitha.co.uk"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/80 border border-stone-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C39B54] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetSuccess(false);
                      setResetError('');
                    }}
                    className="text-[11px] text-[#C39B54] font-bold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-900/80 border border-stone-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C39B54] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full bg-[#C39B54] hover:bg-[#A98440] text-stone-950 font-black py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 text-xs shadow-lg shadow-black/40 cursor-pointer mt-2"
              >
                {loadingAction ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Executive Clearance...</span>
                  </>
                ) : (
                  <>
                    <Crown size={15} />
                    <span>Enter Super Admin Console</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer Navigation Switcher */}
        <div className="pt-4 border-t border-stone-800 text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl border border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-bold transition-all active:scale-98 cursor-pointer"
          >
            <ArrowLeft size={13} className="text-[#C39B54]" />
            <span>Back to Home</span>
          </Link>
          <div>
            <Link
              href="/admin-login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition-colors"
            >
              <span>Standard Operations Staff? Switch to Admin Login</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <p className="text-[10px] text-stone-400 font-mono">
            IP &amp; Session Audit Logging is Active &bull; London HQ
          </p>
        </div>
      </div>
    </div>
  );
}
