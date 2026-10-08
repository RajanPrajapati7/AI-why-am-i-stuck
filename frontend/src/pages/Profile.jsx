import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  Mail,
  Award,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

const COMMON_TECH_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'JavaScript',
  'Go',
  'Docker',
  'MongoDB',
  'PostgreSQL',
  'GraphQL',
  'Next.js',
  'Tailwind CSS',
];

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [techStack, setTechStack] = useState([]);
  const [newTechInput, setNewTechInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Hydrate form from active user state
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setExperienceLevel(user.experienceLevel || 'INTERMEDIATE');
      setTechStack(Array.isArray(user.primaryTechStack) ? [...user.primaryTechStack] : []);
    }
  }, [user]);

  const handleAddTech = (tech) => {
    const trimmed = (tech || newTechInput).trim();
    if (!trimmed) return;
    if (!techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
    }
    setNewTechInput('');
  };

  const handleRemoveTech = (indexToRemove) => {
    setTechStack((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownTech = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        experienceLevel,
        primaryTechStack: techStack,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setSuccessMessage('Your profile has been successfully updated.');
        // Auto-dismiss after 4 seconds
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'An error occurred while saving your profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title & Context Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Developer Profile
            </h1>
            <p className="text-sm text-slate-400">
              Manage your technical background and experience level to calibrate cognitive debugging prompts.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts */}
      <div aria-live="polite" className="space-y-3 mb-6">
        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Profile Form Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="user-full-name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="user-full-name"
                  name="fullName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm transition-all"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label
                htmlFor="user-email-display"
                className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2"
              >
                <span>Email Address</span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Lock className="w-3 h-3" /> Read-only
                </span>
              </label>
              <div className="relative">
                <input
                  id="user-email-display"
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed select-all"
                  aria-describedby="email-desc"
                />
              </div>
              <p id="email-desc" className="text-xs text-slate-500 mt-1.5">
                Email is tied to your cryptographic session credentials.
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Experience Level Selector */}
          <fieldset>
            <legend className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" />
              Engineering Experience Level
            </legend>
            <p className="text-xs text-slate-400 mb-4">
              Calibrates the depth of Socratic questioning, mental model analogies, and action plan explanations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'BEGINNER',
                  label: 'Beginner',
                  desc: 'Focus on language syntax, error interpretations, and foundational principles.',
                },
                {
                  id: 'INTERMEDIATE',
                  label: 'Intermediate',
                  desc: 'Full-stack problem solving, mental models, and architectural patterns.',
                },
                {
                  id: 'ADVANCED',
                  label: 'Advanced',
                  desc: 'Deep systems, race conditions, edge-case analysis, and scale diagnostics.',
                },
              ].map((tier) => {
                const isSelected = experienceLevel === tier.id;
                return (
                  <label
                    key={tier.id}
                    className={`cursor-pointer rounded-xl p-4 border transition-all text-left block ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500 text-white shadow-md shadow-brand-500/10 ring-1 ring-brand-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceTier"
                      value={tier.id}
                      checked={isSelected}
                      onChange={() => setExperienceLevel(tier.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{tier.label}</span>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="h-px bg-slate-800/80" />

          {/* Primary Tech Stack */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="new-tech-input"
                className="text-sm font-medium text-slate-300 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-brand-400" />
                Primary Tech Stack
              </label>
              <span className="text-xs text-slate-500">
                {techStack.length} technologies selected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Technologies you frequently write. Helps the AI contextualize syntax patterns and common traps.
            </p>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              {techStack.length === 0 ? (
                <span className="text-xs text-slate-500 italic py-1 px-2">
                  No technologies specified. Add one below or click suggested tags.
                </span>
              ) : (
                techStack.map((tech, idx) => (
                  <span
                    key={`${tech}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-brand-500/15 border border-brand-500/30 text-brand-300 animate-in fade-in"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(idx)}
                      className="hover:text-rose-400 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                      aria-label={`Remove ${tech} from tech stack`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Input to Add Custom Tech */}
            <div className="flex gap-2">
              <input
                id="new-tech-input"
                type="text"
                value={newTechInput}
                onChange={(e) => setNewTechInput(e.target.value)}
                onKeyDown={handleKeyDownTech}
                placeholder="Add technology (e.g. Next.js, Rust, Redis) & press Enter"
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
              />
              <button
                type="button"
                onClick={() => handleAddTech()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                aria-label="Add technology to list"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Popular suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TECH_SUGGESTIONS.filter((s) => !techStack.includes(s)).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTech(suggestion)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-brand-500/30"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
