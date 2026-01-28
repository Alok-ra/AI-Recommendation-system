
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
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter">FLEET OPERATIONS</h2>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Economic & Predictive Intelligence Active
          </p>
        </div>
        <button 
          onClick={onGenerateReport} 
          className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
        >
          <FileText className="w-5 h-5" /> Generate Fleet Insight
        </button>
      </header>

      {/* Economic Impact Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute -right-10 -bottom-10 opacity-5">
              <TrendingUp className="w-64 h-64 text-emerald-400" />
           </div>
           <div>
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-2">Fleet Economic Impact</span>
             <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">₹{(totalPotentialSavings / 100000).toFixed(2)} Lakh Potential Savings</h3>
             <p className="text-slate-400 text-sm leading-relaxed max-w-md">Estimated capital recovery by performing proactive maintenance before critical failure thresholds are met.</p>
           </div>
           <div className="mt-8 flex gap-6">
             <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Preventive Cost</p>
               <p className="text-xl font-bold text-slate-100">₹{(machines.reduce((s,m)=>s+m.costImpact.preventiveCost, 0)/100000).toFixed(2)}L</p>
             </div>
             <div className="w-px bg-slate-800 h-10 my-auto" />
             <div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Avoided Downtime</p>
               <p className="text-xl font-bold text-emerald-400">₹{(totalPotentialSavings / 100000).toFixed(2)}L</p>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Asset Count</p>
             <p className="text-4xl font-black text-white">{machines.length}</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
             <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Exposure Risk</p>
             <p className="text-4xl font-black text-rose-500">₹{(totalBreakdownRisk / 100000).toFixed(2)}L</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
             <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Urgent Repairs</p>
             <p className="text-4xl font-black text-amber-500">{machines.filter(m => m.status === 'warning').length}</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Fleet Health Index</p>
             <p className="text-4xl font-black text-emerald-500">{(100 - (machines.reduce((a,b)=>a+b.failureProbability, 0)/machines.length)).toFixed(0)}%</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search asset ID or type..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-indigo-500 outline-none transition-all text-sm" 
          />
        </div>
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['all', 'healthy', 'warning', 'critical'] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-32">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white group transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to fleet view</span>
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
             <div className="flex items-center gap-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                 machine.status === 'critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-500' :
                 machine.status === 'warning' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' :
                 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
               }`}>
                 <Wrench className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{machine.name}</h2>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{machine.type} • {machine.location}</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               {l: 'Operating Temp', v: machine.sensorData.temperature.toFixed(1)+'°C'},
               {l: 'Vibration Index', v: machine.sensorData.vibration.toFixed(2)+' mm/s'},
               {l: 'RUL Prediction', v: machine.remainingUsefulLife+' Hours'},
               {l: 'Probable Failure', v: machine.failureProbability+'%'}
             ].map(s => (
               <div key={s.l} className="bg-slate-900/60 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-sm">
                 <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 tracking-widest">{s.l}</span>
                 <span className={`text-2xl font-black tracking-tight text-white`}>{s.v}</span>
               </div>
             ))}
          </div>

          {/* New Financial Impact Analysis Bar */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                 <IndianRupee className="w-8 h-8 text-emerald-400" />
               </div>
               <div>
                 <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Financial Risk Assessment</h4>
                 <p className="text-2xl font-black text-white italic tracking-tighter">₹{(machine.costImpact.potentialSavings / 1000).toFixed(1)}k Realizable Savings</p>
               </div>
            </div>
            <div className="flex gap-10 w-full md:w-auto">
               <div className="flex flex-col text-center md:text-right">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Failure Loss</span>
                 <span className="text-lg font-bold text-rose-500">₹{(machine.costImpact.breakdownCost / 1000).toFixed(1)}k</span>
               </div>
               <div className="flex flex-col text-center md:text-right">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Preventive CapEx</span>
                 <span className="text-lg font-bold text-slate-300">₹{(machine.costImpact.preventiveCost / 1000).toFixed(1)}k</span>
               </div>
            </div>
          </div>

          <SensorCharts history={machine.history} />

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
              <ClipboardList className="text-indigo-400 w-6 h-6" /> 
              Service Logbook
            </h3>
            <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {machine.logs.map(log => (
                 <div key={log.id} className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-black text-indigo-400 uppercase text-xs tracking-wider">{log.action}</p>
                       <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{log.notes}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operator: {log.operator}</p>
                 </div>
               ))}
            </div>
            
            <form onSubmit={submitLog} className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800 space-y-6">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Add Maintenance Entry</h4>
              <input 
                value={logAction} 
                onChange={e => setLogAction(e.target.value)} 
                type="text" 
                placeholder="Action taken..." 
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm outline-none" 
              />
              <textarea 
                value={logNotes} 
                onChange={e => setLogNotes(e.target.value)} 
                placeholder="Observations..." 
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-sm h-32 outline-none" 
              />
              <button className="px-8 py-4 bg-slate-800 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all">
                <PlusCircle className="w-4 h-4" /> Save Record
              </button>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0 space-y-6">
           <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="relative z-10 space-y-8 text-white">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6" />
                  <h3 className="text-xl font-bold italic tracking-tighter">AI DIAGNOSTIC</h3>
                </div>

                {!recommendation && !isAnalyzing ? (
                  <button onClick={handleAnalyze} className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl uppercase text-xs">Compute Protocol</button>
                ) : isAnalyzing ? (
                  <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                ) : (
                  <div className="space-y-4 text-sm">
                    <p className="font-bold">Root Cause: {recommendation?.rootCause}</p>
                    <ul className="list-disc pl-4 space-y-2">
                      {recommendation?.steps.map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
             </div>
           </div>

           <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl border-indigo-500/10">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white italic tracking-tighter uppercase">Scheduling Advisor</h3>
              </div>
              <div className="space-y-5">
                <div className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Recommended Window</span>
                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold">
                      {machine.suggestedSchedule ? new Date(machine.suggestedSchedule).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-3xl border border-slate-800">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Priority Level</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      machine.failureProbability > 75 ? 'bg-rose-500 animate-pulse' : 
                      machine.failureProbability > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className={`text-sm font-black uppercase tracking-widest ${
                      machine.failureProbability > 75 ? 'text-rose-500' : 
                      machine.failureProbability > 30 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {machine.failureProbability > 75 ? 'Immediate' : machine.failureProbability > 30 ? 'High' : 'Routine'}
                    </span>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] h-[350px] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                 <MessageSquare className="w-4 h-4 text-indigo-400" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Asset Support</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {chatHistory.map((h, i) => (
                   <div key={i} className={`flex ${h.role === 'u' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-xs ${h.role === 'u' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                        {h.text}
                      </div>
                   </div>
                 ))}
                 {isTyping && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
              </div>
              <form onSubmit={handleChat} className="p-4 bg-slate-950 flex gap-2">
                 <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} type="text" placeholder="Inquire state..." className="flex-1 bg-slate-900 p-4 rounded-xl text-xs text-white outline-none" />
                 <button className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Send className="w-4 h-4" /></button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const Sidebar = ({ unreadCount, onToggleAlerts }: { unreadCount: number, onToggleAlerts: () => void }) => {
  const { logout, user, role } = useAuth();
  return (
    <div className="w-20 lg:w-72 bg-slate-950 border-r border-slate-800 flex flex-col h-screen shrink-0 z-40">
      <div className="p-8 flex items-center gap-4">
        <Zap className="text-indigo-600 w-8 h-8" />
        <h1 className="hidden lg:block font-black text-lg text-white uppercase italic tracking-tighter leading-none">
          Maintenance <br/>
          <span className="text-indigo-400 text-xs tracking-widest not-italic font-bold">Recommendation System</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-3">
        <Link to="/" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 group">
          <LayoutDashboard className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
          <span className="hidden lg:block text-slate-400 group-hover:text-white font-black uppercase tracking-widest text-[10px]">Command Center</span>
        </Link>
        <button onClick={onToggleAlerts} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 group relative">
          <Bell className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
          <span className="hidden lg:block text-slate-400 group-hover:text-white font-black uppercase tracking-widest text-[10px]">Incident Log</span>
          {unreadCount > 0 && <span className="absolute top-4 left-9 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">{unreadCount}</span>}
        </button>
      </nav>
      <div className="p-6 border-t border-slate-900 space-y-6">
        <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group">
          <LogOut className="w-6 h-6" />
          <span className="hidden lg:block font-black uppercase tracking-widest text-[10px]">Terminal Logout</span>
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
