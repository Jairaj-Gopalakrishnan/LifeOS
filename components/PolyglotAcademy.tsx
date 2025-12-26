
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLanguageImmersionResponse, getDailyReadingProse, getScaffoldedDrill } from '../services/gemini';
import { SupportedLanguage, CEFRLevel, ChatMessage, ScaffoldedDrill, VocabularyTerm } from '../types';
import { 
  Send, Loader2, CheckCircle, 
  Trash2, PlusCircle, Maximize2, Minimize2,
  BrainCircuit, RotateCcw,
  Lightbulb, BookText, BarChart2, X, Plus, Edit2, Save,
  Type, AlignJustify, AlertTriangle, Settings
} from 'lucide-react';

export const PolyglotAcademy: React.FC = () => {
  const { addXp, vocabulary, addVocabulary, updateVocabulary, removeVocabulary, completeTask, apiKeyAvailable } = useAppContext();
  const [lang, setLang] = useState<SupportedLanguage>('dutch');
  const [level, setLevel] = useState<CEFRLevel>('A1');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showHelpForIndex, setShowHelpForIndex] = useState<number | null>(null);
  
  // Immersive Reading State
  const [isReadingFullscreen, setIsReadingFullscreen] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg');
  const [readingLineHeight, setReadingLineHeight] = useState<'leading-relaxed' | 'leading-loose' | 'leading-[2.5]'>('leading-relaxed');

  // Vocabulary Form State
  const [showVocabForm, setShowVocabForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vocabForm, setVocabForm] = useState<Omit<VocabularyTerm, 'id'>>({
    term: '',
    translation: '',
    category: 'Gaming',
    language: 'dutch',
    level: 'A1'
  });

  const [reading, setReading] = useState<{ text: string, theme: string } | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [drill, setDrill] = useState<ScaffoldedDrill | null>(null);
  const [drillInput, setDrillInput] = useState('');
  const [drillResult, setDrillResult] = useState<'correct' | 'wrong' | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const categories: VocabularyTerm['category'][] = ['Gaming', 'D&D', 'Movies', 'Education', 'Music'];

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
    if (apiKeyAvailable) {
      refreshDailyReading();
      refreshDrill();
    }
    setMessages([]);
  }, [lang, level, apiKeyAvailable]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const refreshDailyReading = async () => {
    if (!apiKeyAvailable) return;
    setLoadingReading(true);
    try {
      const data = await getDailyReadingProse(lang, level);
      setReading(data);
    } catch (e) {
      console.error("Reading stream failed:", e);
    } finally {
      setLoadingReading(false);
    }
  };

  const refreshDrill = async () => {
    if (!apiKeyAvailable) return;
    setLoadingDrill(true);
    setDrillResult(null);
    setDrillInput('');
    try {
      const currentVocab = vocabulary.filter(v => v.language === lang).map(v => v.term);
      const data = await getScaffoldedDrill(lang, level, currentVocab.length > 0 ? currentVocab : ['Strategy', 'Logic']);
      setDrill(data);
    } catch (e) {
      console.error("Drill stream failed:", e);
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
      completeTask('3');
    } else {
      setDrillResult('wrong');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading || !apiKeyAvailable) return;
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const data = await getLanguageImmersionResponse(userMsg, lang, level, history);
      setMessages(prev => [...prev, { role: 'model', text: data.reply, help: data.help }]);
      addXp(25);
      completeTask('3');
    } catch (e) {
      console.error("Chat transmission failed:", e);
      setMessages(prev => [...prev, { role: 'model', text: "Linguistic uplink failed. Please check system configuration." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveVocab = () => {
    if (!vocabForm.term || !vocabForm.translation) return;
    if (editingId) {
      updateVocabulary(editingId, vocabForm);
      setEditingId(null);
    } else {
      addVocabulary({ ...vocabForm, language: lang });
      addXp(20);
      completeTask('3');
    }
    setVocabForm({ term: '', translation: '', category: 'Gaming', language: lang, level: level });
    setShowVocabForm(false);
  };

  const startEdit = (v: VocabularyTerm) => {
    setVocabForm({
      term: v.term,
      translation: v.translation,
      category: v.category,
      language: v.language,
      level: v.level || 'A1'
    });
    setEditingId(v.id);
    setShowVocabForm(true);
  };

  const isRTL = lang === 'arabic';

  if (!apiKeyAvailable) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="glass max-w-md w-full p-10 rounded-3xl border-2 border-dashed border-emerald-500/20 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-brand font-black text-white">Linguistic Core Offline</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Polyglot Academy requires a valid Gemini API Key to power real-time immersion and linguistic analysis.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
              <Settings className="w-3 h-3" /> System Instruction
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Add your API key to the environment variables as <span className="text-emerald-400">API_KEY</span> in Vercel settings and redeploy.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="glass rounded-2xl p-6 space-y-4 border-t-2 border-emerald-500/50 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400">
              <BookText className="w-4 h-4" /> {level} Prose Insight
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsReadingFullscreen(true)}
                className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors bg-slate-800/50 rounded-lg border border-slate-700 hover:border-emerald-500/30"
                title="Enter Immersive Reading Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={refreshDailyReading} className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors">
                <RotateCcw className={`w-3.5 h-3.5 ${loadingReading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 min-h-[120px] flex items-center relative group-hover:bg-slate-900/80 transition-all">
            {loadingReading ? <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-20" /> : 
              <p className={`text-sm text-slate-200 leading-relaxed line-clamp-4 ${isRTL ? 'text-right font-medium text-lg' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>{reading?.text}</p>
            }
          </div>
          <button 
            onClick={() => setIsReadingFullscreen(true)}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-all"
          >
            Expand Narrative Flow
          </button>
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

        <div className="glass rounded-3xl p-6 space-y-5 flex flex-col h-[600px]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-100">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm uppercase font-black tracking-widest">Vocab Vault</h3>
              </div>
              <button 
                onClick={() => { setShowVocabForm(!showVocabForm); setEditingId(null); }}
                className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-all"
              >
                {showVocabForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showVocabForm && (
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Term..."
                  value={vocabForm.term}
                  onChange={(e) => setVocabForm({...vocabForm, term: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <input 
                  type="text" 
                  placeholder="Translation..."
                  value={vocabForm.translation}
                  onChange={(e) => setVocabForm({...vocabForm, translation: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={vocabForm.category}
                    onChange={(e) => setVocabForm({...vocabForm, category: e.target.value as any})}
                    className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] text-white outline-none appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    value={vocabForm.level}
                    onChange={(e) => setVocabForm({...vocabForm, level: e.target.value as any})}
                    className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] text-white outline-none appearance-none"
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleSaveVocab}
                  className="w-full bg-emerald-500 text-slate-900 font-black text-[10px] uppercase py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  {editingId ? <><Save className="w-3 h-3" /> Update Term</> : <><PlusCircle className="w-3 h-3" /> Archive Term</>}
                </button>
              </div>
            )}

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {vocabulary.filter(v => v.language === lang).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <BookText className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Vault Empty</p>
                </div>
              ) : (
                vocabulary.filter(v => v.language === lang).map((v) => (
                  <div key={v.id} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all flex justify-between items-center group">
                    <div className="flex flex-col items-start overflow-hidden">
                      <div className="flex gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase text-emerald-500/70 tracking-widest">{v.category}</span>
                        <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-900 px-1 rounded">{v.level}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-100 truncate w-full">{v.term}</p>
                      <p className="text-[10px] text-slate-500 truncate w-full">{v.translation}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(v)}
                        className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => removeVocabulary(v.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>

      {isReadingFullscreen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-500">
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                <BookText className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-brand font-black text-white tracking-tight">Immersive Narrative Flow</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{lang} / {level} Mastery Session</p>
              </div>
            </div>
            <button 
              onClick={() => setIsReadingFullscreen(false)}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-700"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-24">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-2 mb-12 border-l-2 border-emerald-500 pl-6">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Subject Theme</span>
                <h3 className="text-2xl font-brand font-bold text-white capitalize">{reading?.theme || 'General Discourse'}</h3>
              </div>
              
              <div 
                className={`text-slate-200 transition-all duration-300 ${readingFontSize} ${readingLineHeight} ${isRTL ? 'text-right font-medium' : 'text-left font-normal'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {loadingReading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 opacity-20" />
                  </div>
                ) : (
                  reading?.text
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur flex flex-wrap items-center justify-center gap-8">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-slate-500">
                 <Type className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Scaling</span>
               </div>
               <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                 {(['text-base', 'text-lg', 'text-xl', 'text-2xl'] as const).map((size, idx) => (
                   <button
                    key={size}
                    onClick={() => setReadingFontSize(size)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${readingFontSize === size ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <span className={idx === 0 ? 'text-xs' : idx === 1 ? 'text-sm' : idx === 2 ? 'text-base' : 'text-lg'}>A</span>
                   </button>
                 ))}
               </div>
             </div>

             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-slate-500">
                 <AlignJustify className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Proximity</span>
               </div>
               <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                 {[
                   { val: 'leading-relaxed', icon: '≡' },
                   { val: 'leading-loose', icon: '≣' },
                   { val: 'leading-[2.5]', icon: '⩔' }
                 ].map((opt) => (
                   <button
                    key={opt.val}
                    onClick={() => setReadingLineHeight(opt.val as any)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg transition-all ${readingLineHeight === opt.val ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {opt.icon}
                   </button>
                 ))}
               </div>
             </div>

             <button 
              onClick={refreshDailyReading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-emerald-500 hover:text-slate-900 text-emerald-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-emerald-500/20 shadow-lg active:scale-95"
             >
               <RotateCcw className={`w-4 h-4 ${loadingReading ? 'animate-spin' : ''}`} />
               Cycle Narrative
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
