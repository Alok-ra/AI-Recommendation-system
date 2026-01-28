
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
    <div className="bg-indigo-600/10 border-b border-indigo-500/20 px-8 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">SMS Gateway</p>
          <p className="text-[10px] text-slate-400 font-medium">Critical alerts via mobile network</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isEditing ? (
          <form onSubmit={handleRegister} className="flex items-center gap-2 animate-in slide-in-from-right-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="tel"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none w-48 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Check className="w-4 h-4" />
            </button>
            {phoneNumber && (
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        ) : (
          <div className="flex items-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-indigo-300">{phoneNumber}</span>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors border border-slate-800 px-3 py-1.5 rounded-lg hover:border-slate-700"
            >
              Change Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
