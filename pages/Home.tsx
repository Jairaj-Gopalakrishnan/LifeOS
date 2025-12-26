
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XPProgressBar } from '../components/XPProgressBar';
import { BigThreeCard } from '../components/BigThreeCard';
import { Flame, Target, Trophy, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import { Page } from '../types';

export const Home: React.FC = () => {
  const { stats, setActivePage, tasks } = useAppContext();
  
  const studyQuest = tasks.find(t => t.id === '3');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stats */}
      <section className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-brand font-black text-white tracking-tight">LifeOS 2026</h1>
            <p className="text-slate-400 font-medium">Monday, Jan 12th</p>
          </div>
          <div className="flex gap-3">
            <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 border-emerald-500/20">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
              <span className="text-lg font-bold text-white">{stats.streak}</span>
            </div>
          </div>
        </div>

        <XPProgressBar />
      </section>

      {/* Daily Study Quest - NEW CARD */}
      {studyQuest && !studyQuest.completed && (
        <button 
          onClick={() => setActivePage(Page.ACADEMY)}
          className="w-full mb-8 glass p-5 rounded-2xl border-l-4 border-l-emerald-500 text-left flex items-center justify-between group relative overflow-hidden transition-all hover:bg-slate-800/60"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-20 h-20 text-emerald-500" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">Active Quest</p>
              <h3 className="text-lg font-bold text-white">Daily Study Ritual</h3>
              <p className="text-xs text-slate-400">Add a resource or start a 10min chat session.</p>
            </div>
          </div>
          <div className="text-right relative z-10">
            <span className="text-emerald-400 font-black text-lg block">+100 XP</span>
            <ChevronRight className="w-5 h-5 text-slate-600 inline group-hover:text-emerald-400 transition-colors" />
          </div>
        </button>
      )}

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Target className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-xl font-bold text-white">92%</p>
        </div>
        <div className="glass p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Rank</span>
          </div>
          <p className="text-xl font-bold text-white">#1,402</p>
        </div>
      </section>

      {/* Main Focus */}
      <section className="mb-24">
        <BigThreeCard />
        
        <div className="mt-8 glass rounded-2xl p-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-full">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Next Window</p>
                <p className="text-white font-bold">Deep Work Session</p>
              </div>
           </div>
           <span className="text-xs font-mono text-emerald-400 font-bold">14:00 - 16:30</span>
        </div>
      </section>
    </div>
  );
};
