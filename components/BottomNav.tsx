
import React from 'react';
import { Home, Rocket, Activity, GraduationCap, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

export const BottomNav: React.FC = () => {
  const { activePage, setActivePage } = useAppContext();

  const navItems = [
    { id: Page.HOME, icon: Home, label: 'Home' },
    { id: Page.BRAND, icon: Rocket, label: 'Brand' },
    { id: Page.HEALTH, icon: Activity, label: 'Health' },
    { id: Page.ACADEMY, icon: GraduationCap, label: 'Academy' },
    { id: Page.GROWTH, icon: TrendingUp, label: 'Growth' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 safe-bottom">
      <div className="max-w-md mx-auto glass rounded-2xl flex justify-between items-center p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 flex-1 transition-all duration-300 rounded-xl relative ${
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl animate-in fade-in scale-in duration-300" />
              )}
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
