import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-zinc-50 text-center space-y-4">
      <span className="font-mono text-4xl font-extrabold text-zinc-300">404</span>
      <h1 className="text-lg font-semibold text-zinc-900">Page Not Found</h1>
      <p className="text-xs text-zinc-500 max-w-sm">
        The page or rubric document you requested does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;

