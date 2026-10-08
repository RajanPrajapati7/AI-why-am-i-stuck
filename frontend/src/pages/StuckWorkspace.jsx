import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StuckTypeBadge } from '../components/StuckTypeBadge';
import { DomainBadge } from '../components/DomainBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CodeBlock } from '../components/CodeBlock';
import { PostMortemModal } from '../components/PostMortemModal';
import { StillStuckModal } from '../components/StillStuckModal';
import { StuckScorePanel, StuckScoreBar } from '../components/StuckScoreGauge';
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Lightbulb,
  CheckSquare,
  Square,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const StuckWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Socratic question answers state
  const [answers, setAnswers] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  // Post-Mortem modal state
  const [showPostMortem, setShowPostMortem] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Re-diagnosis modal state ("Still Stuck")
  const [showStillStuck, setShowStillStuck] = useState(false);
  const [rediagnosing, setRediagnosing] = useState(false);

  // Problem summary toggle
  const [showProblemDetails, setShowProblemDetails] = useState(false);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/sessions/${id}`);
      if (data.success) {
        setSession(data.session);

        // Pre-populate answers if any exist
        const initialAnswers = {};
        (data.session.clarificationQuestions || []).forEach((q) => {
          initialAnswers[q.questionId] = q.userResponse || '';
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    setSubmittingAnswers(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, responseText]) => ({
          questionId,
          responseText: responseText || 'No response provided',
        })),
      };

      const { data } = await api.post(`/sessions/${id}/answers`, payload);
      if (data.success) {
        setSession(data.session);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating action plan');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const handleToggleAction = async (index, currentState) => {
    try {
      // Optimistic update
      const updated = { ...session };
      updated.solution.actionItems[index].completed = !currentState;
      setSession(updated);

      const { data } = await api.patch(`/sessions/${id}/actions/${index}`, {
        completed: !currentState,
      });
      if (data.success) {
        setSession(data.session);
      }
    } catch (err) {
      console.error('Failed to toggle action item', err);
      fetchSession(); // Rollback on error
    }
  };

  const handleResolveSession = async (postMortemData) => {
    setResolving(true);
    try {
      const { data } = await api.post(`/sessions/${id}/resolve`, postMortemData);
      if (data.success) {
        setSession(data.session);
        setShowPostMortem(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve session');
    } finally {
      setResolving(false);
    }
  };

  const handleRediagnose = async (newObservationData) => {
    setRediagnosing(true);
    try {
      const { data } = await api.post(`/sessions/${id}/rediagnose`, newObservationData);
      if (data.success && data.session) {
        setSession(data.session);
        setShowStillStuck(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to re-diagnose session');
    } finally {
      setRediagnosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Compass className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-400 text-sm font-mono">
          Assembling cognitive workspace state...
        </p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
        <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Workspace Session Error</h2>
        <p className="text-sm text-slate-400 mt-1">{error || 'Session not found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isResolved = session.status === 'RESOLVED';
  const hasPlan = Boolean(session.solution?.actionItems?.length);
  const completedActionsCount =
    session.solution?.actionItems?.filter((a) => a.completed)?.length || 0;
  const totalActionsCount = session.solution?.actionItems?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Session Topbar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={session.status} />
              <DomainBadge domain={session.domain} />
              <StuckTypeBadge type={session.diagnosis?.stuckType} size="sm" />
              {session.diagnosis?.confidenceScore && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                  Confidence: {Math.round(session.diagnosis.confidenceScore * 100)}%
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {session.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isResolved && (
              <div className="flex items-center gap-2">
                {hasPlan && (
                  <button
                    onClick={() => setShowStillStuck(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all hover:-translate-y-0.5"
                    title="Re-evaluate hypothesis with new observations"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">I’m Still Stuck</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPostMortem(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowProblemDetails(!showProblemDetails)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              <span>Original Problem</span>
              {showProblemDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Original Problem Details */}
        {showProblemDetails && (
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fadeIn">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Goal (What Trying To Do):
              </span>
              <p className="text-slate-200">{session.problemStatement?.whatTryingToDo}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Actual Behavior / Blocker:
              </span>
              <p className="text-rose-300">{session.problemStatement?.whatHappeningInstead}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 md:col-span-2">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Already Tried (Ruled Out):
              </span>
              <p className="text-slate-300">{session.problemStatement?.whatAlreadyTried}</p>
            </div>

            {session.problemStatement?.codeSnippetOrLogs && (
              <div className="md:col-span-2">
                <CodeBlock
                  code={session.problemStatement.codeSnippetOrLogs}
                  label="Submitted Snippet / Logs"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* If Resolved: Celebratory Post-Mortem Card */}
      {isResolved && (
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-grow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Problem Successfully Resolved!
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Unstuck in {session.resolution?.timeToUnstuckMinutes || 10} minutes</span>
                  </span>
                  {session.resolution?.userHelpfulnessRating && (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(session.resolution.userHelpfulnessRating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs text-slate-200">
                <span className="font-semibold text-emerald-400 block mb-1 uppercase tracking-wider">
                  What Actually Fixed It:
                </span>
                <p className="leading-relaxed">{session.resolution?.whatActuallyFixedIt}</p>
              </div>

              {session.resolution?.reflectionNotes && (
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">
                    Personal Takeaway:
                  </span>
                  <p>{session.resolution.reflectionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 1: Cognitive Diagnosis Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider font-semibold">
                Cognitive Stage 1
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Root Cause & Misconception Diagnosis
              </h2>
            </div>
          </div>

          {session.revisions && session.revisions.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold self-start sm:self-auto">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Revised Hypothesis (Iteration {session.revisions.length + 1})</span>
            </span>
          )}
        </div>

        {/* Feature 1: StuckScore Gauge rendering */}
        <StuckScorePanel
          score={session.diagnosis?.stuckScore}
          severityLevel={session.diagnosis?.severityLevel}
        />

        {/* Re-evaluation rationale if this is a revised diagnosis */}
        {session.revisions &&
          session.revisions.length > 0 &&
          session.revisions[session.revisions.length - 1]?.reEvaluationRationale && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
              <span className="font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Why the Hypothesis Was Re-evaluated:</span>
              </span>
              <p className="text-slate-200 leading-relaxed">
                {session.revisions[session.revisions.length - 1].reEvaluationRationale}
              </p>
            </div>
          )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Why You Are Stuck:
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {session.diagnosis?.whyYouAreStuck || 'Analyzing cognitive failure mode...'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 block mb-2">
              Implicit Misconception:
            </span>
            <p className="text-sm text-purple-100 leading-relaxed">
              {session.diagnosis?.keyMisconception || 'Isolating root assumption...'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300">Root Cause Summary: </span>
            <span>{session.diagnosis?.rootCauseSummary}</span>
          </div>
        </div>
      </div>

      {/* STAGE 2: Targeted Socratic Clarification Questions */}
      {session.clarificationQuestions && session.clarificationQuestions.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Cognitive Stage 2
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Socratic Assumption Probing
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Before generating code solutions, answering these targeted questions clarifies the exact runtime invariant.
          </p>

          <form onSubmit={handleSubmitAnswers} className="space-y-6">
            {session.clarificationQuestions.map((q, idx) => {
              const currentAnswer = answers[q.questionId] || '';
              return (
                <div
                  key={q.questionId || idx}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 italic">
                      Purpose: {q.purpose}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white">
                    {q.questionText}
                  </h3>

                  {/* Suggested Quick Options */}
                  {q.suggestedOptions && q.suggestedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.suggestedOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          disabled={isResolved}
                          onClick={() => handleSelectOption(q.questionId, opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            currentAnswer === opt
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Free-text response input */}
                  <textarea
                    rows={2}
                    disabled={isResolved}
                    placeholder="Or type your specific response..."
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );
            })}

            {!isResolved && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAnswers}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 disabled:opacity-50 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {submittingAnswers
                      ? 'Synthesizing Solution Plan...'
                      : hasPlan
                      ? 'Re-evaluate & Update Action Plan'
                      : 'Generate Personalized Action Plan'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* STAGE 3: Mental Model & Interactive Action Plan */}
      {hasPlan && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  Cognitive Stage 3
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Personalized Mental Model & Action Plan
                </h2>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Checklist: <span className="text-brand-400 font-bold">{completedActionsCount}</span> / {totalActionsCount} Done
            </div>
          </div>

          {/* Mental Model Illuminator */}
          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <BrainCircuit className="w-4 h-4" />
              <span>The Correct Mental Model</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {session.solution?.mentalModelExplanation}
            </p>
          </div>

          {/* Correct Approach Overview */}
          {session.solution?.correctApproachOverview && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-brand-400 uppercase tracking-wider block mb-1">
                Strategic Approach Overview:
              </span>
              <p className="leading-relaxed">{session.solution.correctApproachOverview}</p>
            </div>
          )}

          {/* Step-by-Step Action Items Checklist */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-400" />
              <span>Step-by-Step Resolution Checklist</span>
            </h3>

            <div className="space-y-3">
              {session.solution?.actionItems?.map((item, idx) => {
                const isItemDone = item.completed;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isItemDone
                        ? 'bg-slate-950/80 border-emerald-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleAction(idx, isItemDone)}
                        className={`mt-0.5 p-1 rounded-lg transition-colors ${
                          isItemDone
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 hover:text-brand-400'
                        }`}
                      >
                        {isItemDone ? (
                          <CheckSquare className="w-5 h-5 fill-emerald-500/20" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">Step {idx + 1}.</span>
                          <span
                            className={`text-sm font-semibold ${
                              isItemDone ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {item.task}
                          </span>
                        </div>

                        {item.rationale && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {item.rationale}
                          </p>
                        )}

                        {item.codeSnippet && (
                          <CodeBlock code={item.codeSnippet} label={`Step ${idx + 1} Code Example`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Test */}
          {session.solution?.verificationTest && (
            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Test (Prove You Are Unstuck)</span>
              </div>
              <p className="text-xs font-mono text-cyan-100 leading-relaxed">
                {session.solution.verificationTest}
              </p>
            </div>
          )}

          {/* Anti-Patterns to Avoid */}
          {session.solution?.antiPatternsToAvoid && session.solution.antiPatternsToAvoid.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block">
                Anti-Patterns to Avoid:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {session.solution.antiPatternsToAvoid.map((ap, i) => (
                  <li key={i}>{ap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Plan Outcome Controls: Still Stuck vs Mark Resolved */}
          {!isResolved && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Did this action plan resolve your blocker?</h4>
                <p className="text-xs text-slate-400">
                  If the verification test passed, record your resolution. If you're still stuck, re-evaluate with your new observations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowStillStuck(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>I’m Still Stuck</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPostMortem(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post-Mortem Modal */}
      <PostMortemModal
        isOpen={showPostMortem}
        onClose={() => setShowPostMortem(false)}
        onResolve={handleResolveSession}
        isSubmitting={resolving}
      />

      {/* Still Stuck Re-Diagnosis Modal */}
      <StillStuckModal
        isOpen={showStillStuck}
        onClose={() => setShowStillStuck(false)}
        onRediagnose={handleRediagnose}
        isSubmitting={rediagnosing}
      />
    </div>
  );
};
