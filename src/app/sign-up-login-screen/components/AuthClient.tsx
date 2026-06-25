'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Phone, Mail, Lock, User, Upload, ArrowLeft, CheckCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type LoginForm = { email: string; password: string; remember: boolean };
type SignupForm = { name: string; phone: string; email: string; password: string; confirmPassword: string; terms: boolean; referredBy?: string; isStudent: boolean };

export default function AuthClient() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [tab, setTab] = useState<'login' | 'signup'>(refCode ? 'signup' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupStep, setSignupStep] = useState<'details' | 'student_verification' | 'pending_status'>('details');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentIdCard, setStudentIdCard] = useState<File | null>(null);
  const [studentIdCardPreview, setStudentIdCardPreview] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '', terms: false, referredBy: refCode, isStudent: false } });

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
    if (data.isStudent && signupStep === 'details') {
      setSignupStep('student_verification');
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

  const handleStudentVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail) {
      toast.error('Please enter your school/college official email ID.');
      return;
    }
    if (!studentIdCard) {
      toast.error('Please upload your college/school ID card photo.');
      return;
    }

    setIsLoading(true);
    try {
      const data = signupForm.getValues();
      const formattedPhone = data.phone.startsWith('+44')
        ? data.phone
        : data.phone.startsWith('0')
          ? `+44${data.phone.substring(1)}`
          : `+44${data.phone}`;

      // 1. Create User
      const credential = await signup(data.email, data.password, data.name, formattedPhone, data.referredBy);
      const uid = credential.user.uid;

      // 2. Upload ID Card Image
      const fileRef = ref(storage, `students/${uid}_id_card_${Date.now()}`);
      await uploadBytes(fileRef, studentIdCard);
      const downloadURL = await getDownloadURL(fileRef);

      // 3. Update User Document
      await updateDoc(doc(db, 'users', uid), {
        isStudent: true,
        studentStatus: 'Pending',
        studentOfficialEmail: studentEmail,
        studentIdCardUrl: downloadURL,
      });

      toast.success('Registration complete! Student verification submitted.');
      setSignupStep('pending_status');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || 'Something went wrong. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipVerification = async () => {
    setIsLoading(true);
    try {
      const data = signupForm.getValues();
      const formattedPhone = data.phone.startsWith('+44')
        ? data.phone
        : data.phone.startsWith('0')
          ? `+44${data.phone.substring(1)}`
          : `+44${data.phone}`;

      await signup(data.email, data.password, data.name, formattedPhone, data.referredBy);
      toast.success('Account created successfully!');
      router.push('/menu');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Signup failed');
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
            <>
              {signupStep === 'details' && (
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

                  <label className="flex items-center gap-3 cursor-pointer bg-[#C39B54]/10 p-4 rounded-xl border border-[#C39B54]/20 hover:bg-[#C39B54]/15 transition-all select-none">
                    <input
                      {...signupForm.register('isStudent')}
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary/20 accent-[#C39B54]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-800 text-[#1E3B2B]">Are you a student?</p>
                      <p className="text-xs text-muted-foreground">Click and verify for extra discount</p>
                    </div>
                  </label>

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
                    ) : signupForm.watch('isStudent') ? 'Next: Student Verification' : 'Create Account'}
                  </button>
                </form>
              )}

              {signupStep === 'student_verification' && (
                <form onSubmit={handleStudentVerificationSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground mb-1">Verify Student Status 🎓</h1>
                    <p className="text-sm text-muted-foreground">Submit details to apply your extra student discount.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-600 text-foreground mb-1.5">Official School / College Email ID</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="your.name@university.ac.uk"
                          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-600 text-foreground mb-1.5">College / School ID Card Photo</label>
                      <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-[#C39B54]/50 rounded-2xl p-6 bg-muted/20 transition-colors relative cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setStudentIdCard(file);
                              setStudentIdCardPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {studentIdCardPreview ? (
                          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-border">
                            <img
                              src={studentIdCardPreview}
                              alt="ID preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-700 bg-[#C39B54] px-3 py-1.5 rounded-lg shadow">Change Photo</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-[#C39B54]/10 text-[#C39B54] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                              <Upload size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-700 text-foreground">Click to upload photo</p>
                              <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1E3B2B] text-white font-700 py-3 rounded-xl hover:bg-[#14261A] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-green-950/10 text-sm"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Account & Uploading ID...
                        </span>
                      ) : (
                        <>Submit Verification <CheckCircle size={16} /></>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSignupStep('details')}
                        className="flex-1 border border-border text-foreground font-600 py-2.5 rounded-xl hover:bg-muted transition-colors text-xs disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSkipVerification}
                        className="flex-1 text-[#C39B54] hover:text-[#a17e41] font-700 py-2.5 text-xs transition-colors hover:underline text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Skip for Now
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {signupStep === 'pending_status' && (
                <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="relative w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200 shadow-md">
                    <GraduationCap size={44} className="text-[#C39B54]" />
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1 shadow border-2 border-white">
                      <CheckCircle size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-850 px-3.5 py-1.5 rounded-full mb-2">
                      Account Created Successfully! 🎉
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground">Verification Under Process! ⏳</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      We are currently reviewing your college ID card. Your student discount will be automatically applied as soon as it is approved. 
                      Feel free to browse the menu and start ordering in the meantime!
                    </p>
                  </div>

                  <button
                    onClick={() => router.push('/menu')}
                    className="w-full bg-[#C39B54] text-white font-700 py-3 rounded-xl hover:bg-[#a17e41] transition-all shadow-lg text-sm"
                  >
                    Go to Menu
                  </button>
                </div>
              )}
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="hover:text-primary transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}