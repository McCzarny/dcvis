import React, { useMemo, useState } from 'react';
import { Zap } from 'lucide-react';
import {
  BELCHATOW_PLANT_INFO,
  DC_SCENARIOS,
  DcScenarioKey,
  PLANT_LARGE_BLOCK_MW,
  PLANT_STANDARD_BLOCK_MW,
  PowerPlantBlockFillState,
  STANDARD_BLOCK_ANNUAL_TWH,
  getBlockFillStates
} from '../data/layersRegistry';

const BAR_PX_PER_MW = 120 / PLANT_STANDARD_BLOCK_MW; // blok standardowy = 120 px, blok nr 14 proporcjonalnie więcej
const TOTAL_MAX_MW = BELCHATOW_PLANT_INFO.totalMaxMW;

const fmtPL = (value: number, maxFrac: number = 1) =>
  value.toLocaleString('pl-PL', { maximumFractionDigits: maxFrac });

const heightFor = (capacityMW: number) => Math.round(capacityMW * BAR_PX_PER_MW);

const barTexture = { backgroundImage: 'repeating-linear-gradient(135deg, rgba(245,158,11,0.07) 0 4px, transparent 4px 9px)' };

interface ScenarioSummary {
  fullBlocks: PowerPlantBlockFillState[];
  partialBlock?: PowerPlantBlockFillState;
  pctOfStation: number;
  pctVsLargest: number;
  annualTWh: number;
  blockEquivalents: number;
}

const useSummary = (powerMW: number): { states: PowerPlantBlockFillState[]; summary: ScenarioSummary } =>
  useMemo(() => {
    const states = getBlockFillStates(powerMW);
    const fullBlocks = states.filter((s) => s.fillFraction >= 0.9999);
    const partialBlock = states.find((s) => s.fillFraction > 0 && s.fillFraction < 0.9999);
    return {
      states,
      summary: {
        fullBlocks,
        partialBlock,
        pctOfStation: (powerMW / TOTAL_MAX_MW) * 100,
        pctVsLargest: (powerMW / PLANT_LARGE_BLOCK_MW) * 100,
        annualTWh: (powerMW * 8760) / 1_000_000,
        blockEquivalents: ((powerMW * 8760) / 1_000_000) / STANDARD_BLOCK_ANNUAL_TWH
      }
    };
  }, [powerMW]);

const buildScenarioSentence = (powerMW: number, summary: ScenarioSummary): string => {
  const nums = summary.fullBlocks.map((b) => b.number);
  const parts: string[] = [];
  if (nums.length > 0) {
    parts.push(
      `pełne bloki nr ${nums[0]}${nums.length > 1 ? `–${nums[nums.length - 1]}` : ''} (${fmtPL(summary.fullBlocks.reduce((a, b) => a + b.capacityMW, 0))} MW)`
    );
  }
  if (summary.partialBlock) {
    const p = summary.partialBlock;
    parts.push(
      `${fmtPL(p.filledMW)} MW z bloku nr ${p.number} (${fmtPL(p.fillFraction * 100)}%)`
    );
  }
  return `${fmtPL(powerMW)} MW to ${parts.join(' oraz ')}`;
};

export const PowerPlantBlocksTab: React.FC = () => {
  const [scenarioKey, setScenarioKey] = useState<DcScenarioKey>('dc500');
  const scenario = DC_SCENARIOS[scenarioKey];
  const { states, summary } = useSummary(scenario.powerMW);

  return (
    <div className="space-y-4">
      {/* Warianty mocy DC */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-sm text-slate-200">
            Ile bloków Elektrowni Bełchatów &bdquo;zjada&rdquo; Data Center?
          </h3>
          <div className="flex items-center gap-2">
            {(Object.values(DC_SCENARIOS) as (typeof DC_SCENARIOS)[DcScenarioKey][]).map((s) => (
              <button
                key={s.key}
                onClick={() => setScenarioKey(s.key)}
                className={`px-3 py-2 rounded-xl border text-left transition-all ${
                  scenarioKey === s.key
                    ? 'bg-sky-500/15 border-sky-400/60 text-sky-300 shadow-md'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-bold font-mono leading-tight">{s.label}</div>
                <div className="text-[9px] uppercase tracking-wide opacity-80">{s.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Każdy słupek to jeden czynny blok energetyczny o wysokości proporcjonalnej do mocy. Pobór Data Center wypełnia
          kolejne bloki – od numeru 2, aż po gigantyczny blok nr 14.{' '}
          <span className="text-sky-300">{buildScenarioSentence(scenario.powerMW, summary)}</span>.
        </p>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" /> pobór Data Center
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm border border-amber-500/50 inline-block"
              style={barTexture}
            />
            wolna moc bloku
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-sky-300" fill="currentColor" /> blok zapełniony w całości
          </span>
        </div>

        {/* Wykres bloków */}
        <div className="h-[360px] pt-6 pb-1 border-b border-slate-800">
          <div className="flex items-stretch h-full gap-1.5 sm:gap-2 px-1">
            {states.map((s) => {
              const h = heightFor(s.capacityMW);
              const fillPx = Math.round(h * s.fillFraction);
              const isFull = s.fillFraction >= 0.9999;
              return (
                <div key={s.number} className="flex-1 flex flex-col justify-end items-center gap-1">
                  <div
                    className="relative w-full max-w-[46px] rounded-t-md border border-amber-500/40 overflow-visible"
                    style={{ height: h, ...barTexture }}
                    title={`Blok nr ${s.number}: ${s.capacityMW} MW${s.filledMW > 0 ? ` · pobór DC pokrywa ${fmtPL(s.filledMW)} MW (${fmtPL(s.fillFraction * 100)}%)` : ''}`}
                  >
                    {isFull && (
                      <Zap
                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-sky-300"
                        fill="currentColor"
                      />
                    )}
                    {s.fillFraction > 0 && (
                      <div
                        className={`absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-sky-600/90 to-sky-400/90 ${
                          !isFull ? 'border-t border-dashed border-white/80' : ''
                        }`}
                        style={{ height: fillPx }}
                      >
                        {!isFull && fillPx > 34 && (
                          <span className="absolute bottom-1 inset-x-0 text-center text-[9px] font-mono font-bold text-slate-900">
                            +{fmtPL(s.filledMW)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-bold leading-none text-slate-200">nr {s.number}</div>
                  <div className="text-[8px] font-mono leading-none text-slate-500">{s.capacityMW} MW</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Karty podsumowujące */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="font-bold text-sky-400 mb-1">{fmtPL(summary.pctOfStation)}% mocy całej stacji</div>
          <p className="text-slate-300">
            Pobór {fmtPL(scenario.powerMW)} MW odpowiada {fmtPL(summary.pctOfStation)}% mocy maksymalnej
            Elektrowni Bełchatów ({fmtPL(TOTAL_MAX_MW)} MW) – największej elektrowni w Polsce.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="font-bold text-cyan-400 mb-1">
            Zapełnione bloki: {summary.fullBlocks.length}/11 mniejszych
          </div>
          <p className="text-slate-300">
            Pobór Data Center wypełnia kolejne bloki od najniższych numerów –{' '}
            {summary.partialBlock
              ? `obecnie sięga na ${fmtPL(summary.partialBlock.fillFraction * 100)}% bloku nr ${summary.partialBlock.number}`
              : 'bez poboru częściowego'}
            . Dopiero po zapełnieniu wszystkich sięgnęłoby po blok nr 14.
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="font-bold text-amber-400 mb-1">
            {scenario.powerMW > PLANT_LARGE_BLOCK_MW ? 'Więcej niż największy blok' : `${fmtPL(summary.pctVsLargest)}% największego bloku`}
          </div>
          <p className="text-slate-300">
            Blok nr 14 ma {fmtPL(PLANT_LARGE_BLOCK_MW)} MW.{' '}
            {scenario.powerMW > PLANT_LARGE_BLOCK_MW
              ? `Wnioskowana moc (${fmtPL(scenario.powerMW)} MW) przekracza go o ${fmtPL(scenario.powerMW - PLANT_LARGE_BLOCK_MW)} MW (${fmtPL(summary.pctVsLargest - 100)}%).`
              : 'Jeden modernizowany gigant nie wystarczy nawet na połowę poboru centrum danych.'}
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="font-bold text-yellow-400 mb-1">
            {fmtPL(summary.annualTWh, 2)} TWh rocznie ≈ {fmtPL(summary.blockEquivalents)} bloku non stop
          </div>
          <p className="text-slate-300">
            Przy pracy 24/7 przez cały rok pobór to ok. {fmtPL(summary.blockEquivalents)} przeciętnego bloku
            (370–390 MW), który musiałby pracować bez przerwy przez wszystkie dni roku ({fmtPL(STANDARD_BLOCK_ANNUAL_TWH, 2)} TWh).
          </p>
        </div>
      </div>

      {/* Źródła i założenia */}
      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <p className="text-[11px] text-slate-500">
          Założenia: dla bloków nr 2–12 przyjęto wartość średnią 380 MW (moc nominalna 370–390 MW); blok nr 14 – 858 MW.
          Suma mocy nominalnych (~5038 MW) jest niższa niż podawana moc maksymalna stacji ({fmtPL(TOTAL_MAX_MW)} MW) –
          różnica wynika m.in. z przyrostów mocy po modernizacjach. Udział % liczony względem {fmtPL(TOTAL_MAX_MW)} MW.
          <br />
          Źródło: {BELCHATOW_PLANT_INFO.sourceLabel}.
        </p>
      </div>
    </div>
  );
};
