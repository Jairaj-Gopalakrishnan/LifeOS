
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Circle, Dumbbell, Globe, Rocket } from 'lucide-react';

export const BigThreeCard: React.FC = () => {
  const { tasks, toggleTask } = useAppContext();

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fitness': return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'brand task': return <Rocket className="w-5 h-5 text-emerald-400" />;
      case 'language goal': return <Globe className="w-5 h-5 text-emerald-400" />;
      default: return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          The Big 3 Today
        </h2>
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">EXEC PRIORITY</span>
      </div>
      
      <div className="space-y-4">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`w-full group flex items-start gap-4 p-4 rounded-xl transition-all duration-300 border ${
              task.completed 
                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30'
            }`}
          >
            <div className="mt-0.5">
              {task.completed 
                ? <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" /> 
                : <Circle className="w-6 h-6 text-slate-500 group-hover:text-emerald-500 transition-colors" />
              }
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                {getIcon(task.type)}
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{task.type}</span>
              </div>
              <p className={`font-semibold text-sm sm:text-base ${task.completed ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                {task.title}
              </p>
              <p className="text-xs text-slate-500 mt-1">{task.description}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`text-xs font-bold ${task.completed ? 'text-slate-500' : 'text-emerald-500'}`}>
                +{task.xpReward} XP
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
