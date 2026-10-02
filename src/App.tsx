import React, { useState } from 'react';
import { DataCenterKey, GISLayer, MapTileProvider, PresetKey } from './types/gis';
import { applyPresetToLayers, buildInitialLayers } from './data/layersRegistry';
import { DataCenterProfile, DEFAULT_DATA_CENTER_ID, getDataCenter } from './data/dataCenters';
import { HeaderNav } from './components/HeaderNav';
import { MapContainerComponent } from './components/MapContainer';
import { LayerControlPanel } from './components/LayerControlPanel';
import { LegendOverlay } from './components/LegendOverlay';
import { AnalyticsDrawer } from './components/AnalyticsDrawer';
import { ProjectDocsModal } from './components/ProjectDocsModal';

export const App: React.FC = () => {
  const [dataCenterId, setDataCenterId] = useState<DataCenterKey>(DEFAULT_DATA_CENTER_ID);
  // Domyślnie od pierwszego renderu: preset "Hałas wentylatorów" (continuous_noise).
  const [layers, setLayers] = useState<GISLayer[]>(() =>
    applyPresetToLayers(buildInitialLayers(getDataCenter(DEFAULT_DATA_CENTER_ID)), 'continuous_noise')
  );
  // Domyślnie podkład Standard (OSM)
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('osm');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isProjectDocsOpen, setIsProjectDocsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>('continuous_noise');

  const dataCenter: DataCenterProfile = getDataCenter(dataCenterId);

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

  const handleApplyPreset = (preset: PresetKey | null) => {
    setActivePreset(preset);
    setLayers((prev) => applyPresetToLayers(prev, preset));
  };

  /**
   * Zmiana centrum danych: przebudowuje listę warstw i ZAWSZE wraca do
   * domyślnego presetu "Hałas wentylatorów" (dostępny w każdej lokalizacji).
   */
  const handleChangeDataCenter = (id: DataCenterKey) => {
    if (id === dataCenterId) return;

    const nextDataCenter = getDataCenter(id);
    const nextLayers = buildInitialLayers(nextDataCenter);
    const nextPreset: PresetKey = 'continuous_noise';

    setDataCenterId(id);
    setActivePreset(nextPreset);
    setLayers(applyPresetToLayers(nextLayers, nextPreset));
  };

  return (
    <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-slate-100">
      {/* Nagłówek zawsze na wierzchu (z-[2000]) */}
      <HeaderNav
        dataCenter={dataCenter}
        onSelectDataCenter={handleChangeDataCenter}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenProjectDocs={() => setIsProjectDocsOpen(true)}
      />

      {/* Kontener mapy */}
      <main className="flex-1 relative w-full h-full">
        <MapContainerComponent
          dataCenter={dataCenter}
          layers={layers}
          tileProvider={tileProvider}
          onSelectTileProvider={setTileProvider}
        />

        {/* Panel boczny warstw (z-[1500]) */}
        <LayerControlPanel
          dataCenter={dataCenter}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeOpacity}
          onApplyPreset={handleApplyPreset}
          activePreset={activePreset}
        />

        {/* Legenda (z-20) */}
        <LegendOverlay dataCenter={dataCenter} layers={layers} />
      </main>

      {/* Modal Wykresów i Symulatora (z-[9999]) */}
      <AnalyticsDrawer
        dataCenter={dataCenter}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <ProjectDocsModal
        dataCenter={dataCenter}
        isOpen={isProjectDocsOpen}
        onClose={() => setIsProjectDocsOpen(false)}
      />
    </div>
  );
};
