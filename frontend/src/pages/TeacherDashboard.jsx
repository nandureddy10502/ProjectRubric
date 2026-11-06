import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  FolderGit2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  User,
  Calendar,
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'graded'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAllEvaluations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/evaluations/all');
        setEvaluations(res.data.data || []);
      } catch (err) {
        console.error('Error loading teacher evaluations:', err);
        setError(err.response?.data?.message || 'Failed to load student submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvaluations();
  }, []);

  // Compute metrics
  const totalSubmissions = evaluations.length;
  const pendingCount = evaluations.filter((e) => e.status === 'Pending').length;
  const gradedList = evaluations.filter((e) => e.status === 'Graded');
  const gradedCount = gradedList.length;

  const averageScore = gradedCount > 0
    ? Math.round(
        gradedList.reduce((acc, curr) => {
          const rubricTotal = curr.rubricId?.criteria?.reduce((sum, c) => sum + (c.maxPoints || 0), 0) || 100;
          return acc + (curr.totalScore / rubricTotal) * 100;
        }, 0) / gradedCount
      )
    : 0;

  // Filtered evaluations
  const filtered = evaluations
    .filter((item) => {
      if (filter === 'pending') return item.status === 'Pending';
      if (filter === 'graded') return item.status === 'Graded';
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = item.studentId?.name?.toLowerCase() || '';
      const studentEmail = item.studentId?.email?.toLowerCase() || '';
      const projectName = item.projectName?.toLowerCase() || '';
      const rubricTitle = item.rubricId?.title?.toLowerCase() || '';
      return (
        studentName.includes(q) ||
        studentEmail.includes(q) ||
        projectName.includes(q) ||
        rubricTitle.includes(q)
      );
    });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 pb-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Instructor Evaluation Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Instructor Dashboard
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Review and evaluate student project submissions against standardized grading rubrics.
            </p>
          </div>

          <div className="text-xs text-zinc-500">
            Faculty Access: <strong className="text-zinc-800 font-medium">{user?.name}</strong> ({user?.email})
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Total Submissions</span>
              <FolderGit2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{totalSubmissions}</div>
            <div className="mt-1 text-[11px] text-zinc-400">Enrolled student projects</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Awaiting Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="mt-1 text-[11px] text-zinc-400">Needs rubric evaluation</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Evaluated & Graded</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{gradedCount}</div>
            <div className="mt-1 text-[11px] text-zinc-400">Scores published to students</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Cohort Average</span>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {gradedCount > 0 ? `${averageScore}%` : '—'}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">Across graded submissions</div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-md border border-zinc-200 text-xs font-medium self-start">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded transition-colors ${
                filter === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All Submissions ({totalSubmissions})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Awaiting Grade</span>
              {pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter('graded')}
              className={`px-3 py-1.5 rounded transition-colors ${
                filter === 'graded'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Graded ({gradedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student, title, rubric..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-200 rounded w-1/4" />
              <div className="h-10 bg-zinc-100 rounded w-full" />
              <div className="h-10 bg-zinc-100 rounded w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FolderGit2 className="w-8 h-8 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-800">No submissions found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No project submissions matched your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th scope="col" className="py-3 px-4 sm:px-6">Student</th>
                    <th scope="col" className="py-3 px-4">Project & Repository</th>
                    <th scope="col" className="py-3 px-4">Rubric</th>
                    <th scope="col" className="py-3 px-4 text-center">Status</th>
                    <th scope="col" className="py-3 px-4 text-center">Score</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 text-xs">
                  {filtered.map((item) => {
                    const rubricTotal = item.rubricId?.criteria?.reduce(
                      (acc, c) => acc + (c.maxPoints || 0),
                      0
                    ) || 100;

                    return (
                      <tr key={item._id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Student Info */}
                        <td className="py-3.5 px-4 sm:px-6 align-middle">
                          <div className="font-semibold text-zinc-900">
                            {item.studentId?.name || 'Unknown Student'}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">
                            {item.studentId?.email || '—'}
                          </div>
                        </td>

                        {/* Project Info */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-medium text-zinc-900 max-w-xs truncate">
                            {item.projectName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                            <span>
                              {new Date(item.submittedAt || item.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            {item.repositoryUrl && (
                              <>
                                <span>•</span>
                                <a
                                  href={item.repositoryUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline"
                                >
                                  <span>Repo</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Rubric Title */}
                        <td className="py-3.5 px-4 align-middle text-zinc-600">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-zinc-100 border border-zinc-200/80 truncate max-w-[180px]">
                            {item.rubricId?.title || 'Course Rubric'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 align-middle text-center">
                          {item.status === 'Pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Graded</span>
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 align-middle text-center font-mono">
                          {item.status === 'Graded' ? (
                            <div>
                              <span className="font-bold text-zinc-900">{item.totalScore}</span>
                              <span className="text-[11px] text-zinc-400"> / {rubricTotal}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 sm:px-6 align-middle text-right">
                          {item.status === 'Pending' ? (
                            <Link
                              to={`/evaluations/${item._id}/grade`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors cursor-pointer"
                            >
                              <span>Grade Project</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={`/evaluations/${item._id}`}
                                className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                              >
                                View
                              </Link>
                              <Link
                                to={`/evaluations/${item._id}/grade`}
                                className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-md transition-colors"
                              >
                                Re-grade
                              </Link>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;

