'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Star,
  Users,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Clock,
  Globe,
  MapPin,
  BarChart2,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreatorCourse {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  price: number;
  status: 'draft' | 'published';
  coverImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  format: 'online' | 'in-person';
  createdAt: string;
}

interface StudentEnrollment {
  _id: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  course: {
    _id: string;
    title: string;
    shortDescription: string;
    category: string;
    price: number;
    coverImageUrl?: string;
    averageRating: number;
    format: 'online' | 'in-person';
    creator: { name: string; image?: string; avatarBgColor?: string };
  };
}

type ManageData =
  | { mode: 'creator'; courses: CreatorCourse[]; user: { name: string; role: string } }
  | { mode: 'student'; enrollments: StudentEnrollment[]; user: { name: string; role: string } };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
    </span>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    Programming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Design: 'bg-purple-50 text-purple-700 border-purple-200',
    Business: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Languages: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[cat] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {cat}
    </span>
  );
}

function CourseThumbnail({ url, title, size = 'md' }: { url?: string; title: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-14 h-10' : 'w-20 h-14';
  if (url) {
    return (
      <div className={`${dim} rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100`}>
        <img src={url} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100`}>
      <BookOpen className="w-5 h-5 text-indigo-400" />
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  course,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  course: CreatorCourse;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-lg font-black text-slate-900">Delete this course?</h2>
          <p className="text-sm text-slate-500 font-medium">
            <span className="font-bold text-slate-700">"{course.title}"</span> will be permanently
            removed along with <span className="text-red-600 font-bold">all its enrollments and reviews</span>.
            This cannot be undone.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-semibold">
            {course.enrollmentCount > 0
              ? `${course.enrollmentCount} student${course.enrollmentCount > 1 ? 's' : ''} will lose access to this course.`
              : 'No students are currently enrolled in this course.'}
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isDeleting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="w-4 h-4" /> Yes, Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, completed }: { value: number; completed: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-slate-500">Progress</span>
        <span className={`text-[11px] font-bold ${completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
          {completed ? '✓ Completed' : `${value}%`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completed ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ManageCoursesPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [data, setData] = useState<ManageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CreatorCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Auth guard
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login?from=/courses/manage');
    }
  }, [session, sessionLoading, router]);

  // Fetch manage data once session is ready
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    setLoading(true);
    setError('');

    fetch(`${API_URL}/courses/manage?userId=${userId}`, { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load data');
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session]);

  // Handle course deletion
  const handleDelete = async () => {
    if (!deleteTarget || !session?.user?.id) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`${API_URL}/courses/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: session.user.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');

      // Remove from local state
      setData((prev) => {
        if (!prev || prev.mode !== 'creator') return prev;
        return { ...prev, courses: prev.courses.filter((c) => c._id !== deleteTarget._id) };
      });
      setDeleteSuccess(`"${deleteTarget.title}" was deleted successfully.`);
      setDeleteTarget(null);
      setTimeout(() => setDeleteSuccess(''), 4000);
    } catch (err: any) {
      setDeleteError(err.message || 'Delete failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading / Auth states ────────────────────────────────────────────────
  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Loading your courses…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const userInitials = user.name?.split(' ').map((n: string) => n[0]).join('') || '?';
  const isCreatorMode = data?.mode === 'creator';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-5 h-5" /></span>
            StudySprint
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore</Link>
            {isCreatorMode && (
              <Link href="/courses/add" className="hover:text-indigo-600 transition-colors">Add Course</Link>
            )}
            <Link href="/courses/manage" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-0.5">
              {isCreatorMode ? 'My Courses' : 'My Learning'}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
              {user.image ? (
                <img src={user.image} alt={user.name || ''} className="w-9 h-9 rounded-full object-cover" />
              ) : userInitials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-700 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">{data?.user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600">{isCreatorMode ? 'Manage Courses' : 'My Learning'}</span>
        </div>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`p-2 rounded-xl ${isCreatorMode ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {isCreatorMode ? <Lightbulb className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isCreatorMode ? 'Manage Your Courses' : 'My Enrolled Courses'}
              </h1>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {isCreatorMode
                ? 'View, manage, and track the performance of all your published and draft courses.'
                : 'Pick up where you left off — track your progress across all enrolled courses.'}
            </p>
          </div>
          {isCreatorMode && (
            <Link
              href="/courses/add"
              className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" /> New Course
            </Link>
          )}
        </div>

        {/* Delete success toast */}
        {deleteSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" /> {deleteSuccess}
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            CREATOR MODE
        ═══════════════════════════════════════════════════════════════════ */}
        {data?.mode === 'creator' && (
          <>
            {/* Stats summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  label: 'Total Courses',
                  value: data.courses.length,
                  color: 'bg-indigo-50 text-indigo-600',
                },
                {
                  icon: <Users className="w-4 h-4" />,
                  label: 'Total Enrollments',
                  value: data.courses.reduce((s, c) => s + c.enrollmentCount, 0),
                  color: 'bg-emerald-50 text-emerald-600',
                },
                {
                  icon: <Star className="w-4 h-4" />,
                  label: 'Avg Rating',
                  value: data.courses.length
                    ? (
                        data.courses.reduce((s, c) => s + c.averageRating, 0) /
                        data.courses.length
                      ).toFixed(1)
                    : '—',
                  color: 'bg-amber-50 text-amber-600',
                },
                {
                  icon: <TrendingUp className="w-4 h-4" />,
                  label: 'Published',
                  value: data.courses.filter((c) => c.status === 'published').length,
                  color: 'bg-purple-50 text-purple-600',
                },
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

            {data.courses.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-slate-800">No courses yet</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                  Create your first course and start building your audience.
                </p>
                <Link
                  href="/courses/add"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <Plus className="w-4 h-4" /> Create First Course
                </Link>
              </div>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {['Course', 'Status', 'Price', 'Students', 'Rating', 'Created', 'Actions'].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 first:pl-6 last:pr-6"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.courses.map((course) => (
                        <tr key={course._id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Course */}
                          <td className="px-5 py-4 pl-6">
                            <div className="flex items-center gap-3 max-w-xs">
                              <CourseThumbnail url={course.coverImageUrl} title={course.title} />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate leading-tight">{course.title}</p>
                                <CategoryBadge cat={course.category} />
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              course.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {course.status === 'published' ? '● Published' : '○ Draft'}
                            </span>
                          </td>
                          {/* Price */}
                          <td className="px-5 py-4">
                            <span className={`text-sm font-bold ${course.price === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {formatPrice(course.price)}
                            </span>
                          </td>
                          {/* Students */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {course.enrollmentCount}
                            </div>
                          </td>
                          {/* Rating */}
                          <td className="px-5 py-4">
                            {course.reviewCount > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <StarRating rating={course.averageRating} />
                                <span className="text-[11px] text-slate-400">({course.reviewCount})</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">No reviews</span>
                            )}
                          </td>
                          {/* Created */}
                          <td className="px-5 py-4">
                            <span className="text-xs text-slate-400 font-semibold">{formatDate(course.createdAt)}</span>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-4 pr-6">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/courses/${course._id}`}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </Link>
                              <button
                                onClick={() => { setDeleteTarget(course); setDeleteError(''); }}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile stacked cards ── */}
                <div className="md:hidden space-y-3">
                  {data.courses.map((course) => (
                    <div key={course._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <CourseThumbnail url={course.coverImageUrl} title={course.title} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{course.title}</p>
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              course.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {course.status === 'published' ? 'Live' : 'Draft'}
                            </span>
                          </div>
                          <CategoryBadge cat={course.category} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="text-center bg-slate-50 rounded-xl p-2">
                          <p className={`text-sm font-black ${course.price === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {formatPrice(course.price)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Price</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-xl p-2">
                          <p className="text-sm font-black text-slate-800">{course.enrollmentCount}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Students</p>
                        </div>
                        <div className="text-center bg-slate-50 rounded-xl p-2">
                          {course.reviewCount > 0 ? (
                            <>
                              <p className="text-sm font-black text-slate-800 flex items-center justify-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {course.averageRating.toFixed(1)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rating</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-black text-slate-400">—</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rating</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Link
                          href={`/courses/${course._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-2.5 rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => { setDeleteTarget(course); setDeleteError(''); }}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2.5 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STUDENT MODE
        ═══════════════════════════════════════════════════════════════════ */}
        {data?.mode === 'student' && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  label: 'Enrolled',
                  value: data.enrollments.length,
                  color: 'bg-indigo-50 text-indigo-600',
                },
                {
                  icon: <CheckCircle className="w-4 h-4" />,
                  label: 'Completed',
                  value: data.enrollments.filter((e) => e.completed).length,
                  color: 'bg-emerald-50 text-emerald-600',
                },
                {
                  icon: <BarChart2 className="w-4 h-4" />,
                  label: 'Avg Progress',
                  value: data.enrollments.length
                    ? Math.round(
                        data.enrollments.reduce((s, e) => s + e.progress, 0) /
                          data.enrollments.length
                      ) + '%'
                    : '—',
                  color: 'bg-amber-50 text-amber-600',
                },
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

            {data.enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-slate-800">No courses yet</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                  Browse the marketplace and enroll in your first course to get started.
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <BookOpen className="w-4 h-4" /> Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.enrollments.map((enrollment) => {
                  const course = enrollment.course as StudentEnrollment['course'];
                  if (!course) return null;
                  return (
                    <div
                      key={enrollment._id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    >
                      {/* Cover */}
                      <div className="relative h-36 bg-gradient-to-br from-indigo-100 to-indigo-50">
                        {course.coverImageUrl ? (
                          <img
                            src={course.coverImageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-indigo-300" />
                          </div>
                        )}
                        {/* Completed badge */}
                        {enrollment.completed && (
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1 space-y-3">
                        {/* Title + category */}
                        <div>
                          <CategoryBadge cat={course.category} />
                          <h3 className="text-sm font-black text-slate-900 mt-1.5 leading-snug line-clamp-2">
                            {course.title}
                          </h3>
                        </div>

                        {/* Creator */}
                        <p className="text-[11px] text-slate-400 font-semibold">
                          by {course.creator?.name || 'Unknown'}
                        </p>

                        {/* Progress */}
                        <ProgressBar value={enrollment.progress} completed={enrollment.completed} />

                        {/* Meta row */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-1">
                            {course.format === 'online'
                              ? <Globe className="w-3 h-3" />
                              : <MapPin className="w-3 h-3" />
                            }
                            {course.format === 'online' ? 'Online' : 'In-Person'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Enrolled {formatDate(enrollment.enrolledAt)}
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="pt-1 mt-auto">
                          <Link
                            href={`/courses/${course._id}`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/20 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {enrollment.completed ? 'Review Course' : 'Continue Learning'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </main>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          course={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
