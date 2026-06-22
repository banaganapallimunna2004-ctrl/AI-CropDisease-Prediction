import {
  Activity,
  ArrowLeft,
  Brain,
  CloudSun,
  Leaf,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AIChatBot from '../components/AIChatBot';
import LiveLocationMap from '../components/LiveLocationMap';

const capabilityCards = [
  {
    title: 'Disease Triage',
    detail: 'Explain symptoms and get likely causes, urgency, and treatment options.',
    icon: Brain,
  },
  {
    title: 'Fertilizer Planning',
    detail: 'Plan NPK, organic inputs, and timing based on crop stage.',
    icon: Sparkles,
  },
  {
    title: 'Weather Decisions',
    detail: 'Convert humidity, rain, and heat risk into field actions.',
    icon: CloudSun,
  },
  {
    title: 'Supplier Context',
    detail: 'Use location context for practical farm supply questions.',
    icon: Store,
  },
];

const ChatBot = () => {
  return (
    <main className="agri-page min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-green-900/10 bg-white/65 px-3 py-2 text-sm font-bold text-green-900/75 backdrop-blur-md transition hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="agri-chip">
              <MessageSquareText className="h-4 w-4" />
              Agro AI Farm Desk
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-green-950 sm:text-5xl">
              Intelligent Agricultural Assistant
            </h1>
            <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-green-900/70">
              Ask clear farm questions and get practical help for crop disease, fertilizer, irrigation, weather risk, and nearby supplier planning.
            </p>
          </div>

          <div className="agri-panel flex min-w-[220px] items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-800 text-slate-900">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-green-900/55">AI Status</p>
              <p className="font-black text-green-950">Online</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map(({ title, detail, icon: Icon }) => (
            <article key={title} className="agri-panel p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-800 text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-black text-green-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-green-900/64">{detail}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <AIChatBot />

          <aside className="space-y-6">
            <section className="agri-panel overflow-hidden">
              <div className="border-b border-green-900/10 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-800 text-slate-900">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-black text-green-950">Live Farm Location</h2>
                    <p className="text-sm font-medium text-green-900/60">Used for local weather and supplier context.</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <LiveLocationMap />
              </div>
            </section>

            <section className="agri-panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200 text-green-900">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-black text-green-950">Better Answers</h2>
                  <p className="text-sm font-medium text-green-900/60">Include these details when possible.</p>
                </div>
              </div>

              <div className="space-y-3">
                {['Crop name and growth stage', 'Visible symptoms and affected area', 'Recent rain, humidity, or heat', 'Organic or chemical preference'].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-green-900/10 bg-white/55 p-3">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-green-800" />
                    <span className="text-sm font-semibold text-green-950">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="agri-panel p-5">
              <h2 className="mb-4 font-black text-green-950">Field Response Quality</h2>
              <div className="space-y-4">
                {[
                  ['Symptom clarity', 'High'],
                  ['Location context', 'Optional'],
                  ['Treatment detail', 'Actionable'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-green-900/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-semibold text-green-900/65">{label}</span>
                    <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-black text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ChatBot;
