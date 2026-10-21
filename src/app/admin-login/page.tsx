'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { isAdminEmail } from '@/lib/adminAuth';

export default function AdminLoginClient() {
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
    // If already logged in as admin, redirect
    if (!loading && isAdminEmail(user?.email)) {
      router.push('/admin-dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!isAdminEmail(email)) {
      setError('Unauthorized email address. Access denied.');
      return;
    }

    setLoadingAction(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Login successful');
      router.push('/admin-dashboard');
    } catch (err: any) {
      // If user not found, create it (First time setup for the admin account)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signup(email, password, 'DoMeal Admin', '');
          toast.success('Admin account created and logged in!');
          router.push('/admin-dashboard');
        } catch (signupErr: any) {
          setError('Invalid credentials');
        }
      } else {
        setError('Failed to log in. Please check your password.');
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setResetError('Please enter your admin email address.');
      return;
    }
    if (!isAdminEmail(targetEmail)) {
      setResetError('This email is not registered as an authorized admin.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-md mb-4">
            <Image
              src="/DOMEAL_Logo.jpg"
              alt="DoMeal logo"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isForgotPassword ? 'Reset Admin Password' : 'Admin Portal'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isForgotPassword
              ? 'Enter your admin email to receive reset instructions'
              : 'Sign in to manage DoMeal operations'}
          </p>
        </div>

        {isForgotPassword ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetSuccess(false);
                setResetError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-700 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            {resetError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-600 text-red-800">{resetError}</p>
              </div>
            )}

            {resetSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-extrabold text-foreground text-lg">Check your inbox</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We&apos;ve sent a password reset link to <strong className="text-foreground font-700">{email}</strong>. Follow the instructions in the email to set a new password.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSuccess(false);
                    }}
                    className="w-full bg-[#1E3B2B] text-white font-700 py-3 rounded-xl hover:bg-[#10261A] transition-all"
                  >
                    Return to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="text-xs text-[#1E3B2B] font-600 hover:underline py-1"
                  >
                    {resetLoading ? 'Sending...' : 'Resend reset email'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-700 text-foreground mb-1.5 ml-1">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@vegchennaisrilalitha.co.uk"
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#1E3B2B] text-white font-700 py-3.5 rounded-xl hover:bg-[#10261A] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Password Reset Link'
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-600 text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5 ml-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vegchennaisrilalitha.co.uk"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-sm font-700 text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetSuccess(false);
                      setResetError('');
                    }}
                    className="text-xs text-primary font-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAction}
                className="w-full bg-[#1E3B2B] text-white font-700 py-3.5 rounded-xl hover:bg-[#10261A] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loadingAction ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In as Admin'
                )}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-xs font-500 text-muted-foreground mt-8">
          Secure portal for DoMeal staff only.
          <br />
          Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
