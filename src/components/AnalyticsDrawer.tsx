import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Area
} from 'recharts';
import {
  NOISE_DECAY_CHART_DATA,
  THERMAL_ELEVATION_CHART_DATA,
  WATER_COMPARISON_CHART_DATA,
  WATER_ANALYSIS
} from '../data/layersRegistry';
import { X, Volume2, Thermometer, Wind, Activity, Droplets } from 'lucide-react';

interface AnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'noise' | 'thermal' | 'water'>('noise');
  const [windInversion, setWindInversion] = useState(false);

  if (!isOpen) return null;

  // Obliczanie modyfikatora szumu przy inwersji nocnej (model 1/r^1.5)
  const chartNoiseData = NOISE_DECAY_CHART_DATA.map((item) => {
    let effCont = item.noiseContinuous;
    let effGen = item.noiseGenerator;
    if (windInversion && item.distance >= 500) {
      effCont += 5;
      if (effGen != null) effGen += 5;
    }
    return {
      ...item,
      effectiveNoiseContinuous: effCont,
      effectiveNoiseGenerator: effGen != null ? effGen : undefined
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
                Wykresy Oddziaływania: Hałas, Mikroklimat i Zużycie Wody
              </h2>
              <p className="text-xs text-slate-400">
                Data Center Domiechowice - Symulacja spadku hałasu, wzrostu temperatury i bilansu wodnego
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

            <button
              onClick={() => setActiveTab('water')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                activeTab === 'water'
                  ? 'bg-slate-900 text-cyan-400 border-slate-700 shadow-md'
                  : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>Bilans Wodny (DC vs Bełchatów)</span>
            </button>
          </div>

          {/* Kontrolki symulacji dla zakładki hałasu */}
          {activeTab === 'noise' && (
            <div className="flex items-center space-x-3 text-xs pb-2">
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
                    Spadek Natężenia Dźwięku – Wentylatory (ciągły) i Agregaty Diesla (testy)
                  </h3>
                  <span className="text-xs text-rose-400 font-mono">
                    Model 1/r<sup>1,5</sup> &middot; Strefa przekroczeń: 0–2000 m
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartNoiseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[30, 100]} unit=" dBA" />
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
                        dataKey="effectiveNoiseContinuous"
                        fill="rgba(244, 63, 94, 0.12)"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        name="Hałas ciągły wentylatorów (dBA)"
                      />
                      <Line
                        type="monotone"
                        dataKey="effectiveNoiseGenerator"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        name="Hałas testów diesla (dBA)"
                        connectNulls
                      />
                      <ReferenceLine
                        y={40}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        label={{ value: 'Norma Nocna 40 dBA', fill: '#10b981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={50}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{ value: 'Norma Dienna 50 dBA', fill: '#f59e0b', fontSize: 10 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela szczegółów opisu hałasu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-rose-400 mb-1">150–500 m (Strefa Krytyczna)</div>
                  <p className="text-slate-300">
                    Hałas 65–57 dBA. Znaczne przekroczenie normy nocnej (40 dBA) o 17–25 dB. Ciągły szum wentylatorów bardziej uciążliwy niż tymczasowy hałas generatorów.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">500–1000 m (Strefa Przekroczeń)</div>
                  <p className="text-slate-300">
                    Spadek do 53 dBA. Norma nocna wciąż przekroczona o ~13 dB. Hałas wentylatorów i generatorów zrównuje się na tym dystansie.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-purple-400 mb-1">2–4 km (Niskie Częstotliwości)</div>
                  <p className="text-slate-300">
                    Niskie częstotliwości (&lt;200 Hz) nie są pochłaniane przez powietrze ani ekrany akustyczne. Słyszalne do 3,2–4 km. dBA drastycznie niedoszacowuje uciążliwości.
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'thermal' ? (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Wzrost Temperatury Otoczenia (°C) – Model Wielomianowy (Quadratic Fit)
                  </h3>
                  <span className="text-xs text-amber-400 font-mono">
                    ΔT(d) = 0,0158·d² – 0,3585·d + 2,0482
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
                  <div className="font-bold text-amber-400 mb-1">0 – 1 km (Wysoki wpływ)</div>
                  <p className="text-slate-300">
                    Wzrost temperatury z +2,07°C przy krawędzi do +1,71°C na 1 km. Wyraźnie odczuwalna modyfikacja mikroklimatu lokalnego.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-orange-400 mb-1">1 – 3 km (Umiarkowany wpływ)</div>
                  <p className="text-slate-300">
                    Spadek z +1,71°C do +1,11°C. Stopniowe wygaszanie sygnału termicznego, wciąż mierzalny wpływ.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">3 – 10 km (Oddziaływanie tła)</div>
                  <p className="text-slate-300">
                    Spadek z +1,11°C przez +0,65°C (5 km) do śladowego +0,04°C (10 km). Sygnał zanika w naturalnym tle klimatycznym.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Roczne Zużycie Wody – Data Center 500 MW vs Mieszkańcy Bełchatowa
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    4,38 TWh/rok &middot; WUE 0,21 + produkcja energii ~2,5 l/kWh
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={WATER_COMPARISON_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="podmiot" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        domain={[0, 12_000_000]}
                        tickFormatter={(v) => `${(v as number) / 1_000_000} mln`}
                        label={{ value: 'm³/rok', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                      />
                      <RechartsTooltip
                        formatter={(value) => `${Number(value).toLocaleString('pl-PL')} m³/rok`}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        dataKey="bezposrednie"
                        stackId="woda"
                        fill="#22d3ee"
                        name="Zużycie bezpośrednie (chłodzenie / mieszkańcy)"
                      />
                      <Bar
                        dataKey="posrednie"
                        stackId="woda"
                        fill="#0284c7"
                        name="Zużycie pośrednie (produkcja energii)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela bilansu wodnego */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-semibold text-sm text-slate-200 mb-3">
                  Bilans wodny Data Center {WATER_ANALYSIS.powerMW} MW (praca 24/7)
                </h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-1.5 pr-2 font-semibold">Kategoria</th>
                      <th className="py-1.5 px-2 font-semibold">Wskaźnik (l/kWh)</th>
                      <th className="py-1.5 pl-2 font-semibold text-right">Roczne zużycie (m³)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800/60">
                      <td className="py-1.5 pr-2">{WATER_ANALYSIS.direct.label}</td>
                      <td className="py-1.5 px-2 font-mono">{WATER_ANALYSIS.direct.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right text-cyan-300">{WATER_ANALYSIS.direct.annualLabel}</td>
                    </tr>
                    <tr className="border-b border-slate-800/60">
                      <td className="py-1.5 pr-2">{WATER_ANALYSIS.indirect.label}</td>
                      <td className="py-1.5 px-2 font-mono">{WATER_ANALYSIS.indirect.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right text-cyan-300">{WATER_ANALYSIS.indirect.annualLabel}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-slate-100">ŁĄCZNIE</td>
                      <td className="py-1.5 px-2 font-mono font-bold">{WATER_ANALYSIS.total.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right font-bold text-cyan-400">{WATER_ANALYSIS.total.annualLabel}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] text-slate-400 mt-2">
                  Roczny pobór energii: 500 MW × 24 h × 365 dni = {WATER_ANALYSIS.annualEnergyLabel}.
                  Bełchatów ({WATER_ANALYSIS.belchatow.population.toLocaleString('pl-PL')} mieszkańców × {WATER_ANALYSIS.belchatow.litersPerPersonDay} l/dobę): {WATER_ANALYSIS.belchatow.annualLabel} rocznie.
                </p>
              </div>

              {/* Wnioski */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1">~4,1x więcej niż całe miasto</div>
                  <p className="text-slate-300">
                    Centrum danych o mocy 500 MW zużywa rocznie (~11,87 mln m³, ponad 11,8 mld litrów)
                    ok. 4,1 raza więcej wody niż wszyscy mieszkańcy Bełchatowa (~2,87 mln m³) w ciągu całego roku.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-sky-400 mb-1">Zapas miasta na ~2,9 miesiąca</div>
                  <p className="text-slate-300">
                    Woda zużywana przez samo miasto w ciągu roku wystarczyłaby temu obiektowi na ok. 2,9 miesiąca
                    nieprzerwanej pracy – skala popytu na wodę porównywalna z dodatkowym dużym miastem.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-blue-400 mb-1">Obciążenie infrastruktury</div>
                  <p className="text-slate-300">
                    Inwestycja stanowi istotne obciążenie lokalnej infrastruktury wodno-kanalizacyjnej
                    (chłodzenie bezpośrednie) oraz krajowego systemu elektroenergetycznego i zasobów
                    środowiskowych (zużycie pośrednie przy produkcji energii).
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
