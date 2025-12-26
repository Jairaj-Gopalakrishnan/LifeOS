
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { BrandStudio } from './components/BrandStudio';
import { PolyglotAcademy } from './components/PolyglotAcademy';
import { HealthAndFuel } from './components/HealthAndFuel';
import { GrowthAndPlanning } from './components/GrowthAndPlanning';
import { Page } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, isLoaded } = useAppContext();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("OS CRITICAL ERROR:", e.error);
      setErrorMsg(e.message || "Unknown runtime exception");
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-black text-white mb-2">OS Critical Failure</h1>
        <p className="text-slate-500 max-w-xs mb-6 text-sm font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
          {errorMsg}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reboot System
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing OS 2026</p>
      </div>
    );
  }

  const renderPage = () => {
    try {
      switch (activePage) {
        case Page.HOME: return <Home />;
        case Page.BRAND: return <BrandStudio />;
        case Page.ACADEMY: return <PolyglotAcademy />;
        case Page.HEALTH: return <HealthAndFuel />;
        case Page.GROWTH: return <GrowthAndPlanning />;
        default: return <Home />;
      }
    } catch (e) {
      console.error("Page Render Failure:", e);
      return (
        <div className="p-8 glass rounded-3xl text-center border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-bold mb-2">Module Load Error</h2>
          <button onClick={() => window.location.reload()} className="text-emerald-500 text-xs font-black uppercase">Refresh Module</button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-32 pt-8 px-6 overflow-x-hidden selection:bg-emerald-500/30">
      <div className="max-w-md lg:max-w-4xl mx-auto">
        {renderPage()}
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
