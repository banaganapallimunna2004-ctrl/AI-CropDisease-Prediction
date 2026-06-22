import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, availableLanguages } from '../i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageSelector = ({ compact = false }) => {
  const { lang, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = availableLanguages.find((l) => l.code === lang) || availableLanguages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative z-50 inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-slate-100 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/60 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-cyan-500/10"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-cyan-400" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        {!compact && (
          <span className="hidden sm:inline text-xs font-bold text-slate-700">
            {currentLang.nativeName}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 origin-top-right z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl ring-1 ring-white/5">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Select Language
              </p>
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(language.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                    lang === language.code
                      ? 'bg-cyan-500/15 text-cyan-700'
                      : 'text-slate-600 hover:bg-white/8 hover:text-slate-900'
                  }`}
                >
                  <span className="text-lg leading-none">{language.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{language.nativeName}</p>
                    <p className="text-[10px] text-slate-500">{language.label}</p>
                  </div>
                  {lang === language.code && (
                    <Check className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
