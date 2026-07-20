'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  BookOpen,
  AlertCircle,
  Lock,
  Mail,
  User,
  CheckCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Lightbulb,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signIn } from '@/lib/auth-client';

// Password strength calculator
function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { level: 5, label: 'Very Strong', color: 'bg-emerald-600' };
}

const ROLE_OPTIONS = [
  {
    value: 'student',
    label: 'Student',
    description: 'Enroll in courses, track progress, get AI guidance',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'border-indigo-500 bg-indigo-50',
    iconColor: 'text-indigo-600 bg-indigo-100',
  },
  {
    value: 'creator',
    label: 'Creator',
    description: 'List courses, manage content, grow your audience',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'border-amber-500 bg-amber-50',
    iconColor: 'text-amber-600 bg-amber-100',
  },
];

const PERKS = [
  { icon: <Sparkles className="w-4 h-4" />, text: 'AI-powered personalized learning paths' },
  { icon: <Shield className="w-4 h-4" />, text: 'Verified expert course creators' },
  { icon: <Users className="w-4 h-4" />, text: 'Join a community of global learners' },
];

export default function RegisterPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'creator'>('student');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [bannerError, setBannerError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  // Validators
  const validateName = (val: string) => (!val.trim() ? 'Full name is required' : '');
  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };
  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters';
    return '';
  };
  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) return 'Please confirm your password';
    if (val !== pass) return 'Passwords do not match';
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (nameError) setNameError(validateName(val));
    setBannerError('');
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) setEmailError(validateEmail(val));
    setBannerError('');
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) setPasswordError(validatePassword(val));
    if (confirmPassword && confirmPasswordError) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, val));
    }
    setBannerError('');
  };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (confirmPasswordError) setConfirmPasswordError(validateConfirmPassword(val, password));
    setBannerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nErr = validateName(name);
    const mErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);

    if (nErr || mErr || pErr || cErr) {
      setNameError(nErr);
      setEmailError(mErr);
      setPasswordError(pErr);
      setConfirmPasswordError(cErr);
      return;
    }

    setIsSubmitting(true);
    setBannerError('');

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        // Better Auth accepts additional fields passed through
        callbackURL: '/login',
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Failed to create account. Email may already be in use.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setBannerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn.social({ provider: 'google', callbackURL: '/' });
    } catch {
      setBannerError('Google sign-up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 font-sans">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 relative overflow-hidden p-12 text-white">
        {/* Background orbs */}
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <span className="p-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <BookOpen className="w-5 h-5" />
          </span>
          StudySprint
        </Link>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-300 text-indigo-300" /> Free to Get Started
            </div>
            <h1 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
              Join thousands <br />
              <span className="text-indigo-300">learning smarter.</span>
            </h1>
            <p className="text-indigo-200/80 text-sm leading-relaxed max-w-xs">
              Sign up once, unlock our full library of courses, your AI study advisor, and a personalized progress dashboard.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/8 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="text-indigo-300 shrink-0">{perk.icon}</div>
                <p className="text-sm text-indigo-100 font-medium">{perk.text}</p>
              </div>
            ))}
          </div>

          {/* Role preview cards */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-indigo-300/70 uppercase tracking-wider">Choose your path</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-600/30 border border-indigo-400/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                <GraduationCap className="w-6 h-6 text-indigo-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Student</p>
                <p className="text-[10px] text-indigo-300/70 font-medium mt-0.5">Learn & grow</p>
              </div>
              <div className="bg-amber-600/20 border border-amber-400/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                <Lightbulb className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Creator</p>
                <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">Teach & earn</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-indigo-300/50 font-medium">
            By registering you agree to our{' '}
            <span className="text-indigo-300 underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-indigo-300 underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-4">

          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-indigo-700 tracking-tight">
              <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-5 h-5" /></span>
              StudySprint
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create account</h2>
            <p className="text-slate-400 text-sm font-medium">Start your learning journey today — it's free</p>
          </div>

          {/* Error Banner */}
          {bannerError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-start gap-2.5 p-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{bannerError}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl flex items-start gap-2.5 p-4">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Account created successfully! Redirecting to sign in…</span>
            </div>
          )}

          {/* Google sign-up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmitting || success}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-2xl py-3 px-4 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">or register with email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value as 'student' | 'creator')}
                  className={`relative flex flex-col items-start gap-2.5 p-4 border-2 rounded-2xl text-left transition-all duration-200 ${
                    role === opt.value
                      ? opt.color + ' shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${role === opt.value ? opt.iconColor : 'bg-slate-100 text-slate-500'} transition-colors`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${role === opt.value ? 'text-slate-900' : 'text-slate-700'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{opt.description}</p>
                  </div>
                  {role === opt.value && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => setNameError(validateName(name))}
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    nameError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                />
              </div>
              {nameError && (
                <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {nameError}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailError(validateEmail(email))}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  placeholder="Minimum 8 characters"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${
                    passwordStrength.level <= 1 ? 'text-red-500' :
                    passwordStrength.level <= 2 ? 'text-amber-500' :
                    passwordStrength.level <= 3 ? 'text-yellow-500' : 'text-emerald-600'
                  }`}>
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
              {passwordError && (
                <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {passwordError}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword, password))}
                  placeholder="Re-enter your password"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    confirmPasswordError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : confirmPassword && confirmPassword === password
                        ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/20'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {confirmPassword && confirmPassword === password && (
                  <span className="absolute inset-y-0 right-8 flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </span>
                )}
              </div>
              {confirmPasswordError && (
                <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit"
              disabled={isSubmitting || success}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-2xl py-3.5 shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
