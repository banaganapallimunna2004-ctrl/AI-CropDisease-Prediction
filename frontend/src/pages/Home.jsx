import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Brain,
  CloudSun,
  Leaf,
  Map,
  ScanLine,
  ShieldCheck,
  Sprout,
  Tractor,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import LanguageSelector from '../components/LanguageSelector';

const fieldCards = [
  {
    icon: ScanLine,
    labelKey: 'leafAnalysisTitle',
    descKey: 'leafAnalysisDesc',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=900&q=85',
  },
  {
    icon: Map,
    labelKey: 'gisMappingTitle',
    descKey: 'gisMappingDesc',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=85',
  },
  {
    icon: CloudSun,
    labelKey: 'weatherAdvisorTitle',
    descKey: 'weatherAdvisorDesc',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=85',
  },
];

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="agri-hero overflow-hidden">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/home" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-green-800 shadow-lg">
            <Leaf className="h-6 w-6" />
          </span>
          <span className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{t('brand')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link
            to="/login"
            className="rounded-xl border border-white/25 bg-white/14 px-4 py-2 text-sm font-bold text-slate-900 backdrop-blur-md transition hover:bg-white/24"
          >
            {t('loginBtn')}
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-8 pt-6 sm:px-8 lg:min-h-[calc(100vh-86px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="max-w-3xl">
          <div className="agri-chip border-white/25 bg-white/18 text-lime-100">
            <Activity className="h-4 w-4" />
            {t('precisionEcosystem')}
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            {t('smartFarming')}
            <span className="block text-lime-200">{t('redefinedByAi')}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-green-50/88 sm:text-lg">
            {t('tagline')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="agri-button px-7 py-4 text-base">
              {t('getStarted')}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/28 bg-white/12 px-7 py-4 text-base font-bold text-slate-900 backdrop-blur-md transition hover:bg-white/20"
            >
              {t('signUpBtn')}
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ['99.8%', t('diagnosisAccuracy')],
              ['< 3s', t('analysisSpeed')],
              ['24/7', t('cloudProtected')],
            ].map(([value, label]) => (
              <div key={label} className="agri-panel-dark p-4">
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wide text-lime-100/78">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="agri-panel-dark overflow-hidden sm:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1400&q=90"
              alt="Healthy crop field monitored by Agro AI"
              className="h-56 w-full object-cover"
            />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300 text-green-950">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{t('telemetryTitle')}</h2>
                  <p className="text-sm text-green-50/72">{t('telemetryDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          {fieldCards.map(({ icon: Icon, labelKey, descKey, image }) => (
            <article key={labelKey} className="agri-panel-dark overflow-hidden">
              <img src={image} alt="" className="h-28 w-full object-cover" />
              <div className="p-4">
                <Icon className="mb-3 h-5 w-5 text-lime-200" />
                <h3 className="font-black text-slate-900">{t(labelKey)}</h3>
                <p className="mt-2 text-xs leading-5 text-green-50/70">{t(descKey)}</p>
              </div>
            </article>
          ))}

          <div className="agri-panel-dark p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-lime-200" />
            <h3 className="font-black text-slate-900">Verified Farm Reports</h3>
            <p className="mt-2 text-xs leading-5 text-green-50/70">Disease scans, treatments, and crop records stay connected to each farm.</p>
          </div>

          <div className="agri-panel-dark p-4">
            <Tractor className="mb-3 h-5 w-5 text-lime-200" />
            <h3 className="font-black text-slate-900">Field Ready</h3>
            <p className="mt-2 text-xs leading-5 text-green-50/70">Built around real farmer workflows: scan, diagnose, act, and monitor.</p>
          </div>
        </section>
      </main>

      <div className="relative z-10 mx-auto -mt-3 flex max-w-7xl items-center gap-3 px-5 pb-6 text-xs font-bold uppercase tracking-wide text-green-50/70 sm:px-8">
        <Sprout className="h-4 w-4 text-lime-200" />
        Smart Agriculture Platform
      </div>
    </div>
  );
};

export default Home;
