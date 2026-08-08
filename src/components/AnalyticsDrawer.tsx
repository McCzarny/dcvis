import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
  Area
} from 'recharts';
import { NOISE_DECAY_CHART_DATA, THERMAL_ELEVATION_CHART_DATA } from '../data/layersRegistry';
import { X, Volume2, Thermometer, Moon, Sun, Wind, Activity } from 'lucide-react';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'noise' | 'thermal'>('noise');
  const [nightMode, setNightMode] = useState(true);
  const [windInversion, setWindInversion] = useState(false);

  if (!isOpen) return null;

  // Obliczanie modyfikatora szumu przy inwersji nocnej
  const chartNoiseData = NOISE_DECAY_CHART_DATA.map((item) => {
    let effectiveNoise = item.noise;
    if (windInversion && item.distance >= 500) {
      effectiveNoise += 5; // podbicie słyszalności humu o 5 dBA przy inwersji
    }
    return {
      ...item,
      effectiveNoise,
      normLimit: nightMode ? item.normNight : item.normDay
    };
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">
                Wykresy Oddziaływania Akustycznego i Mikroklimatycznego
              </h2>
              <p className="text-xs text-slate-400">
                Data Center Domiechowice - Symulacja spadku hałasu i wzrostu temperatury otoczenia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nawigacja po zakładkach */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('noise')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                activeTab === 'noise'
                  ? 'bg-slate-900 text-rose-400 border-slate-700 shadow-md'
                  : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Profil Akustyczny (Hałas dBA)</span>
            </button>

            <button
              onClick={() => setActiveTab('thermal')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                activeTab === 'thermal'
                  ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-md'
                  : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>Profil Termiczny (Zasięg Ciepła °C)</span>
            </button>
          </div>

          {/* Kontrolki symulacji dla zakładki hałasu */}
          {activeTab === 'noise' && (
            <div className="flex items-center space-x-3 text-xs pb-2">
              <button
                onClick={() => setNightMode(!nightMode)}
                className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
                  nightMode
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}
              >
                {nightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{nightMode ? 'Pora Nocna (40 dBA)' : 'Pora Dienna (50 dBA)'}</span>
              </button>

              <button
                onClick={() => setWindInversion(!windInversion)}
                className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
                  windInversion
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>{windInversion ? 'Nocna inwersja & wiatr ON' : 'Warunki neutralne'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Zawartość wykresu */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'noise' ? (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Spadek Natężenia Dźwięku Wentylatorów wraz z Odległością (w m)
                  </h3>
                  <span className="text-xs text-rose-400 font-mono">
                    Strefa przekroczeń: 0 - 800 m
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartNoiseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[30, 90]} unit=" dBA" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="effectiveNoise"
                        fill="rgba(244, 63, 94, 0.15)"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        name="Poziom Hałasu (dBA)"
                      />
                      <Line
                        type="monotone"
                        dataKey="normLimit"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={nightMode ? 'Norma Nocna (40 dBA)' : 'Norma Dienna (50 dBA)'}
                      />
                      <ReferenceLine
                        y={40}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        label={{ value: 'Norma Nocna 40 dBA', fill: '#10b981', fontSize: 10 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela szczegółów opisu hałasu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-rose-400 mb-1">0 - 240 m (Strefa Krytyczna)</div>
                  <p className="text-slate-300">
                    Hałas rzędu 85 do 50 dBA. Znaczne przekroczenie dopuszczalnej normy nocnej dla zabudowy mieszkaniowej o ponad +10 dB.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">500 - 800 m (Granica Normy)</div>
                  <p className="text-slate-300">
                    Spadek z 45 dBA do 40 dBA. Punkt 800 m (0,5 mili) wyznacza formalne sprostanie normie wyrażonej w dBA.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-purple-400 mb-1">500 - 1600 m (Hum & Diesle)</div>
                  <p className="text-slate-300">
                    Niskoczęstotliwościowe buczenie pozostaje słyszalne. Testy diesli (80-100 dBA na ogrodzeniu) docierają do 1,6 km.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Wzrost Temperatury Otoczenia (°C / K) w Zależności od Odległości
                  </h3>
                  <span className="text-xs text-amber-400 font-mono">
                    Szczyt oddziaływania: 0 - 1,5 km
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={THERMAL_ELEVATION_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 2.5]} unit=" °C" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tempRise"
                        fill="rgba(245, 158, 11, 0.15)"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        name="Przyrost Temp. (°C)"
                      />
                      <ReferenceLine
                        y={0.5}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        label={{ value: 'Próg modyfikacji mikroklimatu (+0,5°C)', fill: '#ef4444', fontSize: 10 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela szczegółów opisu termiki */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">0 - 300 m (Płaskowyż Termiczny)</div>
                  <p className="text-slate-300">
                    Temperatura powierzchni otoczenia podwyższona o +1,5°C ÷ +2,5°C z powodu poziomego strumienia ciepła z chillers.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-orange-400 mb-1">500 m - 1 km (Szczyt Mikroklimatu)</div>
                  <p className="text-slate-300">
                    Średni wzrost temperatury +0,80 K spowodowany opadaniem unoszącej pętli ciepłego powietrza.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">1,5 km - 5 km (Wygaszanie)</div>
                  <p className="text-slate-300">
                    Spadek z +0,58 K na 1,5 km do śladowego +0,24 K na 5 km, gdzie sygnał miesza się z naturalnymi wahaniami tła.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
