
import React from 'react';
import { Machine } from '../types';
import { Activity, AlertTriangle, CheckCircle, MapPin, Gauge, ShieldAlert, Clock, IndianRupee } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  onClick: (m: Machine) => void;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick }) => {
  const isExtreme = machine.failureProbability > 85;

  const statusStyles = {
    healthy: 'border-emerald-500/20 hover:border-emerald-500/40',
    warning: 'border-amber-500/20 hover:border-amber-500/40',
    critical: 'border-rose-500/20 hover:border-rose-500/40'
  };

  const statusBadge = {
    healthy: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    critical: 'bg-rose-500/10 text-rose-500'
  };

  return (
    <div 
      onClick={() => onClick(machine)}
      className={`glass-card p-5 cursor-pointer transition-all hover:translate-y-[-4px] active:scale-[0.98] ${statusStyles[machine.status]} group relative overflow-hidden`}
    >
      {isExtreme && (
        <div className="absolute top-0 right-0">
          <div className="bg-rose-600 text-[8px] font-bold text-white px-2 py-1 uppercase tracking-widest rounded-bl-lg shadow-lg">
            High Risk
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[140px]">
            {machine.name}
          </h3>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            {machine.type}
          </span>
        </div>
        <div className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider ${statusBadge[machine.status]}`}>
          {machine.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="stat-label block mb-1">Risk</span>
          <span className={`text-xl font-bold ${isExtreme ? 'text-rose-500' : 'text-white'}`}>
            {machine.failureProbability}%
          </span>
        </div>
        <div>
          <span className="stat-label block mb-1">RUL</span>
          <span className="text-xl font-bold text-white">
            {machine.remainingUsefulLife}h
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-medium text-slate-500 uppercase">{machine.location}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-500">
          <IndianRupee className="w-3 h-3" />
          <span className="text-[10px] font-bold">₹{(machine.costImpact.potentialSavings / 1000).toFixed(1)}k</span>
        </div>
      </div>
    </div>
  );
};
