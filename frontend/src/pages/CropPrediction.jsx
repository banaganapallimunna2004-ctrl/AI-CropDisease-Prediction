import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Activity,
  Sliders,
  Sparkles,
  Droplets,
  Thermometer,
  ShieldCheck,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight
} from "lucide-react";

// Professional crop requirements database for rule-based matching
const cropDatabase = [
  {
    name: "Rice",
    scientificName: "Oryza sativa",
    idealPh: [5.5, 7.0],
    idealTemp: [22, 35],
    idealRain: [1000, 2000],
    idealN: [80, 120],
    idealP: [40, 60],
    idealK: [40, 60],
    description: "Highly dependent on water retention. Prefers alluvial soils with high clay content.",
    waterNeed: "High (Flooding/Regular Sowing)",
    marketYield: "4.5 Tons/Hectare",
  },
  {
    name: "Wheat",
    scientificName: "Triticum aestivum",
    idealPh: [6.0, 7.5],
    idealTemp: [15, 24],
    idealRain: [400, 800],
    idealN: [70, 100],
    idealP: [30, 50],
    idealK: [30, 50],
    description: "Rabi crop. Flourishes in well-drained loamy soils during cool weather conditions.",
    waterNeed: "Moderate (Irrigation Cycles)",
    marketYield: "3.8 Tons/Hectare",
  },
  {
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    idealPh: [5.5, 6.8],
    idealTemp: [20, 30],
    idealRain: [500, 1000],
    idealN: [60, 90],
    idealP: [40, 60],
    idealK: [60, 90],
    description: "High potassium consumer. Flourishes in porous soils rich in organic compost.",
    waterNeed: "Moderate (Drip Irrigation)",
    marketYield: "15.2 Tons/Hectare",
  },
  {
    name: "Potato",
    scientificName: "Solanum tuberosum",
    idealPh: [5.0, 6.0],
    idealTemp: [15, 21],
    idealRain: [500, 800],
    idealN: [60, 90],
    idealP: [50, 80],
    idealK: [80, 120],
    description: "Requires acidic, airy soils. Excessive moisture leads to tuber rot disease.",
    waterNeed: "Low-Moderate (Porous drainage)",
    marketYield: "18.5 Tons/Hectare",
  },
  {
    name: "Corn",
    scientificName: "Zea mays",
    idealPh: [5.8, 7.2],
    idealTemp: [20, 32],
    idealRain: [600, 1200],
    idealN: [90, 120],
    idealP: [40, 60],
    idealK: [40, 60],
    description: "Requires high nitrogen. Broad solar intercept needs open terrain coordinates.",
    waterNeed: "Moderate-High (Silt soils)",
    marketYield: "5.5 Tons/Hectare",
  },
  {
    name: "Cotton",
    scientificName: "Gossypium hirsutum",
    idealPh: [5.5, 7.5],
    idealTemp: [25, 38],
    idealRain: [500, 1000],
    idealN: [60, 90],
    idealP: [30, 50],
    idealK: [40, 70],
    description: "Requires high thermal units and dry harvest periods. Thrives in black cotton soils.",
    waterNeed: "Moderate (Deep root access)",
    marketYield: "2.2 Tons/Hectare",
  }
];

export default function CropPrediction() {
  // UI Form States
  const [ph, setPh] = useState(6.2);
  const [temperature, setTemperature] = useState(26);
  const [rainfall, setRainfall] = useState(850);
  const [n, setN] = useState(75);
  const [p, setP] = useState(45);
  const [k, setK] = useState(55);

  const [predictions, setPredictions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Math algorithm to score suitability of each crop
  const calculatePredictions = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const scoredCrops = cropDatabase.map((crop) => {
        // Calculate scores for each parameter (1.0 is perfect fit, 0.0 is complete mismatch)
        const getParamScore = (val, range) => {
          const [min, max] = range;
          if (val >= min && val <= max) return 1.0;
          const center = (min + max) / 2;
          const dist = Math.abs(val - center);
          const maxDist = (max - min) * 1.5 || 10;
          return Math.max(0.1, Number((1 - dist / maxDist).toFixed(2)));
        };

        const phScore = getParamScore(ph, crop.idealPh);
        const tempScore = getParamScore(temperature, crop.idealTemp);
        const rainScore = getParamScore(rainfall, crop.idealRain);
        const nScore = getParamScore(n, crop.idealN);
        const pScore = getParamScore(p, crop.idealP);
        const kScore = getParamScore(k, crop.idealK);

        // Weighted Average
        const overallScore = Math.round(
          ((phScore * 0.15) +
          (tempScore * 0.15) +
          (rainScore * 0.20) +
          (nScore * 0.18) +
          (pScore * 0.16) +
          (kScore * 0.16)) * 100
        );

        return {
          ...crop,
          suitability: Math.min(100, Math.max(10, overallScore))
        };
      });

      // Sort by suitability score descending
      const sorted = scoredCrops.sort((a, b) => b.suitability - a.suitability).slice(0, 3);
      setPredictions(sorted);
      setIsAnalyzing(false);
    }, 800); // 800ms analysis lag to simulate computation
  };

  return (
    <div className="agri-page text-slate-950">
      {/* Glow overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[150px]" />
        <div className="absolute bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Brain className="h-3.5 w-3.5" />
            AI Soil Agronomist Model
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mt-3">
            Soil Chemistry & Crop Prediction
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl text-sm leading-relaxed">
            Enter your field telemetry details or soil test report numbers below. The Agro AI engine will analyze parameters and recommend the highest yielding crop varieties.
          </p>
        </div>

        {/* Dashboard Layout */}
        <div className="grid gap-8 lg:grid-cols-5">
          
          {/* Inputs Section (Col 1-2) */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl h-fit">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Sliders className="text-cyan-400 h-5 w-5" />
              <h2 className="text-xl font-bold">Soil Chemistry Inputs</h2>
            </div>

            <div className="space-y-6">
              {/* Soil pH Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Soil pH Index</span>
                  <span className="text-cyan-400 font-extrabold">{ph} (
                    {ph < 5.5 ? "Acidic" : ph > 7.2 ? "Alkaline" : "Neutral"}
                  )</span>
                </div>
                <input
                  type="range" min={4.0} max={9.0} step={0.1} value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Temp Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Average Temp (°C)</span>
                  <span className="text-orange-400 font-extrabold">{temperature}°C</span>
                </div>
                <input
                  type="range" min={10} max={45} value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>

              {/* Rainfall Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-slate-500">Annual Rainfall (mm)</span>
                  <span className="text-emerald-400 font-extrabold">{rainfall} mm</span>
                </div>
                <input
                  type="range" min={200} max={2200} step={25} value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full h-1 bg-white rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* NPK Inputs */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Chemical Nutrients Ratio</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nitrogen (N)</label>
                    <input
                      type="number" min={0} max={150} value={n}
                      onChange={(e) => setN(Math.min(150, Math.max(0, Number(e.target.value))))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold text-slate-900 outline-none focus:border-green-400 focus:shadow-md focus:shadow-green-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phosphorus (P)</label>
                    <input
                      type="number" min={0} max={150} value={p}
                      onChange={(e) => setP(Math.min(150, Math.max(0, Number(e.target.value))))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold text-slate-900 outline-none focus:border-lime-400 focus:shadow-md focus:shadow-lime-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Potassium (K)</label>
                    <input
                      type="number" min={0} max={150} value={k}
                      onChange={(e) => setK(Math.min(150, Math.max(0, Number(e.target.value))))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm font-semibold text-slate-900 outline-none focus:border-emerald-400 focus:shadow-md focus:shadow-emerald-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={calculatePredictions}
                disabled={isAnalyzing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 font-extrabold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300 hover:scale-[1.02] disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-5 w-5 animate-spin" />
                    Analyzing Soil Indices...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run AI Crop Recommendation
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Predictions Display (Col 3-5) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-900/60 p-6 backdrop-blur-xl min-h-[400px] flex flex-col">
              
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="text-emerald-400 h-5 w-5" />
                  <h2 className="text-xl font-bold">Recommended Crop Varieties</h2>
                </div>
                {predictions.length > 0 && (
                  <span className="text-xs font-bold text-emerald-400">Match found</span>
                )}
              </div>

              {predictions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 rounded-full bg-cyan-500/5 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                    <Sprout className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">No predictions generated yet</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                    Set your pH index, temperature, rainfall, and nutrient densities in the panel and click the "Run AI Recommendation" button to analyze.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  <AnimatePresence>
                    {predictions.map((crop, index) => (
                      <motion.div
                        key={crop.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 hover:border-cyan-400/30 transition-all flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="space-y-2 max-w-md">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-slate-900">{crop.name}</span>
                            <span className="text-xs italic text-slate-500">({crop.scientificName})</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{crop.description}</p>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-medium text-slate-500">
                            <div>
                              Water Need: <span className="text-cyan-700 font-semibold">{crop.waterNeed}</span>
                            </div>
                            <div>
                              Avg Yield: <span className="text-amber-400 font-semibold">{crop.marketYield}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0">
                          <div className="text-center sm:text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Suitability</p>
                            <p className="text-3xl font-black text-emerald-400 mt-0.5">{crop.suitability}%</p>
                          </div>
                          
                          <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            crop.suitability >= 85 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            crop.suitability >= 65 ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                            "bg-slate-500/10 text-slate-500 border border-slate-100"
                          }`}>
                            {crop.suitability >= 85 ? "Excellent Fit" : crop.suitability >= 65 ? "Suitable" : "Marginal"}
                          </div>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div className="mt-8 rounded-2xl bg-slate-900/40 border border-slate-100 p-4 flex gap-2.5 items-center text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Recommendations are powered by agricultural science heuristics. Consult local soil extensions before sowing.</span>
        </div>
      </main>
    </div>
  );
}
