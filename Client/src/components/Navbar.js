'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AlumniConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/alumni">Alumni</NavLink>
            <NavLink href="/jobs">Jobs</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/notes">Notes</NavLink>
            {user && <NavLink href="/resume">Resume</NavLink>}
            {user && <NavLink href="/profile">My Profile</NavLink>}
            {user?.role === 'admin' && <NavLink href="/admin">Admin</NavLink>}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center overflow-hidden">
                    {user.profilePic
                      ? <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-white text-sm font-semibold">{user.name?.charAt(0)?.toUpperCase()}</span>
                    }
                  </div>
                  <Link href="/profile" className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">{user.name}</Link>
                </div>
                <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2 !px-5">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 fade-in">
            <div className="flex flex-col gap-1">
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/alumni" onClick={() => setMobileOpen(false)}>Alumni</MobileNavLink>
              <MobileNavLink href="/jobs" onClick={() => setMobileOpen(false)}>Jobs</MobileNavLink>
              <MobileNavLink href="/events" onClick={() => setMobileOpen(false)}>Events</MobileNavLink>
              <MobileNavLink href="/notes" onClick={() => setMobileOpen(false)}>Notes</MobileNavLink>
              {user && <MobileNavLink href="/resume" onClick={() => setMobileOpen(false)}>Resume</MobileNavLink>}
              {user && <MobileNavLink href="/profile" onClick={() => setMobileOpen(false)}>My Profile</MobileNavLink>}
              {user?.role === 'admin' && <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin</MobileNavLink>}
              <div className="pt-3 mt-2 border-t border-slate-200">
                {user ? (
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50">
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg">Login</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="text-center btn-primary text-sm !py-2">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }) {
  return (
    <Link href={href} onClick={onClick} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
      {children}
    </Link>
  );
}
