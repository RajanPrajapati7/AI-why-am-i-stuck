import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { StuckWizard } from './pages/StuckWizard';
import { StuckWorkspace } from './pages/StuckWorkspace';
import { Analytics } from './pages/Analytics';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/stuck/new" element={<StuckWizard />} />
                <Route path="/stuck/:id" element={<StuckWorkspace />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Minimalist Footer */}
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
            AI Why Am I Stuck Assistant &bull; Cognitive Debugging & Meta-Learning Engine &bull; 2026
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
