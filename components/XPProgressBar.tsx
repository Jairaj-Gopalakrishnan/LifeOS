
import React from 'react';
import { useAppContext } from '../context/AppContext';

export const XPProgressBar: React.FC = () => {
  const { stats } = useAppContext();
  const progress = (stats.xp / stats.nextLevelXp) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Player Rank</span>
          <span className="text-2xl font-brand font-extrabold text-white">LEVEL {stats.level}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">{stats.xp} / {stats.nextLevelXp} XP</span>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
