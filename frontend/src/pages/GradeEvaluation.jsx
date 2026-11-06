import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Award,
  Sparkles,
  FileText,
  User,
  Calendar,
  Save,
} from 'lucide-react';

export const GradeEvaluation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [scoresState, setScoresState] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/evaluations/${id}`);
        const data = res.data.data;
        setEvaluation(data);

        // Pre-populate scores state from existing scores or rubric criteria
        const criteria = data.rubricId?.criteria || [];
        const initialScores = {};

        criteria.forEach((criterion) => {
          const existingScore = data.scores?.find(
            (s) => s.criterionName.toLowerCase() === criterion.name.toLowerCase()
          );

          initialScores[criterion.name] = {
            pointsAwarded: existingScore ? existingScore.pointsAwarded : 0,
            feedback: existingScore ? existingScore.feedback : '',
            maxPoints: criterion.maxPoints,
          };
        });

        setScoresState(initialScores);
      } catch (err) {
        console.error('Failed to load evaluation for grading:', err);
        setError(err.response?.data?.message || 'Failed to load evaluation.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  const handlePointsChange = (criterionName, maxPoints, rawValue) => {
    let num = Number(rawValue);
    if (isNaN(num)) num = 0;
    // Clamp points between 0 and maxPoints
    if (num < 0) num = 0;
    if (num > maxPoints) num = maxPoints;

    setScoresState((prev) => ({
      ...prev,
      [criterionName]: {
        ...prev[criterionName],
        pointsAwarded: num,
      },
    }));
  };

  const handleFeedbackChange = (criterionName, feedback) => {
    setScoresState((prev) => ({
      ...prev,
      [criterionName]: {
        ...prev[criterionName],
        feedback,
      },
    }));
  };

  // Quick preset helper
  const applyPresetPercentage = (criterionName, maxPoints, percentage) => {
    const awarded = Math.round((maxPoints * percentage) / 100);
    handlePointsChange(criterionName, maxPoints, awarded);
  };

  // Calculate live total score
  const rubricCriteria = evaluation?.rubricId?.criteria || [];
  const totalMaxPoints = rubricCriteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0) || 100;
  
  const currentTotalScore = Object.values(scoresState).reduce(
    (sum, item) => sum + (Number(item?.pointsAwarded) || 0),
    0
  );

  const percentageScore = totalMaxPoints > 0 ? Math.round((currentTotalScore / totalMaxPoints) * 100) : 0;

  const handlePublishGrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Prepare scores array
    const scoresPayload = rubricCriteria.map((criterion) => {
      const stateItem = scoresState[criterion.name] || {};
      return {
        criterionName: criterion.name,
        pointsAwarded: Number(stateItem.pointsAwarded) || 0,
        feedback: stateItem.feedback || '',
      };
    });

    try {
      setSubmitting(true);
      await api.put(`/evaluations/${id}/grade`, {
        scores: scoresPayload,
      });

      setSuccessMsg('Grade successfully published! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 900);
    } catch (err) {
      console.error('Failed to publish grade:', err);
      setError(err.response?.data?.message || 'Failed to publish grade. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
          <div className="h-4 bg-zinc-200 rounded w-32 animate-pulse" />
          <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-zinc-200 rounded w-1/3" />
            <div className="h-4 bg-zinc-100 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <Navbar />
        <main className="max-w-md w-full mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-900">Submission Error</h2>
          <p className="text-xs text-zinc-600">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  const rubric = evaluation.rubricId || {};

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 pb-28">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Submissions</span>
          </Link>
        </div>

        {/* Top Header Card: Student & Project Details */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                  <FileText className="w-3 h-3 text-zinc-500" />
                  {rubric.title}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    evaluation.status === 'Graded'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {evaluation.status === 'Graded' ? 'Previously Graded' : 'Pending Evaluation'}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {evaluation.projectName}
              </h1>

              {evaluation.projectDescription && (
                <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed pt-1">
                  {evaluation.projectDescription}
                </p>
              )}
            </div>

            {/* Clickable Repository Badge */}
            {evaluation.repositoryUrl ? (
              <a
                href={evaluation.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-800 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors shrink-0 shadow-2xs"
              >
                <Github className="w-4 h-4 text-zinc-700" />
                <span>Open Repository</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            ) : (
              <span className="text-xs text-zinc-400 italic">No repository provided</span>
            )}
          </div>

          {/* Student Meta Strip */}
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Student: <strong className="text-zinc-800 font-medium">{evaluation.studentId?.name}</strong></span>
              <span className="text-zinc-400 font-mono">({evaluation.studentId?.email})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Submitted on {new Date(evaluation.submittedAt || evaluation.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Grading Section: Map over rubric.criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Rubric Criteria Evaluation
              </h2>
              <p className="text-xs text-zinc-500">
                Award points and supply constructive feedback for each criterion.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {rubricCriteria.length} criteria total
            </span>
          </div>

          <form id="grading-form" onSubmit={handlePublishGrade} className="space-y-4">
            {rubricCriteria.map((criterion, idx) => {
              const currentItem = scoresState[criterion.name] || { pointsAwarded: 0, feedback: '' };
              const awarded = Number(currentItem.pointsAwarded) || 0;
              const max = criterion.maxPoints;
              const pct = max > 0 ? Math.round((awarded / max) * 100) : 0;

              return (
                <div
                  key={criterion.name || idx}
                  className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-4 transition-all hover:border-zinc-300"
                >
                  {/* Criterion Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-zinc-400">
                          #{idx + 1}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {criterion.name}
                        </h3>
                      </div>
                      {criterion.description && (
                        <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">
                          {criterion.description}
                        </p>
                      )}
                    </div>

                    {/* Max Points Pill */}
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-md">
                        Max Points: {max}
                      </span>
                    </div>
                  </div>

                  {/* Points Input and Quick Preset Stepper */}
                  <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-zinc-700" htmlFor={`points-${idx}`}>
                        Points Awarded:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`points-${idx}`}
                          type="number"
                          min={0}
                          max={max}
                          step={1}
                          required
                          value={currentItem.pointsAwarded}
                          onChange={(e) => handlePointsChange(criterion.name, max, e.target.value)}
                          className="w-20 px-2.5 py-1.5 text-sm font-mono font-semibold text-zinc-900 bg-white border border-zinc-200 rounded-md text-center focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                        />
                        <span className="text-xs font-mono text-zinc-400">/ {max} pts</span>
                        <span className="text-xs font-mono font-semibold text-indigo-600 ml-1">
                          ({pct}%)
                        </span>
                      </div>
                    </div>

                    {/* Quick Percentage Presets */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-zinc-400 mr-1 text-[10px] uppercase font-medium">Quick:</span>
                      <button
                        type="button"
                        onClick={() => applyPresetPercentage(criterion.name, max, 100)}
                        className="px-2 py-0.5 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetPercentage(criterion.name, max, 85)}
                        className="px-2 py-0.5 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        85%
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetPercentage(criterion.name, max, 70)}
                        className="px-2 py-0.5 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        70%
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetPercentage(criterion.name, max, 50)}
                        className="px-2 py-0.5 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        50%
                      </button>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1" htmlFor={`feedback-${idx}`}>
                      Criterion-Specific Feedback & Commentary:
                    </label>
                    <textarea
                      id={`feedback-${idx}`}
                      rows={2}
                      value={currentItem.feedback}
                      onChange={(e) => handleFeedbackChange(criterion.name, e.target.value)}
                      placeholder={`Constructive notes on how the student performed in ${criterion.name}...`}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </form>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-zinc-200 shadow-lg py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Live Score Counter */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                Real-Time Total
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-zinc-900">
                  {currentTotalScore}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  / {totalMaxPoints} pts
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 ml-1">
                  ({percentageScore}%)
                </span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-24 sm:w-36 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 hidden sm:block">
              <div
                style={{ width: `${Math.min(100, percentageScore)}%` }}
                className="h-full bg-indigo-600 transition-all duration-150"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="grading-form"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Grade...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Grade</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeEvaluation;

