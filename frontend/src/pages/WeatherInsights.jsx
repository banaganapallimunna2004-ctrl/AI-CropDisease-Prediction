import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Info,
  Calendar,
  Compass,
  CheckCircle2,
  Sparkles,
  CloudSun
} from "lucide-react";

// Predefined weather scenarios to simulate dynamic agronomic recommendations
const weatherScenarios = {
  monsoon: {
    label: "Monsoon Showers",
    temp: 24,
    humidity: 88,
    wind: 18,
    rainProb: 92,
    uvIndex: 2,
    uvLabel: "Low",
    summary: "Continuous light rain showers with calm winds. High humidity environment.",
    advisory: "Excessive moisture present. Delay regular crop irrigation cycles by 2 days to prevent root rot. Spraying fungicides/insecticides is not recommended due to rain runoff.",
    irrigationStatus: "Irrigation Suspended",
    irrigationColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    forecast: [
      { day: "Today", temp: 24, icon: <CloudRain className="text-blue-400" /> },
      { day: "Fri", temp: 23, icon: <CloudRain className="text-blue-400" /> },
      { day: "Sat", temp: 25, icon: <CloudLightning className="text-blue-400 animate-pulse" /> },
      { day: "Sun", temp: 26, icon: <CloudSun className="text-yellow-400" /> },
      { day: "Mon", temp: 25, icon: <CloudRain className="text-blue-400" /> },
      { day: "Tue", temp: 27, icon: <Sun className="text-amber-400" /> },
      { day: "Wed", temp: 26, icon: <CloudSun className="text-yellow-400" /> }
    ]
  },
  heatwave: {
    label: "Dry Heatwave",
    temp: 41,
    humidity: 28,
    wind: 24,
    rainProb: 5,
    uvIndex: 11,
    uvLabel: "Extreme",
    summary: "Extreme solar radiance, low humidity, and high wind-speed. Rapid evaporation.",
    advisory: "Severe transpiration risk. Activate automated drip irrigation systems immediately. Increase moisture volume by 35% in sandy soils. Avoid applying chemical sprays between 10 AM and 4 PM to prevent leaf burns.",
    irrigationStatus: "Irrigate Immediately (Urgent)",
    irrigationColor: "text-red-400 bg-red-500/10 border-red-500/20",
    forecast: [
      { day: "Today", temp: 41, icon: <Sun className="text-amber-400 animate-spin-slow" /> },
      { day: "Fri", temp: 42, icon: <Sun className="text-amber-400" /> },
      { day: "Sat", temp: 40, icon: <Sun className="text-amber-400" /> },
      { day: "Sun", temp: 39, icon: <CloudSun className="text-yellow-400" /> },
      { day: "Mon", temp: 41, icon: <Sun className="text-amber-400" /> },
      { day: "Tue", temp: 42, icon: <Sun className="text-amber-400" /> },
      { day: "Wed", temp: 43, icon: <Sun className="text-amber-400" /> }
    ]
  },
  storm: {
    label: "Cyclonic Storm",
    temp: 21,
    humidity: 95,
    wind: 65,
    rainProb: 99,
    uvIndex: 1,
    uvLabel: "Low",
    summary: "Severe windgusts with violent thunderstorm precipitation. Flooding risk.",
    advisory: "Physical crop collapse threat. Ensure all field drainage channels are clear of debris to prevent waterlogging. Postpone all planting, weeding, or harvesting operations. Secure greenhouse structural flaps.",
    irrigationStatus: "Drainage Channels Open (No Irrigation)",
    irrigationColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    forecast: [
      { day: "Today", temp: 21, icon: <CloudLightning className="text-blue-500 animate-pulse" /> },
      { day: "Fri", temp: 20, icon: <CloudLightning className="text-blue-500" /> },
      { day: "Sat", temp: 22, icon: <CloudRain className="text-blue-400" /> },
      { day: "Sun", temp: 24, icon: <CloudSun className="text-yellow-400" /> },
      { day: "Mon", temp: 26, icon: <Sun className="text-amber-400" /> },
      { day: "Tue", temp: 27, icon: <Sun className="text-amber-400" /> },
      { day: "Wed", temp: 28, icon: <Sun className="text-amber-400" /> }
    ]
  },
  sunshine: {
    label: "Optimal Sunshine",
    temp: 28,
    humidity: 55,
    wind: 10,
    rainProb: 15,
    uvIndex: 6,
    uvLabel: "High",
    summary: "Moderate warm sun, gentle breeze, and pleasant humidity levels.",
    advisory: "Ideal physiological window. Proceed with standard fertilizer spraying and nitrogen application. Soil absorption rates are optimal. Maintain standard automated moisture schedules.",
    irrigationStatus: "Standard Schedulers Active",
    irrigationColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    forecast: [
      { day: "Today", temp: 28, icon: <Sun className="text-amber-400" /> },
      { day: "Fri", temp: 29, icon: <Sun className="text-amber-400" /> },
      { day: "Sat", temp: 28, icon: <CloudSun className="text-yellow-400" /> },
      { day: "Sun", temp: 27, icon: <CloudSun className="text-yellow-400" /> },
      { day: "Mon", temp: 28, icon: <Sun className="text-amber-400" /> },
      { day: "Tue", temp: 29, icon: <Sun className="text-amber-400" /> },
      { day: "Wed", temp: 30, icon: <Sun className="text-amber-400" /> }
    ]
  }
};

export default function WeatherInsights() {
  const [activeScenarioKey, setActiveScenarioKey] = useState("sunshine");

  const activeScenario = useMemo(() => {
    return weatherScenarios[activeScenarioKey] || weatherScenarios.sunshine;
  }, [activeScenarioKey]);

  return (
    <div className="agri-page text-slate-950">
      {/* Background glow flares */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Title Block */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-950/20 px-3 py-1 text-xs font-semibold text-yellow-400">
              <Compass className="h-3.5 w-3.5 animate-spin-slow" />
              Agronomic Micro-climate Station
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mt-3">
              Weather Insights & Irrigation
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl text-sm leading-relaxed">
              Live climate data mapping and automated crop-specific recommendation warnings based on soil moisture trends and humidity indexes.
            </p>
          </div>

          {/* Selector Scenario Switcher */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900/60 p-2 flex flex-wrap gap-1 backdrop-blur-xl shrink-0">
            {Object.keys(weatherScenarios).map((key) => (
              <button
                key={key}
                onClick={() => setActiveScenarioKey(key)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                  activeScenarioKey === key
                    ? "bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {weatherScenarios[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Display */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Active weather metrics cards (Col 1-2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Primary climate panel */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Current Micro-Climate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900">{activeScenario.temp}°C</span>
                  <span className="text-lg font-medium text-slate-500">Outdoor</span>
                </div>
                <p className="text-sm font-semibold text-slate-600">{activeScenario.summary}</p>
              </div>

              <div className="h-24 w-24 rounded-3xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                {activeScenarioKey === "monsoon" && <CloudRain className="h-12 w-12 text-cyan-400 animate-pulse" />}
                {activeScenarioKey === "heatwave" && <Sun className="h-12 w-12 text-yellow-400 animate-spin-slow" />}
                {activeScenarioKey === "storm" && <CloudLightning className="h-12 w-12 text-blue-400 animate-pulse" />}
                {activeScenarioKey === "sunshine" && <Sun className="h-12 w-12 text-amber-400 animate-pulse" />}
              </div>
            </div>

            {/* Micro Parameter cards */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              
              {/* Humid */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900/40 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Humidity</span>
                  <Droplets className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{activeScenario.humidity}%</p>
              </div>

              {/* Wind */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900/40 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Wind Speed</span>
                  <Wind className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{activeScenario.wind} km/h</p>
              </div>

              {/* Rain */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900/40 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Rain Prob.</span>
                  <CloudRain className="h-4.5 w-4.5 text-blue-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{activeScenario.rainProb}%</p>
              </div>

              {/* UV index */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900/40 p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">UV Index</span>
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{activeScenario.uvIndex} <span className="text-[10px] text-slate-500 font-semibold">({activeScenario.uvLabel})</span></p>
              </div>

            </div>

            {/* 7 Day tray */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Calendar className="text-green-400 h-4 w-4" />
                Agronomic Sowing & Weather Forecast (7 Days)
              </h3>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                {activeScenario.forecast.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-[75px] rounded-2xl bg-slate-50/80 border border-slate-100 p-3 text-center flex flex-col items-center gap-2 hover:border-cyan-400/20 transition"
                  >
                    <span className="text-xs text-slate-500 font-bold">{item.day}</span>
                    <div className="h-8 w-8 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recommendations Block (Col 3) */}
          <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl h-full flex flex-col justify-between">
            
            <div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Sparkles className="text-emerald-400 h-5 w-5 animate-pulse" />
                <h2 className="text-xl font-bold">AI Agronomist Advisory</h2>
              </div>

              {/* Status flag */}
              <div className={`rounded-2xl border p-4 text-center ${activeScenario.irrigationColor}`}>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500">Irrigation recommendation</p>
                <p className="text-base font-black mt-1">{activeScenario.irrigationStatus}</p>
              </div>

              {/* Advisory paragraphs */}
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Irrigation guidance</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{activeScenario.advisory}</p>
                </div>

                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Nitrogen Sprays & Fertilizer Application</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {activeScenarioKey === "monsoon" && "Heavy risk of chemical runoffs. Avoid solid N-P-K applications. Switch to drip fertilization only if necessary."}
                    {activeScenarioKey === "heatwave" && "Extreme heat triggers evapotranspiration. Leaf spray causes severe phytotoxicity. Apply nutrients solely to root bases."}
                    {activeScenarioKey === "storm" && "Windgusts up to 65km/h will blow spray droplets away. Restrict chemical usages immediately."}
                    {activeScenarioKey === "sunshine" && "Standard conditions allow high photosynthesis. Sowing and foliage spray are recommended for tomato and potato fields."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sensor Disclaimer */}
            <div className="mt-8 rounded-2xl bg-white/20 border border-slate-100 p-4 flex gap-2.5 items-center text-xs text-slate-500">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Climate alerts utilize local sensors paired with telemetry forecasts. Check crop rows manually if weather alert activates.</span>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
