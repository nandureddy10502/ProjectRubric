import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import CriterionProgressBar from '../components/CriterionProgressBar';
import EvaluationChart from '../components/EvaluationChart';
import {
  ArrowLeft,
  Calendar,
  UserCheck,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Award,
} from 'lucide-react';

export const EvaluationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/evaluations/${id}`);
        setEvaluation(res.data.data);
      } catch (err) {
        console.error('Failed to load evaluation details:', err);
        setError({
          status: err.response?.status || 500,
          message:
            err.response?.data?.message ||
            'Unable to retrieve evaluation details. You might not have permission to view this project.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="h-4 bg-zinc-200 rounded w-28 animate-pulse" />
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-zinc-200 rounded w-1/3" />
            <div className="h-4 bg-zinc-100 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  // Error / Access Denied State (Strict isolation notice)
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="max-w-xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">
            {error.status === 403 ? 'Access Restricted' : 'Evaluation Unavailable'}
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-md mx-auto">
            {error.message}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Projects</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!evaluation) return null;

  const rubric = evaluation.rubricId || {};
  const criteriaList = rubric.criteria || [];
  const rubricTotalMax = criteriaList.reduce((acc, c) => acc + (c.maxPoints || 0), 0) || 100;
  const percentageScore = Math.round((evaluation.totalScore / rubricTotalMax) * 100);

  // Helper for performance pill
  const getScoreBadge = (pct) => {
    if (pct >= 90) return { label: 'Grade A — Exemplary', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 80) return { label: 'Grade B — Proficient', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (pct >= 70) return { label: 'Grade C — Satisfactory', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Grade D — Needs Revision', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const badge = getScoreBadge(percentageScore);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 pb-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Project Header & Total Score Banner */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Project Details */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  <FileText className="w-3 h-3 text-zinc-500" />
                  {rubric.title || 'Course Rubric'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {evaluation.projectName}
              </h1>

              {evaluation.projectDescription && (
                <p className="text-xs text-zinc-600 max-w-3xl leading-relaxed">
                  {evaluation.projectDescription}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                {evaluation.evaluatedBy && (
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Evaluator: <strong className="text-zinc-700 font-medium">{evaluation.evaluatedBy.name}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Evaluated on{' '}
                    {new Date(evaluation.submittedAt || evaluation.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {evaluation.repositoryUrl && (
                  <a
                    href={evaluation.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <span>Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Right: Clean Score Block */}
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-lg p-5 flex flex-col justify-center min-w-[220px] text-center lg:text-right">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Overall Total Grade
              </span>
              <div className="mt-1 flex items-baseline justify-center lg:justify-end gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                  {evaluation.totalScore}
                </span>
                <span className="text-sm font-semibold text-zinc-400 font-mono">
                  / {rubricTotalMax} pts
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-indigo-600">
                {percentageScore}% Rubric Achievement
              </div>
            </div>
          </div>
        </div>

        {/* Visual Breakdown 1: Horizontal Progress Bar (Flex-width breakdown) */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Criterion Contribution Breakdown
              </h2>
              <p className="text-xs text-zinc-500">
                Proportional visual segment representing each criterion's contribution to your final score
              </p>
            </div>
          </div>

          <div className="pt-3">
            <CriterionProgressBar
              scores={evaluation.scores}
              totalScore={evaluation.totalScore}
              totalMaxPoints={rubricTotalMax}
            />
          </div>
        </div>

        {/* Visual Breakdown 2: Performance Analytics with Recharts */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs">
          <EvaluationChart
            scores={evaluation.scores}
            rubricCriteria={criteriaList}
          />
        </div>

        {/* Breakdown Table: Differentiating Feature */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Comprehensive Rubric & Feedback Matrix
              </h2>
              <p className="text-xs text-zinc-500">
                Criterion definitions, max points, awarded marks, and specific instructor commentary
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {evaluation.scores.length} criteria assessed
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th scope="col" className="py-3 px-4 sm:px-6 w-1/3">
                    Criterion & Expectation
                  </th>
                  <th scope="col" className="py-3 px-4 text-center w-28">
                    Max Points
                  </th>
                  <th scope="col" className="py-3 px-4 text-center w-28">
                    Points Awarded
                  </th>
                  <th scope="col" className="py-3 px-4 w-32 text-center">
                    Score Ratio
                  </th>
                  <th scope="col" className="py-3 px-4 sm:px-6">
                    Instructor Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-xs">
                {evaluation.scores.map((scoreItem, idx) => {
                  const criterionDef = criteriaList.find(
                    (c) => c.name.toLowerCase() === scoreItem.criterionName.toLowerCase()
                  );
                  const maxPoints = criterionDef ? criterionDef.maxPoints : scoreItem.pointsAwarded;
                  const ratio = maxPoints > 0 ? (scoreItem.pointsAwarded / maxPoints) * 100 : 100;

                  return (
                    <tr
                      key={scoreItem.criterionName || idx}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      {/* Criterion Name & Description */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="font-semibold text-zinc-900">
                          {scoreItem.criterionName}
                        </div>
                        {criterionDef?.description && (
                          <div className="text-[11px] text-zinc-500 mt-1 leading-normal">
                            {criterionDef.description}
                          </div>
                        )}
                      </td>

                      {/* Max Points */}
                      <td className="py-4 px-4 align-top text-center font-mono text-zinc-500">
                        {maxPoints} pts
                      </td>

                      {/* Points Awarded */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                          {scoreItem.pointsAwarded} pts
                        </span>
                      </td>

                      {/* Ratio Bar */}
                      <td className="py-4 px-4 align-top text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono text-[11px] font-medium text-zinc-700">
                            {Math.round(ratio)}%
                          </span>
                          <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                            <div
                              style={{ width: `${Math.min(100, ratio)}%` }}
                              className={`h-full ${
                                ratio >= 90
                                  ? 'bg-emerald-500'
                                  : ratio >= 75
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Feedback */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        {scoreItem.feedback ? (
                          <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3 text-zinc-700 text-xs leading-relaxed flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                            <span>{scoreItem.feedback}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">No commentary provided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvaluationDetail;

