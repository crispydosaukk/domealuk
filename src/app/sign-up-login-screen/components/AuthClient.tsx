'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Phone, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

type LoginForm = { email: string; password: string; remember: boolean };
type SignupForm = { name: string; phone: string; email: string; password: string; confirmPassword: string; terms: boolean; referredBy?: string };

export default function AuthClient() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [tab, setTab] = useState<'login' | 'signup'>(refCode ? 'signup' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '', terms: false, referredBy: refCode } });

  const handleLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    loginForm.clearErrors('root');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back to DoMeal!', {
        duration: 1500
      });
      router.push('/menu');
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        loginForm.setError('root', { message: 'No account found with this email. Please create an account first.' });
      } else if (code === 'auth/wrong-password') {
        loginForm.setError('root', { message: 'Incorrect password. Please try again.' });
      } else if (code === 'auth/too-many-requests') {
        loginForm.setError('root', { message: 'Too many failed attempts. Please try again later.' });
      } else {
        loginForm.setError('root', { message: 'Invalid email or password. Please check and try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    signupForm.clearErrors('root');
    try {
      const formattedPhone = data.phone.startsWith('+44')
        ? data.phone
        : data.phone.startsWith('0')
          ? `+44${data.phone.substring(1)}`
          : `+44${data.phone}`;
      await signup(data.email, data.password, data.name, formattedPhone, data.referredBy);
      toast.success('Account created successfully!', {
        duration: 1500
      });
      router.push('/menu');
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code || '';
      if (code === 'auth/email-already-in-use') {
        signupForm.setError('root', { message: 'An account with this email already exists. Please sign in instead.' });
      } else if (code === 'auth/weak-password') {
        signupForm.setError('root', { message: 'Password is too weak. Please use at least 8 characters.' });
      } else {
        const errorMsg = (error as Error).message || 'Something went wrong. Please try again.';
        signupForm.setError('root', { message: errorMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3B2B 0%, #14281D 50%, #1E3B2B 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C39B54 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
              <img
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-extrabold text-2xl leading-tight">DoMeal</p>
              <p className="text-[#C39B54]/80 text-sm">domeal.co.uk</p>
            </div>
          </Link>

          <div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Home Food,<br />Away From Home 🍱
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Join 1,200+ happy customers who enjoy authentic Indian tiffin delivered fresh across London every day.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '500+', sub: 'Daily Orders' },
                { label: '4.9★', sub: 'Customer Rating' },
                { label: '3 yrs', sub: 'Serving London' },
                { label: '100%', sub: 'Pure Vegetarian' },
              ].map(stat => (
                <div key={`stat-${stat.label}`} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xl font-extrabold">{stat.label}</p>
                  <p className="text-xs text-gray-300">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-400 text-xs">© 2026 DoMeal · domeal.co.uk · London</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 xl:px-16 bg-background overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
              <img
                src="/DOMEAL_Logo.jpg"
                alt="DoMeal logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-xl text-primary">DoMeal</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-sm font-700 rounded-lg transition-all duration-150 ${tab === 'login' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 text-sm font-700 rounded-lg transition-all duration-150 ${tab === 'signup' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back!</h1>
                <p className="text-sm text-muted-foreground">Sign in to manage your tiffin orders</p>
              </div>

              {loginForm.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600">{loginForm.formState.errors.root.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...loginForm.register('password', { required: 'Password is required' })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...loginForm.register('remember')} type="checkbox" className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary font-600 hover:underline">Forgot password?</button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-[#142249] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Sign In'}
              </button>


            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your account</h1>
                <p className="text-sm text-muted-foreground">Start enjoying fresh tiffin delivered to your door</p>
              </div>

              {signupForm.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600">{signupForm.formState.errors.root.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...signupForm.register('name', { required: 'Full name is required' })}
                    type="text"
                    placeholder="Priya Raghunathan"
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                {signupForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Mobile Number</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3 text-muted-foreground z-10" />
                  <span className="absolute left-9 text-sm font-600 text-foreground z-10">+44</span>
                  <input
                    {...signupForm.register('phone', { required: 'Mobile number is required', pattern: { value: /^(0?7\d{9}|7\d{9})$/, message: 'Enter a valid UK mobile number (e.g. 7448055754)' } })}
                    type="tel"
                    placeholder="7448055754"
                    className="w-full pl-16 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors relative"
                  />
                </div>
                {signupForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                {signupForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...signupForm.register('confirmPassword', { required: 'Please confirm password' })}
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-600 text-foreground mb-1.5">Referral Code (Optional)</label>
                <div className="relative">
                  <input
                    {...signupForm.register('referredBy')}
                    type="text"
                    placeholder="Enter referral code if you have one"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input {...signupForm.register('terms', { required: 'You must accept terms' })} type="checkbox" className="w-4 h-4 mt-0.5 accent-primary" />
                <span className="text-sm text-foreground">
                  I agree to the{' '}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {signupForm.formState.errors.terms && <p className="text-red-500 text-xs">{signupForm.formState.errors.terms.message}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-700 py-3 rounded-xl hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="hover:text-primary transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}