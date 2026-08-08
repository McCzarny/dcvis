import React from 'react';
import { Server, BarChart2, ShieldAlert } from 'lucide-react';
import { DATA_CENTER_SPECS } from '../data/layersRegistry';

interface HeaderNavProps {
  onOpenAnalytics: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenAnalytics
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white z-[2000] relative px-4 flex items-center justify-between shadow-lg flex-shrink-0">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center shadow-md">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base md:text-lg tracking-tight text-white">
              Data Center Domiechowice
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden md:block">
            Geoportal GIS i Analiza Oddziaływania Środowiskowego (Gmina Bełchatów)
          </p>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="hidden lg:flex items-center space-x-5 text-xs bg-slate-800/80 py-1.5 px-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Powierzchnia:</span>
          <span className="font-bold text-sky-400">{DATA_CENTER_SPECS.areaHa} ha</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Moc:</span>
          <span className="font-bold text-amber-400">~{DATA_CENTER_SPECS.itPowerMW} MW</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Agregaty:</span>
          <span className="font-bold text-rose-400">100+ szt. ({DATA_CENTER_SPECS.generatorPowerMW} MW)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenAnalytics}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-sm"
          title="Otwórz analizę wykresową hałasu i temperatury"
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Wykresy i Symulator</span>
        </button>
      </div>
    </header>
  );
};
