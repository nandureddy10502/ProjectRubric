import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import {
  ArrowLeft,
  FolderGit2,
  FileText,
  Github,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  Sparkles,
} from 'lucide-react';

export const SubmitProject = () => {
  const navigate = useNavigate();

  const [rubrics, setRubrics] = useState([]);
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');

  const [loadingRubrics, setLoadingRubrics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch available rubrics for the student to select
  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        setLoadingRubrics(true);
        const res = await api.get('/rubrics');
        const list = res.data.data || [];
        setRubrics(list);
        if (list.length > 0) {
          setSelectedRubricId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load rubrics:', err);
        setError('Failed to load grading rubrics. Please refresh.');
      } finally {
        setLoadingRubrics(false);
      }
    };

    fetchRubrics();
  }, []);

  const selectedRubric = rubrics.find((r) => r._id === selectedRubricId);
  const totalMaxPoints = selectedRubric?.criteria?.reduce((sum, c) => sum + (c.maxPoints || 0), 0) || 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRubricId) {
      setError('Please select a grading rubric.');
      return;
    }
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/evaluations/submit', {
        rubricId: selectedRubricId,
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim(),
        repositoryUrl: repositoryUrl.trim(),
      });

      // Redirect back to student dashboard
      navigate('/');
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 pb-16">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1 border-b border-zinc-200/80 pb-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 mb-1">
            <Send className="w-3 h-3 text-indigo-600" />
            <span>Student Submission Workflow</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Submit Project for Evaluation
          </h1>
          <p className="text-xs text-zinc-500">
            Select the applicable rubric and submit your project details. Your instructor will grade your project against this exact rubric.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Submission Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-5">
            {/* Rubric Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5" htmlFor="rubric">
                Assignment Rubric <span className="text-red-500">*</span>
              </label>
              {loadingRubrics ? (
                <div className="h-10 bg-zinc-100 rounded-md animate-pulse border border-zinc-200" />
              ) : (
                <select
                  id="rubric"
                  value={selectedRubricId}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  required
                >
                  {rubrics.map((rubric) => (
                    <option key={rubric._id} value={rubric._id}>
                      {rubric.title} ({rubric.criteria?.length || 0} criteria — {rubric.criteria?.reduce((sum, c) => sum + (c.maxPoints || 0), 0) || 100} pts total)
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-zinc-500 mt-1">
                Choose the standard course rubric matching your current milestone or capstone project.
              </p>
            </div>

            {/* Rubric Criteria Preview */}
            {selectedRubric && (
              <div className="bg-zinc-50/70 border border-zinc-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Grading Criteria Breakdown ({totalMaxPoints} Total Points)</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {selectedRubric.criteria?.length} evaluated criteria
                  </span>
                </div>

                {selectedRubric.description && (
                  <p className="text-[11px] text-zinc-500 border-b border-zinc-200/60 pb-2">
                    {selectedRubric.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedRubric.criteria?.map((criterion, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-zinc-200/90 rounded p-2 text-xs flex flex-col justify-between"
                    >
                      <div className="font-medium text-zinc-900">{criterion.name}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {criterion.description || 'Standard evaluation criterion'}
                      </div>
                      <div className="mt-1.5 text-right font-mono text-[10px] font-semibold text-indigo-600">
                        Max {criterion.maxPoints} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5" htmlFor="projectName">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                id="projectName"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. KacheKV - Distributed In-Memory Cache"
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5" htmlFor="projectDescription">
                Project Abstract / Description
              </label>
              <textarea
                id="projectDescription"
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Provide a brief summary of your architecture, technical decisions, and implemented features..."
                className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            {/* Repository URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5" htmlFor="repositoryUrl">
                GitHub / Repository URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  id="repositoryUrl"
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Your instructor will access this repository during code and architecture grading.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Project for Evaluation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SubmitProject;

