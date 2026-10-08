import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, Lock, ArrowRight, AlertCircle, Check } from 'lucide-react';

const COMMON_TECH = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'Next.js', 'Docker', 'PostgreSQL'];

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [selectedTech, setSelectedTech] = useState(['React', 'Node.js', 'MongoDB']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        experienceLevel,
        primaryTechStack: selectedTech,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Your Cognitive Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Calibrate the assistant to your engineering experience level and tech stack
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="register-name"
                  type="text"
                  required
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="register-email"
                  type="email"
                  required
                  placeholder="ada@computing.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="register-password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Experience Level Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'BEGINNER', label: 'Beginner' },
                  { key: 'INTERMEDIATE', label: 'Intermediate' },
                  { key: 'ADVANCED', label: 'Advanced' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setExperienceLevel(item.key)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      experienceLevel === item.key
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Tech Stack */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Your Primary Tech Stack
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TECH.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tech}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 disabled:opacity-50 transition-all hover:shadow-brand-500/40"
            >
              <span>{loading ? 'Initializing Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
