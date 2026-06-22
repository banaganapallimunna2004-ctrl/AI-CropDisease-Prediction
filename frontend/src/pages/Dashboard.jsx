import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n";
import LanguageSelector from "../components/LanguageSelector";
import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  Compass,
  CloudRain,
  Cpu,
  Droplets,
  Gauge,
  Leaf,
  LogOut,
  Map,
  Satellite,
  ScanLine,
  ShieldCheck,
  Sprout,
  Thermometer,
  Tractor,
  TrendingUp,
  User,
  Wind,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

import reportService from "../services/reportService";
import { useAuth } from "../context/AuthContext";


// ---------------- DATA ----------------

const moistureData = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 75 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 88 },
  { month: "May", value: 96 },
  { month: "Jun", value: 104 },
];

const cropData = [
  { crop: "Tomato", value: 88 },
  { crop: "Rice", value: 72 },
  { crop: "Corn", value: 95 },
  { crop: "Wheat", value: 81 },
];

const ndviData = [
  { day: "Mon", value: 0.62 },
  { day: "Tue", value: 0.68 },
  { day: "Wed", value: 0.72 },
  { day: "Thu", value: 0.75 },
  { day: "Fri", value: 0.78 },
  { day: "Sat", value: 0.82 },
  { day: "Sun", value: 0.85 },
];

// ---------------- COMPONENT ----------------


export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [healthScore] = useState(94);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [mapMode, setMapMode] = useState("satellite");
  const [selectedField, setSelectedField] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
 
  const stats = useMemo(
    () => [
      { title: t('totalFarms'),    value: 128,              icon: <Leaf size={28} />,          color: "text-green-400" },
      { title: t('healthyCrops'),  value: 524,              icon: <TrendingUp size={28} />,    color: "text-lime-400" },
      { title: t('diseaseCases'),  value: reports.length || 12, icon: <AlertTriangle size={28} />, color: "text-red-400" },
      { title: t('activeSensors'), value: 243,              icon: <Cpu size={28} />,           color: "text-emerald-400" },
    ],
    [reports.length, t]
  );

  useEffect(() => {
    const loadReports = async () => {
      try {
        setReportsLoading(true);
        setReportsError(null);
        const response = await reportService.getReports();
        setReports(response.data.reports || []);
      } catch (e) {
        setReportsError(e?.response?.data?.message || 'Unable to load reports');
      } finally {
        setReportsLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div className="agri-page bg-dashboard-nature overflow-hidden text-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-green-500/10 blur-[200px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-lime-500/10 blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <nav className="relative z-20 flex items-center justify-between border-b border-green-900/40 bg-white/80 border-b-green-200 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-700">
            <Leaf className="h-5 w-5 text-slate-900" />
          </div>
          <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-lg font-bold text-transparent">
            {t('brand')}
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/scan" className="flex items-center gap-1.5 rounded-lg border border-green-900/40 px-3 py-2 text-sm text-slate-600 transition hover:border-green-600 hover:text-slate-900">
            <ScanLine className="h-4 w-4" /> {t('scanDisease')}
          </Link>
          <Link to="/chatbot" className="flex items-center gap-1.5 rounded-lg border border-green-900/40 px-3 py-2 text-sm text-slate-600 transition hover:border-green-600 hover:text-slate-900">
            <Brain className="h-4 w-4" /> {t('aiChat')}
          </Link>
          <Link to="/analytics" className="flex items-center gap-1.5 rounded-lg border border-green-900/40 px-3 py-2 text-sm text-slate-600 transition hover:border-green-600 hover:text-slate-900">
            <Activity className="h-4 w-4" /> {t('analytics')}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-green-900/40 bg-green-950/20 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-slate-900">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-sm text-red-400 transition hover:border-red-600 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('dashboardTitle')}
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              {t('dashboardSubtitle')}
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-green-500/10 px-6 py-4 backdrop-blur-xl">
            <span className="text-green-700">{t('farmHealthIndex')}</span>
            <h2 className="text-4xl font-bold text-slate-900">
              {healthScore}%
            </h2>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -6 }}
              className="
                rounded-3xl
                border border-green-100
                bg-white shadow-xl shadow-green-900/5
                p-6
                backdrop-blur-xl
                transition-all
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600">{item.title}</p>
                  <h2 className="mt-2 text-4xl font-bold">
                    <CountUp end={item.value} duration={2} />
                  </h2>
                </div>
                <div className={item.color}>{item.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Insights + Weather + Status + Seasonal Advisor */}
        <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
 
          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="text-green-400" />
              <h2 className="text-xl font-semibold">{t('aiFarmingInsights')}</h2>
            </div>
 
            <div className="space-y-4">
              <div className="rounded-2xl bg-green-500/10 p-4 text-xs font-semibold">
                🌱 Crop health improved by 14% this month
              </div>
 
              <div className="rounded-2xl bg-blue-500/10 p-4 text-xs font-semibold">
                💧 Soil moisture at optimal level
              </div>
 
              <div className="rounded-2xl bg-yellow-500/10 p-4 text-xs font-semibold">
                ☀ Best irrigation window: 6 AM - 8 AM
              </div>
 
              <div className="rounded-2xl bg-red-500/10 p-4 text-xs font-semibold">
                🐛 Early pest activity detected in Zone B
              </div>
            </div>
          </div>
 
          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <CloudRain className="text-blue-400" />
              <h2 className="text-xl font-semibold">{t('weatherIntel')}</h2>
            </div>
 
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-blue-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="text-orange-400" />
                  <span className="text-xs font-semibold">{t('temperature')}</span>
                </div>
                <span className="font-semibold text-xs">29°C</span>
              </div>
 
              <div className="flex items-center justify-between rounded-2xl bg-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Droplets className="text-cyan-400" />
                  <span className="text-xs font-semibold">{t('humidity')}</span>
                </div>
                <span className="font-semibold text-xs">78%</span>
              </div>
 
              <div className="flex items-center justify-between rounded-2xl bg-slate-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Wind className="text-slate-700" />
                  <span className="text-xs font-semibold">{t('windSpeed')}</span>
                </div>
                <span className="font-semibold text-xs">12 km/h</span>
              </div>
            </div>
          </div>
 
          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="text-lime-400" />
              <h2 className="text-xl font-semibold">{t('farmStatus')}</h2>
            </div>
 
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-green-500/10 p-4 text-xs font-semibold">
                <Leaf className="text-green-400" />
                <span>{t('cropZonesHealthy')}</span>
              </div>
 
              <div className="flex items-center gap-3 rounded-2xl bg-lime-500/10 p-4 text-xs font-semibold">
                <Activity className="text-lime-400" />
                <span>243 {t('sensorsActive')}</span>
              </div>
 
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold">
                <Gauge className="text-emerald-400" />
                <span>{t('irrigationEfficiency')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="text-amber-400" />
              <h2 className="text-xl font-semibold">{t('seasonalRisk')}</h2>
            </div>
 
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">Current Season: <span className="font-bold text-amber-400">Monsoon</span></p>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
                <span className="font-bold text-amber-300 block mb-1">⚠️ {t('highRiskCrops')}</span>
                Tomato, Potato (Late Blight threat due to 85%+ humidity forecast)
              </div>
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                <span className="font-bold text-green-700 block mb-1">✅ Recommended Planting</span>
                Rice, Corn (High moisture retention levels optimal)
              </div>
            </div>
          </div>
        </div>

        {/* Agriculture Modules */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6">
            <Sprout className="mb-3 text-green-400" />
            <h3 className="font-semibold text-lg">{t('brand')} Intelligence</h3>
            <p className="mt-2 text-slate-600 text-xs leading-5">
              {t('tagline')}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">
            <Satellite className="mb-3 text-blue-400" />
            <h3 className="font-semibold text-lg">{t('liveZonings')}</h3>
            <p className="mt-2 text-slate-600 text-xs leading-5">
              {t('liveZoningsDesc')}
            </p>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6">
            <Tractor className="mb-3 text-purple-400" />
            <h3 className="font-semibold text-lg">{t('sensorGrid')}</h3>
            <p className="mt-2 text-slate-600 text-xs leading-5">
              {t('sensorMoisture')} • {t('sensorTemp')} • {t('sensorHumidity')} • {t('sensorNpk')}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <AlertTriangle className="mb-3 text-red-400" />
            <h3 className="font-semibold text-lg">{t('scanHeading')}</h3>
            <p className="mt-2 text-slate-600 text-xs leading-5">
              {t('scanDesc')}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-semibold">
              {t('sensorMoisture')} Trend
            </h2>
 
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moistureData}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
 
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
 
          <div className="rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
            <h2 className="mb-6 text-xl font-semibold">
              Crop Yield Performance
            </h2>
 
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropData}>
                <CartesianGrid stroke="#334155" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip />
 
                <Bar
                  dataKey="value"
                  fill="#84cc16"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* NDVI Chart */}
        <div className="mt-8 rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <Satellite className="text-blue-400" />
            <h2 className="text-xl font-semibold">
              NDVI Vegetation Index
            </h2>
          </div>
 
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={ndviData}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
 
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f655"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
 
        {/* Interactive Farm GIS Map */}
        <div className="mt-8 rounded-3xl border border-green-100 bg-white shadow-xl shadow-green-900/5 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Map className="text-green-400" />
              <h2 className="text-xl font-semibold">
                {t('liveZonings')}
              </h2>
            </div>
            
            {/* Map Mode Buttons */}
            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-100 backdrop-blur-md">
              {["satellite", "ndvi", "moisture"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setSelectedField(null);
                    setSelectedSensor(null);
                    setMapMode(mode);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    mapMode === mode
                      ? "bg-green-500 text-slate-900 shadow-md shadow-green-500/20"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Interactive SVG Map Layout */}
            <div className="lg:col-span-2 relative h-[360px] rounded-2xl border border-green-300 bg-white border-green-200 overflow-hidden">
              <svg viewBox="0 0 500 300" className="w-full h-full select-none cursor-pointer">
                {/* Background grid */}
                <defs>
                  <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff08" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />

                {/* Field Polygons */}
                {/* Field Alpha (Tomato) */}
                <path
                  d="M 50,50 L 220,50 L 190,140 L 40,130 Z"
                  fill={
                    mapMode === "ndvi" ? "#10b981" :
                    mapMode === "moisture" ? "#06b6d4" : "#14532d"
                  }
                  fillOpacity={selectedField?.id === "alpha" ? 0.75 : 0.4}
                  stroke={selectedField?.id === "alpha" ? "#22c55e" : "#15803d"}
                  strokeWidth={selectedField?.id === "alpha" ? 3 : 1.5}
                  onClick={() => {
                    setSelectedSensor(null);
                    setSelectedField({
                      id: "alpha",
                      name: "Zone Alpha",
                      crop: "Tomato",
                      moisture: "68%",
                      health: "94%",
                      sensors: 3,
                      description: "Flourishing crop beds. Standard NPK balance active."
                    });
                  }}
                  className="transition-all duration-300 hover:fill-opacity-60"
                />
                
                {/* Field Beta (Wheat) */}
                <path
                  d="M 230,50 L 450,60 L 420,150 L 200,140 Z"
                  fill={
                    mapMode === "ndvi" ? "#34d399" :
                    mapMode === "moisture" ? "#0891b2" : "#166534"
                  }
                  fillOpacity={selectedField?.id === "beta" ? 0.75 : 0.4}
                  stroke={selectedField?.id === "beta" ? "#22c55e" : "#166534"}
                  strokeWidth={selectedField?.id === "beta" ? 3 : 1.5}
                  onClick={() => {
                    setSelectedSensor(null);
                    setSelectedField({
                      id: "beta",
                      name: "Zone Beta",
                      crop: "Wheat",
                      moisture: "58%",
                      health: "91%",
                      sensors: 2,
                      description: "Rabi cereal stalks. Evapotranspiration level is stable."
                    });
                  }}
                  className="transition-all duration-300 hover:fill-opacity-60"
                />

                {/* Field Gamma (Corn) */}
                <path
                  d="M 40,140 L 190,150 L 160,250 L 30,230 Z"
                  fill={
                    mapMode === "ndvi" ? "#a3e635" :
                    mapMode === "moisture" ? "#2563eb" : "#0f4a24"
                  }
                  fillOpacity={selectedField?.id === "gamma" ? 0.75 : 0.4}
                  stroke={selectedField?.id === "gamma" ? "#22c55e" : "#14532d"}
                  strokeWidth={selectedField?.id === "gamma" ? 3 : 1.5}
                  onClick={() => {
                    setSelectedSensor(null);
                    setSelectedField({
                      id: "gamma",
                      name: "Zone Gamma",
                      crop: "Corn",
                      moisture: "75%",
                      health: "88%",
                      sensors: 4,
                      description: "Broad Solar receptor crop beds. Silt retention is high."
                    });
                  }}
                  className="transition-all duration-300 hover:fill-opacity-60"
                />

                {/* Field Delta (Potato) */}
                <path
                  d="M 200,150 L 420,160 L 390,260 L 170,250 Z"
                  fill={
                    mapMode === "ndvi" ? "#84cc16" :
                    mapMode === "moisture" ? "#0284c7" : "#0c3b1c"
                  }
                  fillOpacity={selectedField?.id === "delta" ? 0.75 : 0.4}
                  stroke={selectedField?.id === "delta" ? "#22c55e" : "#0f3a1d"}
                  strokeWidth={selectedField?.id === "delta" ? 3 : 1.5}
                  onClick={() => {
                    setSelectedSensor(null);
                    setSelectedField({
                      id: "delta",
                      name: "Zone Delta",
                      crop: "Potato",
                      moisture: "48%",
                      health: "95%",
                      sensors: 3,
                      description: "Acidic porous soils. Sowing density is high."
                    });
                  }}
                  className="transition-all duration-300 hover:fill-opacity-60"
                />

                {/* Sensor Node Hotspots (Dots) */}
                {/* Node 101 (Alpha) */}
                <circle
                  cx="120" cy="80" r="6"
                  fill="#22d3ee" stroke="#0891b2" strokeWidth="2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedField(null);
                    setSelectedSensor({ id: 101, node: "Node-101 (Zone Alpha)", status: "Online", battery: "94%", npk: "48 - 36 - 58" });
                  }}
                  className="animate-pulse cursor-pointer hover:r-8 transition-all"
                />
                
                {/* Node 102 (Beta) */}
                <circle
                  cx="320" cy="90" r="6"
                  fill="#22d3ee" stroke="#0891b2" strokeWidth="2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedField(null);
                    setSelectedSensor({ id: 102, node: "Node-102 (Zone Beta)", status: "Online", battery: "88%", npk: "42 - 32 - 52" });
                  }}
                  className="animate-pulse cursor-pointer hover:r-8 transition-all"
                />

                {/* Node 103 (Gamma) */}
                <circle
                  cx="100" cy="190" r="6"
                  fill="#22d3ee" stroke="#0891b2" strokeWidth="2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedField(null);
                    setSelectedSensor({ id: 103, node: "Node-103 (Zone Gamma)", status: "Online", battery: "92%", npk: "52 - 40 - 62" });
                  }}
                  className="animate-pulse cursor-pointer hover:r-8 transition-all"
                />

                {/* Node 104 (Delta) */}
                <circle
                  cx="300" cy="200" r="6"
                  fill="#f59e0b" stroke="#d97706" strokeWidth="2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedField(null);
                    setSelectedSensor({ id: 104, node: "Node-104 (Zone Delta)", status: "Standby", battery: "76%", npk: "38 - 28 - 48" });
                  }}
                  className="cursor-pointer hover:r-8 transition-all"
                />
              </svg>

              {/* Map overlays / Legends */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-slate-900/80 px-3 py-2 border border-slate-100 text-[10px] space-y-1">
                <p className="font-bold text-slate-700">Telemetry Indicators</p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>Node Online</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Node Standby</span>
                </div>
              </div>
            </div>

            {/* Right: Info Drawer sidebar */}
            <div className="rounded-2xl border border-green-100 bg-white p-5 flex flex-col justify-between h-[360px] overflow-y-auto">
              
              {!selectedField && !selectedSensor ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mb-3 border border-slate-100">
                    <Compass size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Target Selected</h4>
                  <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                    Click any highlighted field zone or blinking sensor node on the GIS map to access live telemetry metrics.
                  </p>
                </div>
              ) : selectedField ? (
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-400">Crop Zone</span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedField.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">CROP TYPE</span>
                      <span className="text-slate-900 font-extrabold">{selectedField.crop}</span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">SOIL MOISTURE</span>
                      <span className="text-cyan-400 font-extrabold">{selectedField.moisture}</span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">FIELD HEALTH</span>
                      <span className="text-emerald-400 font-extrabold">{selectedField.health}</span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">ACTIVE SENSORS</span>
                      <span className="text-slate-900 font-extrabold">{selectedField.sensors} Nodes</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {selectedField.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">IoT Sensor Node</span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedSensor.node}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">NODE STATUS</span>
                      <span className={`${selectedSensor.status === "Online" ? "text-cyan-400" : "text-amber-400"} font-extrabold`}>{selectedSensor.status}</span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">BATTERY LEVEL</span>
                      <span className="text-slate-900 font-extrabold">{selectedSensor.battery}</span>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <span className="text-slate-500 font-bold block mb-1">N - P - K CHEMICAL RATIO</span>
                      <span className="text-green-400 font-black tracking-widest block mt-0.5">{selectedSensor.npk} <span className="text-[10px] text-slate-500 font-normal normal-case tracking-normal">(mg/kg)</span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Action */}
              {(selectedField || selectedSensor) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedField(null);
                    setSelectedSensor(null);
                  }}
                  className="mt-4 w-full rounded-xl border border-green-100 bg-slate-900/40 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Clear Selection
                </button>
              )}

            </div>
          </div>
        </div>
 
        {/* Footer */}
        <div className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
          🌾 {t('brand')} • Smart Agriculture Intelligence Platform
          <br />
          <span className="normal-case text-[10px] font-medium tracking-normal text-slate-600 block mt-1">
            Powered by AI • IoT • Satellite Analytics • Machine Learning
          </span>
        </div>
      </div>
    </div>
  );
}
