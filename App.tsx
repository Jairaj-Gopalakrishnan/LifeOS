
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { BrandStudio } from './components/BrandStudio';
import { PolyglotAcademy } from './components/PolyglotAcademy';
import { HealthAndFuel } from './components/HealthAndFuel';
import { GrowthAndPlanning } from './components/GrowthAndPlanning';
import { Page } from './types';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

/**
 * High-Level Error Boundary for Module Isolation.
 * Ensures local crashes don't bring down the entire OS.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("OS Module Conflict Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 glass rounded-3xl border-2 border-red-500/20 text-center animate-in zoom-in-95">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-brand font-black text-white mb-2">Module Execution Error</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            A critical thread in this module crashed. The rest of your OS remains secure.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-700 hover:text-white transition-all"
          >
            Hot-Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainLayout: React.FC = () => {
  const { activePage, isLoaded } = useAppContext();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <Layers className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing OS 2026</p>
          <p className="text-slate-600 text-[8px] font-medium">Hydrating Biological and Strategic Modules...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case Page.HOME: return <Home />;
      case Page.BRAND: return <BrandStudio />;
      case Page.ACADEMY: return <PolyglotAcademy />;
      case Page.HEALTH: return <HealthAndFuel />;
      case Page.GROWTH: return <GrowthAndPlanning />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-32 pt-8 px-6 overflow-x-hidden selection:bg-emerald-500/30">
      <div className="max-w-md lg:max-w-4xl mx-auto">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </div>
      <BottomNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
