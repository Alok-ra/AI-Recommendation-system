
import React, { useState } from 'react';
import { Phone, Check, Smartphone, X } from 'lucide-react';

interface SmsNotificationBarProps {
  phoneNumber: string;
  onRegister: (phone: string) => void;
}

export const SmsNotificationBar: React.FC<SmsNotificationBarProps> = ({ phoneNumber, onRegister }) => {
  const [input, setInput] = useState(phoneNumber);
  const [isEditing, setIsEditing] = useState(!phoneNumber);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onRegister(input);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border-b border-slate-800/50 px-6 lg:px-10 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
          <Smartphone className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">SMS Gateway</p>
          <p className="text-[9px] text-slate-500 font-medium">Critical alerts via mobile network</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isEditing ? (
          <form onSubmit={handleRegister} className="flex items-center gap-2 animate-in slide-in-from-right-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
              <input
                type="tel"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:border-indigo-500/50 outline-none w-44 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            {phoneNumber && (
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        ) : (
          <div className="flex items-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-mono text-indigo-400">{phoneNumber}</span>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors border border-slate-800 px-2.5 py-1.5 rounded-lg hover:border-slate-700"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
