import React, { useState, useEffect } from 'react';
import { GISLayer, MapTileProvider } from './types/gis';
import { INITIAL_LAYERS } from './data/layersRegistry';
import { HeaderNav } from './components/HeaderNav';
import { MapContainerComponent } from './components/MapContainer';
import { LayerControlPanel } from './components/LayerControlPanel';
import { LegendOverlay } from './components/LegendOverlay';
import { AnalyticsDrawer } from './components/AnalyticsDrawer';
import { ProjectDocsModal } from './components/ProjectDocsModal';

export const App: React.FC = () => {
  const [layers, setLayers] = useState<GISLayer[]>(INITIAL_LAYERS);
  // Domyślnie podkład Standard (OSM)
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('osm');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isProjectDocsOpen, setIsProjectDocsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<'continuous_noise' | 'generator_noise' | 'thermal' | 'protected_areas' | 'residential_distances' | null>('continuous_noise');
  
  // Inicjalizuj preset "Hałas wentylatorów" na starcie
  useEffect(() => {
    handleApplyPreset('continuous_noise');
  }, []);

  const handleToggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleChangeOpacity = (id: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  };

  const handleApplyPreset = (preset: 'continuous_noise' | 'generator_noise' | 'thermal' | 'protected_areas' | 'residential_distances' | null) => {
    // Set the active preset (radio button behavior)
    setActivePreset(preset);

    setLayers((prev) =>
      prev.map((layer) => {
        // Core layer always visible
        if (layer.id === 'data_center_polygon') {
          return { ...layer, visible: true };
        }

        // Determine visibility based on active preset
        let shouldBeVisible = false;

        if (preset === 'continuous_noise') {
          shouldBeVisible = ['noise_continuous_buffers', 'residential_buildings_layer'].includes(layer.id);
        } else if (preset === 'generator_noise') {
          shouldBeVisible = ['noise_generators_buffers', 'residential_buildings_layer'].includes(layer.id);
        } else if (preset === 'thermal') {
          shouldBeVisible = ['thermal_impact_buffers', 'residential_buildings_layer'].includes(layer.id);
        } else if (preset === 'protected_areas') {
          shouldBeVisible = ['dolina_widawki_polygon', 'archeo_site_marker'].includes(layer.id);
        } else if (preset === 'residential_distances') {
          shouldBeVisible = layer.id === 'residential_buildings_layer';
        }

        return { ...layer, visible: shouldBeVisible };
      })
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-slate-100">
      {/* Nagłówek zawsze na wierzchu (z-[2000]) */}
      <HeaderNav
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenProjectDocs={() => setIsProjectDocsOpen(true)}
      />

      {/* Kontener mapy */}
      <main className="flex-1 relative w-full h-full">
        <MapContainerComponent
          layers={layers}
          tileProvider={tileProvider}
          onSelectTileProvider={setTileProvider}
        />

        {/* Panel boczny warstw (z-[1500]) */}
        <LayerControlPanel
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeOpacity}
          onApplyPreset={handleApplyPreset}
          activePreset={activePreset}
        />

        {/* Legenda (z-20) */}
        <LegendOverlay layers={layers} />
      </main>

      {/* Modal Wykresów i Symulatora (z-[9999]) */}
      <AnalyticsDrawer
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <ProjectDocsModal
        isOpen={isProjectDocsOpen}
        onClose={() => setIsProjectDocsOpen(false)}
      />
    </div>
  );
};
