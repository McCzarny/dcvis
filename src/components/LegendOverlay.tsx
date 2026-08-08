import React, { useState } from 'react';
import { GISLayer } from '../types/gis';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface LegendOverlayProps {
  layers: GISLayer[];
}

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
