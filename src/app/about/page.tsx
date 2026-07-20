'use client';

import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Zap, 
  ShieldCheck, 
  Target, 
  Cpu, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  MessageSquare,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';

// Mock Team Members based on Seed Database
const TEAM = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Co-Founder & Head of Curriculum',
    bio: 'Former Professor of Computer Science with 12+ years of teaching full-stack engineering and distributed systems.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    bgColor: '#4f46e5',
    specialty: 'Computer Science'
  },
  {
    name: 'Alex Rivera',
    role: 'Director of UX & Product Design',
    bio: 'Product designer and design systems lead at Google. Specializes in accessible UX design and design workflows.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bgColor: '#06b6d4',
    specialty: 'Design Systems'
  },
  {
    name: 'Sophia Martinez',
    role: 'Head of Content Localization',
    bio: 'Polyglot and professional language coach speaking 6 languages. Focuses on rapid immersion learning methodologies.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bgColor: '#f59e0b',
    specialty: 'Language Immersion'
  }
];

export default function AboutPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const effectiveLoggedIn = !!session?.user;
  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      {/* Meta/SEO headers are managed dynamically by the framework but we use proper semantics */}
      
      {/* ── Navbar ────────────────────────────────────────────────────── */}
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
            <Link href="/about" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-0.5">About</Link>
            {effectiveLoggedIn && (
              <>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <Link href="/courses/manage" className="hover:text-indigo-600 transition-colors">My Courses</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {effectiveLoggedIn ? (
              <Link href="/profile" className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name} className="rounded-full object-cover w-full h-full" />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-ghost text-indigo-600 font-bold">Log In</Link>
                <Link href="/register" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl px-4 py-2 text-sm font-bold shadow-md shadow-indigo-600/15">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-grow space-y-16 pb-20">
        
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white py-20 px-6 lg:px-12 text-center">
          <div className="absolute -top-32 -right-32 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-indigo-200 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 fill-indigo-300 text-indigo-300" /> Shaping the Future of Education
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            >
              Learn with Speed. <br/>
              Teach with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">AI Intelligence.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-indigo-200/80 text-base max-w-2xl mx-auto leading-relaxed"
            >
              StudySprint bridges the gap between elite instructors and eager learners by packing state-of-the-art AI-driven curation, description generation, and interactive coaching widgets right into your browser.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center gap-4 pt-4"
            >
              <Link href="/courses" className="btn bg-indigo-600 hover:bg-indigo-500 border-none text-white font-bold rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="btn bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl px-6 py-3">
                Join StudySprint
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Key Highlights (Grid) ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Built on Three Innovation Pillars</h2>
            <p className="text-sm text-slate-400 font-medium">How we optimize modern education for both students and creators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-6 h-6 text-indigo-600" />,
                title: "Adaptive Recommendations",
                desc: "Our engine uses interaction logs, click logs, and target learning goals to suggest the most relevant study material."
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
                title: "Agentic AI Advisor",
                desc: "An intelligent learning coach loaded directly in your browser. Helps construct study schedules and resolves coursework queries."
              },
              {
                icon: <Zap className="w-6 h-6 text-purple-500" />,
                title: "Creator Description Copilot",
                desc: "Empowers educators with high-converting titles, outlines, and syllabus Copywriters built directly through LLM integrations."
              }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-4 transition-all duration-300"
              >
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{pillar.icon}</div>
                <h3 className="text-lg font-black text-slate-800 leading-tight">{pillar.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Stats & Traction banner ── */}
        <section className="bg-slate-100 py-16 border-y border-slate-200 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Dynamic Course Count", value: "4+", desc: "Expert-curated learning listings" },
              { title: "Active Learners", value: "2+", desc: "Transitioning careers with tech" },
              { title: "AI Feature Integration", value: "3+", desc: "Curation, Content Gen & Advisors" },
              { title: "Overall Average Rating", value: "4.8", desc: "Highest-quality learner satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <p className="text-4xl font-black text-indigo-700">{stat.value}</p>
                <p className="text-sm font-bold text-slate-800 leading-none">{stat.title}</p>
                <p className="text-xs text-slate-400 font-semibold">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team / Seeded Instructor Showcase ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Meet Our Seed Instructors</h2>
            <p className="text-sm text-slate-400 font-medium">Real industry professionals leading the future of immersion and automation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div 
                key={i} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-slate-50">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-black text-slate-800 flex items-center gap-1 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-indigo-600" /> {member.specialty}
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-800">{member.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold">{member.role}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-grow font-semibold">{member.bio}</p>
                  <div className="pt-2">
                    <Link href="/courses" className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1">
                      View Courses <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6 lg:px-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-700 tracking-tight">
              <span className="p-1.5 bg-indigo-600 rounded text-white"><BookOpen className="w-5 h-5" /></span>
              StudySprint
            </Link>
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
              <li><Link href="/courses" className="hover:text-indigo-600 transition-colors">Programming</Link></li>
              <li><Link href="/courses" className="hover:text-indigo-600 transition-colors">Design Systems</Link></li>
              <li><Link href="/courses" className="hover:text-indigo-600 transition-colors">Business AI</Link></li>
              <li><Link href="/courses" className="hover:text-indigo-600 transition-colors">Immersion Spanish</Link></li>
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
