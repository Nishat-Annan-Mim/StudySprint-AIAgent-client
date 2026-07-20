'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Star, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Filter, 
  X,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import Card from '@/components/Card';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ExploreCoursesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Search state & debounce
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters state
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState('');
  const [location, setLocation] = useState('All');
  
  // Sort state
  const [sort, setSort] = useState('newest');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 8;

  // Mobile filters drawer open/close
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Debouncer for search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset page on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Reset filters
  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setCategory('All');
    setMaxPrice(150);
    setMinRating('');
    setLocation('All');
    setSort('newest');
    setPage(1);
  };

  // Fetch Courses with parameters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', searchQuery, category, maxPrice, minRating, location, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (category && category !== 'All') params.append('category', category);
      if (maxPrice < 150) params.append('maxPrice', maxPrice.toString());
      if (minRating) params.append('minRating', minRating);
      if (location && location !== 'All') params.append('location', location);

      const res = await fetch(`${API_URL}/courses?${params.toString()}`);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
  });

  const courses = data?.courses || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Card Skeleton Loader component matching course card dimensions
  const SkeletonCard = () => (
    <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm h-[380px] flex flex-col justify-between animate-pulse">
      <div className="bg-slate-200 aspect-video w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-200 rounded w-1/5" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 w-1/2">
            <div className="w-6 h-6 rounded-full bg-slate-200" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
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
                    <span>EW</span>
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 border border-slate-200">
                  <li className="menu-title text-slate-400">Emma Watson</li>
                  <li><a className="hover:text-indigo-600">Settings</a></li>
                  <li><a onClick={() => setIsLoggedIn(false)} className="text-red-500 hover:text-red-600">Logout</a></li>
                </ul>
              </div>
            ) : (
              <>
                <button onClick={() => setIsLoggedIn(true)} className="btn btn-ghost text-slate-600 hover:text-indigo-600 font-semibold">
                  Login
                </button>
                <button onClick={() => setIsLoggedIn(true)} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl text-white px-5 shadow-md">
                  Register
                </button>
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
            <li><Link href="/" className="font-semibold text-slate-700">Home</Link></li>
            <li><Link href="/courses" className="font-semibold text-indigo-600">Explore Courses</Link></li>
            <li><Link href="/about" className="font-semibold text-slate-700">About</Link></li>
          </ul>
        </div>
      </header>

      {/* Main Explore Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-600" /> Filters</h3>
            <button onClick={resetFilters} className="text-xs text-slate-400 font-semibold hover:text-indigo-600 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-700 text-sm">Category</h4>
            <div className="flex flex-col gap-2.5">
              {['All', 'Programming', 'Design', 'Business', 'Languages'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category"
                    checked={category === cat}
                    onChange={() => { setCategory(cat); setPage(1); }}
                    className="radio radio-primary radio-sm"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm font-bold text-slate-700">
              <span>Max Price</span>
              <span className="text-indigo-600">{maxPrice === 150 ? 'Any' : `$${maxPrice}`}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="150" 
              step="10"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(parseInt(e.target.value, 10)); setPage(1); }}
              className="range range-primary range-xs"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>$0</span>
              <span>$75</span>
              <span>$150+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-700 text-sm">Rating Threshold</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'All Ratings', value: '' },
                { label: '4.5+ ★', value: '4.5' },
                { label: '4.0+ ★', value: '4.0' },
                { label: '3.5+ ★', value: '3.5' },
              ].map((rat) => (
                <label key={rat.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rating"
                    checked={minRating === rat.value}
                    onChange={() => { setMinRating(rat.value); setPage(1); }}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="flex items-center gap-1">{rat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format / Location Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-slate-700 text-sm">Location</h4>
            <div className="flex flex-col gap-2.5">
              {['All', 'Online', 'In-person'].map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="location"
                    checked={location === loc}
                    onChange={() => { setLocation(loc); setPage(1); }}
                    className="radio radio-primary radio-sm"
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Search Results Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Controls: Search, Sort, Mobile Filter Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search course title or keywords..."
                className="input input-bordered w-full pl-10 pr-4 py-2 border-slate-200 focus:border-indigo-500 bg-slate-50 text-slate-800 text-sm rounded-xl focus:outline-none"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Mobile Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Mobile Filter Button */}
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="btn btn-outline border-slate-200 text-slate-600 lg:hidden flex items-center gap-1 rounded-xl btn-sm px-4"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select 
                  value={sort} 
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="select select-ghost bg-transparent focus:outline-none select-xs text-xs font-semibold text-slate-600 cursor-pointer pr-6 p-0 border-none"
                >
                  <option value="newest">Newest</option>
                  <option value="rating-high">Highest Rated</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Metadata */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
            <span>Showing {isLoading ? '...' : totalCount} Courses</span>
            {searchQuery && <span>Search: "{searchQuery}"</span>}
          </div>

          {/* Grid listing */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((id) => <SkeletonCard key={id} />)}
            </div>
          ) : isError ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-red-500 font-bold">Failed to load courses. Please try again.</p>
              <button onClick={() => refetch()} className="btn btn-primary btn-sm bg-indigo-600 border-none rounded-lg text-white">Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/50 p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Courses Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                We couldn't find any published courses matching your search or filters. Try adjusting your categories or price threshold.
              </p>
              <button onClick={resetFilters} className="btn btn-outline border-indigo-200 text-indigo-600 hover:bg-indigo-50 btn-sm rounded-lg font-bold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course: any) => (
                <Card key={course._id} className="flex flex-col justify-between h-full p-0">
                  {/* Image cover banner */}
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

                  {/* Info block */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {course.averageRating} ({course.reviewCount})</span>
                        <span className="capitalize">{course.format}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-2 leading-snug hover:text-indigo-600 transition-colors">
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="btn btn-outline border-slate-200 text-slate-600 hover:bg-slate-100 disabled:bg-transparent rounded-xl btn-sm px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm rounded-xl px-4 ${p === page ? 'btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white' : 'btn-outline border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              ))}

              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="btn btn-outline border-slate-200 text-slate-600 hover:bg-slate-100 disabled:bg-transparent rounded-xl btn-sm px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Drawer Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-xs lg:hidden flex justify-end">
          <div className="w-80 bg-white h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-600" /> Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="btn btn-ghost btn-circle btn-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-700 text-sm">Category</h4>
                <div className="flex flex-col gap-2.5">
                  {['All', 'Programming', 'Design', 'Business', 'Languages'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category-mobile"
                        checked={category === cat}
                        onChange={() => { setCategory(cat); setPage(1); }}
                        className="radio radio-primary radio-sm"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span>Max Price</span>
                  <span className="text-indigo-600">{maxPrice === 150 ? 'Any' : `$${maxPrice}`}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="150" 
                  step="10"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(parseInt(e.target.value, 10)); setPage(1); }}
                  className="range range-primary range-xs"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-700 text-sm">Rating Threshold</h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { label: 'All Ratings', value: '' },
                    { label: '4.5+ ★', value: '4.5' },
                    { label: '4.0+ ★', value: '4.0' },
                    { label: '3.5+ ★', value: '3.5' },
                  ].map((rat) => (
                    <label key={rat.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating-mobile"
                        checked={minRating === rat.value}
                        onChange={() => { setMinRating(rat.value); setPage(1); }}
                        className="radio radio-primary radio-sm"
                      />
                      <span className="flex items-center gap-1">{rat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-700 text-sm">Location</h4>
                <div className="flex flex-col gap-2.5">
                  {['All', 'Online', 'In-person'].map((loc) => (
                    <label key={loc} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="location-mobile"
                        checked={location === loc}
                        onChange={() => { setLocation(loc); setPage(1); }}
                        className="radio radio-primary radio-sm"
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button onClick={resetFilters} className="btn btn-outline border-slate-200 text-slate-500 flex-1 rounded-xl">Reset</button>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="btn btn-primary bg-indigo-600 border-none text-white flex-1 rounded-xl">Apply</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
