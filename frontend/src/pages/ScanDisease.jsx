import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  ShieldAlert,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Download,
  RefreshCw,
  Info,
  Plus,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import reportService from '../services/reportService';
import farmService from '../services/farmService';
import { useTranslation } from '../i18n';

const cropOptions = ['Tomato', 'Potato', 'Corn', 'Rice', 'Cotton', 'Wheat'];
const symptomSuggestions = [
  'Yellowing leaves with dark spots.',
  'White powdery coating on leaf surface.',
  'Orange pustules on corn leaves.',
  'Dark lesions and leaf blight.',
];

const ScanDisease = () => {
  const { t, lang } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState('');
  const [cropType, setCropType] = useState('Tomato');
  const [symptoms, setSymptoms] = useState('');
  
  // Drag & drop / Multiple files state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Analyses results for each file
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [status, setStatus] = useState('Ready to scan. Upload plant imagery.');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ latitude: '', longitude: '' });

  // UI States
  const [treatmentTab, setTreatmentTab] = useState('organic'); // 'organic' | 'chemical'
  const [zoomActive, setZoomActive] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  // Inline farm creation
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCrop, setNewFarmCrop] = useState('Tomato');
  const [createFarmLoading, setCreateFarmLoading] = useState(false);
  const [createFarmError, setCreateFarmError] = useState('');

  // Scanned history of selected farm
  const [historyReports, setHistoryReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load farms initially
  useEffect(() => {
    const loadFarms = async () => {
      try {
        const response = await farmService.getFarms();
        const farmList = response.data.farms || [];
        setFarms(farmList);
        if (farmList.length) {
          setFarmId(farmList[0]._id);
        }
      } catch (err) {
        console.error('Failed to load farms:', err);
      }
    };
    loadFarms();
  }, []);

  // Fetch history when farmId changes
  useEffect(() => {
    if (!farmId) {
      setHistoryReports([]);
      return;
    }
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await reportService.getReports();
        const allReports = response.data.reports || [];
        const farmReports = allReports.filter(r => r.farm?._id === farmId || r.farm === farmId);
        setHistoryReports(farmReports.slice(0, 5)); // Keep latest 5
      } catch (err) {
        console.error('Failed to load history reports:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [farmId]);

  // Handle previews generation on selectedFiles change
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    
    // Revoke old object URLs when files change
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocation({ latitude: '', longitude: '' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Reset states when files clear
  const handleClearAll = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setAnalyses([]);
    setActiveFileIndex(0);
    setError(null);
    setStatus('Ready to scan. Upload plant imagery.');
  };

  // Drag Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length === 0) {
        setError('Only image files are allowed.');
        return;
      }
      // Limit to 3 files total
      const newFiles = [...selectedFiles, ...files].slice(0, 3);
      setSelectedFiles(newFiles);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      const newFiles = [...selectedFiles, ...files].slice(0, 3);
      setSelectedFiles(newFiles);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = (index, e) => {
    e.stopPropagation();
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newAnalyses = analyses.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setAnalyses(newAnalyses);
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(Math.max(0, newFiles.length - 1));
    }
  };

  // Create Farm Handler
  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!newFarmName.trim()) {
      setCreateFarmError('Farm name is required.');
      return;
    }
    setCreateFarmLoading(true);
    setCreateFarmError('');
    try {
      const payload = {
        name: newFarmName.trim(),
        cropType: newFarmCrop,
        zoneType: 'Crop Zone',
        coordinates: {
          type: 'Point',
          coordinates: [location.longitude || 78.4867, location.latitude || 17.3850],
        },
        description: `My precision farm growing ${newFarmCrop}.`,
      };
      const res = await farmService.createFarm(payload);
      const createdFarm = res.data.farm;
      setFarms((prev) => [...prev, createdFarm]);
      setFarmId(createdFarm._id);
      setShowCreateFarm(false);
      setNewFarmName('');
    } catch (err) {
      setCreateFarmError(err.response?.data?.message || 'Failed to create farm.');
    } finally {
      setCreateFarmLoading(false);
    }
  };

  // Disease Scan Handler (loops through all selected images for batch scan)
  const handleScanAll = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!farmId) {
      setError('Please select or create a farm to save crop scan reports.');
      return;
    }
    if (selectedFiles.length === 0) {
      setError('Please upload at least one plant image to scan.');
      return;
    }

    setLoading(true);
    const results = [...analyses];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        // Skip files that have already been scanned to avoid double requests
        if (results[i]) continue;

        setLoadingIndex(i);
        setStatus(`Scanning image ${i + 1} of ${selectedFiles.length}: "${selectedFiles[i].name}"...`);

        const payload = {
          farmId,
          cropType,
          symptoms: symptoms.trim() || 'Analyze visible crop disease symptoms from the uploaded image.',
          latitude: location.latitude,
          longitude: location.longitude,
          image: selectedFiles[i],
        };

        const response = await reportService.scanDisease(payload);
        const reportData = response.data.analysis || response.data.report;
        results[i] = reportData;
        setAnalyses([...results]);
      }

      setStatus('Batch scanning completed. View detailed diagnostic reports below.');
      
      // Refresh scan history
      const response = await reportService.getReports();
      const allReports = response.data.reports || [];
      const farmReports = allReports.filter(r => r.farm?._id === farmId || r.farm === farmId);
      setHistoryReports(farmReports.slice(0, 5));

    } catch (err) {
      console.error('Scan Error:', err);
      const msg = err.response?.data?.message || 'Unable to complete the scan. Please check network and credentials.';
      setError(msg);
      setStatus('Scan failed.');
    } finally {
      setLoading(false);
      setLoadingIndex(null);
    }
  };

  const currentAnalysis = useMemo(() => {
    return analyses[activeFileIndex] || null;
  }, [analyses, activeFileIndex]);

  // Severity style configuration
  const severityConfig = useMemo(() => {
    if (!currentAnalysis) return null;
    const severity = currentAnalysis.severity || 'Medium';
    switch (severity) {
      case 'Low':
        return {
          class: 'severity-low',
          label: 'Low Severity',
          icon: <CheckCircle2 className="h-5 w-5 mr-1" />,
          color: '#34d399'
        };
      case 'High':
        return {
          class: 'severity-high',
          label: 'High Severity',
          icon: <AlertTriangle className="h-5 w-5 mr-1" />,
          color: '#f97316'
        };
      case 'Critical':
        return {
          class: 'severity-critical',
          label: 'Critical Status',
          icon: <ShieldAlert className="h-5 w-5 mr-1 animate-pulse" />,
          color: '#ef4444'
        };
      case 'Medium':
      default:
        return {
          class: 'severity-medium',
          label: 'Medium Severity',
          icon: <Info className="h-5 w-5 mr-1" />,
          color: '#fbbf24'
        };
    }
  }, [currentAnalysis]);

  // Confidence gauge calculations
  const gaugePercent = currentAnalysis ? currentAnalysis.confidence : 0;
  const strokeDashoffset = useMemo(() => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // 282.743
    return circumference - (gaugePercent / 100) * circumference;
  }, [gaugePercent]);

  // Report Share Action
  const handleShare = () => {
    if (!currentAnalysis) return;
    const text = `AgroAI Crop Report Summary:\nCrop: ${cropType}\nDisease Detected: ${currentAnalysis.diseaseName} (${currentAnalysis.scientificName})\nConfidence: ${currentAnalysis.confidence}%\nSeverity: ${currentAnalysis.severity}\nOrganic Treatment: ${currentAnalysis.organicTreatment || currentAnalysis.treatment}\nChemical Treatment: ${currentAnalysis.chemicalTreatment}\nPrevention: ${currentAnalysis.prevention}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      });
    }
  };

  // Report Download Action
  const handlePrint = () => {
    window.print();
  };

  // History Report Selection Helper
  const handleSelectHistoryReport = (rep) => {
    // Populate fake active scan result from history item
    const formattedAnalysis = {
      diseaseName: rep.diseaseName,
      scientificName: rep.scientificName || 'Pathogen details hidden',
      confidence: rep.confidence,
      severity: rep.severity,
      treatment: rep.treatment,
      organicTreatment: rep.organicTreatment || rep.treatment.split('💊 CHEMICAL:')[0]?.replace('🌿 ORGANIC:', '')?.trim(),
      chemicalTreatment: rep.chemicalTreatment || rep.treatment.split('💊 CHEMICAL:')[1]?.trim(),
      prevention: rep.prevention,
      economicImpact: rep.economicImpact || 'Varies by farm size',
      spreadRisk: rep.spreadRisk || 'High',
      source: 'database-saved-report'
    };
    
    // Add fake image and report to view
    setSelectedFiles([new File([""], "saved_image.png")]);
    setPreviews([rep.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80']);
    setAnalyses([formattedAnalysis]);
    setActiveFileIndex(0);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Scanner Body */}
        <div className="mb-10 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl sm:p-10">
          
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-700/95">
                {t('scanHeading')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t('scanInstructions')}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-500 text-sm">
                {t('scanDesc')}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white/5 border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 hover:border-slate-300 active:scale-95 no-print"
            >
              ← {t('dashboardTitle')}
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-1">
            {/* Forms and Upload Panels Row */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Left Side: Setup Fields */}
              <div className="space-y-6 rounded-[2rem] border border-slate-100 bg-slate-900/40 p-6 backdrop-blur-md no-print">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Scanner Config
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Select/Add Farm */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {t('selectFarmLabel')} <span className="text-rose-400">*</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setShowCreateFarm(!showCreateFarm); setCreateFarmError(''); }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-700 transition-colors"
                      >
                        {showCreateFarm ? '✕ Cancel' : '＋ Add Farm'}
                      </button>
                    </div>

                    {showCreateFarm ? (
                      <div className="rounded-2xl border border-cyan-400/20 bg-white/85 p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Farm name (e.g. North Field)"
                          value={newFarmName}
                          onChange={(e) => setNewFarmName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 transition"
                        />
                        <select
                          value={newFarmCrop}
                          onChange={(e) => setNewFarmCrop(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs text-slate-900 outline-none focus:border-cyan-400 transition"
                        >
                          {cropOptions.map((crop) => (
                            <option key={crop} value={crop}>{crop} Field</option>
                          ))}
                        </select>
                        {createFarmError && (
                          <p className="text-xs text-rose-400">{createFarmError}</p>
                        )}
                        <button
                          type="button"
                          disabled={createFarmLoading}
                          onClick={handleCreateFarm}
                          className="w-full rounded-xl bg-cyan-400 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
                        >
                          {createFarmLoading ? 'Saving…' : t('saveSelectFarm')}
                        </button>
                      </div>
                    ) : (
                      <select
                        value={farmId}
                        onChange={(e) => setFarmId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-cyan-400 transition"
                      >
                        {farms.length ? (
                          farms.map((farm) => (
                            <option key={farm._id} value={farm._id}>
                              {farm.name} ({farm.cropType})
                            </option>
                          ))
                        ) : (
                          <option value="">{t('noFarms')}</option>
                        )}
                      </select>
                    )}
                  </div>

                  {/* Crop Type Selection */}
                  <div>
                    <label className="block mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Crop type</span>
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 border-slate-200 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-cyan-400 transition"
                    >
                      {cropOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Symptoms description */}
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t('symptomDesc')}</span>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={3}
                      placeholder={t('symptomPlaceholder')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 border-slate-200 px-4 py-3 text-xs text-slate-900 outline-none focus:border-cyan-400 transition resize-none"
                    />
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setSymptoms(suggestion)}
                        className="rounded-full border border-slate-100 bg-white/5 px-3 py-1.5 text-[10px] text-slate-600 transition hover:border-cyan-300/30 hover:bg-white/10 active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Geolocation visual */}
                <div className="rounded-xl border border-slate-100 bg-slate-100 p-3 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Scan GPS Coordinates:</span>
                  <span className="font-mono text-cyan-700">
                    {location.latitude
                      ? `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`
                      : 'Requesting GPS...'}
                  </span>
                </div>
              </div>

              {/* Right Side: File Upload Panel */}
              <div className="flex flex-col space-y-4 rounded-[2rem] border border-slate-100 bg-slate-900/40 p-6 backdrop-blur-md no-print">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-cyan-400" />
                    {t('batchScan')}
                  </h3>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear All
                    </button>
                  )}
                </div>

                {/* HTML5 Drag and Drop area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`dropzone relative flex-1 min-h-[160px] rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed ${
                    dragActive ? 'drag-active border-cyan-400 bg-cyan-400/5' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-cyan-400/10 text-cyan-700 mx-auto">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      {t('dragDrop')}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Up to 3 high-res leaf images (.png, .jpg, .jpeg)
                    </p>
                  </div>
                </div>

                {/* Image Thumbnails Slider */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {previews.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setActiveFileIndex(idx); }}
                        className={`group relative h-16 rounded-xl border overflow-hidden cursor-pointer transition ${
                          activeFileIndex === idx
                            ? 'border-cyan-400 scale-[1.03] shadow-md shadow-cyan-400/15'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Crop snippet" className="h-full w-full object-cover" />
                        <div className="absolute top-1 right-1 h-4 w-4 bg-slate-50 border-slate-200 border border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-500 text-slate-900 transition-colors"
                          onClick={(e) => handleRemoveFile(idx, e)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </div>
                        {analyses[idx] && (
                          <div className="absolute bottom-1 left-1 bg-emerald-500/90 text-[8px] font-bold text-slate-950 px-1 rounded">
                            Done
                          </div>
                        )}
                        {loading && loadingIndex === idx && (
                          <div className="absolute inset-0 bg-slate-50 border-slate-200 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Start Scan Button */}
                <button
                  type="button"
                  onClick={handleScanAll}
                  disabled={loading || selectedFiles.length === 0}
                  className="btn-premium w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-extrabold"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                      {t('scanning')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-slate-950" />
                      {t('scanBtn')} ({selectedFiles.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-200 flex items-center gap-2 no-print"
              >
                <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 no-print">
              <span>{status}</span>
              {currentAnalysis && (
                <span className="text-cyan-400 font-medium">Engine: {currentAnalysis.source}</span>
              )}
            </div>

            {/* ─── Premium Results section ─── */}
            <AnimatePresence mode="wait">
              {currentAnalysis ? (
                <motion.div
                  key={activeFileIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="border-t border-slate-200 pt-8 mt-4 grid gap-8 md:grid-cols-[280px_1fr]"
                >
                  {/* Left Side: Scan Preview & Circular Gauge */}
                  <div className="space-y-6">
                    
                    {/* Live Preview with Zoom Overlay */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white group">
                      <img
                        src={previews[activeFileIndex]}
                        alt="Scanned plant leaf"
                        className={`w-full aspect-square object-cover transition-transform duration-300 ${
                          zoomActive ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                        }`}
                        onClick={() => setZoomActive(!zoomActive)}
                      />
                      
                      {/* Leaf Scan Line Simulation */}
                      {loading && (
                        <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan-line" />
                      )}

                      {/* Simulated Bounding Box Annotation overlay */}
                      {showAnnotations && !loading && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-[35%] left-[25%] w-[40%] h-[35%] border-2 border-rose-500/70 border-dashed rounded-lg animate-pulse">
                            <span className="absolute -top-5 left-0 bg-rose-500 text-[8px] font-bold text-slate-900 px-1.5 py-0.5 rounded shadow-md">
                              AI Focus: Spot Pattern
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 flex gap-1 no-print">
                        <button
                          type="button"
                          onClick={() => setShowAnnotations(!showAnnotations)}
                          className={`p-1.5 rounded-lg border text-[10px] font-semibold transition ${
                            showAnnotations
                              ? 'bg-cyan-500/80 border-cyan-400 text-slate-950'
                              : 'bg-slate-900/80 border-slate-200 text-slate-500'
                          }`}
                        >
                          {showAnnotations ? 'Hide Markers' : 'Show Markers'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomActive(!zoomActive)}
                          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-200 text-slate-600 hover:text-slate-900"
                          title="Zoom"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Circular Confidence Gauge */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-900/40 p-5 flex flex-col items-center text-center">
                      <span className="text-xs uppercase font-bold text-slate-500 tracking-[0.2em] mb-4">
                        {t('resultConfidence')}
                      </span>
                      
                      <div className="relative h-28 w-28 flex items-center justify-center">
                        <svg className="h-full w-full transform -rotate-90 confidence-gauge">
                          {/* Inner Gray Ring */}
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="transparent"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="8"
                          />
                          {/* Colored Ring */}
                          <circle
                            cx="56"
                            cy="56"
                            r="45"
                            fill="transparent"
                            stroke="url(#cyan-gradient)"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 45} // 282.743
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))' }}
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22d3ee" />
                              <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        <div className="absolute text-center">
                          <span className="text-2xl font-black text-slate-900">{gaugePercent}%</span>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] text-slate-500">
                        Reliability index verified by agricultural pathogen analysis pipeline.
                      </p>
                    </div>

                  </div>

                  {/* Right Side: Detailed Diagnostic Report */}
                  <div className="space-y-6">
                    
                    {/* Header Row */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-2xl font-extrabold text-slate-900">
                            {currentAnalysis.diseaseName}
                          </h2>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${severityConfig.class}`}>
                            {severityConfig.icon}
                            {severityConfig.label}
                          </span>
                        </div>
                        <p className="italic text-cyan-700 text-sm mt-1">
                          {currentAnalysis.scientificName || 'Scientific classification unavailable'}
                        </p>
                      </div>
                      
                      {/* Action buttons (Download PDF, Share) */}
                      <div className="flex gap-2 no-print">
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white/5 text-xs text-slate-700 transition hover:bg-white/10"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          {shareCopied ? 'Copied!' : t('shareReport')}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 text-xs text-cyan-700 transition hover:bg-cyan-400/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t('downloadReport')}
                        </button>
                      </div>
                    </div>

                    {/* Organic vs Chemical Treatment Tabs */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-900/40 p-4">
                      <div className="flex border-b border-slate-100 mb-4 no-print">
                        <button
                          type="button"
                          onClick={() => setTreatmentTab('organic')}
                          className={`pb-2 px-4 text-xs font-bold transition border-b-2 ${
                            treatmentTab === 'organic'
                              ? 'border-cyan-400 text-cyan-700'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          🍃 {t('treatmentGuide')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTreatmentTab('chemical')}
                          className={`pb-2 px-4 text-xs font-bold transition border-b-2 ${
                            treatmentTab === 'chemical'
                              ? 'border-cyan-400 text-cyan-700'
                              : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          💊 {t('chemicalTreatment')}
                        </button>
                      </div>

                      <div className="text-xs leading-6 text-slate-700 min-h-[80px]">
                        {treatmentTab === 'organic' ? (
                          <div className="space-y-2">
                            <p className="font-semibold text-emerald-400">Bio-agents & Cultural Methods:</p>
                            <p>{currentAnalysis.organicTreatment || currentAnalysis.treatment?.split('💊 CHEMICAL:')[0]?.replace('🌿 ORGANIC:', '')?.trim() || 'No organic treatment found.'}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-semibold text-cyan-400">Pesticide & Fungicide Formulations:</p>
                            <p>{currentAnalysis.chemicalTreatment || currentAnalysis.treatment?.split('💊 CHEMICAL:')[1]?.trim() || 'No specific chemical control needed or available.'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* structured grid cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Prevention Strategy Card */}
                      <div className="rounded-xl border border-slate-100 bg-slate-900/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {t('preventionGuide')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-5">
                          {currentAnalysis.prevention}
                        </p>
                      </div>

                      {/* Economic Impact Card */}
                      <div className="rounded-xl border border-slate-100 bg-slate-900/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {t('economicImpact')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-5">
                          {currentAnalysis.economicImpact || 'Estimated 10-35% harvest loss risk.'}
                        </p>
                      </div>

                      {/* Spread Risk Card */}
                      <div className="rounded-xl border border-slate-100 bg-slate-900/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {t('spreadRisk')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-5">
                          {currentAnalysis.spreadRisk || 'High - airborne spores spread under 80% humidity.'}
                        </p>
                      </div>
                    </div>

                    {/* Related Diseases Checklist */}
                    {currentAnalysis.relatedDiseases && currentAnalysis.relatedDiseases.length > 0 && (
                      <div className="rounded-xl border border-slate-100 bg-slate-900/20 p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-cyan-400" />
                          {t('relatedDiseases')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnalysis.relatedDiseases.map((dis) => (
                            <span key={dis} className="px-2.5 py-1 rounded-lg bg-white text-xs font-medium text-slate-600 border border-slate-100">
                              {dis}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Sidebar: Historical Scan Comparison (no-print) */}
        <aside className="space-y-6 no-print">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-cyan-400" />
              Scan History
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Compare current plant symptoms with recent detections on this farm.
            </p>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton h-14 w-full" />
                ))}
              </div>
            ) : historyReports.length > 0 ? (
              <div className="space-y-3">
                {historyReports.map((rep) => (
                  <div
                    key={rep._id}
                    onClick={() => handleSelectHistoryReport(rep)}
                    className="group rounded-xl border border-slate-100 bg-slate-900/30 p-3 hover:bg-slate-800/40 hover:border-cyan-400/25 transition cursor-pointer flex items-center gap-3"
                  >
                    {rep.imageUrl ? (
                      <img src={rep.imageUrl} alt="History thumbnail" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{rep.diseaseName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(rep.createdAt).toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })} • Conf: {rep.confidence}%
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No previous scans found for this farm.
                </p>
              </div>
            )}
          </div>

          {/* Quick Tip card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-2">
              💡 Pathologist Pro-Tip
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              When capturing leaf images, ensure the camera is parallel to the leaf surface, in bright indirect sunlight. Include the margins of healthy and diseased areas in a single frame for higher matching confidence.
            </p>
          </div>

        </aside>
      </div>
    </main>
  );
};

export default ScanDisease;
