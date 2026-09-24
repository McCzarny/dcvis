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
  Area,
  LabelList
} from 'recharts';
import {
  NOISE_DECAY_CHART_DATA,
  THERMAL_ELEVATION_CHART_DATA
} from '../data/layersRegistry';
import {
  DataCenterProfile,
  buildEnergyChartRows,
  buildWaterChartRows,
  formatFixed,
  formatGWh,
  formatInt,
  formatMlnM3,
  formatNum,
  ratioClause
} from '../data/dataCenters';
import { X, Volume2, Thermometer, Activity, Droplets, Zap, Factory } from 'lucide-react';
import { PowerPlantBlocksTab } from './PowerPlantBlocksTab';

interface AnalyticsDrawerProps {
  dataCenter: DataCenterProfile;
  isOpen: boolean;
  onClose: () => void;
}

type AnalyticsTab = 'noise' | 'thermal' | 'water' | 'energy' | 'blocks';

export const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({ dataCenter, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('noise');

  if (!isOpen) return null;

  const specs = dataCenter.specs;
  const water = dataCenter.water;
  const waterComparison = water.comparison;
  const energy = dataCenter.energy;
  const energyComparison = energy.comparison;
  const waterRows = buildWaterChartRows(dataCenter);
  const energyRows = buildEnergyChartRows(dataCenter);

  // Zakładki zależne od DC: wymuszamy zakładkę dostępną dla aktywnego centrum
  // (np. bez analizy hałasu i termiki dla Piaseczna zostają Woda i Energia)
  const availableTabs: AnalyticsTab[] = [
    ...(dataCenter.hasNoiseAnalysis ? (['noise'] as AnalyticsTab[]) : []),
    ...(dataCenter.hasThermalAnalysis ? (['thermal'] as AnalyticsTab[]) : []),
    'water',
    'energy',
    ...(dataCenter.hasPowerPlantComparison ? (['blocks'] as AnalyticsTab[]) : [])
  ];
  const tab: AnalyticsTab = availableTabs.includes(activeTab)
    ? activeTab
    : (availableTabs[0] ?? 'water');

  // Obliczanie szumu w warunkach neutralnych oraz przy nocnej inwersji (model 1/r^1.5, +5 dBA od 500 m)
  const chartNoiseData = NOISE_DECAY_CHART_DATA.map((item) => {
    const inversion = item.distance >= 500;
    return {
      ...item,
      neutralNoiseContinuous: item.noiseContinuous,
      neutralNoiseGenerator: item.noiseGenerator,
      inversionNoiseContinuous: inversion ? item.noiseContinuous + 5 : item.noiseContinuous,
      inversionNoiseGenerator: item.noiseGenerator != null ? item.noiseGenerator + (inversion ? 5 : 0) : undefined
    };
  });

  const waterPeak = Math.max(...waterRows.map((row) => row.bezposrednie + row.posrednie));
  const waterChartDomain: [number, number] = [0, Math.max(12_000_000, waterPeak * 1.15)];

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
                {dataCenter.hasNoiseAnalysis
                  ? 'Wykresy Oddziaływania: Hałas, Mikroklimat, Woda i Energia'
                  : dataCenter.hasThermalAnalysis
                    ? 'Wykresy Oddziaływania: Mikroklimat, Woda i Energia'
                    : 'Wykresy Oddziaływania: Woda i Energia'}
              </h2>
              <p className="text-xs text-slate-400">
                Data Center {specs.shortName} – symulacja
                {dataCenter.hasNoiseAnalysis ? ' spadku hałasu,' : ''}
                {dataCenter.hasThermalAnalysis ? ' wzrostu temperatury,' : ''} bilansu
                wodnego i energetycznego
                {dataCenter.hasPowerPlantComparison
                  ? ' oraz skali mocy względem Elektrowni Bełchatów'
                  : ''}
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
        <div className="px-6 pt-4 flex items-center justify-between overflow-x-auto border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center space-x-2">
            {dataCenter.hasNoiseAnalysis && (
              <button
                onClick={() => setActiveTab('noise')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                  tab === 'noise'
                    ? 'bg-slate-900 text-rose-400 border-slate-700 shadow-md'
                    : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Profil Akustyczny (Hałas dBA)</span>
              </button>
            )}

            {dataCenter.hasThermalAnalysis && (
              <button
                onClick={() => setActiveTab('thermal')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                  tab === 'thermal'
                    ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-md'
                    : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                <span>Profil Termiczny (Zasięg Ciepła °C)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('water')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                tab === 'water'
                  ? 'bg-slate-900 text-cyan-400 border-slate-700 shadow-md'
                  : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>
                Bilans Wodny
                {waterComparison ? ` (DC vs ${waterComparison.city.name})` : ' (DC)'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('energy')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                tab === 'energy'
                  ? 'bg-slate-900 text-yellow-400 border-slate-700 shadow-md'
                  : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                Bilans Energetyczny
                {energyComparison ? ` (DC vs ${energyComparison.city.name})` : ' (DC)'}
              </span>
            </button>

            {dataCenter.hasPowerPlantComparison && (
              <button
                onClick={() => setActiveTab('blocks')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-x transition-all ${
                  tab === 'blocks'
                    ? 'bg-slate-900 text-sky-400 border-slate-700 shadow-md'
                    : 'text-slate-200 border-transparent hover:text-slate-100 bg-slate-800/30'
                }`}
              >
                <Factory className="w-4 h-4" />
                <span>Skala Mocy</span>
              </button>
            )}
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {tab === 'noise' ? (
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
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="neutralNoiseContinuous"
                        fill="rgba(244, 63, 94, 0.12)"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        name="Hałas ciągły wentylatorów (dBA) – warunki neutralne"
                      />
                      <Line
                        type="monotone"
                        dataKey="inversionNoiseContinuous"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        name="Hałas ciągły wentylatorów (dBA) – nocna inwersja & wiatr"
                      />
                      <Line
                        type="monotone"
                        dataKey="neutralNoiseGenerator"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        name="Hałas testów diesla (dBA) – warunki neutralne"
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="inversionNoiseGenerator"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="2 3"
                        name="Hałas testów diesla (dBA) – nocna inwersja & wiatr"
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
                    Spadek do 53 dBA. Norma nocna wciąż przekroczona o ~13 dB. Hałas wentylatorów i generatorów zrównoważy się na tym dystansie.
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
          ) : tab === 'thermal' ? (
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
          ) : tab === 'water' ? (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Roczne Zużycie Wody – Data Center {water.powerMW} MW
                    {waterComparison ? ` vs Mieszkańcy ${waterComparison.city.genitive}` : ''}
                  </h3>
                  <span className="text-xs text-cyan-400 font-mono">
                    {formatGWh(energy.dc.annualGWh)}/rok &middot; chłodzenie {water.direct.factorLabel} +
                    produkcja energii ~{formatFixed(water.indirect.factorLKwh, 1)} l/kWh
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="podmiot" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        domain={waterChartDomain}
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
                        fill="#60b0d7"
                        name="Zużycie pośrednie (produkcja energii)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela bilansu wodnego */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-semibold text-sm text-slate-200 mb-3">
                  Bilans wodny Data Center {water.powerMW} MW (praca 24/7)
                </h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-1.5 pr-2 font-semibold">Kategoria</th>
                      <th className="py-1.5 px-2 font-semibold">Wskaźnik</th>
                      <th className="py-1.5 pl-2 font-semibold text-right">Roczne zużycie (m³)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800/60">
                      <td className="py-1.5 pr-2">{water.direct.label}</td>
                      <td className="py-1.5 px-2 font-mono">{water.direct.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right text-cyan-300">{water.direct.annualLabel}</td>
                    </tr>
                    <tr className="border-b border-slate-800/60">
                      <td className="py-1.5 pr-2">{water.indirect.label}</td>
                      <td className="py-1.5 px-2 font-mono">{water.indirect.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right text-cyan-300">{water.indirect.annualLabel}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-2 font-bold text-slate-100">ŁĄCZNIE</td>
                      <td className="py-1.5 px-2 font-mono font-bold">{water.total.factorLabel}</td>
                      <td className="py-1.5 pl-2 font-mono text-right font-bold text-cyan-400">{water.total.annualLabel}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] text-slate-400 mt-2">
                  Roczny pobór energii: {water.powerMW} MW × 24 h × 365 dni = {water.annualEnergyLabel}.
                  {waterComparison ? (
                    <>
                      {' '}
                      {waterComparison.city.name} ({waterComparison.city.population.toLocaleString('pl-PL')} mieszkańców ×{' '}
                      {waterComparison.city.perCapitaLabel}): {waterComparison.city.annualLabel} rocznie.
                    </>
                  ) : (
                    <>
                      {' '}
                      Zużycie bezpośrednie: {water.direct.factorLabel} × 365 dni = {water.direct.annualLabel}.
                    </>
                  )}
                </p>
              </div>

              {/* Wydajność wód podziemnych – tylko gdy są dane */}
              {waterComparison?.groundwater && (
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <h3 className="font-semibold text-sm text-slate-200 mb-2">
                    Wydajność Wód Podziemnych (Warstwa Wodonośna Czwartorzędu)
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-none">
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">&#9679;</span>
                      <span>{waterComparison.groundwater.aquiferDepthNote}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">&#9679;</span>
                      <span>{waterComparison.groundwater.waterTableNote}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">&#9679;</span>
                      <span>
                        {waterComparison.groundwater.yieldNote}{' '}
                        <span className="font-mono text-cyan-300">
                          do {waterComparison.groundwater.maxFlowM3h} m³/h &middot; zwykle 10–40 m³/h
                        </span>
                      </span>
                    </li>
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Źródło: {waterComparison.groundwater.source}
                  </p>
                </div>
              )}

              {/* Wnioski */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {waterComparison ? (
                  <>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-cyan-400 mb-1">
                        ~{formatNum(waterComparison.ratioVsCity, 2)}x zużycie całego miasta
                      </div>
                      <p className="text-slate-300">
                        Centrum danych o mocy {water.powerMW} MW zużywa rocznie (~{formatMlnM3(water.total.annualM3)} mln m³,
                        ponad {formatMlnM3(water.total.annualM3)} mld litrów) ok. {ratioClause(waterComparison.ratioVsCity, 'wody')}{' '}
                        wszyscy mieszkańcy {waterComparison.city.genitive} ({waterComparison.city.annualLabel}) w ciągu całego roku.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-sky-400 mb-1">
                        Zapas miasta na ~{formatNum(waterComparison.cityWaterForDcMonths, 1)} miesiąca
                      </div>
                      <p className="text-slate-300">
                        Woda zużywana przez samo miasto w ciągu roku wystarczyłaby temu obiektowi na ok.{' '}
                        {formatNum(waterComparison.cityWaterForDcMonths, 1)} miesiąca nieprzerwanej pracy
                        {waterComparison.ratioVsCity >= 1
                          ? ' – skala popytu na wodę porównywalna z dodatkowym dużym miastem.'
                          : ' – roczne zużycie miasta przewyższa zapotrzebowanie tego obiektu.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-blue-400 mb-1">Obciążenie infrastruktury</div>
                      <p className="text-slate-300">
                        Zużycie bezpośrednie (chłodzenie) wynosi {water.direct.factorLabel} ({
                          water.direct.annualLabel
                        }/rok), natomiast główne obciążenie stanowi krajowy system elektroenergetyczny i zasoby
                        środowiskowe (zużycie pośrednie przy produkcji energii).
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-cyan-400 mb-1">{water.direct.annualLabel} rocznie</div>
                      <p className="text-slate-300">
                        Bezpośrednie zużycie wody (chłodzenie) wynosi {water.direct.factorLabel}, czyli{' '}
                        {water.direct.annualLabel} rocznie przy pracy przez cały rok.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-sky-400 mb-1">
                        {water.total.annualLabel} łącznie
                      </div>
                      <p className="text-slate-300">
                        Po doliczeniu zużycia pośredniego przy produkcji prądu ({water.indirect.annualLabel}/rok, założenie{' '}
                        {water.indirect.factorLabel}) łączne zużycie wynosi {water.total.annualLabel} (
                        {water.total.annualLitersLabel}) rocznie.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-slate-300 mb-1">Dane w przygotowaniu</div>
                      <p className="text-slate-300">
                        Porównanie zużycia wody z miastem oraz wydajność wód podziemnych zostaną uzupełnione,
                        gdy będą dostępne wiarygodne dane dla tej lokalizacji.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : tab === 'blocks' ? (
            <PowerPlantBlocksTab />
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-slate-200">
                    Roczne Zużycie Energii – Data Center {energy.powerMW} MW
                    {energyComparison ? ` vs Mieszkańcy ${energyComparison.city.genitive}` : ''}
                  </h3>
                  <span className="text-xs text-yellow-400 font-mono">
                    {energy.powerMW} MW &middot; 24 h &middot; 365 dni = {formatGWh(energy.dc.annualGWh)}
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={energyRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="podmiot" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        scale="log"
                        domain={[10, 10000]}
                        ticks={[10, 100, 1000, 10000]}
                        tickFormatter={(v) => `${v}`}
                        label={{ value: 'GWh/rok (skala logarytmiczna)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                      />
                      <RechartsTooltip
                        formatter={(value) => formatGWh(Number(value))}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc'
                        }}
                      />
                      <Bar dataKey="gwh" fill="#facc15" name="Roczne zużycie energii">
                        <LabelList
                          dataKey="gwh"
                          position="top"
                          fill="#f8fafc"
                          fontSize={12}
                          formatter={(v: number | string) => formatGWh(Number(v))}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela bilansu energetycznego */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-semibold text-sm text-slate-200 mb-3">
                  Bilans energetyczny Data Center {energy.powerMW} MW (praca 24/7)
                </h3>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-1.5 pr-2 font-semibold">Kategoria</th>
                      <th className="py-1.5 px-2 font-semibold">Wskaźnik</th>
                      <th className="py-1.5 pl-2 font-semibold text-right">Roczne zużycie</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800/60">
                      <td className="py-1.5 pr-2">Data Center – pobór (praca 24/7)</td>
                      <td className="py-1.5 px-2 font-mono">{energy.powerMW} MW</td>
                      <td className="py-1.5 pl-2 font-mono text-right text-yellow-300">
                        {energy.dc.annualLabel}
                      </td>
                    </tr>
                    {energyComparison && (
                      <tr className="border-b border-slate-800/60">
                        <td className="py-1.5 pr-2">{energyComparison.city.name} – mieszkańcy</td>
                        <td className="py-1.5 px-2 font-mono">{energyComparison.city.perCapitaLabel}/mieszkańca</td>
                        <td className="py-1.5 pl-2 font-mono text-right text-yellow-300">
                          {energyComparison.city.annualLabel}
                        </td>
                      </tr>
                    )}
                    {energyComparison && (
                      <tr>
                        <td className="py-1.5 pr-2 font-bold text-slate-100">
                          Stosunek DC / {energyComparison.city.name}
                        </td>
                        <td className="py-1.5 px-2 font-mono font-bold">—</td>
                        <td className="py-1.5 pl-2 font-mono text-right font-bold text-yellow-400">
                          ~{energyComparison.ratioVsCity.toLocaleString('pl-PL')}x
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p className="text-[11px] text-slate-400 mt-2">
                  {energyComparison ? (
                    <>
                      GUS 2024 (Bank Danych Lokalnych): {energyComparison.city.perCapitaLabel} na mieszkańca{' '}
                      {energyComparison.city.genitive}. {energyComparison.city.name} (
                      {energyComparison.city.population.toLocaleString('pl-PL')} mieszk.):{' '}
                      {energyComparison.city.annualLabel} rocznie.
                    </>
                  ) : (
                    <>
                      Roczny pobór: {energy.powerMW} MW × 8760 h = {formatInt(energy.dc.annualKWh)} kWh (
                      {formatGWh(energy.dc.annualGWh)}). Porównanie z miastem – dane w przygotowaniu.
                    </>
                  )}
                </p>
              </div>

              {/* Wnioski */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {energyComparison ? (
                  <>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-yellow-400 mb-1">
                        ~{energyComparison.ratioVsCity.toLocaleString('pl-PL')}x zużycie całego miasta
                      </div>
                      <p className="text-slate-300">
                        Centrum danych o mocy {energy.powerMW} MW zużywa rocznie ok. {formatGWh(energy.dc.annualGWh)} –{' '}
                        {ratioClause(energyComparison.ratioVsCity, 'energii elektrycznej')}{' '}
                        wszyscy mieszkańcy {energyComparison.city.genitive} ({formatGWh(energyComparison.city.annualGWh)})
                        w ciągu całego roku.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-400 mb-1">
                        Całoroczny prąd miasta na ~{formatNum(energyComparison.cityEnergyForDcDays, 1)} dnia
                      </div>
                      <p className="text-slate-300">
                        Energia zużywana przez całe miasto w ciągu roku pokryłaby zapotrzebowanie tego obiektu
                        na ok. {formatNum(energyComparison.cityEnergyForDcDays, 1)} dnia nieprzerwanej pracy
                        {energyComparison.ratioVsCity >= 1
                          ? ' – skala zapotrzebowania porównywalna z dużą aglomeracją.'
                          : ' – roczne zużycie miasta przewyższa zapotrzebowanie tego obiektu.'}
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-orange-400 mb-1">Obciążenie sieci elektroenergetycznej</div>
                      <p className="text-slate-300">
                        Pobór rzędu {energy.powerMW} MW ({formatGWh(energy.dc.annualGWh)}) to istotne obciążenie
                        krajowego systemu elektroenergetycznego – porównywalne z zapotrzebowaniem dużego miasta,
                        wraz z kosztami środowiskowymi produkcji energii.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-yellow-400 mb-1">
                        ~{formatGWh(energy.dc.annualGWh)} rocznie
                      </div>
                      <p className="text-slate-300">
                        Centrum danych o mocy {energy.powerMW} MW pracując 24/7 przez 365 dni zużywa ok.{' '}
                        {formatGWh(energy.dc.annualGWh)} ({formatInt(energy.dc.annualKWh)} kWh) rocznie.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-400 mb-1">Moc ~{energy.powerMW} MW</div>
                      <p className="text-slate-300">
                        Stały pobór mocy rzędu {energy.powerMW} MW to istotne obciążenie lokalnej sieci
                        elektroenergetycznej, niezależnie od pory doby i sezonu.
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div className="font-bold text-slate-300 mb-1">Dane w przygotowaniu</div>
                      <p className="text-slate-300">
                        Porównanie zużycia energii z miastem (zużycie per capita, stosunek do gminy)
                        zostanie uzupełnione, gdy będą dostępne wiarygodne dane dla tej lokalizacji.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
