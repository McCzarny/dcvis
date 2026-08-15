import React, { useState } from 'react';
import { GISLayer } from '../types/gis';
import { Layers, Eye, EyeOff, Sliders, ChevronLeft, ChevronRight, Volume2, ShieldAlert, Thermometer, ShieldCheckIcon, MapPin, Droplets, Zap } from 'lucide-react';

interface LayerControlPanelProps {
  layers: GISLayer[];
  onToggleLayer: (id: string) => void;
  onChangeOpacity: (id: string, opacity: number) => void;
  onApplyPreset: (preset: 'continuous_noise' | 'generator_noise' | 'thermal' | 'protected_areas' | 'residential_distances' | 'water' | 'energy' | null) => void;
  activePreset: 'continuous_noise' | 'generator_noise' | 'thermal' | 'protected_areas' | 'residential_distances' | 'water' | 'energy' | null;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  layers,
  onToggleLayer,
  onChangeOpacity,
  onApplyPreset,
  activePreset
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const presets = [
    {
      id: 'continuous_noise' as const,
      label: 'Hałas wentylatorów',
      color: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100',
      icon: <Volume2 className="w-3.5 h-3.5 text-orange-600" />
    },
    {
      id: 'generator_noise' as const,
      label: 'Testy generatorów',
      color: 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
    },
    {
      id: 'thermal' as const,
      label: 'Wpływ na temperaturę',
      color: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100',
      icon: <Thermometer className="w-3.5 h-3.5 text-amber-600" />
    },
    {
      id: 'protected_areas' as const,
      label: 'Obszary chronione',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100',
      icon: <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
    },
    {
      id: 'residential_distances' as const,
      label: 'Odległości do zabudowań',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100',
      icon: <MapPin className="w-3.5 h-3.5 text-indigo-600" />
    },
    {
      id: 'water' as const,
      label: 'Zużycie wody (DC vs Bełchatów)',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-900 hover:bg-cyan-100',
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-600" />
    },
    {
      id: 'energy' as const,
      label: 'Zużycie prądu (DC vs Bełchatów)',
      color: 'bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100',
      icon: <Zap className="w-3.5 h-3.5 text-yellow-600" />
    }
  ];

  return (
    <div
      className={`absolute top-4 left-4 z-[1500] transition-all duration-300 flex ${
        collapsed ? 'w-12' : 'w-80 md:w-96'
      }`}
    >
      <div className="w-full glass-panel rounded-2xl flex flex-col max-h-[calc(100vh-6rem)] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-sm text-slate-800">Warstwy Mapy i Wpływu</h2>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-all ml-auto"
            title={collapsed ? 'Rozwiń panel warstw' : 'Zwiń panel'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 text-slate-800 flex flex-col">
            {/* Przełączniki warstw */}
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-2 tracking-wider">
                Wybierz warstwę do wyświetlenia
              </div>
              <div className="space-y-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(activePreset === preset.id ? null : preset.id)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-[11px] font-semibold text-left transition-all flex items-center space-x-2 ${
                      activePreset === preset.id
                        ? `${preset.color.split(' ')[0]} border-2 ring-2 ring-offset-1 ring-current`
                        : `${preset.color}`
                    }`}
                  >
                    {preset.icon}
                    <span className="flex-1 truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t border-slate-200 pt-2.5 mt-auto">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100/60 hover:bg-slate-200/60 transition-all text-xs font-semibold text-slate-700"
              >
                <span>Zaawansowane ustawienia</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${advancedOpen ? 'rotate-90' : ''}`} />
              </button>

              {advancedOpen && (
                <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-2.5 rounded-lg border transition-all ${
                        layer.visible
                          ? 'bg-white border-slate-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleLayer(layer.id)}
                            className={`p-1 rounded transition-all flex-shrink-0 ${
                              layer.visible
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-slate-200 text-slate-500 hover:text-slate-700'
                            }`}
                            title={layer.visible ? 'Ukryj warstwę' : 'Pokaż warstwę'}
                          >
                            {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: layer.color }}
                              />
                              <h3 className="font-semibold text-[10px] text-slate-900 leading-tight truncate">
                                {layer.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>

                      {layer.visible && (
                        <div className="ml-7 flex items-center space-x-2 pt-1.5">
                          <Sliders className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.05"
                              value={layer.opacity}
                              onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                              className="w-full h-0.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-600 font-semibold w-6 text-right flex-shrink-0">
                            {Math.round(layer.opacity * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
