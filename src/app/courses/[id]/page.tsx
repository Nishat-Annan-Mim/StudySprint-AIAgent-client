'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  MessageSquare,
  Award,
  BookOpenCheck,
  CheckCircle,
  ThumbsUp,
  User,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/Card';
import AIChatWidget from '@/components/AIChatWidget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const queryClient = useQueryClient();

  // Login simulation states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'creator'>('student');
  const [userId, setUserId] = useState<string>('');

  // Active gallery image
  const [activeImage, setActiveImage] = useState<string>('');

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Enrollment notification state
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  // Fetch simulation users (to dynamically set IDs for actions)
  const { data: simUsers } = useQuery({
    queryKey: ['simulationUsers'],
    queryFn: () => fetch(`${API_URL}/landing/simulation-users`).then((res) => res.json()),
  });

  // Track simulated user ID
  useEffect(() => {
    if (isLoggedIn && simUsers) {
      if (role === 'student' && simUsers.student) {
        setUserId(simUsers.student._id);
      } else if (role === 'creator' && simUsers.creator) {
        setUserId(simUsers.creator._id);
      }
    } else {
      setUserId('');
    }
  }, [isLoggedIn, role, simUsers]);

  // Fetch Course details
  const { data: detailsData, isLoading: detailsLoading, refetch: refetchDetails } = useQuery({
    queryKey: ['courseDetails', id, userId],
    queryFn: async () => {
      const url = userId 
        ? `${API_URL}/courses/${id}?studentId=${userId}`
        : `${API_URL}/courses/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load course details');
      return res.json();
    },
    // Refetch when simulated user log in state changes
    enabled: !!id,
  });

  const course = detailsData?.course;
  const reviews = detailsData?.reviews || [];
  const isEnrolled = detailsData?.isEnrolled || false;
  const progress = detailsData?.progress || 0;

  // Set initial active image when course details are loaded
  useEffect(() => {
    if (course?.coverImageUrl) {
      setActiveImage(course.coverImageUrl);
    }
  }, [course]);

  // Fetch Related Courses
  const { data: relatedCourses, isLoading: relatedLoading } = useQuery({
    queryKey: ['relatedCourses', id],
    queryFn: () => fetch(`${API_URL}/courses/${id}/related`).then((res) => res.json()),
    enabled: !!id,
  });

  // Enrollment Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/courses/${id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to enroll');
      }
      return res.json();
    },
    onSuccess: () => {
      setEnrollSuccess(true);
      setEnrollError('');
      refetchDetails(); // Update enrollment state
      queryClient.invalidateQueries({ queryKey: ['courseDetails', id, userId] });
    },
    onError: (err: any) => {
      setEnrollError(err.message);
      setEnrollSuccess(false);
    }
  });

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/courses/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userId,
          rating,
          comment
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }
      return res.json();
    },
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewError('');
      setComment('');
      refetchDetails(); // Recalculate average rating & counts
      queryClient.invalidateQueries({ queryKey: ['courseDetails', id, userId] });
    },
    onError: (err: any) => {
      setReviewError(err.message);
      setReviewSuccess(false);
    }
  });

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      // Prompt simulation login
      setIsLoggedIn(true);
      setRole('student');
      return;
    }
    enrollMutation.mutate();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || role !== 'student') {
      setReviewError('You must be logged in as a student to write a review.');
      return;
    }
    reviewMutation.mutate();
  };

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-ring loading-lg text-indigo-600" />
          <span className="text-slate-500 font-semibold text-sm">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-slate-500 max-w-sm">The course listing might have been removed or set back to draft mode.</p>
        <Link href="/courses" className="btn btn-primary bg-indigo-600 border-none text-white rounded-xl">Back to Explore</Link>
      </div>
    );
  }

  // Calculate review rating breakdown percentages
  const ratingCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
  reviews.forEach((r: any) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++;
    }
  });

  const totalReviews = reviews.length;
  const ratingBreakdown = ratingCounts.map((count) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  }).reverse(); // 5 stars down to 1 star

  // Fallback thumbnails gallery images
  const galleryThumbnails = [
    course.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    ...(course.galleryImages?.length > 0 
      ? course.galleryImages 
      : [
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
        ])
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      {/* Simulation Banner */}
      <div className="bg-indigo-900 text-white text-xs py-1.5 px-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <span className="badge badge-warning badge-xs">Simulation Mode</span>
          <span>Toggle client logged-in states to test enrollment triggers.</span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isLoggedIn} 
              onChange={() => setIsLoggedIn(!isLoggedIn)} 
              className="toggle toggle-primary toggle-xs"
            />
            <span>Log In Simulation</span>
          </label>
          {isLoggedIn && (
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'student' | 'creator')}
              className="select select-bordered select-xs text-slate-800 bg-white"
            >
              <option value="student">Student (Emma Watson)</option>
              <option value="creator">Creator (Sarah Jenkins)</option>
            </select>
          )}
        </div>
      </div>

      {/* Sticky Navbar */}
      <header className="navbar bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-12 shadow-sm">
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-indigo-700 tracking-tight">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white"><BookOpen className="w-6 h-6" /></span>
            StudySprint
          </Link>
        </div>

        <div className="flex-none hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6 font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-indigo-600 transition-colors text-indigo-600">Explore Courses</Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                  <div className="bg-indigo-600 text-white rounded-full w-10">
                    <span>{role === 'creator' ? 'SJ' : 'EW'}</span>
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-slate-200">
                  <li className="menu-title text-slate-400">
                    {role === 'creator' ? 'Dr. Sarah Jenkins' : 'Emma Watson'}
                  </li>
                  <li><a className="hover:text-indigo-600">Settings</a></li>
                  <li><a onClick={() => setIsLoggedIn(false)} className="text-red-500 hover:text-red-600">Logout</a></li>
                </ul>
              </div>
            ) : (
              <>
                <button onClick={() => setIsLoggedIn(true)} className="btn btn-ghost text-slate-600 hover:text-indigo-600 font-semibold">
                  Login
                </button>
                <button onClick={() => { setIsLoggedIn(true); setRole('student'); }} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl text-white px-5 shadow-md">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-6 uppercase tracking-wider">
          <Link href="/courses" className="hover:text-indigo-600">Explore</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-indigo-600 truncate max-w-xs">{course.title}</span>
        </div>

        {/* Dynamic Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Media Gallery, Accordion, Reviews */}
          <div className="lg:col-span-8 space-y-10">
            {/* Image/Media Gallery */}
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200/60 shadow-md bg-slate-100">
                <img 
                  src={activeImage} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
              
              {/* Thumbnails row */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryThumbnails.map((thumb, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(thumb)}
                    className={`relative w-24 aspect-video rounded-lg overflow-hidden border-2 bg-slate-100 transition-all ${activeImage === thumb ? 'border-indigo-600 scale-95 shadow-sm' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={thumb} alt="Preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Overview / What you'll learn */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">Course Overview</h2>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                  {course.fullDescription}
                </p>
              </div>

              {course.syllabus?.length > 0 && (
                <div className="border-t border-slate-100 pt-6 space-y-3.5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BookOpenCheck className="w-5 h-5 text-indigo-600" /> What You'll Learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    {course.syllabus.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion (Syllabus Sections) */}
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Syllabus Curriculum</h2>
              <div className="join join-vertical w-full bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
                {course.syllabus?.map((s: any, idx: number) => (
                  <div key={idx} className="collapse collapse-arrow join-item border-b border-slate-100 last:border-none">
                    <input type="radio" name="syllabus-accordion" defaultChecked={idx === 0} /> 
                    <div className="collapse-title text-sm font-bold text-slate-800 py-4 px-6 flex items-center gap-3">
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded text-xs">Section {idx + 1}</span>
                      {s.title}
                    </div>
                    <div className="collapse-content px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-50/50 pt-4">
                      {s.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Feedback</h2>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{course.reviewCount} review{course.reviewCount !== 1 ? 's' : ''}</span>
              </div>

              {/* Rating breakdown block */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-4 text-center sm:border-r border-slate-100 py-2">
                  <p className="text-5xl font-black text-slate-900">{course.averageRating}</p>
                  <div className="flex justify-center gap-1 my-2 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-4 h-4 ${idx < Math.round(course.averageRating) ? 'fill-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Course Average Rating</p>
                </div>

                <div className="sm:col-span-8 space-y-2">
                  {ratingBreakdown.map((percent, idx) => {
                    const stars = 5 - idx;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span className="w-12 text-right">{stars} Star{stars !== 1 ? 's' : ''}</span>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-right text-slate-400">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 pt-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-6">No reviews have been submitted for this course yet.</p>
                ) : (
                  reviews.map((rev: any) => (
                    <div key={rev._id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 items-start">
                      {/* Avatar */}
                      {rev.student?.image ? (
                        <img src={rev.student.image} alt={rev.student.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: rev.student?.avatarBgColor || '#4f46e5' }}>
                          {rev.student?.name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                      )}

                      {/* Content */}
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{rev.student?.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{rev.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Review submit form */}
              {isEnrolled && (
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-1.5"><MessageSquare className="w-5 h-5 text-indigo-600" /> Share Your Review</h3>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {/* Star rating selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text input */}
                    <div className="space-y-2">
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your feedback about syllabus clarity, materials quality, or creator's pace..."
                        required
                        className="textarea textarea-bordered w-full h-24 border-slate-200 focus:border-indigo-500 bg-slate-50 focus:outline-none text-slate-800 text-sm"
                      />
                    </div>

                    {/* Alerts */}
                    {reviewSuccess && (
                      <p className="text-emerald-500 text-xs font-bold">Review submitted successfully!</p>
                    )}
                    {reviewError && (
                      <p className="text-red-500 text-xs font-bold">{reviewError}</p>
                    )}

                    <button 
                      type="submit" 
                      disabled={reviewMutation.isPending}
                      className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-xl px-5"
                    >
                      {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Key Info Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <Card className="p-6 border border-slate-200/60 shadow-md">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Pricing</p>
                  <p className="text-3xl font-black text-slate-900">
                    {course.price === 0 ? (
                      <span className="text-emerald-600 font-extrabold">Free</span>
                    ) : (
                      `$${course.price}`
                    )}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Format</p>
                      <p className="text-slate-800 font-extrabold capitalize">{course.format}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Start Date</p>
                      <p className="text-slate-800 font-extrabold">
                        {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Self-paced / Immediate'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                      <p className="text-slate-800 font-extrabold">{course.location}</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment actions */}
                <div className="border-t border-slate-100 pt-6 space-y-3">
                  {isEnrolled ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center space-y-2">
                      <p className="text-emerald-700 font-extrabold text-sm flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> You're Enrolled!
                      </p>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <progress className="progress progress-success w-full" value={progress} max="100" />
                    </div>
                  ) : (
                    <>
                      {enrollSuccess && (
                        <p className="text-emerald-500 text-xs font-bold text-center">Successfully enrolled! Welcome aboard.</p>
                      )}
                      {enrollError && (
                        <p className="text-red-500 text-xs font-bold text-center">{enrollError}</p>
                      )}

                      <button 
                        onClick={handleEnrollClick}
                        disabled={enrollMutation.isPending}
                        className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-xl w-full py-3 shadow-lg shadow-indigo-600/20 font-bold text-sm"
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : isLoggedIn ? 'Enroll Now' : 'Login to Enroll'}
                      </button>
                    </>
                  )}

                  {/* Ask AI Trigger Button */}
                  <button className="btn btn-outline border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs py-2.5">
                    <Sparkles className="w-4 h-4" /> Ask AI about this course
                  </button>
                </div>
              </div>
            </Card>

            {/* Creator Card */}
            <Card className="p-5 border border-slate-200/60 shadow-md">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-3">About the Creator</h3>
              <div className="flex items-center gap-3">
                {course.creator?.image ? (
                  <img src={course.creator.image} alt={course.creator.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: course.creator?.avatarBgColor || '#4f46e5' }}>
                    {course.creator?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base leading-tight">{course.creator?.name}</h4>
                  <span className="badge badge-indigo badge-outline text-[10px] uppercase font-bold mt-1">Instructor</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-4">
                {course.creator?.bio || "Expert StudySprint creator sharing resource packs, sessions, and syllabus bootcamp guides."}
              </p>
            </Card>
          </div>
        </div>

        {/* Related Courses Section */}
        {relatedCourses && relatedCourses.length > 0 && (
          <div className="pt-20 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Related Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map((related: any) => (
                <Card key={related._id} className="flex flex-col justify-between h-full p-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img 
                      src={related.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'} 
                      alt={related.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-slate-100">
                      {related.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {related.averageRating}</span>
                        <span className="capitalize">{related.format}</span>
                      </div>
                      <Link href={`/courses/${related._id}`} className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
                        {related.title}
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                        {related.creator?.name}
                      </span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {related.price === 0 ? (
                          <span className="text-emerald-600 font-extrabold">Free</span>
                        ) : (
                          `$${related.price}`
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 lg:px-12 text-sm text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-600 rounded text-white"><BookOpen className="w-4 h-4" /></span>
            <span className="text-slate-700 font-extrabold">StudySprint</span>
          </div>
          <p>StudySprint &copy; {new Date().getFullYear()} - All rights reserved.</p>
        </div>
      </footer>

      {/* AI Chat Widget — course context mode */}
      <AIChatWidget
        userId={"guest"}
        context={{ type: 'course', courseId: id }}
      />
    </div>
  );
}
