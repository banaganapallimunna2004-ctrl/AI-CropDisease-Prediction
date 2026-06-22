import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  Activity,
  Droplets,
  Sprout,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  Thermometer,
  ShieldCheck
} from "lucide-react";

export default function AIAnalytics() {
  // Simulator state variables
  const [moisture, setMoisture] = useState(68);
  const [nitrogen, setNitrogen] = useState(45);
  const [phosphorus, setPhosphorus] = useState(38);
  const [potassium, setPotassium] = useState(62);
  const [canopyCover, setCanopyCover] = useState(72);
  const [temp, setTemp] = useState(28);

  // Dynamic calculations based on simulator sliders
  const healthScore = useMemo(() => {
    const moistureScore = 100 - Math.abs(moisture - 70) * 1.5;
    const npkScore = 100 - (Math.abs(nitrogen - 50) + Math.abs(phosphorus - 40) + Math.abs(potassium - 60)) * 0.5;
    const tempScore = 100 - Math.abs(temp - 26) * 2;
    return Math.min(100, Math.max(20, Math.round((moistureScore * 0.4) + (npkScore * 0.4) + (tempScore * 0.2))));
  }, [moisture, nitrogen, phosphorus, potassium, temp]);

  const yieldProjection = useMemo(() => {
    const baseYield = 4.2; // Tons/Hectare
    const multiplier = (healthScore / 100) * (canopyCover / 100) * 1.3;
    return Math.max(1.5, Number((baseYield * multiplier).toFixed(2)));
  }, [healthScore, canopyCover]);

  // Chart Data
  const npkData = useMemo(() => [
    { name: "Nitrogen (N)", current: nitrogen, optimal: 50 },
    { name: "Phosphorus (P)", current: phosphorus, optimal: 40 },
    { name: "Potassium (K)", current: potassium, optimal: 60 }
  ], [nitrogen, phosphorus, potassium]);

  const moistureTrendData = useMemo(() => [
    { day: "Mon", moisture: Math.round(moisture * 0.9) },
    { day: "Tue", moisture: Math.round(moisture * 0.95) },
    { day: "Wed", moisture: moisture },
    { day: "Thu", moisture: Math.round(moisture * 1.05) },
    { day: "Fri", moisture: Math.round(moisture * 1.02) },
    { day: "Sat", moisture: Math.round(moisture * 0.98) },
    { day: "Sun", moisture: Math.round(moisture * 0.96) }
  ], [moisture]);

  const projectionData = useMemo(() => [
    { month: "Sowing", current: 0, projected: 0.5 },
    { month: "Vegetative", current: yieldProjection * 0.2, projected: yieldProjection * 0.25 },
    { month: "Flowering", current: yieldProjection * 0.5, projected: yieldProjection * 0.55 },
    { month: "Pod Development", current: yieldProjection * 0.8, projected: yieldProjection * 0.85 },
    { month: "Harvest", current: yieldProjection, projected: yieldProjection }
  ], [yieldProjection]);

  return (
    <div className="agri-page text-slate-950">
      {/* Dynamic colorful blur lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Title Section */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              Agro AI Diagnostics Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mt-3">
              Precision Crop Analytics
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl text-sm leading-relaxed">
              Monitor complex soil chemistry, soil telemetry trends, and run predictive AI simulations on crop growth indices.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Predictive Health Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-emerald-400">{healthScore}%</span>
                <span className="text-xs font-bold text-slate-500">Optimal</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Simulator Panel (Col 1) */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Sliders className="text-cyan-400 h-5 w-5" />
              <h2 className="text-xl font-bold">Field Simulator Controls</h2>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Adjust the sliders below to simulate changing crop and environmental parameters. The AI analytics models will recalculate in real-time.
            </p>

            <div className="space-y-6 flex-1">
              {/* Soil Moisture Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Soil Moisture (%)</span>
                  <span className="text-cyan-400 font-extrabold">{moisture}%</span>
                </div>
                <input
                  type="range" min={20} max={100} value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Air Temp Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Air Temperature (°C)</span>
                  <span className="text-orange-400 font-extrabold">{temp}°C</span>
                </div>
                <input
                  type="range" min={10} max={45} value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              {/* Canopy Cover Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Canopy Cover (%)</span>
                  <span className="text-emerald-400 font-extrabold">{canopyCover}%</span>
                </div>
                <input
                  type="range" min={10} max={100} value={canopyCover}
                  onChange={(e) => setCanopyCover(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Soil N-P-K Inputs */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Soil Nutrients (mg/kg)</h3>
                
                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-500">
                    <span>Nitrogen (N)</span>
                    <span className="font-bold text-slate-900">{nitrogen}</span>
                  </div>
                  <input
                    type="range" min={10} max={90} value={nitrogen}
                    onChange={(e) => setNitrogen(Number(e.target.value))}
                    className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-green-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-500">
                    <span>Phosphorus (P)</span>
                    <span className="font-bold text-slate-900">{phosphorus}</span>
                  </div>
                  <input
                    type="range" min={10} max={90} value={phosphorus}
                    onChange={(e) => setPhosphorus(Number(e.target.value))}
                    className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-lime-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 text-slate-500">
                    <span>Potassium (K)</span>
                    <span className="font-bold text-slate-900">{potassium}</span>
                  </div>
                  <input
                    type="range" min={10} max={90} value={potassium}
                    onChange={(e) => setPotassium(Number(e.target.value))}
                    className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Simulation Verdict */}
            <div className="mt-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-4 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-700">Simulation Status: Stable</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  At {healthScore}% health score, crop metabolic activity is operating at peak levels. Fertilizer absorption is predicted optimal.
                </p>
              </div>
            </div>
          </div>

          {/* Analytics Graphs (Col 2 & 3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Yield Forecast & Metrics */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Yield Estimation</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{yieldProjection} Tons/ha</p>
                  <p className="text-[11px] text-slate-500 mt-1">Based on simulated soil NPK + Canopy Index</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Soil Hydration Status</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1.5">
                    {moisture < 45 ? "Dehydrated" : moisture > 85 ? "Over-saturated" : "Adequate"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Simulated target: 65% – 75% optimal</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                  <Droplets className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Recharts Charts Layout */}
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* NPK Chart */}
              <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sprout className="text-green-400 h-4 w-4" />
                  NPK Chemistry Balance
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={npkData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
                      <Bar dataKey="current" fill="#10b981" radius={[6, 6, 0, 0]} name="Current Level" />
                      <Bar dataKey="optimal" fill="#1e293b" radius={[6, 6, 0, 0]} name="Target Optimal" stroke="#475569" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Moisture Trend Chart */}
              <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Droplets className="text-cyan-400 h-4 w-4" />
                  Hydration Trends (Weekly)
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moistureTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
                      <Line type="monotone" dataKey="moisture" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 4 }} name="Moisture %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Harvest Estimation Area Chart */}
              <div className="col-span-1 md:col-span-2 rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="text-amber-400 h-4 w-4" />
                  Cumulative Yield Projection
                </h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                      <CartesianGrid stroke="#334155" />
                      <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", color: "#fff" }} />
                      <Area type="monotone" dataKey="projected" stroke="#fbbf24" fill="url(#colorProjected)" strokeWidth={3} name="Ideal Baseline" />
                      <Area type="monotone" dataKey="current" stroke="#10b981" fill="url(#colorCurrent)" strokeWidth={3} name="Simulated Harvest" />
                      <defs>
                        <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Info Disclaimer */}
        <div className="mt-8 rounded-2xl bg-slate-900/40 border border-slate-100 p-4 flex gap-2.5 items-center text-xs text-slate-500">
          <Info className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>This model uses live farm coordinates and telemetry simulations to estimate indices. Real values depend on weather anomalies and irrigation stability.</span>
        </div>
      </main>
    </div>
  );
}
