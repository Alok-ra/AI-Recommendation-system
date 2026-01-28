
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { SensorData } from '../types';

interface SensorChartsProps {
  history: SensorData[];
}

export const SensorCharts: React.FC<SensorChartsProps> = ({ history }) => {
  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: h.temperature,
    vibration: h.vibration * 100, // Scale for visibility
    pressure: h.pressure
  }));

  return (
    <div className="space-y-6">
      <div className="h-64 w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-inner">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Temperature Trends (°C)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
            <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Area type="monotone" dataKey="temp" stroke="#f43f5e" fillOpacity={1} fill="url(#colorTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64 w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-inner">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Vibration Levels (Intensity Index)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} />
            <YAxis stroke="#475569" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Line type="stepAfter" dataKey="vibration" stroke="#38bdf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
