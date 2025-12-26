
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Calendar, CheckSquare, BookOpen, Clock, 
  Target, Plus, Trash2, Heart, Moon, 
  Sun, Shield, AlertCircle, Play, Pause,
  ChevronLeft, ChevronRight, Bookmark,
  X, CheckCircle2, Tag, Palette
} from 'lucide-react';
import { Priority, Task, Milestone } from '../types';

export const GrowthAndPlanning: React.FC = () => {
  const { 
    tasks, addTask, toggleTask, 
    journal, updateJournal, 
    milestones, addMilestone, removeMilestone,
    taskCategories, addTaskCategory, removeTaskCategory,
    addXp 
  } = useAppContext();

  // Unified To-Do State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    category: taskCategories[0]?.id || 'growth', 
    priority: 'Standard' as Priority 
  });

  // Custom Category State
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#10b981' });

  // Vision Calendar State
  const [calendarView, setCalendarView] = useState<'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual'>('Monthly');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', date: new Date().toISOString().split('T')[0] });

  // Meditation Timer State
  const [meditationTime, setMeditationTime] = useState(300); // Default 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [meditationDuration, setMeditationDuration] = useState(5);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journal.find(e => e.date === today) || { morningGratitude: '', eveningReflection: '', meditationMinutes: 0 };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && meditationTime > 0) {
      interval = setInterval(() => setMeditationTime(t => t - 1), 1000);
    } else if (meditationTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      updateJournal({ meditationMinutes: (todayEntry.meditationMinutes || 0) + meditationDuration });
      addXp(50);
      alert("Meditation complete. Clarity focused. +50 XP");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, meditationTime]);

  const handleAddTask = () => {
    if (!newTask.title) return;
    const xp = newTask.priority === 'Critical' ? 250 : newTask.priority === 'Essential' ? 150 : 75;
    const selectedCat = taskCategories.find(c => c.id === newTask.category);
    addTask({
      title: newTask.title,
      description: `${selectedCat?.name || 'Standard'} focus task`,
      category: newTask.category,
      xpReward: xp,
      type: selectedCat?.name || 'Task',
      priority: newTask.priority
    });
    setNewTask({ ...newTask, title: '' });
    setShowTaskForm(false);
  };

  const handleAddCategory = () => {
    if (!newCat.name) return;
    addTaskCategory(newCat.name, newCat.color);
    setNewCat({ name: '', color: '#10b981' });
    setShowCatForm(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title) return;
    addMilestone({
      title: newMilestone.title,
      date: newMilestone.date,
      view: calendarView
    });
    setNewMilestone({ title: '', date: new Date().toISOString().split('T')[0] });
    setShowMilestoneForm(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCategoryColor = (catId: string) => {
    return taskCategories.find(c => c.id === catId)?.color || '#1e293b';
  };

  const getCategoryName = (catId: string) => {
    return taskCategories.find(c => c.id === catId)?.name || 'General';
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-32 space-y-8">
      <header>
        <h1 className="text-3xl font-brand font-black text-white tracking-tight">Growth & Planning</h1>
        <p className="text-slate-400">Architecting 2026 with discipline and depth.</p>
      </header>

      {/* Unified To-Do with Dynamic Categories */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Unified Strategy Board
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCatForm(!showCatForm)}
              className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-slate-900 transition-all flex items-center gap-1 text-[10px] font-black uppercase"
            >
              <Tag className="w-3 h-3" /> Cats
            </button>
            <button 
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-all"
            >
              {showTaskForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Category Management Form */}
        {showCatForm && (
          <div className="bg-slate-800/80 p-4 rounded-xl space-y-3 border border-slate-700 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Category Forge</span>
              <button onClick={() => setShowCatForm(false)} className="text-slate-500 hover:text-white"><X className="w-3 h-3"/></button>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Category Name..."
                className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                value={newCat.name}
                onChange={(e) => setNewCat({...newCat, name: e.target.value})}
              />
              <input 
                type="color" 
                className="w-10 h-10 bg-transparent border-none outline-none cursor-pointer"
                value={newCat.color}
                onChange={(e) => setNewCat({...newCat, color: e.target.value})}
              />
              <button onClick={handleAddCategory} className="bg-blue-500 text-slate-900 px-4 rounded-xl font-bold text-xs">ADD</button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {taskCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1 bg-slate-900 p-1 pl-2 pr-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] font-bold text-slate-300">{cat.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {!['fitness', 'brand', 'academy', 'growth'].includes(cat.id) && (
                    <button onClick={() => removeTaskCategory(cat.id)} className="text-slate-600 hover:text-red-500 ml-1">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Creation Form */}
        {showTaskForm && (
          <div className="bg-slate-800/50 p-4 rounded-xl space-y-4 border border-slate-700 animate-in zoom-in-95">
            <input 
              type="text" 
              placeholder="Task Objective..."
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-emerald-500 text-white"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1">Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {taskCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setNewTask({...newTask, category: cat.id})}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all truncate flex items-center justify-center gap-2 ${
                      newTask.category === cat.id 
                        ? 'bg-emerald-500 text-slate-900 border-emerald-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1">Priority Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Standard', 'Essential', 'Critical'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewTask({...newTask, priority: p})}
                    className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                      newTask.priority === p 
                        ? 'bg-slate-100 text-slate-900 border-slate-100 shadow-lg' 
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAddTask}
              className="w-full bg-emerald-500 text-slate-900 font-black uppercase py-3 rounded-2xl text-xs tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
            >
              Deploy Objective
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map(task => {
            const catColor = getCategoryColor(task.category);
            const catName = getCategoryName(task.category);
            return (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${
                  task.priority === 'Critical' ? 'priority-critical bg-slate-800/60' : 'bg-slate-800/40 border-slate-700'
                } ${task.completed ? 'opacity-40 grayscale border-slate-800 shadow-none' : 'hover:border-slate-500 shadow-xl shadow-slate-950/20'}`}
              >
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500/50'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: `${catColor}40`, borderLeft: `2px solid ${catColor}` }}
                    >
                      {catName}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${task.priority === 'Critical' ? 'text-yellow-500' : 'text-slate-500'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black text-emerald-500/80">+{task.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Founder's Journal */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Founder's Journal
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Morning Gratitude</span>
              </div>
              <textarea 
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-sm min-h-[80px] focus:border-emerald-500 outline-none text-white transition-all"
                placeholder="Today, I am grateful for..."
                value={todayEntry.morningGratitude}
                onChange={(e) => updateJournal({ morningGratitude: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Evening Reflection</span>
              </div>
              <textarea 
                className="w-full bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-sm min-h-[80px] focus:border-emerald-500 outline-none text-white transition-all"
                placeholder="What did I learn today?"
                value={todayEntry.eveningReflection}
                onChange={(e) => updateJournal({ eveningReflection: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Meditation Timer */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Shield className="w-5 h-5 text-emerald-400" />
                Deep Presence
             </div>
             <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Daily Focus</span>
          </div>

          <div className="py-8 text-center">
            <div className="text-6xl font-brand font-black text-white mb-2">{formatTime(meditationTime)}</div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Meditation Timer</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              {[5, 10, 20].map(m => (
                <button 
                  key={m}
                  onClick={() => { setMeditationDuration(m); setMeditationTime(m * 60); setIsTimerRunning(false); }}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${meditationDuration === m ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${isTimerRunning ? 'bg-slate-700 text-white' : 'bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/20'}`}
            >
              {isTimerRunning ? <><Pause className="w-5 h-5" /> Pause Session</> : <><Play className="w-5 h-5" /> Start Session</>}
            </button>
          </div>
        </div>
      </section>

      {/* 2026 Vision Calendar */}
      <section className="glass rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Calendar className="w-5 h-5 text-emerald-400" />
            2026 Vision Calendar
          </div>
          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700 overflow-x-auto">
            {(['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'] as const).map(view => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all ${calendarView === view ? 'bg-slate-100 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowMilestoneForm(true)}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group min-h-[160px]"
          >
            <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">New Milestone</p>
          </button>

          {milestones.filter(m => m.view === calendarView).map(m => (
            <div key={m.id} className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl space-y-3 relative group">
              <button 
                onClick={() => removeMilestone(m.id)}
                className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{calendarView}</span>
              </div>
              <h4 className="font-bold text-white text-sm leading-tight">{m.title}</h4>
              <p className="text-[10px] font-mono text-slate-500">{new Date(m.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        {showMilestoneForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass w-full max-w-sm rounded-3xl p-6 space-y-4 animate-in zoom-in-95">
              <h3 className="text-xl font-brand font-black text-white">Project Milestone</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Milestone Title..."
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-emerald-500 outline-none"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                />
                <input 
                  type="date" 
                  className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-emerald-500 outline-none"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleAddMilestone}
                  className="flex-1 bg-emerald-500 text-slate-900 font-bold py-3 rounded-xl"
                >
                  Deploy Milestone
                </button>
                <button 
                  onClick={() => setShowMilestoneForm(false)}
                  className="px-4 py-3 bg-slate-700 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
