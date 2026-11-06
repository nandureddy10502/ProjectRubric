import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Layers, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white shadow-xs group-hover:bg-zinc-800 transition-colors">
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            Project<span className="text-indigo-600 font-bold">Rubric</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
            v1.0
          </span>
        </Link>

        {/* User Status & Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-zinc-900 leading-tight">{user.name}</span>
                <span className="text-[10px] text-zinc-500 capitalize">{user.role}</span>
              </div>
            </div>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

