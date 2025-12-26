
export interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  lastActive: string;
}

export type Priority = 'Critical' | 'Essential' | 'Standard';

export interface Task {
  id: string;
  category: string; // Changed from fixed union to string to support custom categories
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: string;
  priority?: Priority;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

export type SupportedLanguage = 'dutch' | 'french' | 'arabic';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface StudyResource {
  id: string;
  title: string;
  url: string;
  category: 'Podcast' | 'Prose' | 'Essay' | 'Video' | 'Listening' | 'Gaming' | 'Music' | 'D&D' | 'Movies';
  language: SupportedLanguage;
}

export interface VocabularyTerm {
  id: string;
  term: string;
  translation: string;
  category: 'Gaming' | 'D&D' | 'Movies' | 'Education' | 'Music';
  language: SupportedLanguage;
  level?: CEFRLevel;
}

export interface LanguageHelp {
  translation: string;
  slangNotes: string;
  grammarTip: string;
  nuanceClue?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  help?: LanguageHelp;
}

export interface ScaffoldedDrill {
  englishSentence: string;
  targetSentence: string;
  wordBank: string[];
  hint: string;
  options?: string[]; // For A1/A2 Multiple Choice
}

export enum Page {
  HOME = 'home',
  BRAND = 'brand',
  HEALTH = 'health',
  ACADEMY = 'academy',
  GROWTH = 'growth'
}

export interface JournalEntry {
  date: string;
  morningGratitude: string;
  eveningReflection: string;
  meditationMinutes: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  view: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
}
