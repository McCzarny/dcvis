import React, { useState } from 'react';
import { X, PlusCircle, Code, Palette, Tag } from 'lucide-react';
import { GISLayer, LayerCategory } from '../types/gis';

interface AddLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLayer: (layer: GISLayer) => void;
}

export const AddLayerModal: React.FC<AddLayerModalProps> = ({ isOpen, onClose, onAddLayer }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LayerCategory>('inwestycja');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [geoJsonInput, setGeoJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Proszę podać nazwę warstwy.');
      return;
    }

    let parsedGeoJson: any;
    try {
      parsedGeoJson = JSON.parse(geoJsonInput);
    } catch (err) {
      setError('Niepoprawny format GeoJSON (wymagany prawidłowy ciąg JSON).');
      return;
    }

    const newLayer: GISLayer = {
      id: `custom_layer_${Date.now()}`,
      name,
      category,
      description: description || 'Własna warstwa przestrzenna wdrożona dynamicznie.',
      visible: true,
      opacity: 0.7,
      color,
      fillColor: color,
      type: 'geojson',
      geoJsonData: parsedGeoJson,
      sources: ['Użytkownik / Custom GeoJSON']
    };

    onAddLayer(newLayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-700/80">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">
                Dodaj Nową Warstwę Przestrzenną GeoJSON
              </h2>
              <p className="text-xs text-slate-400">
                Rozszerz mapę o własne poligony, linie lub punkty pomiarowe
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nazwa Warstwy:</label>
            <input
              type="text"
              placeholder="np. Nowa Linia Światłowodowa, Działki Sąsiednie..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kategoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LayerCategory)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="inwestycja">Inwestycja</option>
                <option value="srodowisko">Środowisko</option>
                <option value="akustyka">Akustyka</option>
                <option value="termika">Termika</option>
                <option value="planowanie">Planowanie</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kolor Poligonu/Linii:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-9 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-slate-400">{color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Opis Warstwy:</label>
            <input
              type="text"
              placeholder="Krótki opis funkcji i pochodzenia danych..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Kod GeoJSON (Feature lub FeatureCollection):</label>
            <textarea
              rows={5}
              placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[...]]},"properties":{...}}'
              value={geoJsonInput}
              onChange={(e) => setGeoJsonInput(e.target.value)}
              className="w-full font-mono bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-cyan-300 text-[11px] focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-600/30"
            >
              Dodaj Warstwę
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
