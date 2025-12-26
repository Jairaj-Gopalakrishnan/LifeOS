
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
    <div className="glass rounded-2xl p-6">
      <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-4">Social Deployment Grid</h3>
      <div className="grid grid-cols-8 gap-2">
        <div className="flex flex-col gap-4 pt-8">
          <Linkedin className="w-4 h-4 text-slate-500" />
          <Instagram className="w-4 h-4 text-slate-500" />
        </div>
        {days.map(day => (
          <div key={day} className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold mb-1">{day}</span>
            <button
              onClick={() => toggle(day, 'li')}
              className={`w-full aspect-square rounded-md transition-all ${schedule[day].li ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border border-slate-700'}`}
            />
            <button
              onClick={() => toggle(day, 'ig')}
              className={`w-full aspect-square rounded-md transition-all ${schedule[day].ig ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border border-slate-700'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
