
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLanguageImmersionResponse, getDailyReadingProse, getScaffoldedDrill } from '../services/gemini';
import { SupportedLanguage, CEFRLevel, ChatMessage, LanguageHelp, StudyResource, VocabularyTerm, ScaffoldedDrill } from '../types';
import { 
  MessageSquare, Send, Loader2, BookOpen, 
  Sparkles, Info, CheckCircle, 
  Plus, Trash2, Library, PlusCircle, ExternalLink as LaunchIcon,
  ChevronRight, BrainCircuit, BookMarked, Edit3, X, RotateCcw,
  Gamepad2, Music, Film, GraduationCap, HelpCircle, Eye, EyeOff,
  Lightbulb, BookText, Quote, Trophy, BarChart2
} from 'lucide-react';

const SEED_VOCAB: VocabularyTerm[] = [
  // Dutch
  { id: 'nl-1', term: 'Samenspel', translation: 'Cooperation', category: 'Gaming', language: 'dutch', level: 'B1' },
  { id: 'nl-2', term: 'Strategie', translation: 'Strategy', category: 'Gaming', language: 'dutch', level: 'B2' },
  { id: 'nl-3', term: 'Kerker', translation: 'Dungeon', category: 'D&D', language: 'dutch', level: 'A2' },
  { id: 'nl-4', term: 'Draak', translation: 'Dragon', category: 'D&D', language: 'dutch', level: 'A1' },
  // ... and others
];

export const PolyglotAcademy: React.FC = () => {
  const { addXp, resources, addResource, removeResource } = useAppContext();
  const [lang, setLang] = useState<SupportedLanguage>('dutch');
  
  // Proficiency Level State per language
  const [level, setLevel] = useState<CEFRLevel>(() => {
    const saved = localStorage.getItem(`lifeos_level_${lang}`);
    return (saved as CEFRLevel) || 'A1';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showHelpForIndex, setShowHelpForIndex] = useState<number | null>(null);
  
  const [showAddRes, setShowAddRes] = useState(false);
  const [resForm, setResForm] = useState<Omit<StudyResource, 'id'>>({
    title: '',
    url: '',
    category: 'Gaming',
    language: 'dutch'
  });

  const [reading, setReading] = useState<{ text: string, theme: string } | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [drill, setDrill] = useState<ScaffoldedDrill | null>(null);
  const [drillInput, setDrillInput] = useState('');
  const [drillResult, setDrillResult] = useState<'correct' | 'wrong' | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const languages: { id: SupportedLanguage; label: string; flag: string }[] = [
    { id: 'dutch', label: 'Dutch', flag: '🇳🇱' },
    { id: 'french', label: 'French', flag: '🇫🇷' },
    { id: 'arabic', label: 'Arabic', flag: '🇦🇪' },
  ];

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  useEffect(() => {
    localStorage.setItem(`lifeos_level_${lang}`, level);
    refreshDailyReading();
    refreshDrill();
    setMessages([]); // Reset chat context when level or lang changes
  }, [lang, level]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
      const aiMsg: ChatMessage = { role: 'model', text: data.reply, help: data.help };
      setMessages(prev => [...prev, aiMsg]);
      addXp(25);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddResource = () => {
    if (!resForm.title || !resForm.url) return;
    addResource({ ...resForm, language: lang });
    setResForm({ ...resForm, title: '', url: '', category: 'Gaming', language: lang });
    setShowAddRes(false);
    addXp(50);
  };

  const isRTL = lang === 'arabic';
  const filteredResources = resources.filter(r => r.language === lang);
  const filteredVocab = SEED_VOCAB.filter(v => v.language === lang);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-brand font-black text-white tracking-tight">Polyglot Academy</h1>
            <p className="text-slate-400 font-medium">Interest-Based Mastery OS</p>
          </div>
          {/* Level Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> CEFR Proficiency Engine
            </span>
            <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700 w-fit">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                    level === l 
                      ? 'bg-emerald-500 text-slate-900 shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700 w-full lg:w-auto overflow-x-auto">
          {languages.map(l => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id);
                setMessages([]);
                setShowHelpForIndex(null);
                setResForm(p => ({ ...p, language: l.id }));
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                lang === l.id 
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Daily Immersion Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Reading */}
        <div className="glass rounded-2xl p-6 space-y-4 border-t-2 border-emerald-500/50 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
              <BookText className="w-4 h-4" /> {level} Immersion Prose
            </h3>
            <button onClick={refreshDailyReading} disabled={loadingReading} className="p-1 text-slate-500 hover:text-emerald-400">
              <RotateCcw className={`w-4 h-4 ${loadingReading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[140px] flex items-center justify-center relative overflow-hidden group">
            {loadingReading ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 opacity-20" />
            ) : reading ? (
              <p className={`text-sm text-slate-200 leading-relaxed ${isRTL ? 'text-right font-medium text-lg' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                {reading.text}
              </p>
            ) : null}
          </div>
        </div>

        {/* Dynamic Drill Engine */}
        <div className="glass rounded-2xl p-6 space-y-4 border-t-2 border-emerald-500/50">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
              <BrainCircuit className="w-4 h-4" /> {level === 'A1' || level === 'A2' ? 'Word Drop Challenge' : 'Syntax Forge'}
            </h3>
            <button onClick={refreshDrill} disabled={loadingDrill} className="p-1 text-slate-500 hover:text-emerald-400">
              <RotateCcw className={`w-4 h-4 ${loadingDrill ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 bg-slate-800/40 rounded-xl border border-slate-700 min-h-[100px] flex flex-col justify-center ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {loadingDrill ? (
                <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500/20" /></div>
              ) : drill ? (
                <>
                  <p className="text-slate-400 text-xs mb-1 font-black uppercase opacity-60">Source Intent:</p>
                  <p className="text-slate-100 font-bold italic mb-3">"{drill.englishSentence}"</p>
                  
                  {/* Word Drop for A1/A2 */}
                  {(level === 'A1' || level === 'A2') && drill.options ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {drill.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleDrillCheck(opt)}
                          className="py-3 px-4 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 hover:border-emerald-500 transition-all text-center"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {drill.wordBank.map((word, i) => (
                        <span key={i} className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-[10px] text-emerald-400 font-mono shadow-inner">
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {(level === 'B1' || level === 'B2') && (
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Construct full sentence..."
                  value={drillInput}
                  onChange={(e) => setDrillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDrillCheck()}
                  className={`flex-1 bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    drillResult === 'correct' ? 'border-emerald-500' : 
                    drillResult === 'wrong' ? 'border-red-500' : 'border-slate-700'
                  }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button 
                  onClick={() => handleDrillCheck()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-bold text-xs"
                >
                  DECODE
                </button>
              </div>
            )}
            {drillResult === 'correct' && <p className="text-[10px] text-emerald-400 font-black flex items-center gap-1 animate-in slide-in-from-left-2"><CheckCircle className="w-3 h-3" /> Level Clear. +100 XP</p>}
          </div>
        </div>
      </section>

      {/* Chat Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[650px]">
          <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Immersion Partner ({level})</h3>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-1 rounded">2026 ENGINE</span>
               </div>
            </div>
            <div 
              ref={scrollRef}
              className={`flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col ${isRTL ? 'text-right' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <BrainCircuit className="w-16 h-16 mb-4 text-emerald-500" />
                  <p className="text-slate-100 font-black uppercase tracking-widest">Awaiting Command</p>
                  <p className="text-xs text-slate-400 max-w-[250px] mt-2">Level {level} protocol active. Discuss gaming or education systems in {lang}.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-emerald-600 text-white font-medium shadow-emerald-900/20' 
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'model' && m.help && (
                    <div className="flex flex-col items-start w-full">
                       <button 
                        onClick={() => setShowHelpForIndex(showHelpForIndex === i ? null : i)}
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase transition-all px-2 py-1 rounded-lg border ${
                          showHelpForIndex === i 
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' 
                          : 'text-slate-500 border-transparent hover:text-emerald-400'
                        }`}
                       >
                         <Lightbulb className="w-3 h-3" />
                         💡 {level === 'B2' ? 'Nuance Insight' : 'Safety Net Breakdown'}
                       </button>
                       {showHelpForIndex === i && (
                         <div className="mt-2 p-5 glass border border-emerald-500/30 rounded-2xl text-xs space-y-4 animate-in slide-in-from-top-2 duration-300 max-w-sm">
                            {(level === 'A1' || level === 'A2') ? (
                              <>
                                <div className="space-y-1">
                                  <p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Literal Translation</p>
                                  <p className="text-slate-200 italic font-medium">"{m.help.translation}"</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Grammar Logic</p>
                                  <p className="text-slate-400">{m.help.grammarTip}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-1">
                                  <p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">The Clue</p>
                                  <p className="text-slate-200 font-bold italic leading-relaxed">"{m.help.nuanceClue || 'Seek the hidden context in the phrasing.'}"</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Linguistic Context</p>
                                  <p className="text-slate-400 leading-relaxed">{m.help.slangNotes}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-700/50">
                                  <details className="cursor-pointer">
                                    <summary className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300">Reveal Translation</summary>
                                    <p className="mt-2 text-slate-500 italic">"{m.help.translation}"</p>
                                  </details>
                                </div>
                              </>
                            )}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={`Engage in ${lang} (${level})...`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-600"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button 
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 p-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories & Vocab Sidebar */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 space-y-5">
             <div className="flex items-center gap-2 text-slate-100">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm uppercase font-black tracking-widest">Active Level Vault</h3>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredVocab.map((v) => (
                  <div key={v.id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all flex justify-between items-center group">
                    <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase text-emerald-500/70 tracking-widest">{v.category}</span>
                        <span className="text-[8px] font-black uppercase text-slate-500 border border-slate-700 px-1 rounded">{v.level || 'B2'}</span>
                      </div>
                      <p className={`text-sm font-bold text-slate-100 ${isRTL ? 'text-lg' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>{v.term}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{v.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>

      {/* Resource Library (Asset Dashboard) */}
      <section className="glass rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-brand font-black text-white">Digital Immersion Assets</h2>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">External Knowledge Nodes: YouTube • D&D Manuals • Music</p>
          </div>
          <button 
            onClick={() => setShowAddRes(!showAddRes)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>

        {showAddRes && (
          <div className="p-6 bg-slate-800/80 rounded-3xl border border-slate-700 space-y-4 animate-in zoom-in-95 duration-200 max-w-3xl mx-auto shadow-2xl">
            <h4 className="text-sm font-black text-white uppercase tracking-widest text-center">New Immersion Node</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Asset Identity..."
                className="w-full bg-slate-900 text-sm border border-slate-700 p-4 rounded-2xl focus:border-emerald-500 outline-none"
                value={resForm.title}
                onChange={(e) => setResForm({...resForm, title: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Secure URL..."
                className="w-full bg-slate-900 text-sm border border-slate-700 p-4 rounded-2xl focus:border-emerald-500 outline-none"
                value={resForm.url}
                onChange={(e) => setResForm({...resForm, url: e.target.value})}
              />
              <select 
                className="w-full bg-slate-900 text-sm border border-slate-700 p-4 rounded-2xl outline-none text-slate-300"
                value={resForm.category}
                onChange={(e) => setResForm({...resForm, category: e.target.value as any})}
              >
                <option>Gaming</option>
                <option>Music</option>
                <option>D&D</option>
                <option>Movies</option>
                <option>Education</option>
                <option>Podcast</option>
              </select>
              <button 
                onClick={handleAddResource}
                className="bg-emerald-500 text-slate-900 text-xs font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-400 transition-all"
              >
                DEPLOY ASSET (+50 XP)
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredResources.map((res) => (
            <div key={res.id} className="flex flex-col justify-between p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl group hover:border-emerald-500/50 transition-all shadow-lg">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    {res.category}
                  </span>
                  <button onClick={() => removeResource(res.id)} className="p-1.5 hover:text-red-400 text-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-black text-slate-100 mb-1 leading-tight group-hover:text-emerald-400">{res.title}</h4>
              </div>
              <a 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LaunchIcon className="w-3.5 h-3.5" />
                INITIATE STREAM
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Internal utility icon for D&D (Skull)
const Skull = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C7.03 2 3 6.03 3 11c0 2.94 1.41 5.55 3.61 7.18L6 22h12l-.61-3.82C19.59 16.55 21 13.94 21 11c0-4.97-4.03-9-9-9z"/>
    <path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 18v-4"/>
  </svg>
);
