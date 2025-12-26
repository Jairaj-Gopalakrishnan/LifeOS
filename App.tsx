
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { BrandStudio } from './components/BrandStudio';
import { PolyglotAcademy } from './components/PolyglotAcademy';
import { HealthAndFuel } from './components/HealthAndFuel';
import { GrowthAndPlanning } from './components/GrowthAndPlanning';
import { Page } from './types';
import { AlertCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage, isLoaded } = useAppContext();
  const [hasError, setHasError] = useState(false);

  // Simple runtime error catcher for layout
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Runtime Exception:", e.message);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-white mb-2">OS Critical Failure</h1>
        <p className="text-slate-400 max-w-xs mb-6 text-sm">A module has failed to initialize. The system state has been preserved.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-emerald-500 text-slate-900 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest"
        >
          Reboot OS
        </button>
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
