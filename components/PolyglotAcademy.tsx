
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLanguageImmersionResponse, getDailyReadingProse, getScaffoldedDrill } from '../services/gemini';
import { SupportedLanguage, CEFRLevel, ChatMessage, ScaffoldedDrill, VocabularyTerm, StudyResource } from '../types';
import { 
  Send, Loader2, Sparkles, CheckCircle, 
  Trash2, PlusCircle, ExternalLink as LaunchIcon,
  BrainCircuit, RotateCcw,
  Gamepad2, Music, Film, GraduationCap,
  Lightbulb, BookText, Quote, BarChart2, X
} from 'lucide-react';

const SEED_VOCAB: VocabularyTerm[] = [
  { id: '1', term: 'Samenspel', translation: 'Cooperation', category: 'Gaming', language: 'dutch', level: 'B1' },
  { id: '2', term: 'Stratégie', translation: 'Strategy', category: 'Gaming', language: 'french', level: 'B2' },
  { id: '3', term: 'إستراتيجية', translation: 'Strategy', category: 'Gaming', language: 'arabic', level: 'B2' },
  { id: '4', term: 'Onderwijs', translation: 'Education', category: 'Education', language: 'dutch', level: 'B1' },
  { id: '5', term: 'Réalisateur', translation: 'Director', category: 'Movies', language: 'french', level: 'B2' }
];

export const PolyglotAcademy: React.FC = () => {
  const { addXp, resources, addResource, removeResource } = useAppContext();
  const [lang, setLang] = useState<SupportedLanguage>('dutch');
  const [level, setLevel] = useState<CEFRLevel>('A1');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showHelpForIndex, setShowHelpForIndex] = useState<number | null>(null);
  
  const [showAddRes, setShowAddRes] = useState(false);
  const [resForm, setResForm] = useState<Omit<StudyResource, 'id'>>({
    title: '', url: '', category: 'Gaming', language: 'dutch'
  });

  const [reading, setReading] = useState<{ text: string, theme: string } | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [drill, setDrill] = useState<ScaffoldedDrill | null>(null);
  const [drillInput, setDrillInput] = useState('');
  const [drillResult, setDrillResult] = useState<'correct' | 'wrong' | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  // Initial load of level from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`lifeos_level_${lang}`);
      if (saved) setLevel(saved as CEFRLevel);
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lifeos_level_${lang}`, level);
    }
    refreshDailyReading();
    refreshDrill();
    setMessages([]);
  }, [lang, level]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const refreshDailyReading = async () => {
    setLoadingReading(true);
    try {
      const data = await getDailyReadingProse(lang, level);
      setReading(data);
    } finally {
      setLoadingReading(false);
    }
  };

  const refreshDrill = async () => {
    setLoadingDrill(true);
    setDrillResult(null);
    setDrillInput('');
    try {
      const vocab = SEED_VOCAB.filter(v => v.language === lang).map(v => v.term);
      const data = await getScaffoldedDrill(lang, level, vocab);
      setDrill(data);
    } finally {
      setLoadingDrill(false);
    }
  };

  const handleDrillCheck = (input?: string) => {
    const finalInput = input || drillInput;
    if (!drill) return;
    const isCorrect = finalInput.trim().toLowerCase() === drill.targetSentence.trim().toLowerCase();
    if (isCorrect) {
      setDrillResult('correct');
      addXp(100);
    } else {
      setDrillResult('wrong');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const data = await getLanguageImmersionResponse(userMsg, lang, level, history);
      setMessages(prev => [...prev, { role: 'model', text: data.reply, help: data.help }]);
      addXp(25);
    } finally {
      setChatLoading(false);
    }
  };

  const isRTL = lang === 'arabic';

  return (
    <div className="animate-in fade-in duration-700 pb-32 space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-brand font-black text-white tracking-tight">Polyglot Academy</h1>
            <p className="text-slate-400 font-medium">Linguistic Executive Mastery</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> CEFR Level Switcher
            </span>
            <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700 w-fit">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                    level === l ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700">
          {(['dutch', 'french', 'arabic'] as SupportedLanguage[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                lang === l ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4 border-t-2 border-emerald-500/50">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
              <BookText className="w-4 h-4" /> {level} Prose Insight
            </h3>
            <button onClick={refreshDailyReading} className="p-1 text-slate-500 hover:text-emerald-400">
              <RotateCcw className={`w-4 h-4 ${loadingReading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[120px] flex items-center">
            {loadingReading ? <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /> : 
              <p className={`text-sm text-slate-200 leading-relaxed ${isRTL ? 'text-right font-medium text-lg' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>{reading?.text}</p>
            }
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4 border-t-2 border-emerald-500/50">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
              <BrainCircuit className="w-4 h-4" /> {level.startsWith('A') ? 'Word Drop' : 'Syntax Forge'}
            </h3>
            <button onClick={refreshDrill} className="p-1 text-slate-500 hover:text-emerald-400">
              <RotateCcw className={`w-4 h-4 ${loadingDrill ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div className={`p-4 bg-slate-800/40 rounded-xl border border-slate-700 min-h-[100px] flex flex-col justify-center ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {loadingDrill ? <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /> : drill && (
                <>
                  <p className="text-slate-100 font-bold italic mb-3">"{drill.englishSentence}"</p>
                  {level.startsWith('A') && drill.options ? (
                    <div className="grid grid-cols-2 gap-2">
                      {drill.options.map((opt, i) => (
                        <button key={i} onClick={() => handleDrillCheck(opt)} className="py-2.5 px-4 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 hover:border-emerald-500 transition-all">{opt}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">{drill.wordBank.map((word, i) => <span key={i} className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-[10px] text-emerald-400 font-mono shadow-inner">{word}</span>)}</div>
                  )}
                </>
              )}
            </div>
            {!level.startsWith('A') && (
              <div className="flex gap-2">
                <input type="text" placeholder="Construct sentence..." value={drillInput} onChange={(e) => setDrillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleDrillCheck()} className={`flex-1 bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white outline-none ${drillResult === 'correct' ? 'border-emerald-500' : drillResult === 'wrong' ? 'border-red-500' : 'border-slate-700'}`} dir={isRTL ? 'rtl' : 'ltr'} />
                <button onClick={() => handleDrillCheck()} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95">DEPLOY</button>
              </div>
            )}
            {drillResult === 'correct' && <p className="text-[10px] text-emerald-400 font-black flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Protocol Valid. +100 XP</p>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[600px]">
          <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-slate-700">
            <div className="p-4 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Immersion Hub ({level})</h3>
               </div>
            </div>
            <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <BrainCircuit className="w-12 h-12 mb-4 text-emerald-500" />
                  <p className="text-xs text-slate-400 max-w-[200px]">Begin linguistic immersion in {lang}. Strategies, Gaming, or Cinema themes active.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2 animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white font-medium shadow-lg' : 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'}`}>{m.text}</div>
                  {m.role === 'model' && m.help && (
                    <div className="flex flex-col items-start w-full">
                       <button onClick={() => setShowHelpForIndex(showHelpForIndex === i ? null : i)} className={`flex items-center gap-1.5 text-[10px] font-black uppercase transition-all px-2 py-1 rounded-lg border ${showHelpForIndex === i ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-500 border-transparent hover:text-emerald-400'}`}><Lightbulb className="w-3 h-3" />💡 {level.startsWith('B') ? 'Nuance Insight' : 'Safety Net'}</button>
                       {showHelpForIndex === i && (
                         <div className="mt-2 p-4 glass border border-emerald-500/20 rounded-2xl text-xs space-y-4 animate-in slide-in-from-top-2 max-w-sm">
                            <div className="space-y-1"><p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Translation</p><p className="text-slate-200 italic">"{m.help.translation}"</p></div>
                            <div className="space-y-1"><p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Logic & Tips</p><p className="text-slate-400">{level.startsWith('B') ? m.help.nuanceClue : m.help.grammarTip}</p></div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-500/50 ml-2" />}
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} placeholder={`Discuss in ${lang}...`} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-sm text-white focus:border-emerald-500 outline-none transition-all shadow-inner" dir={isRTL ? 'rtl' : 'ltr'} />
              <button onClick={handleSendChat} disabled={chatLoading} className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 p-4 rounded-2xl transition-all shadow-lg active:scale-95"><Send className="w-6 h-6" /></button>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 space-y-5">
           <div className="flex items-center gap-2 text-slate-100">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm uppercase font-black tracking-widest">Vocab Vault</h3>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar h-[500px]">
              {SEED_VOCAB.filter(v => v.language === lang).map((v) => (
                <div key={v.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all flex flex-col items-start">
                  <div className="flex gap-2 mb-1"><span className="text-[8px] font-black uppercase text-emerald-500/70 tracking-widest">{v.category}</span><span className="text-[8px] font-black uppercase text-slate-500 bg-slate-900 px-1 rounded">{v.level}</span></div>
                  <p className="text-sm font-bold text-slate-100">{v.term}</p>
                  <p className="text-[10px] text-slate-500">{v.translation}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};
