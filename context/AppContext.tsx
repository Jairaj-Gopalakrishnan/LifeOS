
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserStats, Task, Page, StudyResource, JournalEntry, Milestone } from '../types';

interface AppContextType {
  stats: UserStats;
  tasks: Task[];
  resources: StudyResource[];
  journal: JournalEntry[];
  milestones: Milestone[];
  addXp: (amount: number) => void;
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  addResource: (res: Omit<StudyResource, 'id'>) => void;
  removeResource: (id: string) => void;
  updateJournal: (entry: Partial<JournalEntry>) => void;
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  removeMilestone: (id: string) => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activePage, setActivePage] = useState<Page>(Page.HOME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('lifeos_stats');
      const savedTasks = localStorage.getItem('lifeos_tasks');
      const savedResources = localStorage.getItem('lifeos_resources');
      const savedJournal = localStorage.getItem('lifeos_journal');
      const savedMilestones = localStorage.getItem('lifeos_milestones');

      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedResources) setResources(JSON.parse(savedResources));
      if (savedJournal) setJournal(JSON.parse(savedJournal));
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      
      setIsLoaded(true);
    }
  }, []);

  // Persist state to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('lifeos_stats', JSON.stringify(stats));
      localStorage.setItem('lifeos_tasks', JSON.stringify(tasks));
      localStorage.setItem('lifeos_resources', JSON.stringify(resources));
      localStorage.setItem('lifeos_journal', JSON.stringify(journal));
      localStorage.setItem('lifeos_milestones', JSON.stringify(milestones));
    }
  }, [stats, tasks, resources, journal, milestones, isLoaded]);

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
    const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), completed: false };
    setTasks(prev => [newTask, ...prev]);
  };

  const addResource = (res: Omit<StudyResource, 'id'>) => {
    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9) };
    setResources(prev => [newRes, ...prev]);
  };

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
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
    const newM = { ...m, id: Math.random().toString(36).substr(2, 9) };
    setMilestones(prev => [newM, ...prev]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      stats, tasks, resources, journal, milestones,
      addXp, toggleTask, addTask, addResource, removeResource, 
      updateJournal, addMilestone, removeMilestone,
      activePage, setActivePage 
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
