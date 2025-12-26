
import React, { useState } from 'react';
import { Instagram, Linkedin } from 'lucide-react';

export const SocialCalendar: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [schedule, setSchedule] = useState<Record<string, { li: boolean, ig: boolean }>>(
    days.reduce((acc, day) => ({ ...acc, [day]: { li: false, ig: false } }), {})
  );

  const toggle = (day: string, platform: 'li' | 'ig') => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [platform]: !prev[day][platform] }
    }));
  };

  return (
    <div className="glass rounded-2xl p-6 border-t-2 border-emerald-500/20">
      <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-500/70 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        Social Deployment Grid
      </h3>
      <div className="grid grid-cols-8 gap-3 sm:gap-4">
        <div className="flex flex-col gap-5 pt-8">
          <Linkedin className="w-4 h-4 text-slate-500" />
          <Instagram className="w-4 h-4 text-slate-500" />
        </div>
        {days.map(day => (
          <div key={day} className="flex flex-col items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">{day}</span>
            <button
              onClick={() => toggle(day, 'li')}
              className={`w-full aspect-square rounded-xl transition-all duration-300 ${schedule[day].li ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 border-transparent' : 'bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30'}`}
            />
            <button
              onClick={() => toggle(day, 'ig')}
              className={`w-full aspect-square rounded-xl transition-all duration-300 ${schedule[day].ig ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30 border-transparent' : 'bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
