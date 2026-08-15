import React, { useState } from 'react';
import { GISLayer } from '../types/gis';
import { WATER_ANALYSIS } from '../data/layersRegistry';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface LegendOverlayProps {
  layers: GISLayer[];
}

const formatMln = (m3: number) =>
  (m3 / 1_000_000).toLocaleString('pl-PL', { maximumFractionDigits: 2 });

export const LegendOverlay: React.FC<LegendOverlayProps> = ({ layers }) => {
  const [collapsed, setCollapsed] = useState(false);
  const activeLayers = layers.filter((l) => l.visible);

  return (
    <div className="absolute bottom-6 right-4 z-[900] max-w-xs md:max-w-sm rounded-2xl p-3 shadow-2xl transition-all bg-white/90 border border-slate-300 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
        <div className="flex items-center space-x-1.5">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Legenda Mapy
          </h3>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-600 hover:text-slate-800 p-0.5"
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
          {activeLayers.length > 0 ? (
            activeLayers.map((layer) => (
              <div key={`legend-${layer.id}`} className="space-y-1">
                <div className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span>{layer.name}</span>
                </div>

                {/* Rysowanie pod-buforów jeśli istnieją */}
                {layer.buffers && layer.buffers.length > 0 && (
                  <div className="pl-4 space-y-1 mt-1 border-l border-slate-300">
                    {layer.buffers.map((buf) => (
                      <div
                        key={`legend-buf-${buf.distanceMeters}`}
                        className="flex items-center justify-between text-[11px] text-slate-700"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: buf.color }}
                          />
                          <span>{buf.label}</span>
                        </div>
                        <span className="font-mono text-slate-800 font-semibold">{buf.valueText}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Panel porównania zużycia wody (Data Center vs Bełchatów) */}
                {layer.id === 'water_consumption_layer' && (
                  <div className="mt-1.5 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-cyan-400 border border-cyan-600" />
                          <span>Data Center 500 MW (łącznie)</span>
                        </div>
                        <span className="font-mono text-slate-800 font-semibold">
                          ~{formatMln(WATER_ANALYSIS.total.annualM3)} mln m³/rok
                        </span>
                      </div>
                      <div className="pl-4 space-y-0.5 text-[10px] text-slate-500">
                        <div className="flex items-center justify-between">
                          <span>– chłodzenie (WUE {WATER_ANALYSIS.direct.factorLabel})</span>
                          <span className="font-mono">~{formatMln(WATER_ANALYSIS.direct.annualM3)} mln m³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>– produkcja energii ({WATER_ANALYSIS.indirect.factorLabel})</span>
                          <span className="font-mono">~{formatMln(WATER_ANALYSIS.indirect.annualM3)} mln m³</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-400 border border-indigo-600" />
                          <span>Bełchatów ({WATER_ANALYSIS.belchatow.population.toLocaleString('pl-PL')} mieszk.)</span>
                        </div>
                        <span className="font-mono text-slate-800 font-semibold">
                          ~{formatMln(WATER_ANALYSIS.belchatow.annualM3)} mln m³/rok
                        </span>
                      </div>
                    </div>

                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 text-[11px] leading-relaxed text-cyan-900">
                      Centrum danych zużywa ok. <strong>{WATER_ANALYSIS.ratioVsCity.toLocaleString('pl-PL')} raza więcej wody</strong> niż
                      wszyscy mieszkańcy Bełchatowa. Roczne zużycie miasta wystarczyłoby obiektowi na ok.{' '}
                      <strong>{WATER_ANALYSIS.cityWaterForDcMonths.toLocaleString('pl-PL')} miesiąca</strong> pracy.
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-slate-600 text-xs italic">
              Brak widocznych warstw
            </div>
          )}
        </div>
      )}
    </div>
  );
};
