
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XPProgressBar } from '../components/XPProgressBar';
import { BigThreeCard } from '../components/BigThreeCard';
import { Flame, Target, Trophy, Clock, GraduationCap, ChevronRight, Zap, CheckCircle2, Circle } from 'lucide-react';
import { Page } from '../types';

export const Home: React.FC = () => {
  const { stats, setActivePage, tasks, toggleTask } = useAppContext();
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  // Find the Daily Study Quest task specifically
  const studyQuestTask = tasks.find(t => t.id === '3' || t.title === 'Daily Study Quest');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="mb-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-brand font-black text-white tracking-tight leading-none mb-1">LifeOS 2026</h1>
            <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80">{today}</p>
          </div>
          <div className="flex gap-4">
            <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border-emerald-500/10 shadow-lg shadow-orange-500/5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
              <span className="text-xl font-black text-white">{stats.streak}</span>
            </div>
          </div>
        </div>

        <XPProgressBar />
      </section>

      {/* Daily Study Quest Highlight Card */}
      {studyQuestTask && (
        <section className="mb-6">
          <div className={`glass p-6 rounded-3xl border-t-2 shadow-2xl relative overflow-hidden group transition-all duration-500 ${
            studyQuestTask.completed ? 'border-emerald-500 animate-success' : 'border-slate-700'
          }`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-24 h-24 text-emerald-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
                    studyQuestTask.completed ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'
                  }`}>
                    {studyQuestTask.completed ? 'Quest Complete' : 'Active Quest'}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Polyglot Academy</span>
                </div>
                <h3 className="text-xl font-brand font-black text-white">Daily Study Quest</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs">{studyQuestTask.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Reward</p>
                  <p className={`text-lg font-black ${studyQuestTask.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                    +{studyQuestTask.xpReward} XP
                  </p>
                </div>
                <button 
                  onClick={() => toggleTask(studyQuestTask.id)}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 flex items-center justify-center ${
                    studyQuestTask.completed 
                    ? 'bg-emerald-500 text-slate-900 shadow-emerald-500/20' 
                    : 'bg-slate-800 border border-slate-700 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-500'
                  }`}
                >
                  {studyQuestTask.completed ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Circle className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            {studyQuestTask.completed && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-700">
                <p className="text-xs font-bold text-emerald-400">Quest Status: Synchronized & Completed</p>
                <button 
                  onClick={() => setActivePage(Page.ACADEMY)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors flex items-center gap-1"
                >
                  Academy Hub <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <button 
          onClick={() => setActivePage(Page.ACADEMY)}
          className="glass p-6 rounded-3xl border border-slate-700/50 text-left flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Daily Immersion</h3>
              <p className="text-xs text-slate-500 font-medium">Linguistic mastery stream active.</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-3xl border-l-4 border-l-emerald-500 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Target className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Efficiency</span>
            </div>
            <p className="text-2xl font-black text-white">92%</p>
          </div>
          <div className="glass p-5 rounded-3xl border-l-4 border-l-emerald-500 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Trophy className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Global Rank</span>
            </div>
            <p className="text-2xl font-black text-white">#1,402</p>
          </div>
        </div>
      </section>

      <section className="mb-24">
        <BigThreeCard />
        
        <div className="mt-8 glass rounded-3xl p-8 flex items-center justify-between border-t-2 border-emerald-500/10 hover:border-emerald-500/20 transition-all">
           <div className="flex items-center gap-5">
              <div className="bg-slate-800 p-4 rounded-2xl shadow-inner">
                <Clock className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Deep Work Window</p>
                <h4 className="text-white font-black text-lg">System Strategy Forge</h4>
              </div>
           </div>
           <div className="text-right">
              <span className="text-sm font-mono text-emerald-400 font-black bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">14:00 - 16:30</span>
           </div>
        </div>
      </section>
    </div>
  );
};
