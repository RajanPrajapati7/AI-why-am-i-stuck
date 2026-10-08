import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass } from 'lucide-react';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Compass className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-400 text-sm font-mono tracking-wide">
          Verifying cognitive workspace session...
        </p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
