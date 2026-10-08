import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  History,
  LogOut,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
              Why Am I Stuck?
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-brand-400 -mt-1 font-semibold">
              Cognitive Debugger
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-slate-800 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              to="/stuck/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-600/25 transition-all hover:shadow-brand-500/40 hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>I'm Stuck</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/analytics')
                  ? 'bg-slate-800 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Learning Patterns</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-slate-800 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-slate-800 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Profile"
              aria-label="Developer Profile"
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'bg-slate-800 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Settings"
              aria-label="Application Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Settings</span>
            </Link>

            <div className="h-5 w-px bg-slate-800 mx-1 sm:mx-2" />

            {/* User Profile Badge & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/profile"
                className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-300 font-mono bg-slate-900 hover:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-800 transition-colors"
                title="View your profile"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                title="Log Out"
                aria-label="Sign out of your account"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
