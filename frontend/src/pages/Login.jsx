import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials for reviewers/graders
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-zinc-50">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-lg bg-zinc-900 items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Sign in to ProjectRubric
          </h1>
          <p className="text-xs text-zinc-500">
            Transparent rubric tracking & criterion-level grading
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
          {sessionExpired && (
            <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your session expired. Please sign in again to continue.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5" htmlFor="email">
                Institutional Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Pill Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <span className="block text-[11px] font-medium text-zinc-500 mb-2">
              Quick Demo Fill (Instant Testing):
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('alex@example.com', 'password123')}
                className="px-2 py-1.5 text-left border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-zinc-900 text-[11px]">Alex</div>
                <div className="text-[10px] text-zinc-500 truncate">Student (2 Graded)</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('sarah@example.com', 'password123')}
                className="px-2 py-1.5 text-left border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-zinc-900 text-[11px]">Sarah</div>
                <div className="text-[10px] text-zinc-500 truncate">Student (1 Pending)</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teacher@example.com', 'password123')}
                className="px-2 py-1.5 text-left border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="font-medium text-zinc-900 text-[11px]">Dr. Evelyn</div>
                <div className="text-[10px] text-zinc-500 truncate">Teacher Portal</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-zinc-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

