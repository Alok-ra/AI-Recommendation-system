
import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { 
  INITIAL_MACHINES, 
  getNextDataPoint, 
  predictFailure 
} from './services/mockDataService';
import { 
  getMaintenanceAnalysis, 
  generateFleetReport, 
  askMachineChat 
} from './services/geminiService';
import { Machine, MaintenanceRecommendation, Alert, UserRole, MaintenanceLog, MachineStatus } from './types';
import { MachineCard } from './components/MachineCard';
import { SensorCharts } from './components/SensorCharts';
import { NotificationCenter } from './components/NotificationCenter';
import { SmsNotificationBar } from './components/SmsNotificationBar';
import { FleetAssistant } from './components/FleetAssistant';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  BrainCircuit, 
  Search,
  Zap,
  Loader2,
  ArrowLeft,
  Wrench,
  Database,
  User as UserIcon,
  LogOut,
  FileText,
  MessageSquare,
  Send,
  PlusCircle,
  Smartphone,
  ShieldCheck,
  ClipboardList,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  X 
} from 'lucide-react';

// --- Auth Context ---

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: string | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('mrs_auth') === 'true');
  const [role, setRole] = useState<UserRole | null>(() => localStorage.getItem('mrs_role') as UserRole || null);
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('mrs_user') || null);

  const login = (u: string, p: string) => {
    if (u === 'admin' && p === 'admin') {
      setIsAuthenticated(true);
      setRole('admin');
      setUser('Plant Manager');
      localStorage.setItem('mrs_auth', 'true');
      localStorage.setItem('mrs_role', 'admin');
      localStorage.setItem('mrs_user', 'Plant Manager');
      return true;
    } else if (u === 'user' && p === 'user') {
      setIsAuthenticated(true);
      setRole('engineer');
      setUser('Site Engineer');
      localStorage.setItem('mrs_auth', 'true');
      localStorage.setItem('mrs_role', 'engineer');
      localStorage.setItem('mrs_user', 'Site Engineer');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

// --- Modals ---

const ReportModal = ({ content, onClose }: { content: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <FileText className="text-indigo-400 w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Fleet Intelligence Summary</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 text-slate-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
        {content}
      </div>
      <div className="p-6 border-t border-slate-800 flex justify-end gap-4">
        <button onClick={() => window.print()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">Download PDF</button>
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">Close</button>
      </div>
    </div>
  </div>
);

// --- Pages ---

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (login(username, password)) navigate('/');
      else { setError('Invalid industrial credentials.'); setLoading(false); }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%)] opacity-30 pointer-events-none" />
      <div className="w-full max-w-lg relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6 ring-4 ring-indigo-500/10">
            <Zap className="text-white w-12 h-12" />
          </div>
          <h1 className="font-black text-4xl text-white uppercase italic tracking-tighter leading-none">
            Maintenance <br/>
            <span className="text-indigo-400 text-2xl tracking-widest not-italic font-bold">Recommendation System</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-4 text-[10px]">AI-Powered Predictive Maintenance Portal</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Credential ID</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="admin / user" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="••••••••" />
            </div>
            {error && <p className="text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center h-14">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Authorize Access'}
            </button>
          </form>
          <div className="mt-8 text-center opacity-40">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Demo: admin/admin or user/user</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ machines, onGenerateReport }: { machines: Machine[], onGenerateReport: () => void }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | MachineStatus>('all');

  const filtered = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPotentialSavings = machines.reduce((sum, m) => sum + m.costImpact.potentialSavings, 0);
  const totalBreakdownRisk = machines.reduce((sum, m) => sum + m.costImpact.breakdownCost, 0);

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Fleet Overview</h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Predictive intelligence monitoring {machines.length} assets
          </p>
        </div>
        <button 
          onClick={onGenerateReport} 
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 text-sm"
        >
          <FileText className="w-4 h-4" /> Generate Fleet Report
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="stat-label">Potential Savings</span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-emerald-400">₹{(totalPotentialSavings / 100000).toFixed(2)}L</span>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Capital Recovery Opportunity</p>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="stat-label">Exposure Risk</span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-rose-500">₹{(totalBreakdownRisk / 100000).toFixed(2)}L</span>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Unmitigated Failure Cost</p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="stat-label">Fleet Health Index</span>
          <div className="mt-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{(100 - (machines.reduce((a,b)=>a+b.failureProbability, 0)/machines.length)).toFixed(0)}%</span>
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Aggregate Reliability Score</p>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between min-h-[140px]">
          <span className="stat-label">Maintenance Status</span>
          <div className="mt-2 flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold text-amber-500">{machines.filter(m => m.status === 'warning').length}</span>
              <p className="text-[8px] text-slate-500 uppercase">Warning</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-2xl font-bold text-rose-500">{machines.filter(m => m.status === 'critical').length}</span>
              <p className="text-[8px] text-slate-500 uppercase">Critical</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by asset name or type..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:border-indigo-500/50 outline-none transition-all text-sm placeholder:text-slate-600" 
          />
        </div>
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {(['all', 'healthy', 'warning', 'critical'] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filtered.map(m => (
          <MachineCard key={m.id} machine={m} onClick={() => navigate(`/machine/${m.id}`)} />
        ))}
      </div>
    </div>
  );
};

const MachineDetails = ({ machines, onAddLog }: { machines: Machine[], onAddLog: (mid: string, action: string, notes: string) => void }) => {
  const { id } = useParams();
  const machine = machines.find(m => m.id === id);
  const [recommendation, setRecommendation] = useState<MaintenanceRecommendation | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'u'|'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logAction, setLogAction] = useState('');
  const [logNotes, setLogNotes] = useState('');

  if (!machine) return <Navigate to="/" />;

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const msg = chatMsg;
    setChatMsg('');
    setChatHistory(prev => [...prev, {role: 'u', text: msg}]);
    setIsTyping(true);
    const reply = await askMachineChat(msg, machine);
    setIsTyping(false);
    setChatHistory(prev => [...prev, {role: 'ai', text: reply}]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const res = await getMaintenanceAnalysis(machine);
    setRecommendation(res);
    setIsAnalyzing(false);
  };

  const submitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAction.trim()) return;
    onAddLog(machine.id, logAction, logNotes);
    setLogAction('');
    setLogNotes('');
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto pb-32">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white group transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Fleet</span>
        </Link>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          machine.status === 'critical' ? 'bg-rose-500/10 text-rose-500' :
          machine.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
          'bg-emerald-500/10 text-emerald-500'
        }`}>
          {machine.status} Status
        </div>
      </div>
      
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center gap-6">
             <div className="flex items-center gap-4">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg ${
                 machine.status === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                 machine.status === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
               }`}>
                 <Wrench className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-4xl font-bold text-white tracking-tight">{machine.name}</h2>
                 <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{machine.type} • {machine.location}</p>
               </div>
             </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               {l: 'Operating Temp', v: machine.sensorData.temperature.toFixed(1)+'°C'},
               {l: 'Vibration Index', v: machine.sensorData.vibration.toFixed(2)+' mm/s'},
               {l: 'RUL Prediction', v: machine.remainingUsefulLife+' Hours'},
               {l: 'Failure Prob.', v: machine.failureProbability+'%'}
             ].map(s => (
               <div key={s.l} className="glass-card p-6">
                 <span className="stat-label block mb-1">{s.l}</span>
                 <span className="text-2xl font-bold text-white tracking-tight">{s.v}</span>
               </div>
             ))}
          </div>

          <div className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                 <IndianRupee className="w-6 h-6 text-emerald-400" />
               </div>
               <div>
                 <h4 className="stat-label mb-1">Financial Risk Assessment</h4>
                 <p className="text-2xl font-bold text-white tracking-tight">₹{(machine.costImpact.potentialSavings / 1000).toFixed(1)}k Realizable Savings</p>
               </div>
            </div>
            <div className="flex gap-10">
               <div>
                 <span className="stat-label">Failure Loss</span>
                 <p className="text-lg font-bold text-rose-500 mt-1">₹{(machine.costImpact.breakdownCost / 1000).toFixed(1)}k</p>
               </div>
               <div>
                 <span className="stat-label">Preventive Cost</span>
                 <p className="text-lg font-bold text-slate-300 mt-1">₹{(machine.costImpact.preventiveCost / 1000).toFixed(1)}k</p>
               </div>
            </div>
          </div>

          <SensorCharts history={machine.history} />

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <ClipboardList className="text-indigo-400 w-5 h-5" /> 
              Maintenance Log
            </h3>
            <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {machine.logs.map(log => (
                 <div key={log.id} className="p-5 bg-slate-950/40 border border-slate-800/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider">{log.action}</p>
                       <span className="text-[10px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{log.notes}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Operator: {log.operator}</p>
                 </div>
               ))}
            </div>
            
            <form onSubmit={submitLog} className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 space-y-4">
              <h4 className="stat-label">New Entry</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  value={logAction} 
                  onChange={e => setLogAction(e.target.value)} 
                  type="text" 
                  placeholder="Action taken..." 
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50" 
                />
                <button className="px-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all">
                  <PlusCircle className="w-4 h-4" /> Save Record
                </button>
              </div>
              <textarea 
                value={logNotes} 
                onChange={e => setLogNotes(e.target.value)} 
                placeholder="Detailed observations..." 
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm h-24 outline-none focus:border-indigo-500/50" 
              />
            </form>
          </div>
        </div>

        <div className="w-full xl:w-96 shrink-0 space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-6 text-white">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6" />
                  <h3 className="text-lg font-bold tracking-tight">AI Diagnostic</h3>
                </div>

                {!recommendation && !isAnalyzing ? (
                  <button onClick={handleAnalyze} className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg">Run Analysis</button>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Processing Sensor Data...</span>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Root Cause</p>
                      <p className="font-medium">{recommendation?.rootCause}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Recommended Steps</p>
                      <ul className="space-y-2">
                        {recommendation?.steps.map((s,i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i+1}</span>
                            <span className="text-xs opacity-90">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
             </div>
           </div>

           <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Advisor</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                  <span className="stat-label block mb-2">Schedule Window</span>
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold">
                      {machine.suggestedSchedule ? new Date(machine.suggestedSchedule).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                  <span className="stat-label block mb-2">Priority</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      machine.failureProbability > 75 ? 'bg-rose-500 animate-pulse' : 
                      machine.failureProbability > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      machine.failureProbability > 75 ? 'text-rose-500' : 
                      machine.failureProbability > 30 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {machine.failureProbability > 75 ? 'Immediate' : machine.failureProbability > 30 ? 'High' : 'Routine'}
                    </span>
                  </div>
                </div>
              </div>
           </div>

           <div className="glass-card h-[400px] flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
                 <MessageSquare className="w-4 h-4 text-indigo-400" />
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Asset Support</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                 {chatHistory.map((h, i) => (
                   <div key={i} className={`flex ${h.role === 'u' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-xs ${h.role === 'u' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        {h.text}
                      </div>
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex justify-start">
                     <div className="bg-slate-800 p-3 rounded-xl">
                       <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                     </div>
                   </div>
                 )}
              </div>
              <form onSubmit={handleChat} className="p-4 bg-slate-950/50 flex gap-2 border-t border-slate-800/50">
                 <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} type="text" placeholder="Ask about this asset..." className="flex-1 bg-slate-900 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50 transition-all" />
                 <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-all"><Send className="w-4 h-4" /></button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const Sidebar = ({ unreadCount, onToggleAlerts }: { unreadCount: number, onToggleAlerts: () => void }) => {
  const { logout, user } = useAuth();
  return (
    <div className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800/60 flex flex-col h-screen shrink-0 z-40">
      <div className="p-6 lg:p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <Zap className="text-white w-6 h-6" />
        </div>
        <h1 className="hidden lg:block font-bold text-sm text-white tracking-tight leading-tight">
          Maintenance<br/>
          <span className="text-indigo-400 text-[10px] font-medium tracking-wider uppercase">Advisor Pro</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900/50 transition-all group">
          <LayoutDashboard className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden lg:block text-slate-400 group-hover:text-white font-medium text-sm">Dashboard</span>
        </Link>
        <button onClick={onToggleAlerts} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900/50 transition-all group relative">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden lg:block text-slate-400 group-hover:text-white font-medium text-sm">Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-3 left-7 lg:left-auto lg:right-4 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-rose-500/20">
              {unreadCount}
            </span>
          )}
        </button>
      </nav>

      <div className="p-4 border-t border-slate-900">
        <div className="hidden lg:flex items-center gap-3 px-4 py-4 mb-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authorized</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group">
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState<string>(() => localStorage.getItem('mrs_phone') || '');
  const [smsNotification, setSmsNotification] = useState<{msg: string, to: string} | null>(null);
  const extremeAlertsRef = useRef<Set<string>>(new Set());

  const addAlert = useCallback((m: Machine, msg: string, sev: 'low'|'medium'|'high' = 'medium') => {
    setAlerts(p => {
      const newAlert: Alert = {
        id: Math.random().toString(36).substr(2,9), 
        machineId: m.id, 
        machineName: m.name, 
        type: 'threshold_exceeded', 
        severity: sev, 
        message: msg, 
        timestamp: new Date().toISOString(), 
        read: false
      };
      
      if (sev === 'high' && registeredPhone) {
        setSmsNotification({ msg, to: registeredPhone });
        setTimeout(() => setSmsNotification(null), 8000);
      }

      return [newAlert, ...p].slice(0, 50);
    });
  }, [registeredPhone]);

  const addLog = (mid: string, action: string, notes: string) => {
    setMachines(prev => prev.map(m => m.id === mid ? {...m, logs: [{id: Date.now().toString(), timestamp: new Date().toISOString(), operator: localStorage.getItem('mrs_user') || 'System', action, notes}, ...m.logs]} : m));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const res = await generateFleetReport(machines);
    setReport(res);
    setIsGenerating(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setMachines(prev => {
        return prev.map(m => {
          const next = getNextDataPoint(m.sensorData, m.type);
          const pred = predictFailure(next, m.type);
          const { probability, riskLevel, remainingUsefulLife, suggestedSchedule, costImpact } = pred;
          
          if (probability > 85 && !extremeAlertsRef.current.has(m.id)) {
            extremeAlertsRef.current.add(m.id);
            getMaintenanceAnalysis({ ...m, failureProbability: probability, sensorData: next }).then(aiRec => {
              const detailedMsg = `CRITICAL ALERT: ${aiRec.summary}\n\nROOT CAUSE: ${aiRec.rootCause}\n\nESTIMATED RUL: ${remainingUsefulLife} Hours\n\nREQUIRED STEPS:\n${aiRec.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nECON IMPACT: ₹${(costImpact.potentialSavings/1000).toFixed(1)}k Realizable Savings`;
              addAlert(m, detailedMsg, 'high');
            });
          } else if (probability <= 85 && m.status !== riskLevel && riskLevel !== 'healthy') {
             addAlert(m, `Maintenance warning: ${m.name} entered ${riskLevel.toUpperCase()} state (Risk: ${probability}%, RUL: ${remainingUsefulLife}h)`, 'medium');
          } else if (probability < 80) {
            extremeAlertsRef.current.delete(m.id);
          }

          return {
            ...m, 
            sensorData: next, 
            history: [...m.history.slice(-19), next], 
            failureProbability: probability, 
            status: riskLevel,
            remainingUsefulLife,
            suggestedSchedule,
            costImpact
          };
        });
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [addAlert]);

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-slate-950 overflow-hidden relative">
                <Sidebar unreadCount={alerts.filter(a => !a.read).length} onToggleAlerts={() => setIsAlertsOpen(!isAlertsOpen)} />
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                  <SmsNotificationBar phoneNumber={registeredPhone} onRegister={p => { setRegisteredPhone(p); localStorage.setItem('mrs_phone', p); }} />
                  <div className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard machines={machines} onGenerateReport={handleGenerateReport} />} />
                      <Route path="/machine/:id" element={<MachineDetails machines={machines} onAddLog={addLog} />} />
                    </Routes>
                  </div>
                </main>
                <NotificationCenter alerts={alerts} isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} onMarkRead={id => setAlerts(p => p.map(a => a.id === id ? {...a, read: true} : a))} onClearAll={() => setAlerts([])} />
                <FleetAssistant machines={machines} />
                
                {smsNotification && (
                  <div className="fixed bottom-10 right-10 z-[100] bg-white text-slate-900 p-6 rounded-[2rem] shadow-2xl border-l-8 border-indigo-600 flex flex-col gap-4 animate-in slide-in-from-right duration-500 max-w-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-600 uppercase">Incoming SMS: {smsNotification.to}</span>
                      <Smartphone className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{smsNotification.msg}</p>
                  </div>
                )}

                {isGenerating && <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center text-white font-black">Generating Report...</div>}
                {report && <ReportModal content={report} onClose={() => setReport(null)} />}
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
