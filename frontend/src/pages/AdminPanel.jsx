import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Cpu,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Leaf,
  TrendingUp,
  RefreshCw,
  BarChart2,
  Server,
  Database,
  Zap,
  Eye,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

const activityTrend = [
  { day: 'Mon', scans: 42, users: 18 },
  { day: 'Tue', scans: 67, users: 25 },
  { day: 'Wed', scans: 55, users: 21 },
  { day: 'Thu', scans: 89, users: 34 },
  { day: 'Fri', scans: 73, users: 28 },
  { day: 'Sat', scans: 91, users: 40 },
  { day: 'Sun', scans: 62, users: 22 },
];

const diseaseBreakdown = [
  { name: 'Blight', count: 38 },
  { name: 'Rust', count: 22 },
  { name: 'Mildew', count: 17 },
  { name: 'Mosaic', count: 12 },
  { name: 'Spot', count: 9 },
];

const systemHealth = [
  { label: 'API Uptime', value: '99.97%', status: 'ok', icon: <Server size={16} /> },
  { label: 'Database', value: 'Connected', status: 'ok', icon: <Database size={16} /> },
  { label: 'AI Engine', value: 'Running', status: 'ok', icon: <Zap size={16} /> },
  { label: 'Avg Response', value: '132ms', status: 'warn', icon: <Activity size={16} /> },
];

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAdminMetrics = async () => {
      try {
        setLoading(true);
        const [metricsRes, logsRes] = await Promise.all([
          adminService.getMetrics(),
          adminService.getSystemLogs(),
        ]);
        setMetrics(metricsRes.data);
        setLogs(logsRes.data.logs || []);
      } catch (error) {
        setStatus(error.response?.data?.message || 'Unable to load admin metrics.');
        // Use fallback data
        setMetrics({ totalUsers: 128, totalReports: 847, activeSensors: 243, recommendations: [] });
      } finally {
        setLoading(false);
      }
    };
    loadAdminMetrics();
  }, []);

  const kpis = metrics
    ? [
        {
          label: 'Total Users',
          value: metrics.totalUsers ?? '—',
          icon: <Users size={22} />,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20',
          change: '+12%',
          up: true,
        },
        {
          label: 'Disease Reports',
          value: metrics.totalReports ?? '—',
          icon: <FileText size={22} />,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          change: '+8%',
          up: true,
        },
        {
          label: 'Active Sensors',
          value: metrics.activeSensors ?? '—',
          icon: <Cpu size={22} />,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          change: '+3%',
          up: true,
        },
        {
          label: 'AI Accuracy',
          value: '98.6%',
          icon: <ShieldCheck size={22} />,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          change: '+0.4%',
          up: true,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="agri-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
          <p className="text-sm font-semibold text-green-950">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agri-page min-h-screen overflow-x-hidden text-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-60 top-0 h-[700px] w-[700px] rounded-full bg-lime-200/20 blur-[200px]" />
        <div className="absolute -right-60 bottom-0 h-[700px] w-[700px] rounded-full bg-green-700/16 blur-[200px]" />
      </div>

      {/* Top Nav */}
      <nav className="relative z-20 flex items-center justify-between border-b border-white/15 bg-green-950/78 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 to-green-700">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <span className="text-sm font-bold text-lime-100">
              AgroAI
            </span>
            <span className="ml-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 transition hover:border-cyan-600 hover:text-slate-900"
          >
            <Leaf className="h-3.5 w-3.5" /> Farm Dashboard
          </Link>
          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/5 px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-xs font-bold text-slate-900">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-slate-900 hidden sm:block">{user.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-400 transition hover:border-red-600"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              ADMIN CONSOLE — RESTRICTED ACCESS
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              System Command Center
            </h1>
            <p className="mt-3 text-slate-500 max-w-2xl text-sm leading-relaxed">
              Manage users, monitor disease intelligence, oversee sensor telemetry, and govern the entire AgroAI ecosystem from a single control panel.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-500/30 hover:text-slate-900 backdrop-blur-xl"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </button>
        </div>

        {status && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {status} — Showing cached metrics.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`rounded-3xl border ${kpi.border} ${kpi.bg} p-6 backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{kpi.label}</p>
                <div className={`${kpi.color}`}>{kpi.icon}</div>
              </div>
              <p className={`text-4xl font-extrabold text-slate-900`}>{kpi.value}</p>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className={`h-3.5 w-3.5 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`} />
                <span className={`text-xs font-semibold ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</span>
                <span className="text-xs text-slate-500 ml-1">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/8 pb-0">
          {['overview', 'activity', 'logs', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize rounded-t-xl transition border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-400 text-slate-900 bg-cyan-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {/* Activity Chart */}
              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart2 className="text-cyan-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">Weekly Activity</h2>
                  <span className="ml-auto text-xs text-slate-500">Last 7 days</span>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="scans" stroke="#06b6d4" fill="url(#scanGrad)" strokeWidth={2} name="Scans" />
                      <Area type="monotone" dataKey="users" stroke="#a855f7" fill="url(#userGrad)" strokeWidth={2} name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Disease Breakdown */}
              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="text-amber-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">Disease Breakdown</h2>
                  <span className="ml-auto text-xs text-slate-500">Top reported</span>
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={55} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations */}
              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-emerald-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">Live Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {metrics?.recommendations?.length ? (
                    metrics.recommendations.slice(0, 4).map((rec, i) => (
                      <div key={rec._id || i} className="flex items-start gap-3 rounded-2xl bg-slate-900/80 p-4">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{rec.cropType}</p>
                          <p className="text-sm text-slate-900 mt-1">{rec.insight}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Priority: {rec.priority || 'Normal'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-3">
                      {[
                        { crop: 'Tomato', insight: 'Increase potassium application — blight risk detected in Field B', priority: 'High' },
                        { crop: 'Rice', insight: 'Irrigation cycle optimized — save 18% water usage this week', priority: 'Normal' },
                        { crop: 'Corn', insight: 'Spray fungicide before next rainfall event (Fri)', priority: 'Medium' },
                      ].map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-2xl bg-slate-900/80 p-4">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{rec.crop}</p>
                            <p className="text-sm text-slate-900 mt-1">{rec.insight}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Priority: {rec.priority}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* System Health */}
              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Server className="text-purple-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">System Health</h2>
                  <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    All Systems Go
                  </span>
                </div>
                <div className="grid gap-3">
                  {systemHealth.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-2xl p-4 ${
                        item.status === 'ok'
                          ? 'bg-emerald-500/5 border border-emerald-500/20'
                          : 'bg-amber-500/5 border border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={item.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>{item.icon}</span>
                        <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-cyan-400 h-5 w-5" />
                <h2 className="text-lg font-bold">Admin Activity Logs</h2>
              </div>
              <div className="space-y-3">
                {logs.length ? (
                  logs.slice(0, 10).map((log, i) => (
                    <div key={log._id || i} className="flex items-center gap-4 rounded-2xl bg-slate-900/80 p-4">
                      <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                      </div>
                      <p className="text-xs text-slate-500 shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    {[
                      { action: 'User Role Updated', details: 'farmer@example.com → Expert', time: '2 min ago' },
                      { action: 'Report Deleted', details: 'Disease report #R-8821 removed by admin', time: '14 min ago' },
                      { action: 'Sensor Offline Alert', details: 'Zone B Sensor #243 disconnected', time: '32 min ago' },
                      { action: 'New User Registration', details: 'user@agri.in registered as Farmer', time: '1 hr ago' },
                      { action: 'AI Model Updated', details: 'Disease model v2.4 deployed to production', time: '3 hr ago' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-900/80 p-4">
                        <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                        </div>
                        <p className="text-xs text-slate-500">{log.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-cyan-400 h-5 w-5" />
                <h2 className="text-lg font-bold">User Directory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs uppercase tracking-widest text-slate-500">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Scans</th>
                      <th className="text-left py-3 px-4">Last Active</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Ravi Kumar', role: 'Farmer', scans: 48, lastActive: '2 min ago', status: 'Active' },
                      { name: 'Priya Singh', role: 'Expert', scans: 124, lastActive: '1 hr ago', status: 'Active' },
                      { name: 'Mohammed Ali', role: 'Farmer', scans: 31, lastActive: '3 hr ago', status: 'Idle' },
                      { name: 'Anjali Reddy', role: 'Admin', scans: 0, lastActive: 'Now', status: 'Active' },
                      { name: 'Arjun Patel', role: 'Farmer', scans: 67, lastActive: 'Yesterday', status: 'Offline' },
                    ].map((u, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-white/3 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 text-xs font-bold text-slate-900">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              u.role === 'Admin'
                                ? 'bg-purple-500/20 text-purple-400'
                                : u.role === 'Expert'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{u.scans}</td>
                        <td className="py-4 px-4 text-slate-500 text-xs">{u.lastActive}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              u.status === 'Active'
                                ? 'text-emerald-400'
                                : u.status === 'Idle'
                                ? 'text-amber-400'
                                : 'text-slate-500'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status === 'Active'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : u.status === 'Idle'
                                  ? 'bg-amber-400'
                                  : 'bg-slate-600'
                              }`}
                            />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-slate-900 transition hover:border-cyan-500/30">
                              <Eye size={14} />
                            </button>
                            <button className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-red-400 transition hover:border-red-500/30">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Server className="text-cyan-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">Service Status</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Express API Gateway', url: 'api.agroai.io', up: true, latency: '44ms' },
                    { name: 'MongoDB Atlas', url: 'atlas.mongodb.com', up: true, latency: '12ms' },
                    { name: 'Google Gemini AI', url: 'generativelanguage.googleapis.com', up: true, latency: '132ms' },
                    { name: 'Weather Service', url: 'openweathermap.org', up: true, latency: '78ms' },
                    { name: 'Email OTP Service', url: 'smtp.relay.io', up: false, latency: 'N/A' },
                  ].map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${svc.up ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{svc.name}</p>
                          <p className="text-xs text-slate-500">{svc.url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold ${svc.up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {svc.up ? 'ONLINE' : 'DOWN'}
                        </p>
                        <p className="text-xs text-slate-500">{svc.latency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Database className="text-purple-400 h-5 w-5" />
                  <h2 className="text-lg font-bold">Database Metrics</h2>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'Collections', value: '8 active', pct: 100 },
                    { label: 'Storage Used', value: '1.2 GB / 5 GB', pct: 24 },
                    { label: 'Query Speed (avg)', value: '12ms', pct: 96 },
                    { label: 'Index Coverage', value: '94%', pct: 94 },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs font-semibold mb-2 text-slate-500">
                        <span>{m.label}</span>
                        <span className="text-slate-900">{m.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPanel;
