import React, { useEffect, useRef, useState } from 'react';
import { DataCenterKey, GISLayer, MapTileProvider, PresetKey } from './types/gis';
import { applyPresetToLayers, buildInitialLayers, defaultPresetForLayers } from './data/layersRegistry';
import { DATA_CENTERS, DataCenterProfile, DEFAULT_DATA_CENTER_ID, getDataCenter } from './data/dataCenters';
import { HeaderNav } from './components/HeaderNav';
import { MapContainerComponent } from './components/MapContainer';
import { LayerControlPanel } from './components/LayerControlPanel';
import { LegendOverlay } from './components/LegendOverlay';
import { AnalyticsDrawer } from './components/AnalyticsDrawer';
import { ProjectDocsModal } from './components/ProjectDocsModal';

/**
 * Odczytuje wybrane centrum danych z adresu strony (np. `#/trzebnica`).
 * Zwraca null, gdy hash jest pusty lub nieprawidłowy.
 */
function dataCenterIdFromHash(): DataCenterKey | null {
  const match = window.location.hash.match(/^#\/([a-z-]+)\/?$/i);
  if (!match) return null;
  const id = match[1].toLowerCase();
  return DATA_CENTERS.some((dc) => dc.id === id) ? (id as DataCenterKey) : null;
}

export const App: React.FC = () => {
  // Start z adresu URL (link do konkretnego miasta), inaczej domyślne DC.
  // Wszystkie trzy stany muszą pochodzić z TEGO SAMEGO id (hash nie zmienia
  // się w trakcie inicjalizacji, więc każde wywołanie zwraca to samo).
  const [dataCenterId, setDataCenterId] = useState<DataCenterKey>(
    () => dataCenterIdFromHash() ?? DEFAULT_DATA_CENTER_ID
  );
  const [layers, setLayers] = useState<GISLayer[]>(() => {
    const initial = buildInitialLayers(
      getDataCenter(dataCenterIdFromHash() ?? DEFAULT_DATA_CENTER_ID)
    );
    return applyPresetToLayers(initial, defaultPresetForLayers(initial));
  });
  // Domyślnie podkład Standard (OSM)
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('osm');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isProjectDocsOpen, setIsProjectDocsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(() =>
    defaultPresetForLayers(
      buildInitialLayers(getDataCenter(dataCenterIdFromHash() ?? DEFAULT_DATA_CENTER_ID))
    )
  );

  const dataCenter: DataCenterProfile = getDataCenter(dataCenterId);

  // Lustrzany ref, żeby listener hashchange nie łapał przestarzałego stanu.
  const dataCenterIdRef = useRef(dataCenterId);
  dataCenterIdRef.current = dataCenterId;

  /**
   * Przełącza lokalizację: przebudowuje warstwy i wraca do domyślnego presetu.
   */
  const applyDataCenter = (id: DataCenterKey) => {
    const nextDataCenter = getDataCenter(id);
    const nextLayers = buildInitialLayers(nextDataCenter);
    const nextPreset = defaultPresetForLayers(nextLayers);

    setDataCenterId(id);
    setActivePreset(nextPreset);
    setLayers(applyPresetToLayers(nextLayers, nextPreset));
  };

  // Adres pusty/nieprawidłowy → wpisz bieżące miasto (bez wpisu w historii).
  // Zmiana hasha (przyciski wstecz/dalej, wklejony link) → przełącz miasto.
  useEffect(() => {
    if (!dataCenterIdFromHash()) {
      window.history.replaceState(null, '', `#/${dataCenterIdRef.current}`);
    }
    const handleHashChange = () => {
      const id = dataCenterIdFromHash();
      if (id && id !== dataCenterIdRef.current) applyDataCenter(id);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleApplyPreset = (preset: PresetKey | null) => {
    setActivePreset(preset);
    setLayers((prev) => applyPresetToLayers(prev, preset));
  };

  /**
   * Zmiana centrum danych z menu: przełącza lokalizację i zapisuje ją w adresie,
   * żeby linkiem można było podzielić się z kimś (np. `#/trzebnica`).
   */
  const handleChangeDataCenter = (id: DataCenterKey) => {
    if (id === dataCenterId) return;
    if (window.location.hash !== `#/${id}`) window.location.hash = `/${id}`;
    applyDataCenter(id);
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
