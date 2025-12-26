
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { ActionPage } from './pages/ActionPage';
import { BrandStudio } from './components/BrandStudio';
import { PolyglotAcademy } from './components/PolyglotAcademy';
import { HealthAndFuel } from './components/HealthAndFuel';
import { GrowthAndPlanning } from './components/GrowthAndPlanning';
import { Page } from './types';

const MainLayout: React.FC = () => {
  const { activePage } = useAppContext();

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
    <div className="min-h-screen bg-slate-900 pb-20 pt-8 px-6 overflow-x-hidden">
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
