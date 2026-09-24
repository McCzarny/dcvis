import React, { useEffect, useRef, useState } from 'react';
import { BarChart2, Check, ChevronDown, FileText, MapPin, MessageSquare, Server } from 'lucide-react';
import { DATA_CENTERS, DataCenterProfile, formatNum } from '../data/dataCenters';
import { DataCenterKey } from '../types/gis';

interface HeaderNavProps {
  dataCenter: DataCenterProfile;
  onSelectDataCenter: (id: DataCenterKey) => void;
  onOpenAnalytics: () => void;
  onOpenProjectDocs: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  dataCenter,
  onSelectDataCenter,
  onOpenAnalytics,
  onOpenProjectDocs
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const specs = dataCenter.specs;

  // Zamykanie dropdownu po kliknięciu poza nim lub ESC
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const chipClass =
    'px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white z-[2000] relative px-4 flex items-center justify-between shadow-lg flex-shrink-0">
      {/* Brand / Logo + wybór centrum danych */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
          <Server className="w-5 h-5 text-white" />
        </div>

        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all max-w-full"
            title="Zmień centrum danych"
          >
            <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="font-bold text-base md:text-lg tracking-tight text-white truncate">
              {specs.name}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-2 w-[22rem] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[2100]"
            >
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                Wybierz centrum danych
              </div>
              {DATA_CENTERS.map((option) => {
                const optionSpecs = option.specs;
                const isSelected = option.id === dataCenter.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectDataCenter(option.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 border-b border-slate-800/70 last:border-b-0 transition-all ${
                      isSelected ? 'bg-sky-950/60 hover:bg-sky-900/50' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-100 truncate">
                          {optionSpecs.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {optionSpecs.location} · {optionSpecs.district}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                      <span className={chipClass}>{formatNum(optionSpecs.areaHa, 2)} ha</span>
                      <span className={chipClass}>~{optionSpecs.itPowerMW} MW</span>
                      <span className={chipClass}>
                        {optionSpecs.generatorsCountLabel} agregatów ({optionSpecs.generatorPowerMW} MW)
                      </span>
                      {optionSpecs.dryCoolersCount !== undefined && (
                        <span className={chipClass}>{optionSpecs.dryCoolersCount} drycoolerów</span>
                      )}
                      {optionSpecs.waterPerDayM3 !== undefined && (
                        <span className={chipClass}>{formatNum(optionSpecs.waterPerDayM3)} m³/dobę</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="hidden lg:flex items-center space-x-5 text-xs bg-slate-800/80 py-1.5 px-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Powierzchnia:</span>
          <span className="font-bold text-sky-400">{formatNum(specs.areaHa, 2)} ha</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Moc:</span>
          <span className="font-bold text-amber-400">~{specs.itPowerMW} MW</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Agregaty:</span>
          <span className="font-bold text-rose-400">
            {specs.generatorsCountLabel} szt. ({specs.generatorPowerMW} MW)
          </span>
        </div>
        {specs.waterPerDayM3 !== undefined && (
          <>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Woda:</span>
              <span className="font-bold text-cyan-400">{formatNum(specs.waterPerDayM3)} m³/dobę</span>
            </div>
          </>
        )}
        {specs.dryCoolersCount !== undefined && (
          <>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Drycoolery:</span>
              <span className="font-bold text-teal-400">{specs.dryCoolersCount} szt.</span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenProjectDocs}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-sm"
          title="Otwórz raport i dokumentację projektu"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Metodologia i źródła</span>
        </button>

        <button
          onClick={onOpenAnalytics}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-sm"
          title="Otwórz analizę wykresową hałasu, temperatury i zużycia wody"
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Wykresy i Symulator</span>
        </button>

        <a
          href="https://github.com/McCzarny/dcvis/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all shadow-sm"
          title="Zgłoś uwagę lub błąd przez GitHub Issues"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Zgłoś uwagę</span>
        </a>
      </div>
    </header>
  );
};
