
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserStats, Task, Page, StudyResource, JournalEntry, Milestone, VocabularyTerm } from '../types';

interface AppContextType {
  stats: UserStats;
  tasks: Task[];
  resources: StudyResource[];
  vocabulary: VocabularyTerm[];
  journal: JournalEntry[];
  milestones: Milestone[];
  addXp: (amount: number) => void;
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  addResource: (res: Omit<StudyResource, 'id'>) => void;
  removeResource: (id: string) => void;
  addVocabulary: (term: Omit<VocabularyTerm, 'id'>) => void;
  updateVocabulary: (id: string, term: Partial<VocabularyTerm>) => void;
  removeVocabulary: (id: string) => void;
  updateJournal: (entry: Partial<JournalEntry>) => void;
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  removeMilestone: (id: string) => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
  isLoaded: boolean;
}

const DEFAULT_STATS: UserStats = {
  level: 12,
  xp: 450,
  nextLevelXp: 1000,
  streak: 8,
  lastActive: new Date().toISOString()
};

const INITIAL_TASKS: Task[] = [
  { id: '1', category: 'fitness', title: 'Power Session', description: '45min HIIT / Strength Training', xpReward: 150, completed: false, type: 'Fitness', priority: 'Essential' },
  { id: '2', category: 'brand', title: 'Content Forge', description: 'Draft 2 LinkedIn Posts & Newsletter', xpReward: 200, completed: false, type: 'Brand Task', priority: 'Critical' },
  { id: '3', category: 'academy', title: 'Daily Study Quest', description: '10min AI Chat or Add Resource', xpReward: 100, completed: false, type: 'Language Goal', priority: 'Standard' }
];

const SEED_VOCAB: VocabularyTerm[] = [
  { id: '1', term: 'Samenspel', translation: 'Cooperation', category: 'Gaming', language: 'dutch', level: 'B1' },
  { id: '2', term: 'Stratégie', translation: 'Strategy', category: 'Gaming', language: 'french', level: 'B2' },
  { id: '3', term: 'إستراتيجية', translation: 'Strategy', category: 'Gaming', language: 'arabic', level: 'B2' },
  { id: '4', term: 'Onderwijs', translation: 'Education', category: 'Education', language: 'dutch', level: 'B1' },
  { id: '5', term: 'Réalisateur', translation: 'Director', category: 'Movies', language: 'french', level: 'B2' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyTerm[]>(SEED_VOCAB);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activePage, setActivePage] = useState<Page>(Page.HOME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("LifeOS: Starting system hydration...");
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn("LifeOS: Hydration timeout. Forcing system mount.");
        setIsLoaded(true);
      }
    }, 2000);

    if (typeof window !== 'undefined') {
      try {
        const get = (key: string) => {
          const val = localStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        };

        const s = get('lifeos_stats');
        const t = get('lifeos_tasks');
        const r = get('lifeos_resources');
        const v = get('lifeos_vocabulary');
        const j = get('lifeos_journal');
        const m = get('lifeos_milestones');

        if (s) setStats(s);
        if (t) setTasks(t);
        if (r) setResources(r);
        if (v) setVocabulary(v);
        if (j) setJournal(j);
        if (m) setMilestones(m);
        
        console.log("LifeOS: Data persistence linked.");
      } catch (e) {
        console.error("LifeOS: Persistence Link Failure", e);
      } finally {
        setIsLoaded(true);
        clearTimeout(timeout);
      }
    }
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('lifeos_stats', JSON.stringify(stats));
        localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
        localStorage.setItem('lifeos_resources', JSON.stringify(resources));
        localStorage.setItem('lifeos_vocabulary', JSON.stringify(vocabulary));
        localStorage.setItem('lifeos_journal', JSON.stringify(journal));
        localStorage.setItem('lifeos_milestones', JSON.stringify(milestones));
      } catch (e) {
        console.error("LifeOS: Persistence Save Failure", e);
      }
    }
  }, [stats, tasks, resources, vocabulary, journal, milestones, isLoaded]);

  const addXp = useCallback((amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextLevelXp = prev.nextLevelXp;

      while (newXp >= newNextLevelXp) {
        newXp -= newNextLevelXp;
        newLevel += 1;
        newNextLevelXp = Math.floor(newNextLevelXp * 1.15);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextLevelXp,
        lastActive: new Date().toISOString()
      };
    });
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        if (!task.completed) addXp(task.xpReward);
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), completed: false } as Task;
    setTasks(prev => [newTask, ...prev]);
  };

  const addResource = (res: Omit<StudyResource, 'id'>) => {
    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9) } as StudyResource;
    setResources(prev => [newRes, ...prev]);
  };

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const addVocabulary = (term: Omit<VocabularyTerm, 'id'>) => {
    const newTerm = { ...term, id: Math.random().toString(36).substr(2, 9) } as VocabularyTerm;
    setVocabulary(prev => [newTerm, ...prev]);
  };

  const updateVocabulary = (id: string, term: Partial<VocabularyTerm>) => {
    setVocabulary(prev => prev.map(v => v.id === id ? { ...v, ...term } : v));
  };

  const removeVocabulary = (id: string) => {
    setVocabulary(prev => prev.filter(v => v.id !== id));
  };

  const updateJournal = (entryUpdate: Partial<JournalEntry>) => {
    const today = new Date().toISOString().split('T')[0];
    setJournal(prev => {
      const existing = prev.find(e => e.date === today);
      if (existing) {
        return prev.map(e => e.date === today ? { ...e, ...entryUpdate } : e);
      } else {
        return [{ 
          date: today, 
          morningGratitude: '', 
          eveningReflection: '', 
          meditationMinutes: 0, 
          ...entryUpdate 
        }, ...prev];
      }
    });
  };

  const addMilestone = (m: Omit<Milestone, 'id'>) => {
    const newM = { ...m, id: Math.random().toString(36).substr(2, 9) } as Milestone;
    setMilestones(prev => [newM, ...prev]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      stats, tasks, resources, vocabulary, journal, milestones,
      addXp, toggleTask, addTask, addResource, removeResource,
      addVocabulary, updateVocabulary, removeVocabulary,
      updateJournal, addMilestone, removeMilestone,
      activePage, setActivePage, isLoaded 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
