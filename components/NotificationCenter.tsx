
import React from 'react';
import { Alert } from '../types';
import { Bell, X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface NotificationCenterProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  alerts, onMarkRead, onClearAll, isOpen, onClose 
}) => {
  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.read).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-80 lg:w-96 bg-slate-900 border-l border-slate-800 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white uppercase italic tracking-tighter">System Alerts</h2>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-4 ring-slate-900">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 opacity-30 italic">
            <Bell className="w-8 h-8" />
            <p className="text-[10px] font-black uppercase tracking-widest">No active incidents</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                alert.read 
                  ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                  : alert.severity === 'high' 
                    ? 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                    : 'bg-slate-800 border-indigo-500/30 shadow-lg'
              }`}
              onClick={() => onMarkRead(alert.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
                      {alert.machineName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {alert.message}
                  </div>
                  {!alert.read && (
                    <div className="mt-3 text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                      Pending Action
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <button 
            onClick={onClearAll}
            className="w-full py-3 text-[10px] font-black text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-[0.2em]"
          >
            Purge Incident Archive
          </button>
        </div>
      )}
    </div>
  );
};
