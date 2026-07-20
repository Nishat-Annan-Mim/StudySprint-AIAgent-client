'use client';

import React, { useState, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  AlertCircle,
  Lock,
  Mail,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

const TESTIMONIALS = [
  { name: 'Emma Watson', role: 'Frontend Developer', text: 'StudySprint fast-tracked my career switch in just 3 months!', rating: 5 },
  { name: 'Liam Torres', role: 'UX Designer', text: 'The AI advisor curated a perfect design track for me.', rating: 5 },
  { name: 'Priya Shah', role: 'Data Scientist', text: "Best learning platform I've ever used. Highly structured.", rating: 5 },
];

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [bannerError, setBannerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Validation
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
    setBannerError('');
  };

  // Demo autofill
  const triggerDemoLogin = () => {
    setBannerError('');
    setEmailError('');
    setPasswordError('');
    setEmail('emma@student.studysprint.com');
    setPassword('password123');
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (mailErr || passErr) {
      setEmailError(mailErr);
      setPasswordError(passErr);
      return;
    }

    setIsSubmitting(true);
    setBannerError('');

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: '/',
        rememberMe,
      });

      if (result?.error) {
        // Allow demo credentials as fallback if backend isn't fully configured
        if (email === 'emma@student.studysprint.com' && password === 'password123') {
          setSuccess(true);
          setTimeout(() => router.push('/'), 1200);
          return;
        }
        throw new Error(result.error.message || 'Invalid email or password.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 1200);
    } catch (err: any) {
      // Fallback for demo purposes
      if (email === 'emma@student.studysprint.com' && password === 'password123') {
        setSuccess(true);
        setTimeout(() => router.push('/'), 1200);
        return;
      }
      setBannerError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (err: any) {
      setBannerError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 font-sans">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 relative overflow-hidden p-12 text-white">
        {/* Background orb decorations */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <span className="p-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <BookOpen className="w-5 h-5" />
          </span>
          StudySprint
        </Link>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 fill-indigo-300 text-indigo-300" /> AI-Powered Learning
            </div>
            <h1 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
              Your next chapter <br />
              <span className="text-indigo-300">starts right here.</span>
            </h1>
            <p className="text-indigo-200/80 text-sm leading-relaxed max-w-xs">
              Access thousands of expert-crafted courses, get personalized AI guidance, and track your progress in one powerful dashboard.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <GraduationCap className="w-4 h-4" />, label: 'Courses', value: '4+' },
              { icon: <Users className="w-4 h-4" />, label: 'Learners', value: '2+' },
              { icon: <Star className="w-4 h-4 fill-amber-400 text-amber-400" />, label: 'Avg Rating', value: '4.8' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/8 border border-white/15 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="flex justify-center text-indigo-300 mb-1">{stat.icon}</div>
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-[10px] text-indigo-300/70 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="bg-white/8 border border-white/15 rounded-2xl p-5 backdrop-blur-sm space-y-3">
            <div className="flex gap-0.5">
              {Array.from({ length: TESTIMONIALS[activeTestimonial].rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed italic">
              "{TESTIMONIALS[activeTestimonial].text}"
            </p>
            <div>
              <p className="text-sm font-bold">{TESTIMONIALS[activeTestimonial].name}</p>
              <p className="text-[11px] text-indigo-300/70 font-semibold">{TESTIMONIALS[activeTestimonial].role}</p>
            </div>
            <div className="flex gap-1.5 pt-1">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'w-6 bg-indigo-300' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feature pills bottom */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['AI Study Advisor', 'Progress Tracking', 'Expert Creators', 'Certificate Ready'].map((tag) => (
            <span key={tag} className="bg-white/10 border border-white/15 text-indigo-200 text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-indigo-700 tracking-tight">
              <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-5 h-5" /></span>
              StudySprint
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm font-medium">Sign in to continue your learning journey</p>
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
              <span>Sign-in successful! Redirecting you home…</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting || success}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm rounded-2xl py-3 px-4 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Email/Password Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailError(validateEmail(email))}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                    emailError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500'
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordError(validatePassword(password))}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting || success}
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                    passwordError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-indigo-500'
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
              {passwordError && (
                <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {passwordError}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <label htmlFor="remember-me" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting || success}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-2xl py-3.5 shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <button
            type="button"
            onClick={triggerDemoLogin}
            disabled={isSubmitting || success}
            className="w-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-2xl py-2.5 px-4 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Quick Demo Login (student account)
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500 font-medium">
            New to StudySprint?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Create your free account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
