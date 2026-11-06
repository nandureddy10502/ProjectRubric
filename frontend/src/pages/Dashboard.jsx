import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TeacherDashboard from './TeacherDashboard';
import {
  FolderGit2,
  Calendar,
  ChevronRight,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  Send,
  Github,
  ExternalLink,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  // If the authenticated user is a teacher, dynamically render the Teacher Dashboard
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Strictly calls student-isolated endpoint
        const res = await api.get('/evaluations/my-projects');
        setEvaluations(res.data.data || []);
      } catch (err) {
        console.error('Error fetching student evaluations:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Compute summary stats
  const totalProjects = evaluations.length;
  const gradedProjects = evaluations.filter((e) => e.status === 'Graded');
  const pendingProjects = evaluations.filter((e) => e.status === 'Pending');

  const averageScore = gradedProjects.length > 0
    ? Math.round(
        gradedProjects.reduce((sum, e) => {
          const rubricTotal = e.rubricId?.criteria?.reduce((acc, c) => acc + (c.maxPoints || 0), 0) || 100;
          return sum + (e.totalScore / rubricTotal) * 100;
        }, 0) / gradedProjects.length
      )
    : 0;

  const highestScore = gradedProjects.length > 0
    ? Math.max(...gradedProjects.map((e) => e.totalScore || 0))
    : 0;

  // Grade helper
  const getGradeBadge = (score) => {
    if (score >= 90) return { label: 'Grade A', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 80) return { label: 'Grade B', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (score >= 70) return { label: 'Grade C', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Grade D', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 pb-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Student Workspace</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Review your transparent project grading rubrics, criteria scores, and instructor feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Submit Project Button */}
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Project</span>
            </Link>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Total Submissions</span>
              <FolderGit2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{totalProjects}</div>
            <div className="mt-1 text-[11px] text-zinc-400">Isolated to your account</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Awaiting Grade</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{pendingProjects.length}</div>
            <div className="mt-1 text-[11px] text-zinc-400">In instructor review queue</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Average Grade</span>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {gradedProjects.length > 0 ? `${averageScore}%` : '—'}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">Mean rubric achievement</div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Highest Score</span>
              <Award className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {gradedProjects.length > 0 ? `${highestScore} pts` : '—'}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">Peak performance mark</div>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Projects Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">
              My Project Submissions
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {evaluations.length} {evaluations.length === 1 ? 'project' : 'projects'} found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 animate-pulse">
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-1/2" />
                  <div className="h-8 bg-zinc-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : evaluations.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">No project submissions yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You haven't submitted any projects yet. Click "Submit Project" above to submit an assignment for evaluation.
              </p>
              <div className="pt-2">
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Your First Project</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluations.map((project) => {
                const isPending = project.status === 'Pending';
                const grade = getGradeBadge(project.totalScore);
                const rubricTotal = project.rubricId?.criteria?.reduce(
                  (acc, c) => acc + (c.maxPoints || 0),
                  0
                ) || 100;

                return (
                  <div
                    key={project._id}
                    className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Top: Rubric Tag & Status/Grade Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 truncate max-w-[200px]">
                          {project.rubricId?.title || 'Course Rubric'}
                        </span>

                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Awaiting Grade</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${grade.color}`}>
                            {grade.label}
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className={`text-base font-semibold tracking-tight transition-colors ${
                        isPending ? 'text-zinc-900' : 'text-zinc-900 group-hover:text-indigo-600'
                      }`}>
                        {project.projectName}
                      </h3>

                      {project.projectDescription && (
                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2">
                          {project.projectDescription}
                        </p>
                      )}

                      {/* Score Highlight Typography */}
                      <div className="mt-4 pt-4 border-t border-zinc-100 flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-zinc-500 block font-medium">Evaluation Score</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            {isPending ? (
                              <span className="text-lg font-semibold text-zinc-400 italic">
                                Pending
                              </span>
                            ) : (
                              <>
                                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                                  {project.totalScore}
                                </span>
                                <span className="text-xs text-zinc-400 font-mono">
                                  / {rubricTotal} pts
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-zinc-500 block font-medium">Status</span>
                          {isPending ? (
                            <span className="text-xs font-medium text-amber-600 font-mono">
                              In Queue
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-zinc-900 font-mono">
                              {Math.round((project.totalScore / rubricTotal) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual Criteria Bar / Pending Notification */}
                      <div className="mt-4">
                        {isPending ? (
                          <div className="bg-amber-50/70 border border-amber-200/60 rounded p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Submitted for faculty grading. Rubric breakdown will be available once published.</span>
                          </div>
                        ) : (
                          <>
                            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-zinc-100">
                              {project.scores?.map((item, idx) => {
                                const pct = (item.pointsAwarded / (rubricTotal || 100)) * 100;
                                const colors = ['bg-indigo-600', 'bg-zinc-700', 'bg-indigo-400', 'bg-zinc-500', 'bg-indigo-300'];
                                return (
                                  <div
                                    key={idx}
                                    style={{ width: `${pct}%` }}
                                    className={`h-full ${colors[idx % colors.length]}`}
                                    title={`${item.criterionName}: ${item.pointsAwarded} pts`}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                              <span>{project.scores?.length || 0} evaluated criteria</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.submittedAt || project.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Link: Disabled if Pending */}
                    <div className="mt-5 pt-4 border-t border-zinc-100">
                      {isPending ? (
                        <div className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 bg-zinc-50/60 rounded-md border border-zinc-200/70 cursor-not-allowed select-none">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Awaiting Faculty Grade</span>
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">Pending</span>
                        </div>
                      ) : (
                        <Link
                          to={`/evaluations/${project._id}`}
                          className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-900 rounded-md border border-zinc-200 transition-colors"
                        >
                          <span>Inspect Rubric Breakdown</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
