'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Star, Users, CheckCircle, Loader2, ChevronRight,
  ArrowLeft, Sparkles, GraduationCap, TrendingUp, Clock,
  Globe, ExternalLink, ChevronLeft, RefreshCw, AlertCircle,
  BarChart2, Zap, Target,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend,
} from 'recharts';
import AIChatWidget from '@/components/AIChatWidget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChartPoint { month: string; enrolled: number; completed: number }

interface Enrollment {
  _id: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  course: {
    _id: string;
    title: string;
    category: string;
    coverImageUrl?: string;
    averageRating: number;
    format: 'online' | 'in-person';
    creator: { name: string; image?: string };
  };
}

interface CourseCard {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  price: number;
  coverImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  format: 'online' | 'in-person';
  creator: { name: string; image?: string; avatarBgColor?: string };
}

interface DashboardData {
  user: {
    _id: string; name: string; email: string;
    image?: string; avatarBgColor?: string;
    role: string; bio?: string; learningGoals: string[];
  };
  enrollments: Enrollment[];
  chartData: ChartPoint[];
  stats: { totalEnrolled: number; totalCompleted: number; avgProgress: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(p: number) { return p === 0 ? 'Free' : `$${p.toFixed(2)}`; }

function CategoryBadge({ cat }: { cat: string }) {
  const c: Record<string, string> = {
    Programming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Design: 'bg-purple-50 text-purple-700 border-purple-200',
    Business: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Languages: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c[cat] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {cat}
    </span>
  );
}

function Avatar({ src, name, bg, size = 10 }: { src?: string; name: string; bg?: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const dim = `w-${size} h-${size}`;
  return src ? (
    <img src={src} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />
  ) : (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-black shrink-0`}
      style={{ backgroundColor: bg || '#4f46e5', fontSize: size > 8 ? 18 : 12 }}
    >
      {initials}
    </div>
  );
}

function ProgressBar({ value, completed }: { value: number; completed: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-400">Progress</span>
        <span className={`text-[11px] font-bold ${completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
          {completed ? '✓ Done' : `${value}%`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Recommendation Carousel ──────────────────────────────────────────────────
function RecommendationCarousel({ userId, userGoals }: { userId: string; userGoals: string[] }) {
  const [recs, setRecs] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0);
  const [isFallback, setIsFallback] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`${API_URL}/dashboard/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setRecs(data.recommendations || []);
        setIsFallback(!!data.fallback);
        setIdx(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const visible = recs.slice(idx, idx + 2);
  const canPrev = idx > 0;
  const canNext = idx + 2 < recs.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Recommended for You</h2>
            {isFallback ? (
              <p className="text-[11px] text-slate-400 font-medium">Top-rated picks • Add learning goals to get AI recommendations</p>
            ) : (
              <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-500" /> AI-personalised based on your goals
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 2))}
            disabled={!canPrev || loading}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(recs.length - 2, i + 2))}
            disabled={!canNext || loading}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-sm font-semibold">AI is finding your best matches…</span>
          </div>
        ) : error ? (
          <div className="text-sm text-slate-400 font-semibold text-center py-6">{error}</div>
        ) : recs.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">You're enrolled in everything!</p>
            <p className="text-xs text-slate-400 font-medium">Check back after new courses are added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visible.map((course) => (
              <div key={course._id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col">
                {/* Cover */}
                <div className="relative h-28 bg-gradient-to-br from-indigo-100 to-indigo-50">
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-indigo-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2"><CategoryBadge cat={course.category} /></div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {course.averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-xs font-black text-slate-800 leading-snug line-clamp-2 mb-1">{course.title}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mb-3">by {course.creator?.name}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className={`text-sm font-black ${course.price === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {formatPrice(course.price)}
                    </span>
                    <Link
                      href={`/courses/${course._id}`}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Goal hint */}
        {!loading && userGoals.length === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-amber-700">
            <Target className="w-4 h-4 shrink-0" />
            <span>Add learning goals in your <Link href="/profile" className="underline">Profile</Link> to get smarter AI recommendations.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Custom Tooltip for chart ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-black text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Auth guard
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login?from=/dashboard');
    }
  }, [session, sessionLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`${API_URL}/dashboard?userId=${session.user.id}`, { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load dashboard');
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading your dashboard…</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  const user = data?.user || { name: session.user.name || '', email: session.user.email || '', image: session.user.image, learningGoals: [] };
  const stats = data?.stats || { totalEnrolled: 0, totalCompleted: 0, avgProgress: 0 };
  const chartData = data?.chartData || [];
  const enrollments = data?.enrollments || [];
  const userInitials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-5 h-5" /></span>
            StudySprint
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-0.5">Dashboard</Link>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore</Link>
            <Link href="/courses/manage" className="hover:text-indigo-600 transition-colors">My Courses</Link>
            <Link href="/profile" className="hover:text-indigo-600 transition-colors">Profile</Link>
          </nav>
          <Link href="/profile" className="flex items-center gap-2.5 group">
            <Avatar src={user.image ?? undefined} name={user.name} bg={(user as any).avatarBgColor} size={9} />
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-700 leading-none group-hover:text-indigo-600 transition-colors">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">{(user as any).role || 'student'}</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Welcome Header ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="ring-4 ring-white/20 rounded-full">
                <Avatar src={user.image ?? undefined} name={user.name} bg={(user as any).avatarBgColor} size={16} />
              </div>
              <div>
                <p className="text-indigo-300 text-sm font-semibold">{greeting} 👋</p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">{user.name}</h1>
                {(user as any).learningGoals?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(user as any).learningGoals.slice(0, 3).map((g: string, i: number) => (
                      <span key={i} className="bg-white/10 border border-white/20 text-indigo-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        🎯 {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/courses"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm"
              >
                <BookOpen className="w-3.5 h-3.5" /> Explore Courses
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Advisor
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <GraduationCap className="w-4 h-4" />, label: 'Enrolled', value: stats.totalEnrolled, color: 'bg-indigo-50 text-indigo-600' },
            { icon: <CheckCircle className="w-4 h-4" />, label: 'Completed', value: stats.totalCompleted, color: 'bg-emerald-50 text-emerald-600' },
            { icon: <BarChart2 className="w-4 h-4" />, label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'bg-amber-50 text-amber-600' },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'In Progress', value: stats.totalEnrolled - stats.totalCompleted, color: 'bg-purple-50 text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-semibold">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Error ───────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left Column: Chart + Enrolled ─────────────────────── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Progress Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Study Progress</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Courses enrolled & completed — last 6 months</p>
                  </div>
                </div>
                {/* Chart type toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['area', 'bar'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setChartType(t)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${
                        chartType === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {chartData.every((d) => d.enrolled === 0) ? (
                  <div className="flex flex-col items-center justify-center py-14 text-slate-400 space-y-3">
                    <TrendingUp className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-semibold">No enrollment data yet</p>
                    <p className="text-xs font-medium">Enroll in courses to see your progress chart here.</p>
                    <Link href="/courses" className="text-xs font-bold text-indigo-600 hover:underline">Browse courses →</Link>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    {chartType === 'area' ? (
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradEnrolled" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }} />
                        <Area type="monotone" dataKey="enrolled" name="Enrolled" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradEnrolled)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                        <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2.5} fill="url(#gradCompleted)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }} />
                        <Bar dataKey="enrolled" name="Enrolled" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">My Courses</h2>
                </div>
                <Link href="/courses/manage" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                  <p className="text-sm font-semibold">No enrollments yet</p>
                  <Link href="/courses" className="text-xs font-bold text-indigo-600 hover:underline">Find your first course →</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {enrollments.slice(0, 5).map((enr) => {
                    const c = enr.course;
                    if (!c) return null;
                    return (
                      <div key={enr._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                        {/* Thumbnail */}
                        <div className="w-14 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-indigo-50">
                          {c.coverImageUrl ? (
                            <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-indigo-300" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start gap-2 justify-between">
                            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{c.title}</p>
                            <CategoryBadge cat={c.category} />
                          </div>
                          <ProgressBar value={enr.progress} completed={enr.completed} />
                        </div>
                        {/* CTA */}
                        <Link
                          href={`/courses/${c._id}`}
                          className="shrink-0 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                        >
                          {enr.completed ? 'Review' : 'Continue'} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── Right Column: Recommendations + Quick Links ─────────── */}
          <div className="space-y-6">

            {/* AI Recommendations */}
            <RecommendationCarousel userId={session.user.id} userGoals={(user as any).learningGoals || []} />

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Quick Links</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { href: '/courses', icon: <BookOpen className="w-4 h-4" />, label: 'Explore Courses', sub: 'Discover new topics', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  { href: '/courses/manage', icon: <GraduationCap className="w-4 h-4" />, label: 'My Enrolled Courses', sub: 'Track your progress', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { href: '/courses/add', icon: <Sparkles className="w-4 h-4" />, label: 'Create a Course', sub: 'Share your expertise', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  { href: '/profile', icon: <Target className="w-4 h-4" />, label: 'Update Learning Goals', sub: 'Improve AI recommendations', color: 'text-purple-600 bg-purple-50 border-purple-200' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                  >
                    <div className={`p-2 rounded-xl border ${link.color}`}>{link.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{link.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{link.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* AI Chat Widget — context-aware dashboard mode */}
      <AIChatWidget
        userId={session.user.id}
        context={{ type: 'dashboard' }}
      />
    </div>
  );
}
