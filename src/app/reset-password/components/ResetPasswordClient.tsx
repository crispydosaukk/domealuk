'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import {
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Mode and codes passed by Firebase action links
  const oobCode = searchParams.get('oobCode') || '';
  const mode = searchParams.get('mode') || '';

  // State for Code Verification (Mode: resetPassword with oobCode)
  const [isVerifyingCode, setIsVerifyingCode] = useState(!!oobCode);
  const [codeValid, setCodeValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // State for Requesting Reset Link (Mode: request reset email)
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // General loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If oobCode is present, verify code with Firebase on mount
  useEffect(() => {
    if (!oobCode) return;

    let isMounted = true;
    const verifyCode = async () => {
      setIsVerifyingCode(true);
      setError('');
      try {
        const emailFromCode = await verifyPasswordResetCode(auth, oobCode);
        if (isMounted) {
          setTargetEmail(emailFromCode);
          setCodeValid(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setCodeValid(false);
          const code = err?.code || '';
          if (code === 'auth/expired-action-code') {
            setError('This password reset link has expired. Please request a new one.');
          } else if (code === 'auth/invalid-action-code') {
            setError('This password reset link is invalid or has already been used.');
          } else {
            setError('Unable to verify reset link. Please request a new password reset email.');
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifyingCode(false);
        }
      }
    };

    verifyCode();
    return () => {
      isMounted = false;
    };
  }, [oobCode]);

  // Handler: Confirm New Password (with verified oobCode)
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setResetSuccess(true);
      toast.success('Password successfully reset! 🎉');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (code === 'auth/expired-action-code') {
        setError('This reset link has expired. Please request a new one.');
      } else {
        setError(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler: Send Password Reset Email Link
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = requestEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setRequestSuccess(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-md mx-auto group-hover:scale-105 transition-transform">
              <Image
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal logo"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground tracking-tight">
            {oobCode ? 'Set New Password' : 'Reset Your Password'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {oobCode
              ? targetEmail
                ? `Enter a new password for ${targetEmail}`
                : 'Choose a new password for your DoMeal account'
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-border sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-600 text-red-800">{error}</p>
            </div>
          )}

          {/* Scenario 1: Verifying code */}
          {isVerifyingCode && (
            <div className="py-12 text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-primary mx-auto" />
              <p className="text-sm font-600 text-foreground">Verifying reset link...</p>
              <p className="text-xs text-muted-foreground">Please wait a moment</p>
            </div>
          )}

          {/* Scenario 2: Code verification failed */}
          {!isVerifyingCode && oobCode && !codeValid && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-foreground">Invalid Reset Link</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This reset link has expired or has already been used. Please request a fresh reset link below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push('/reset-password');
                }}
                className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-[#142249] transition-all"
              >
                Request a New Reset Link
              </button>
            </div>
          )}

          {/* Scenario 3: Valid code, password reset success */}
          {!isVerifyingCode && oobCode && codeValid && resetSuccess && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-foreground">Password Reset Complete! 🎉</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>
              <Link
                href="/sign-up-login-screen"
                className="inline-block w-full bg-primary text-white font-700 py-3.5 rounded-xl hover:bg-[#142249] transition-all text-center"
              >
                Proceed to Sign In
              </Link>
            </div>
          )}

          {/* Scenario 4: Valid code, enter new password form */}
          {!isVerifyingCode && oobCode && codeValid && !resetSuccess && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-[#142249] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Save New Password'
                )}
              </button>
            </form>
          )}

          {/* Scenario 5: No oobCode -> Request Password Reset Link */}
          {!oobCode && !requestSuccess && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    required
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-[#142249] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Password Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Scenario 6: Reset link sent successfully */}
          {!oobCode && requestSuccess && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle size={30} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-foreground">Check Your Email</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="text-foreground">{requestEmail}</strong>.
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  Click the link in the email to set your new password. If you don&apos;t see it, check your spam folder.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/sign-up-login-screen"
                  className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-[#142249] transition-all text-center"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={loading}
                  className="text-xs text-primary font-600 hover:underline py-1"
                >
                  {loading ? 'Resending...' : 'Resend email link'}
                </button>
              </div>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="mt-6 text-center border-t border-border pt-4">
            <Link
              href="/sign-up-login-screen"
              className="inline-flex items-center gap-1.5 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
