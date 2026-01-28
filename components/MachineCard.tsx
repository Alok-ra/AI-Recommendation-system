
import React from 'react';
import { Machine } from '../types';
import { Activity, AlertTriangle, CheckCircle, MapPin, Gauge, ShieldAlert, Clock, IndianRupee } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  onClick: (m: Machine) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick }) => {
  const isExtreme = machine.failureProbability > 85;

  const statusColors = {
    healthy: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    critical: isExtreme 
      ? 'bg-rose-600/20 border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  };

  const statusIcons = {
    healthy: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    critical: isExtreme ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />
  };

  return (
    <div 
      onClick={() => onClick(machine)}
      className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${statusColors[machine.status]} group bg-slate-900/40 backdrop-blur-sm shadow-lg relative overflow-hidden`}
    >
      {isExtreme && (
        <>
          <div className="absolute top-0 right-0 p-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <div className="absolute top-0 left-0 bg-rose-600 text-[8px] font-black text-white px-2 py-0.5 uppercase tracking-widest rounded-br-lg shadow-md z-10">
            Immediate Action
          </div>
        </>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors uppercase italic tracking-tighter">
            {machine.name}
          </h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {machine.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
           {statusIcons[machine.status]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Failure Risk</span>
          <span className={`text-2xl font-black ${isExtreme ? 'text-rose-500 animate-pulse' : machine.failureProbability > 70 ? 'text-rose-400' : 'text-slate-100'}`}>
            {machine.failureProbability}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">RUL (Hours)</span>
          <span className={`text-2xl font-black ${machine.remainingUsefulLife < 24 ? 'text-rose-400' : 'text-slate-100'}`}>
            ~{machine.remainingUsefulLife}h
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <IndianRupee className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Potential Savings</span>
          <span className="text-xs font-black text-emerald-400">₹{(machine.costImpact.potentialSavings / 1000).toFixed(1)}k Realizable</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 border-t border-slate-700/50 pt-4 uppercase tracking-widest">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-indigo-400" />
          {machine.location}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3 text-indigo-400" />
          {machine.remainingUsefulLife < 24 ? 'Critical' : 'Operational'}
        </div>
      </div>
    </div>
  );
};
