import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Brain,
  HelpCircle,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [appearance, setAppearance] = useState('dark');
  const [enableCognitiveCoaching, setEnableCognitiveCoaching] = useState(true);
  const [enableSocraticQuestioning, setEnableSocraticQuestioning] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Hydrate settings from active user
  useEffect(() => {
    if (user?.settings) {
      if (user.settings.appearance) {
        setAppearance(user.settings.appearance);
      }
      if (user.settings.aiPreferences) {
        setEnableCognitiveCoaching(
          user.settings.aiPreferences.enableCognitiveCoaching ?? true
        );
        setEnableSocraticQuestioning(
          user.settings.aiPreferences.enableSocraticQuestioning ?? true
        );
      }
    }
  }, [user]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      setIsSubmitting(true);
      const res = await api.put('/auth/settings', {
        appearance,
        aiPreferences: {
          enableCognitiveCoaching,
          enableSocraticQuestioning,
        },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setSuccessMessage('Your application settings have been saved.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(res.data.message || 'Failed to update settings.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'An error occurred while saving your preferences. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Application Settings
            </h1>
            <p className="text-sm text-slate-400">
              Customize your cognitive debugging experience and AI guidance parameters.
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

      <form onSubmit={handleSaveSettings} className="space-y-8" noValidate>
        {/* Appearance Preference */}
        <section
          aria-labelledby="appearance-heading"
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <Moon className="w-4 h-4 text-brand-400" />
            <h2 id="appearance-heading" className="text-base font-semibold text-white">
              Appearance Preference
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Select your preferred visual theme across the assistant workspaces and dashboards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'system',
                label: 'System',
                desc: 'Sync with system OS dark/light mode',
                icon: Laptop,
              },
              {
                id: 'dark',
                label: 'Dark Mode',
                desc: 'Deep slate background with neon accents (Recommended)',
                icon: Moon,
              },
              {
                id: 'light',
                label: 'Light Mode',
                desc: 'High-contrast light interface',
                icon: Sun,
              },
            ].map((theme) => {
              const isSelected = appearance === theme.id;
              const Icon = theme.icon;
              return (
                <label
                  key={theme.id}
                  className={`cursor-pointer rounded-xl p-4 border transition-all text-left block ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 text-white shadow-md shadow-brand-500/10 ring-1 ring-brand-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="appearanceTheme"
                    value={theme.id}
                    checked={isSelected}
                    onChange={() => setAppearance(theme.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-sm">{theme.label}</span>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{theme.desc}</p>
                </label>
              );
            })}
          </div>
        </section>

        {/* AI Cognitive Guidance Preferences */}
        <section
          aria-labelledby="ai-prefs-heading"
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-brand-400" />
            <h2 id="ai-prefs-heading" className="text-base font-semibold text-white">
              AI Assistance & Cognitive Coaching
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Configure how aggressively the cognitive engine guides your debugging process.
          </p>

          <div className="space-y-4">
            {/* Cognitive Coaching Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-1">
                <label
                  htmlFor="enable-cognitive-coaching"
                  className="text-sm font-medium text-slate-200 cursor-pointer block"
                >
                  Enable Cognitive Coaching
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide architectural mental models, false-assumption corrections, and why-you-are-stuck analysis rather than just pasting code fixes.
                </p>
              </div>
              <button
                type="button"
                id="enable-cognitive-coaching"
                role="switch"
                aria-checked={enableCognitiveCoaching}
                onClick={() => setEnableCognitiveCoaching(!enableCognitiveCoaching)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  enableCognitiveCoaching ? 'bg-brand-600' : 'bg-slate-800'
                }`}
              >
                <span className="sr-only">Toggle cognitive coaching</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableCognitiveCoaching ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Socratic Questioning Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-1">
                <label
                  htmlFor="enable-socratic-questioning"
                  className="text-sm font-medium text-slate-200 cursor-pointer block"
                >
                  Enable Socratic Clarification Questions
                </label>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Require answering targeted diagnostic questions to pinpoint blind spots before unlocking the step-by-step action plan.
                </p>
              </div>
              <button
                type="button"
                id="enable-socratic-questioning"
                role="switch"
                aria-checked={enableSocraticQuestioning}
                onClick={() => setEnableSocraticQuestioning(!enableSocraticQuestioning)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  enableSocraticQuestioning ? 'bg-brand-600' : 'bg-slate-800'
                }`}
              >
                <span className="sr-only">Toggle Socratic questioning</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enableSocraticQuestioning ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Save Settings Trigger */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-brand-500/30"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Section */}
      <section
        aria-labelledby="account-heading"
        className="mt-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-brand-400" />
          <h2 id="account-heading" className="text-base font-semibold text-white">
            Account Management
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Authenticated credentials and session lifecycle management.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <span className="text-xs text-slate-500 block mb-0.5">Signed in as</span>
            <span className="text-sm font-mono text-slate-200 font-medium">
              {user?.email || 'authenticated-user@assistant.ai'}
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            aria-label="Log out of account"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>
    </div>
  );
};
