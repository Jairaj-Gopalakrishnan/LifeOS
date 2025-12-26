
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateContentHooks, generateCourseOutline } from '../services/gemini';
import { SocialCalendar } from './SocialCalendar';
import { Sparkles, GraduationCap, PenTool, Check, Loader2, ChevronRight, Share2, Users } from 'lucide-react';

export const BrandStudio: React.FC = () => {
  const { addXp } = useAppContext();
  const [hooks, setHooks] = useState<{ hook: string, platform: string }[]>([]);
  const [course, setCourse] = useState<{ moduleNumber: number, title: string, objective: string }[]>([]);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [audience, setAudience] = useState('Beginners');

  const handleGenerateHooks = async () => {
    setLoadingHooks(true);
    try {
      const data = await generateContentHooks('Global Education Trends & Epistemic Injustice');
      setHooks(data);
    } finally {
      setLoadingHooks(false);
    }
  };

  const handleBuildCourse = async () => {
    if (!courseTitle) return;
    setLoadingCourse(true);
    try {
      const data = await generateCourseOutline(courseTitle, audience);
      setCourse(data);
    } finally {
      setLoadingCourse(false);
    }
  };

  const completeDraft = () => {
    addXp(100);
    alert("Draft Finalized. +100 XP gained for deep content creation.");
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-brand font-black text-white tracking-tight">Brand Studio</h1>
          <p className="text-slate-400">Education Systems & Personal Brand Hub</p>
        </div>
        <button 
          onClick={completeDraft}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <PenTool className="w-4 h-4" />
          <span>Post Drafted</span>
        </button>
      </div>

      <SocialCalendar />

      {/* Idea Engine */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Content Idea Engine
          </h3>
          <button 
            onClick={handleGenerateHooks}
            disabled={loadingHooks}
            className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
          >
            {loadingHooks ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
            Refresh Hooks
          </button>
        </div>
        <p className="text-xs text-slate-500">Generating hooks for Education Trends & Epistemic Injustice.</p>
        <div className="space-y-3">
          {hooks.length === 0 && !loadingHooks && (
            <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-slate-600 text-sm">
              Press refresh to generate executive content hooks
            </div>
          )}
          {hooks.map((h, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded">
                  {h.platform}
                </span>
              </div>
              <p className="text-slate-200 text-sm italic">"{h.hook}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course Architect */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          Course Architect
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Course Title (e.g. Decentralized Learning Architecture)" 
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
            />
            <button 
              onClick={handleBuildCourse}
              disabled={loadingCourse || !courseTitle}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              {loadingCourse ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Target Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginners', 'Intermediate', 'Advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setAudience(level)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    audience === level 
                      ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-md' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pt-2">
          {course.length === 0 && !loadingCourse && (
            <div className="p-12 border-2 border-dashed border-slate-800 rounded-3xl text-center opacity-30 flex flex-col items-center justify-center">
              <GraduationCap className="w-12 h-12 mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">Outline Registry Idle</p>
            </div>
          )}
          {course.map((mod) => (
            <div key={mod.moduleNumber} className="flex gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50 hover:border-emerald-500/20 transition-all">
              <div className="bg-emerald-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 font-brand font-black text-sm shrink-0">
                {mod.moduleNumber}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{mod.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.objective}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
