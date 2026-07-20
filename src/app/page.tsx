'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Award, 
  MessageSquare, 
  Send, 
  Code, 
  Palette, 
  Briefcase, 
  Globe, 
  Compass, 
  UserCheck, 
  TrendingUp, 
  BookOpenCheck,
  ChevronDown,
  Search,
  LogIn,
  LogOut
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import Card from '@/components/Card';
import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Recharts platform growth data
const chartData = [
  { month: 'Jan', enrollments: 240, completions: 110 },
  { month: 'Feb', enrollments: 380, completions: 190 },
  { month: 'Mar', enrollments: 510, completions: 280 },
  { month: 'Apr', enrollments: 720, completions: 430 },
  { month: 'May', enrollments: 980, completions: 620 },
  { month: 'Jun', enrollments: 1450, completions: 890 },
];

export default function HomePage() {
  // Real session from Better Auth
  const { data: session, isPending: sessionLoading } = useSession();
  const realUser = session?.user;

  // Simulation mode (overrides real session for demo/preview)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'creator'>('student');

  // Effective login state — real session OR simulation toggle
  const effectiveLoggedIn = !!realUser || isLoggedIn;
  const effectiveRole = realUser ? 'student' : role;
  const effectiveName = realUser?.name || (role === 'creator' ? 'Dr. Sarah Jenkins' : 'Emma Watson');
  const effectiveInitials = effectiveName.split(' ').map((n: string) => n[0]).join('');

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "Hi there! I'm your Study Advisor. I can see you're interested in Full-Stack Web Development. Would you like some help choosing what to study next?" }
  ]);

  // Fetch Trust Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['landingStats'],
    queryFn: () => fetch(`${API_URL}/landing/stats`).then((res) => res.json()),
  });

  // Fetch Featured Courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: () => fetch(`${API_URL}/landing/featured-courses`).then((res) => res.json()),
  });

  // Fetch Categories counts
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['landingCategories'],
    queryFn: () => fetch(`${API_URL}/landing/categories`).then((res) => res.json()),
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage('');

    // Simulate Advisor Reply
    setTimeout(() => {
      let replyContent = "That sounds like a great study plan! I recommend starting with our Full-Stack Web Development Bootcamp to acquire frontend and backend skills.";
      if (chatMessage.toLowerCase().includes('design') || chatMessage.toLowerCase().includes('figma')) {
        replyContent = "If you're focused on UI design, Alex's course 'Mastering Figma & UI Design Systems' is a top-rated choice to build production design templates.";
      } else if (chatMessage.toLowerCase().includes('spanish') || chatMessage.toLowerCase().includes('languages')) {
        replyContent = "For languages, Sophia's workshop 'Conversational Spanish: Zero to Fluent' uses rapid immersion frameworks to build speaking confidence fast.";
      } else if (chatMessage.toLowerCase().includes('free') || chatMessage.toLowerCase().includes('automation')) {
        replyContent = "We have a highly-rated free resource: 'AI-Powered Business Automation' which teaches prompt engineering and workflow automation.";
      }
      setChatHistory((prev) => [...prev, { role: 'assistant', content: replyContent }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Simulation Banner — only shown when no real session is active */}
      {!realUser && (
        <div className="bg-indigo-900 text-white text-xs py-1.5 px-4 flex justify-between items-center z-50 relative">
          <div className="flex items-center gap-2">
            <span className="badge badge-warning badge-xs">Simulation Mode</span>
            <span>Click the toggle to preview the student/creator logged-in interfaces.</span>
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
                <option value="student">Student Account</option>
                <option value="creator">Creator Account</option>
              </select>
            )}
          </div>
        </div>
      )}

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
            <Link href="/courses" className="hover:text-indigo-600 transition-colors">Explore Courses</Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            {effectiveLoggedIn && (
              <>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <Link href="/courses/manage" className="hover:text-indigo-600 transition-colors">My Courses</Link>
                <Link href="/courses/add" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold">
                  + Add Course
                </Link>
                <a href="#" className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-indigo-600">
                  <Sparkles className="w-4 h-4" /> AI Advisor
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {effectiveLoggedIn ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                  <div className="bg-indigo-600 text-white rounded-full w-10">
                    {realUser?.image ? (
                      <img src={realUser.image} alt={effectiveName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span>{effectiveInitials}</span>
                    )}
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-slate-200">
                  <li className="menu-title text-slate-400">{effectiveName}</li>
                  {effectiveRole === 'creator' && (
                    <li><Link href="/courses/manage" className="hover:text-indigo-600">Manage Listings</Link></li>
                  )}
                  <li><a className="hover:text-indigo-600">Settings</a></li>
                  <li>
                    <a
                      onClick={async () => {
                        if (realUser) {
                          await signOut();
                        } else {
                          setIsLoggedIn(false);
                        }
                      }}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost text-slate-600 hover:text-indigo-600 font-semibold">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl text-white px-5 shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className="dropdown dropdown-end md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-lg bg-base-100 rounded-xl w-56 border border-slate-200 gap-2">
            <li><Link href="/courses" className="font-semibold text-slate-700">Explore Courses</Link></li>
            <li><Link href="/about" className="font-semibold text-slate-700">About</Link></li>
            {effectiveLoggedIn ? (
              <>
                <li><a className="font-semibold text-indigo-600"><Sparkles className="w-4 h-4" /> AI Advisor</a></li>
                <li className="border-t border-slate-100 pt-2">
                  <a
                    onClick={async () => {
                      if (realUser) await signOut();
                      else setIsLoggedIn(false);
                    }}
                    className="text-red-500 cursor-pointer"
                  >
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="border-t border-slate-100 pt-2">
                  <Link href="/login" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white btn-sm rounded-lg">Log In</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 px-6 lg:px-12 min-h-[75vh] flex items-center border-b border-slate-100">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4" /> Next-gen Learning Marketplace
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Learn Faster.<br />
              <span className="text-indigo-600">Teach Smarter.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              Browse video courses, study packs, workshops, and 1-on-1 tutoring sessions. Leverage agentic AI guides to customize your curriculum and achieve goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <a href="#featured-courses" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-xl px-8 py-3 shadow-lg shadow-indigo-600/20 text-base font-semibold">
                Explore Courses
              </a>
              <Link href="/register" className="btn btn-outline border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl px-8 py-3 text-base font-semibold">
                Become a Creator
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-3xl border border-indigo-200/50 p-6 flex flex-col justify-center items-center shadow-xl">
              {/* Floating elements animation */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-10 left-10 bg-white shadow-lg rounded-2xl p-4 border border-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Code className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Programming</p>
                  <p className="text-sm font-bold text-slate-800">React Roadmap</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="absolute bottom-10 right-10 bg-white shadow-lg rounded-2xl p-4 border border-slate-100 flex items-center gap-3"
              >
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Star className="w-5 h-5 fill-amber-500 text-amber-500" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Instructor</p>
                  <p className="text-sm font-bold text-slate-800">4.9 Average Rating</p>
                </div>
              </motion.div>

              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg shadow-indigo-600/30">
                  <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">AI Advisor Active</p>
                <p className="text-sm text-slate-500 max-w-xs">
                  Tailoring course materials, learning objectives, and custom schedules to match your study path.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Scroll to Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce text-slate-400" />
        </div>
      </section>

      {/* 1. Trust Bar Section */}
      <section className="bg-white py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-indigo-600">
                {statsLoading ? '...' : `${stats?.coursesCount || 4}+`}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Courses</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-indigo-600">
                {statsLoading ? '...' : `${(stats?.studentsCount || 2)}+`}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Active Students</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500 hidden sm:inline" />
                {statsLoading ? '...' : `${stats?.avgRating || 4.8}`}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Average Review Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Featured Categories</h2>
            <p className="text-slate-500 mt-3 text-base">
              Dive into our curated learning streams guided by specialized instructors and advanced curriculum planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'programming', name: 'Programming', icon: <Code className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100', count: categories?.find((c: any) => c.name === 'Programming')?.count || 2 },
              { id: 'design', name: 'Design', icon: <Palette className="w-6 h-6 text-pink-600" />, bg: 'bg-pink-50 border-pink-100', count: categories?.find((c: any) => c.name === 'Design')?.count || 1 },
              { id: 'business', name: 'Business', icon: <Briefcase className="w-6 h-6 text-teal-600" />, bg: 'bg-teal-50 border-teal-100', count: categories?.find((c: any) => c.name === 'Business')?.count || 1 },
              { id: 'languages', name: 'Languages', icon: <Globe className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50 border-amber-100', count: categories?.find((c: any) => c.name === 'Languages')?.count || 1 },
            ].map((cat) => (
              <a href="#" key={cat.id} className="block group">
                <div className={`p-6 rounded-2xl border ${cat.bg} hover:shadow-lg transition-all duration-300`}>
                  <div className="p-3 bg-white rounded-xl shadow-sm w-fit group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-6 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                  <div className="flex justify-between items-center mt-3 text-sm text-slate-500 font-semibold">
                    <span>{cat.count} Course{cat.count !== 1 ? 's' : ''}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Courses Section */}
      <section id="featured-courses" className="py-20 bg-white border-y border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Learning Paths</h2>
              <p className="text-slate-500 mt-2 text-base">Top-rated and recently published resources on the marketplace.</p>
            </div>
            <a href="#" className="btn btn-outline border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl px-5 flex items-center gap-1.5 font-bold">
              View All Courses <Compass className="w-4 h-4" />
            </a>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="bg-slate-100 rounded-2xl h-80 animate-pulse border border-slate-200/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses?.map((course: any) => (
                <Card key={course._id} className="flex flex-col justify-between h-full p-0">
                  {/* Banner image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img 
                      src={course.coverImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-slate-100">
                      {course.category}
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {course.averageRating} ({course.reviewCount})</span>
                        <span className="capitalize">{course.format}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-1 leading-snug hover:text-indigo-600 cursor-pointer">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {course.creator?.image ? (
                          <img src={course.creator.image} alt={course.creator.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: course.creator?.avatarBgColor || '#4f46e5' }}>
                            {course.creator?.name?.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                        )}
                        <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">
                          {course.creator?.name}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800 text-base">
                        {course.price === 0 ? (
                          <span className="text-emerald-600 font-extrabold">Free</span>
                        ) : (
                          `$${course.price}`
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 mt-3 text-base">Follow our three-step framework to launch or accelerate your track.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-indigo-100 -translate-y-12 -z-10" />

            {[
              { step: "01", title: "Browse & Compare", desc: "Discover high-quality video courses, workshop packages, and resources structured by industry experts.", icon: <Search className="w-8 h-8 text-indigo-600" /> },
              { step: "02", title: "Enroll & Secure Access", desc: "Unlock instant access to materials, download resources, and track progress dashboard metrics.", icon: <UserCheck className="w-8 h-8 text-indigo-600" /> },
              { step: "03", title: "Get AI Advisor Guidance", desc: "Interact with our AI Study Advisor to analyze your progress, review syllabus items, and design next steps.", icon: <Sparkles className="w-8 h-8 text-amber-500" /> }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/50 relative flex flex-col items-center text-center">
                <div className="absolute -top-5 bg-indigo-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md shadow-indigo-600/20">
                  Step {step.step}
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 mt-2">
                  {step.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AI Advisor Spotlight Section */}
      <section className="py-20 bg-white border-y border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" /> Conversational Memory
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Meet Your AI Study Advisor
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Unlike static chatbots, our Study Advisor reads your active course enrollments, monitors your progress metrics, and queries details dynamically to suggest what syllabus sections to practice next.
            </p>
            <ul className="space-y-3.5">
              {[
                "Analyzes your active course progress percentages",
                "Suggests learning tracks based on custom goals",
                "Maintains long-term chat session memory",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <span className="p-1 bg-indigo-100 text-indigo-600 rounded-full"><Award className="w-4 h-4" /></span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => { setIsLoggedIn(true); }} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white rounded-xl px-6 py-3 shadow-md">
              Ask AI Now
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-lg mx-auto">
              <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white"><Sparkles className="w-4 h-4" /></div>
                  <div>
                    <p className="text-xs text-white font-bold">Study Advisor</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="h-64 overflow-y-auto p-5 space-y-4 text-sm flex flex-col">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendChatMessage} className="bg-slate-900 border-t border-slate-800 p-3 flex gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question (e.g. recommend a figma course)..." 
                  className="flex-1 bg-slate-850 text-white border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Testimonials</h2>
            <p className="text-slate-500 mt-3 text-base">Real experiences from students learning via StudySprint.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Emma Watson", role: "Student", comment: "Incredible bootcamp. The projects are actually valuable to show to employers, and explanations are clear.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" },
              { name: "John Doe", role: "Student", comment: "A practical guide to LLM automations. The instructions are detailed and templates are easy to customize.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" },
              { name: "Jessica Smith", role: "Creative Lead", comment: "Perfect Figma course. Learnt Design Tokens and Advanced variables which helped land my first UI job!", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100" }
            ].map((test, idx) => (
              <Card key={idx} className="flex flex-col justify-between p-6">
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "{test.comment}"
                </p>
                <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4">
                  <img src={test.image} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{test.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{test.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Statistics/Impact Section */}
      <section className="py-20 bg-white border-y border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" /> Platform Traction
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Tracking Our Global Impact
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Our marketplace is scaling rapidly. As more creators list premium study packs, tutoring session slots, and bootcamps, our student completions and total course enrollments scale proportionally month-over-month.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Growth</p>
                <p className="text-3xl font-extrabold text-indigo-600 mt-1">120%</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Graduation Rate</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">94%</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 w-full h-[320px] bg-slate-50 border border-slate-200/50 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Platform Growth Metric (2026)</p>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="enrollments" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnrollments)" name="Course Enrollments" />
                <Area type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompletions)" name="Resource Completions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 8. Newsletter + Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-400/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to Accelerate Your Learning Path?
          </h2>
          <p className="text-indigo-200 text-base sm:text-lg max-w-xl mx-auto">
            Join thousands of students selecting StudySprint resources. Subscribe to get notified on newly released courses, study packs, and AI recommendations.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your professional email..." 
              required
              className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
            />
            <button type="submit" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30">
              Join StudySprint
            </button>
          </form>

          <AnimatePresence>
            {subscribed && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 font-bold text-sm"
              >
                Thank you for subscribing! Check your inbox for study tips and releases.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6 lg:px-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
              <span className="p-1 bg-indigo-600 rounded text-white"><BookOpen className="w-5 h-5" /></span>
              StudySprint
            </a>
            <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
              StudySprint is an AI-powered learning marketplace for video courses, PDF study packs, tutoring session slots, and workshops.
            </p>
            <p className="text-xs text-slate-400 font-medium">
              contact@studysprint.io | +1 (555) 0199-281
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">About</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="hover:text-indigo-600 transition-colors">Our Company</Link></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Sponsors</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Press Kit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Programming</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Design Systems</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Business AI</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Immersion Spanish</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">Socials</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Twitter (X)</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">LinkedIn Profile</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">YouTube Channel</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">GitHub Repos</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
          <p>StudySprint &copy; {new Date().getFullYear()} - All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-slate-600">Terms</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-slate-600">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
