'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Loader2,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Image as ImageIcon,
  FileText,
  Layers,
  Globe,
  Users,
  ArrowLeft,
  Eye,
  Save,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['Programming', 'Design', 'Business', 'Languages'];

interface SyllabusSection {
  id: string; // local key for React
  title: string;
  content: string;
}

function genId() {
  return Math.random().toString(36).slice(2);
}

// ─── Shared input styles ────────────────────────────────────────────────────
const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all';
const errorInputClass =
  'border-red-400 focus:border-red-400 focus:ring-red-500/20';
const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

export default function AddCoursePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login?from=/courses/add');
    }
  }, [session, sessionLoading, router]);

  // ── Form state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [format, setFormat] = useState<'online' | 'in-person'>('online');
  const [location, setLocation] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [syllabus, setSyllabus] = useState<SyllabusSection[]>([
    { id: genId(), title: '', content: '' },
  ]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // ── UI state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successCourseId, setSuccessCourseId] = useState<string | null>(null);

  // ── Syllabus helpers ────────────────────────────────────────────────────
  const addSection = () =>
    setSyllabus((prev) => [...prev, { id: genId(), title: '', content: '' }]);

  const removeSection = (id: string) =>
    setSyllabus((prev) => prev.filter((s) => s.id !== id));

  const updateSection = (id: string, field: 'title' | 'content', value: string) =>
    setSyllabus((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!category) errs.category = 'Category is required';
    if (!shortDescription.trim()) errs.shortDescription = 'Short description is required';
    if (!fullDescription.trim()) errs.fullDescription = 'Full description is required';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) errs.price = 'Price must be 0 or more';
    if (format === 'in-person' && !location.trim())
      errs.location = 'Location is required for in-person courses';
    // Validate non-empty syllabus sections
    syllabus.forEach((s, i) => {
      if (s.title.trim() && !s.content.trim())
        errs[`syllabus_${i}_content`] = 'Section content is required';
      if (!s.title.trim() && s.content.trim())
        errs[`syllabus_${i}_title`] = 'Section title is required';
    });
    return errs;
  }, [title, category, shortDescription, fullDescription, price, format, location, syllabus]);

  // ── AI Generate ─────────────────────────────────────────────────────────
  const handleGenerateDescription = async () => {
    if (!title.trim() || !category) return;
    setIsGenerating(true);
    setAiError('');
    setAiSuccess(false);

    try {
      const res = await fetch(`${API_URL}/courses/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), category, keywords: keywords.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fallback) {
          // AI key not configured — show helpful message but don't block workflow
          setAiError(
            'AI key not configured (OPENROUTER_API_KEY). Add your key to server/.env to enable this feature.'
          );
          return;
        }
        throw new Error(data.error || 'Failed to generate description');
      }

      if (data.shortDescription) setShortDescription(data.shortDescription);
      if (data.fullDescription) setFullDescription(data.fullDescription);
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 4000);
    } catch (err: any) {
      setAiError(err.message || 'AI generation failed. Try again or write manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Form Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent, submitStatus: 'draft' | 'published') => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      // Scroll to first error
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFieldErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const userId = session?.user?.id;
      if (!userId) {
        router.push('/login?from=/courses/add');
        return;
      }

      // Filter out empty syllabus sections
      const cleanedSyllabus = syllabus
        .filter((s) => s.title.trim() && s.content.trim())
        .map(({ title, content }) => ({ title: title.trim(), content: content.trim() }));

      const payload = {
        userId,
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        category,
        price: parseFloat(price) || 0,
        startDate: startDate || undefined,
        format,
        location: format === 'in-person' ? location.trim() : 'Online',
        coverImageUrl: coverImageUrl.trim() || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        syllabus: cleanedSyllabus,
        status: submitStatus,
      };

      const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create course');

      setSuccessCourseId(data.course._id);
      // Navigate to new course after a brief success flash
      setTimeout(() => {
        router.push(`/courses/${data.course._id}`);
      }, 1400);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state while checking auth ───────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!session) return null; // Redirect handled in useEffect

  const canGenerate = title.trim().length >= 3 && !!category;
  const user = session.user;
  const userInitials = user.name?.split(' ').map((n: string) => n[0]).join('') || '?';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </span>
            StudySprint
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore</Link>
            <Link href="/courses/add" className="text-indigo-600 font-bold">Add Course</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
              {user.image ? (
                <img src={user.image} alt={user.name || ''} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-700 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/courses" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600">Add New Course</span>
        </div>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create a New Course
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Fill in the details below. Use AI to draft your descriptions, then customise.
            </p>
          </div>
          {/* Auto-promote info badge */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl shrink-0">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Publishing promotes your account to Creator</span>
          </div>
        </div>

        {/* ── Success Banner ──────────────────────────────────────────── */}
        {successCourseId && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-5 flex items-center gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Course created successfully!</p>
              <p className="text-xs font-medium text-emerald-600 mt-0.5">Redirecting you to the course page…</p>
            </div>
          </div>
        )}

        {/* ── Submit Error ────────────────────────────────────────────── */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-start gap-2.5 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, status)} noValidate className="space-y-6">

          {/* ════════════════════════════════════════════════════════════
              CARD 1 — Core Details
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Core Details</h2>
            </div>
            <div className="p-6 space-y-5">

              {/* Title */}
              <div>
                <label className={labelClass}>Course Title *</label>
                <input
                  id="course-title"
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: '' })); }}
                  placeholder="e.g. Full-Stack Web Development Bootcamp"
                  className={`${inputClass} ${fieldErrors.title ? errorInputClass : ''}`}
                />
                {fieldErrors.title && (
                  <p data-error className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setCategory(cat); setFieldErrors((p) => ({ ...p, category: '' })); }}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        category === cat
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {fieldErrors.category && (
                  <p data-error className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* Keywords (for AI assist) */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Keywords / Topics
                    <span className="normal-case font-medium text-slate-400">(helps AI generate better descriptions)</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. React, Node.js, TypeScript, REST APIs"
                  className={inputClass}
                />
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 2 — Descriptions with AI Assist
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Descriptions</h2>
              </div>

              {/* AI Generate Button */}
              <button
                type="button"
                id="ai-generate-btn"
                onClick={handleGenerateDescription}
                disabled={!canGenerate || isGenerating}
                title={
                  !canGenerate
                    ? 'Fill in Title and Category first to enable AI generation'
                    : 'Generate descriptions using AI'
                }
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 ${
                  canGenerate && !isGenerating
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* AI feedback banners */}
              {aiSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Descriptions generated! Review and edit them below.
                </div>
              )}
              {aiError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Short Description */}
              <div>
                <label className={labelClass}>
                  Short Description *
                  <span className="normal-case font-medium text-slate-400 ml-1">(shown on course cards, max ~200 chars)</span>
                </label>
                <textarea
                  id="short-description"
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => { setShortDescription(e.target.value); setFieldErrors((p) => ({ ...p, shortDescription: '' })); }}
                  placeholder="A concise one-liner that sells the course at a glance…"
                  className={`${inputClass} resize-none ${fieldErrors.shortDescription ? errorInputClass : ''}`}
                />
                <div className="flex justify-between mt-1">
                  {fieldErrors.shortDescription ? (
                    <p data-error className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.shortDescription}
                    </p>
                  ) : <span />}
                  <span className={`text-[11px] font-semibold ${shortDescription.length > 220 ? 'text-red-500' : 'text-slate-400'}`}>
                    {shortDescription.length}/220
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className={labelClass}>
                  Full Description *
                  <span className="normal-case font-medium text-slate-400 ml-1">(shown on the course detail page)</span>
                </label>
                <textarea
                  id="full-description"
                  rows={7}
                  value={fullDescription}
                  onChange={(e) => { setFullDescription(e.target.value); setFieldErrors((p) => ({ ...p, fullDescription: '' })); }}
                  placeholder="Describe what students will learn, who this course is for, prerequisites, and what makes it unique…"
                  className={`${inputClass} resize-y ${fieldErrors.fullDescription ? errorInputClass : ''}`}
                />
                {fieldErrors.fullDescription && (
                  <p data-error className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.fullDescription}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 3 — Pricing & Schedule
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Pricing & Schedule</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Price */}
              <div>
                <label className={labelClass}>
                  <DollarSign className="w-3.5 h-3.5 inline mr-0.5" /> Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">$</span>
                  <input
                    id="course-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setFieldErrors((p) => ({ ...p, price: '' })); }}
                    className={`${inputClass} pl-7 ${fieldErrors.price ? errorInputClass : ''}`}
                    placeholder="0 for free"
                  />
                </div>
                {parseFloat(price) === 0 && (
                  <p className="text-emerald-600 text-[11px] font-semibold mt-1">This course will be listed as Free</p>
                )}
                {fieldErrors.price && (
                  <p data-error className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.price}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className={labelClass}>
                  <Calendar className="w-3.5 h-3.5 inline mr-0.5" /> Start Date
                  <span className="normal-case font-medium text-slate-400 ml-1">(optional)</span>
                </label>
                <input
                  id="course-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Format */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Format *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['online', 'in-person'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        format === f
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {f === 'online' ? (
                        <Globe className={`w-5 h-5 ${format === f ? 'text-indigo-600' : 'text-slate-400'}`} />
                      ) : (
                        <Users className={`w-5 h-5 ${format === f ? 'text-indigo-600' : 'text-slate-400'}`} />
                      )}
                      <div className="text-left">
                        <p className="font-bold capitalize">{f}</p>
                        <p className="text-[10px] font-medium text-slate-400 normal-case">
                          {f === 'online' ? 'Remote, self-paced or live' : 'Physical classroom / venue'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location (only for in-person) */}
              {format === 'in-person' && (
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    <MapPin className="w-3.5 h-3.5 inline mr-0.5" /> Location *
                  </label>
                  <input
                    id="course-location"
                    type="text"
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setFieldErrors((p) => ({ ...p, location: '' })); }}
                    placeholder="e.g. New York, NY — WeWork Downtown"
                    className={`${inputClass} ${fieldErrors.location ? errorInputClass : ''}`}
                  />
                  {fieldErrors.location && (
                    <p data-error className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.location}
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 4 — Media & Tags
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Media & Tags</h2>
            </div>
            <div className="p-6 space-y-5">

              {/* Cover Image URL */}
              <div>
                <label className={labelClass}>
                  Cover Image URL
                  <span className="normal-case font-medium text-slate-400 ml-1">(optional — leave blank for default)</span>
                </label>
                <input
                  id="cover-image-url"
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={inputClass}
                />
                {coverImageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 w-full max-w-xs aspect-video">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}>
                  <Tag className="w-3.5 h-3.5 inline mr-0.5" /> Tags
                  <span className="normal-case font-medium text-slate-400 ml-1">(comma-separated, used for search)</span>
                </label>
                <input
                  id="course-tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="react, javascript, frontend, beginner"
                  className={inputClass}
                />
                {/* Tag preview pills */}
                {tags.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i} className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              CARD 5 — Syllabus
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Syllabus Sections</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Optional — add sections to outline your curriculum</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </div>

            <div className="p-6 space-y-4">
              {syllabus.map((section, idx) => (
                <div
                  key={section.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative group"
                >
                  {/* Section number badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Section {idx + 1}
                    </span>
                    {syllabus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="Remove section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Section title */}
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder={`Section title, e.g. "Introduction & Setup"`}
                    className={`${inputClass} ${fieldErrors[`syllabus_${idx}_title`] ? errorInputClass : ''}`}
                  />
                  {fieldErrors[`syllabus_${idx}_title`] && (
                    <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors[`syllabus_${idx}_title`]}
                    </p>
                  )}

                  {/* Section content */}
                  <textarea
                    rows={3}
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="What will students learn in this section? List topics, outcomes, or a brief overview…"
                    className={`${inputClass} resize-none ${fieldErrors[`syllabus_${idx}_content`] ? errorInputClass : ''}`}
                  />
                  {fieldErrors[`syllabus_${idx}_content`] && (
                    <p className="text-red-500 text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors[`syllabus_${idx}_content`]}
                    </p>
                  )}
                </div>
              ))}

              {/* Add another section CTA */}
              <button
                type="button"
                onClick={addSection}
                className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 rounded-2xl py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add another section
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              Submit Controls
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Ready to go?</p>
                <p className="text-xs text-slate-400 font-medium">
                  Save as draft to continue editing, or publish immediately to make it live.
                </p>
              </div>

              {/* Publish / Draft toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    status === 'draft'
                      ? 'bg-white text-slate-700 shadow-sm border border-slate-200'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                    status === 'published'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Publish
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-5 border-t border-slate-100">
              <Link
                href="/courses"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl transition-all"
              >
                Cancel
              </Link>

              <button
                type="submit"
                id="submit-course"
                disabled={isSubmitting || !!successCourseId}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any, status);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-8 text-sm font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                  status === 'published'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                    : 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-700/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {status === 'published' ? 'Publishing…' : 'Saving Draft…'}
                  </>
                ) : (
                  <>
                    {status === 'published' ? (
                      <><Eye className="w-4 h-4" /> Publish Course</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save as Draft</>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Status description */}
            <p className="text-[11px] text-slate-400 font-medium mt-3">
              {status === 'published'
                ? '⚡ This course will be immediately visible to all students in the marketplace.'
                : '🔒 Draft courses are only visible to you. Publish when ready.'}
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}
