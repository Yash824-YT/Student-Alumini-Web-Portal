'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { usersAPI } from '@/lib/api';

export default function HomePage() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const res = await usersAPI.getAll({ limit: 20 });
      setAlumni(res.data.users);
    } catch (err) {
      console.error('Error fetching alumni:', err);
    }
  };

  // Auto-scroll the slider
  useEffect(() => {
    if (!sliderRef.current || alumni.length === 0) return;
    const slider = sliderRef.current;
    let scrollAmount = 0;
    const speed = 1;
    const interval = setInterval(() => {
      scrollAmount += speed;
      if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
        scrollAmount = 0;
      }
      slider.scrollLeft = scrollAmount;
    }, 30);
    return () => clearInterval(interval);
  }, [alumni]);

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const amount = 320;
    sliderRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-[0.03]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-indigo-600">Welcome to AlumniConnect</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-tight mb-6">
                Connect with Your
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Alumni Network
                </span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Discover alumni profiles, explore career opportunities, join exciting events, and build your professional resume — all in one platform.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link href="/alumni" className="btn-primary text-base !py-3.5 !px-8">
                    Explore Alumni →
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn-primary text-base !py-3.5 !px-8">
                      Get Started Free →
                    </Link>
                    <Link href="/login" className="btn-secondary text-base !py-3.5 !px-8">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-10 flex items-center gap-8">
                <Stat number="500+" label="Alumni" />
                <Stat number="120+" label="Jobs Posted" />
                <Stat number="50+" label="Events" />
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl gradient-bg opacity-20 absolute -top-4 -right-4" />
                <div className="w-80 h-80 rounded-3xl bg-white shadow-2xl border border-slate-100 p-8 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center animate-float">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Alumni Network</p>
                        <p className="text-sm text-slate-400">500+ connected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                        <span className="text-2xl">💼</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Job Listings</p>
                        <p className="text-sm text-slate-400">120+ opportunities</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                        <span className="text-2xl">📅</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Events</p>
                        <p className="text-sm text-slate-400">50+ upcoming</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                        <span className="text-2xl">📄</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Resume Builder</p>
                        <p className="text-sm text-slate-400">Create & Download</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Slider Section */}
      {alumni.length > 0 && (
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">Our Alumni</h2>
                <p className="text-lg text-slate-500">Meet the talented individuals from our network</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollSlider('left')}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => scrollSlider('right')}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Sliding Carousel */}
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-none"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseEnter={() => {
                if (sliderRef.current) sliderRef.current.dataset.paused = 'true';
              }}
              onMouseLeave={() => {
                if (sliderRef.current) sliderRef.current.dataset.paused = 'false';
              }}
            >
              {alumni.map((person) => {
                const gradientColors = [
                  'from-indigo-500 to-purple-600',
                  'from-emerald-500 to-teal-600',
                  'from-amber-500 to-orange-600',
                  'from-rose-500 to-pink-600',
                  'from-cyan-500 to-blue-600',
                  'from-violet-500 to-purple-600',
                ];
                const gradient = gradientColors[person.name?.charCodeAt(0) % gradientColors.length];
                
                return (
                  <div
                    key={person._id}
                    className="shrink-0 w-[280px] rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
                  >
                    {/* Gradient top bar */}
                    <div className={`h-20 bg-gradient-to-r ${gradient} relative`}>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg border-4 border-white`}>
                          <span className="text-white text-2xl font-bold">
                            {person.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="pt-12 pb-6 px-5 text-center">
                      <h3 className="text-lg font-bold text-slate-800 mb-1">{person.name}</h3>
                      
                      {person.currentPosition && (
                        <p className="text-sm text-indigo-600 font-medium mb-1">{person.currentPosition}</p>
                      )}
                      
                      {person.currentCompany && (
                        <p className="text-sm text-slate-500 mb-3">🏢 {person.currentCompany}</p>
                      )}

                      <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                        {person.graduationYear && (
                          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-semibold">
                            🎓 {person.graduationYear}
                          </span>
                        )}
                        {person.department && (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg truncate max-w-[120px]">
                            {person.department}
                          </span>
                        )}
                      </div>

                      {person.location && (
                        <p className="text-xs text-slate-400 mt-3">📍 {person.location}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Link */}
            <div className="text-center mt-8">
              <Link href="/alumni" className="btn-secondary text-sm">
                View All Alumni →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything You Need</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A comprehensive platform to stay connected with your alma mater and fellow alumni.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="👥"
              title="Alumni Profiles"
              desc="Browse and search alumni profiles. Filter by department, graduation year, and more."
              color="bg-indigo-50"
            />
            <FeatureCard
              icon="💼"
              title="Job Listings"
              desc="Discover career opportunities posted by fellow alumni and industry partners."
              color="bg-emerald-50"
            />
            <FeatureCard
              icon="📅"
              title="Events & Reunions"
              desc="Stay updated with upcoming events, workshops, and reunions. Register with one click."
              color="bg-amber-50"
            />
            <FeatureCard
              icon="📚"
              title="Notes & PYQs"
              desc="Access previous year questions, study materials, and notes shared by alumni."
              color="bg-teal-50"
            />
            <FeatureCard
              icon="📄"
              title="Resume Builder"
              desc="Create professional resumes with our easy-to-use builder and download instantly."
              color="bg-rose-50"
            />
            <FeatureCard
              icon="🤖"
              title="AI Chatbot"
              desc="Get instant assistance with our intelligent chatbot available 24/7 for your queries."
              color="bg-cyan-50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Connect?
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Join thousands of alumni who are already networking, finding opportunities, and staying connected.
          </p>
          {!user && (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl hover:bg-indigo-50 transition-all hover:translate-y-[-2px] shadow-lg text-lg">
                Create Account
              </Link>
              <Link href="/alumni" className="border-2 border-white/30 text-white font-semibold py-4 px-10 rounded-xl hover:bg-white/10 transition-all text-lg">
                Browse Alumni
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-white font-bold text-lg">AlumniConnect</span>
              </div>
              <p className="text-sm leading-relaxed">Your comprehensive alumni networking platform for building lasting professional connections.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/alumni" className="block hover:text-white transition-colors">Alumni Directory</Link>
                <Link href="/jobs" className="block hover:text-white transition-colors">Job Board</Link>
                <Link href="/events" className="block hover:text-white transition-colors">Events</Link>
                <Link href="/notes" className="block hover:text-white transition-colors">Notes & PYQs</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link href="/resume" className="block hover:text-white transition-colors">Resume Builder</Link>
                <a className="block hover:text-white transition-colors cursor-pointer">Help Center</a>
                <a className="block hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>📧 director@navsahyadri.edu.in</p>
                <p>📱 +91 7769927007/ +91 7769937007</p>
                <p>📍 Sr. No. 69,70 & 71, Naigaon (Nasrapur), Pune, Maharashtra, India.</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-sm">
            <p>© 2026 AlumniConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-indigo-600">{number}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="card group cursor-default">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
