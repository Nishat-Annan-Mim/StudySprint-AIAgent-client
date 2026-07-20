'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Save, Loader2, CheckCircle, AlertCircle,
  User, Mail, Lock, Eye, EyeOff, Tag, X,
  ChevronRight, ArrowLeft, Image as ImageIcon,
  Shield, Info, Pencil, Plus, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import authClient from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all';
const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

function SectionCard({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusBanner({ type, message }: { type: 'success' | 'error'; message: string }) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`border rounded-2xl p-4 flex items-start gap-2.5 text-sm font-semibold ${styles[type]}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

// ─── Avatar Component with edit overlay ──────────────────────────────────────
function ProfileAvatar({
  src, name, bg, onEditClick,
}: { src?: string | null; name: string; bg?: string; onEditClick: () => void }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="relative group w-24 h-24 cursor-pointer" onClick={onEditClick}>
      {src ? (
        <img src={src} alt={name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
      ) : (
        <div
          className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-black"
          style={{ backgroundColor: bg || '#4f46e5' }}
        >
          {initials}
        </div>
      )}
      <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Pencil className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

// ─── Tag Input for learning goals ─────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] bg-white border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 transition-all">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-700 transition-colors ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input); }}
          placeholder={tags.length === 0 ? 'Type a goal and press Enter…' : 'Add more…'}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none py-0.5 px-1"
        />
      </div>
      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
        <Info className="w-3 h-3" /> Press Enter or comma to add a goal. These power your AI recommendations.
      </p>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // Profile form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // UI state
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userRole, setUserRole] = useState('student');
  const [userBg, setUserBg] = useState('#4f46e5');

  // Auth guard
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login?from=/profile');
    }
  }, [session, sessionLoading, router]);

  // Fetch current profile from our API (has full user data including bio + learningGoals)
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`${API_URL}/profile?userId=${session.user.id}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setName(data.name || '');
          setBio(data.bio || '');
          setImageUrl(data.image || '');
          setLearningGoals(data.learningGoals || []);
          setUserRole(data.role || 'student');
          setUserBg(data.avatarBgColor || '#4f46e5');
        }
      })
      .finally(() => setInitialLoading(false));
  }, [session]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileStatus({ type: 'error', msg: 'Name is required.' });
      return;
    }
    if (!session?.user?.id) return;

    setProfileLoading(true);
    setProfileStatus(null);

    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: session.user.id,
          name: name.trim(),
          bio: bio.trim(),
          image: imageUrl.trim() || null,
          learningGoals,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setProfileStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setTimeout(() => setProfileStatus(null), 4000);
    } catch (err: any) {
      setProfileStatus({ type: 'error', msg: err.message || 'Save failed. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwdStatus({ type: 'error', msg: 'All password fields are required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdStatus({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPwdStatus({ type: 'error', msg: 'New password must be different from current password.' });
      return;
    }

    setPwdLoading(true);
    setPwdStatus(null);

    try {
      // Use Better Auth's client-side changePassword
      const result = await (authClient as any).changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Incorrect current password.');
      }

      setPwdStatus({ type: 'success', msg: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPwdStatus(null), 4000);
    } catch (err: any) {
      setPwdStatus({ type: 'error', msg: err.message || 'Password change failed. Check your current password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Loading states ────────────────────────────────────────────────────────
  if (sessionLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading your profile…</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const displayName = name || session.user.name || 'User';
  const displayImage = imageUrl || session.user.image;
  // Is this an OAuth-only account (no password)? 
  // Heuristic: email contains Google's usual domains or emailVerified and no password set
  // We'll show password section for all email users, disable it with a notice for OAuth
  const isEmailUser = !!(session.user.email);
  // Better Auth sets emailVerified; Google accounts often have it verified automatically
  const isLinkedGoogle = (session.user as any)?.accounts?.some?.((a: any) => a.provider === 'google');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-12 shadow-sm">
        <div className="max-w-4xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-5 h-5" /></span>
            StudySprint
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore</Link>
            <Link href="/courses/manage" className="hover:text-indigo-600 transition-colors">My Courses</Link>
            <Link href="/profile" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-0.5">Profile</Link>
          </nav>
          <button
            onClick={() => signOut().then(() => router.push('/'))}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/dashboard" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600">Profile</span>
        </div>

        {/* ── Profile Header Card ─────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <ProfileAvatar
                src={displayImage}
                name={displayName}
                bg={userBg}
                onEditClick={() => setShowImageInput((p) => !p)}
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 border-2 border-white rounded-full p-1">
                <Pencil className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-0.5">My Profile</p>
              <h1 className="text-2xl font-black tracking-tight">{displayName}</h1>
              <p className="text-indigo-300 text-sm font-medium mt-0.5">{session.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  userRole === 'creator' ? 'bg-amber-400/20 border-amber-400/30 text-amber-300' : 'bg-white/10 border-white/20 text-indigo-200'
                }`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
                {isLinkedGoogle && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google linked
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all backdrop-blur-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Image URL editor (shown on click) */}
        {showImageInput && (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelClass + ' mb-0'}>Profile Picture URL</label>
              <button onClick={() => setShowImageInput(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              className={inputClass}
            />
            {imageUrl && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '0.2')} />
              </div>
            )}
            <p className="text-[11px] text-slate-400 font-medium">Leave blank to use your coloured-initials avatar.</p>
          </div>
        )}

        {/* Profile save status */}
        {profileStatus && <StatusBanner type={profileStatus.type} message={profileStatus.msg} />}

        {/* ═══════════════════════════════════════════════════════════
            CARD 1: Basic Information
        ═══════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <SectionCard icon={<User className="w-4 h-4" />} title="Basic Information" color="bg-indigo-50 text-indigo-600">
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className={inputClass + ' pl-10'}
                    required
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={labelClass}>Email Address <span className="normal-case font-medium text-slate-400 ml-1">(managed by authentication)</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={session.user.email || ''}
                    disabled
                    className={inputClass + ' pl-10 bg-slate-50 text-slate-400 cursor-not-allowed'}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={labelClass}>Bio <span className="normal-case font-medium text-slate-400 ml-1">(optional)</span></label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself — your background, expertise, or what you're learning…"
                  className={inputClass + ' resize-none'}
                />
                <p className="text-[11px] text-slate-400 font-medium mt-1">{bio.length}/300</p>
              </div>
            </div>
          </SectionCard>

          {/* ═══════════════════════════════════════════════════════════
              CARD 2: Learning Goals (feeds AI recommender)
          ═══════════════════════════════════════════════════════════ */}
          <SectionCard icon={<Tag className="w-4 h-4" />} title="Learning Goals" color="bg-amber-50 text-amber-600">
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-semibold">
                  Your learning goals directly power the <span className="font-black">AI Recommendation Engine</span> on your dashboard. The more specific, the better the picks!
                </p>
              </div>
              <TagInput tags={learningGoals} onChange={setLearningGoals} />

              {/* Suggested goals */}
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Quick add suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {['React development', 'UI/UX design', 'Data science', 'Python', 'Machine learning', 'Business strategy', 'French language', 'TypeScript'].map((s) => (
                    !learningGoals.includes(s) && (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setLearningGoals((prev) => [...prev, s])}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" /> {s}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="save-profile-btn"
              disabled={profileLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {profileLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>

        {/* ═══════════════════════════════════════════════════════════
            CARD 3: Security — Change Password
        ═══════════════════════════════════════════════════════════ */}
        {pwdStatus && <StatusBanner type={pwdStatus.type} message={pwdStatus.msg} />}

        <SectionCard icon={<Lock className="w-4 h-4" />} title="Security" color="bg-red-50 text-red-600">
          <div className="space-y-6">

            {/* Google account indicator */}
            {isLinkedGoogle && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-blue-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800">Google Account Linked</p>
                  <p className="text-xs text-blue-600 font-medium">Your account is connected to Google. You can sign in with Google or set a password below.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current password */}
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="current-password"
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={inputClass + ' pl-10 pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="new-password"
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={inputClass + ' pl-10 pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </span>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`${inputClass} pl-10 ${
                      confirmNewPassword && confirmNewPassword === newPassword
                        ? 'border-emerald-400 focus:border-emerald-400'
                        : ''
                    }`}
                  />
                  {confirmNewPassword && confirmNewPassword === newPassword && (
                    <span className="absolute inset-y-0 right-3 flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  id="change-password-btn"
                  disabled={pwdLoading}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pwdLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Update Password</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </SectionCard>

      </main>
    </div>
  );
}
