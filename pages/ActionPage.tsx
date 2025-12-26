
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import { Plus, Zap } from 'lucide-react';

interface Props {
  page: Page;
}

export const ActionPage: React.FC<Props> = ({ page }) => {
  const { addXp } = useAppContext();

  const getContent = () => {
    switch(page) {
      case Page.BRAND: return { title: 'Brand Forge', color: 'emerald', desc: 'Accelerate your digital presence.' };
      case Page.HEALTH: return { title: 'Health Matrix', color: 'emerald', desc: 'Optimize biology and longevity.' };
      case Page.ACADEMY: return { title: 'Academy', color: 'emerald', desc: 'Acquire high-value skillsets.' };
      case Page.GROWTH: return { title: 'Personal Growth', color: 'emerald', desc: 'Mindset and philosophical depth.' };
      default: return { title: 'System', color: 'emerald', desc: 'LifeOS Modules.' };
    }
  };

  const content = getContent();

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
      <h1 className="text-3xl font-brand font-black text-white tracking-tight mb-2">{content.title}</h1>
      <p className="text-slate-400 mb-8">{content.desc}</p>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-6 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Executive Action {i}</h3>
                <p className="text-sm text-slate-500">Standardized protocol performance</p>
              </div>
            </div>
            <button 
              onClick={() => addXp(50)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
          <Plus className="w-8 h-8" />
        </div>
        <p className="text-slate-400 font-bold mb-1">Add Custom Module</p>
        <p className="text-xs text-slate-600">Configure your personal OS</p>
      </div>
    </div>
  );
};
