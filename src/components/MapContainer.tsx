import React, { useMemo } from 'react';
import { MapContainer as ReactMapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GISLayer, MapTileProvider } from '../types/gis';
import { generateFeatureBuffers } from '../utils/geoUtils';
import { dataCenterGeoJSON } from '../data/geojson/dataCenter';
import { archeoSiteGeoJSON } from '../data/geojson/archeoSite';
import dolinaWidawkiFullGeoJSON from '../data/geojson/dolinaWidawki.json';
import { getResidentialBuildings } from '../data/residentialData';
import { Crosshair, Home } from 'lucide-react';

// Stonowany, statyczny marker dla obiektu archeologicznego (bez migania)
const archeoDivIcon = L.divIcon({
  className: 'archeo-custom-marker',
  html: `
    <div class="w-7 h-7 rounded-full bg-amber-600 border-2 border-white text-white flex items-center justify-center shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21 12 3l9 18H3z"/>
        <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

// Stonowany marker dla domu mieszkalnego
const homeDivIcon = L.divIcon({
  className: 'home-custom-marker',
  html: `
    <div class="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white text-white flex items-center justify-center shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

interface MapContainerProps {
  layers: GISLayer[];
  tileProvider: MapTileProvider;
  onSelectTileProvider: (provider: MapTileProvider) => void;
}

const MapControls: React.FC<{ tileProvider: MapTileProvider; onSelectTileProvider: (p: MapTileProvider) => void }> = ({
  tileProvider,
  onSelectTileProvider
}) => {
  const map = useMap();

  const handleResetView = () => {
    map.flyTo([51.367, 19.314], 14, { duration: 1.0 });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end space-y-2">
      {/* Przełącznik podkładów: Standard (OSM) vs Satelita */}
      <div className="bg-white/95 border border-slate-300 p-1 rounded-xl flex items-center space-x-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => onSelectTileProvider('osm')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            tileProvider === 'osm'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Standard (OSM)
        </button>
        <button
          onClick={() => onSelectTileProvider('satellite')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            tileProvider === 'satellite'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Satelita
        </button>
      </div>

      {/* Przycisk powrotu */}
      <button
        onClick={handleResetView}
        className="bg-white/95 border border-slate-300 p-2 rounded-xl text-slate-700 hover:text-sky-600 transition-all flex items-center space-x-1.5 text-xs font-medium shadow-lg backdrop-blur-md"
        title="Centruj mapę na Centrum Danych"
      >
        <Crosshair className="w-4 h-4 text-sky-600" />
        <span className="hidden sm:inline">Wyśrodkuj na Centrum Danych</span>
      </button>
    </div>
  );
};

export const MapContainerComponent: React.FC<MapContainerProps> = ({
  layers,
  tileProvider,
  onSelectTileProvider
}) => {
  const center: [number, number] = [51.367, 19.314];

  const tileUrls = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const tileAttributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  };

  // Dane zabudowań mieszkalnych
  const residentialBuildings = useMemo(() => getResidentialBuildings(), []);
  const dcCenterCoord: [number, number] = [51.367, 19.314];

  // Bufory hałasu ciągłego
  const noiseContLayer = layers.find((l) => l.id === 'noise_continuous_buffers');
  const noiseContBuffers = useMemo(() => {
    if (!noiseContLayer || !noiseContLayer.visible || !noiseContLayer.buffers) return [];
    return generateFeatureBuffers(dataCenterGeoJSON, noiseContLayer.buffers);
  }, [noiseContLayer?.visible, noiseContLayer?.opacity]);

  // Bufory hałasu generatorów diesla
  const noiseGenLayer = layers.find((l) => l.id === 'noise_generators_buffers');
  const noiseGenBuffers = useMemo(() => {
    if (!noiseGenLayer || !noiseGenLayer.visible || !noiseGenLayer.buffers) return [];
    return generateFeatureBuffers(dataCenterGeoJSON, noiseGenLayer.buffers);
  }, [noiseGenLayer?.visible, noiseGenLayer?.opacity]);

  // Bufory termiczne
  const thermalLayer = layers.find((l) => l.id === 'thermal_impact_buffers');
  const thermalBuffers = useMemo(() => {
    if (!thermalLayer || !thermalLayer.visible || !thermalLayer.buffers) return [];
    return generateFeatureBuffers(dataCenterGeoJSON, thermalLayer.buffers);
  }, [thermalLayer?.visible, thermalLayer?.opacity]);

  // Pobranie pozostałych warstw
  const dcLayer = layers.find((l) => l.id === 'data_center_polygon');
  const archeoLayer = layers.find((l) => l.id === 'archeo_site_marker');
  const widawkaLayer = layers.find((l) => l.id === 'dolina_widawki_polygon');
  const residentialLayer = layers.find((l) => l.id === 'residential_buildings_layer');

  return (
    <div className="w-full h-full relative">
      <ReactMapContainer
        center={center}
        zoom={14}
        minZoom={10}
        maxZoom={18}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url={tileUrls[tileProvider]}
          attribution={tileAttributions[tileProvider]}
          maxZoom={19}
        />

        <MapControls tileProvider={tileProvider} onSelectTileProvider={onSelectTileProvider} />

        {/* 1. WARSTWA: Obszar Chronionego Krajobrazu Doliny Widawki (z pliku data/dolina-winiawki.json) */}
        {widawkaLayer?.visible && (
          <GeoJSON
            key={`widawka-full-${widawkaLayer.opacity}`}
            data={dolinaWidawkiFullGeoJSON as any}
            style={{
              color: widawkaLayer.color,
              fillColor: widawkaLayer.fillColor,
              fillOpacity: widawkaLayer.opacity,
              weight: widawkaLayer.weight || 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 max-w-xs">
                <h4 className="font-bold text-sm text-emerald-800">
                  Obszar Chronionego Krajobrazu Doliny Widawki
                </h4>
                <div className="text-xs text-slate-600 font-mono">
                  Kod INSPIRE: PL.ZIPOP.1393.OCHK.272
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  Oficjalny obszar chroniony krajobrazowo z bazy GDOŚ. Bezpośrednie sąsiedztwo inwestycji wymaga zachowania wymogów ochronnych.
                </p>
              </div>
            </Popup>
          </GeoJSON>
        )}

        {/* Marker etykiety Doliny Widawki - obok Centrum Danych */}
        {widawkaLayer?.visible && (
          <Marker position={[51.3775, 19.2950]} icon={L.divIcon({
            className: 'widawka-text-label',
            html: `
              <div class="bg-white/95 border-2 border-emerald-500 rounded-lg px-2.5 py-1.5 shadow-md backdrop-blur-sm pointer-events-auto">
                <div class="font-bold text-xs uppercase tracking-wide text-emerald-900">Dolina Widawki</div>
                <div class="text-[10px] text-emerald-700">Obszar Chronionego Krajobrazu</div>
              </div>
            `,
            iconSize: [160, 40],
            iconAnchor: [80, 20],
            popupAnchor: [0, -20]
          })}>
          </Marker>
        )}

        {/* 2. WARSTWA: Hałas Ciągły Wentylatorów */}
        {noiseContLayer?.visible &&
          noiseContBuffers
            .slice()
            .reverse()
            .map((buf) => (
              <GeoJSON
                key={`noise-cont-${buf.distanceMeters}-${noiseContLayer.opacity}`}
                data={buf.geoJson}
                style={{
                  color: buf.color,
                  fillColor: buf.fillColor,
                  fillOpacity: (noiseContLayer.opacity || 0.4) * 0.7,
                  weight: 1.5,
                  dashArray: buf.distanceMeters >= 500 ? '4, 4' : undefined
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 max-w-xs">
                    <h4 className="font-bold text-sm text-orange-800">{buf.label}</h4>
                    <div className="bg-slate-100 p-2 rounded border border-slate-200">
                      <div className="text-xs text-slate-500">Poziom hałasu:</div>
                      <div className="text-base font-bold text-orange-600">{buf.valueText}</div>
                    </div>
                    <p className="text-xs text-slate-600">{buf.description}</p>
                  </div>
                </Popup>
              </GeoJSON>
            ))}

        {/* 3. WARSTWA: Hałas Testów Generatorów Diesla */}
        {noiseGenLayer?.visible &&
          noiseGenBuffers
            .slice()
            .reverse()
            .map((buf) => (
              <GeoJSON
                key={`noise-gen-${buf.distanceMeters}-${noiseGenLayer.opacity}`}
                data={buf.geoJson}
                style={{
                  color: buf.color,
                  fillColor: buf.fillColor,
                  fillOpacity: (noiseGenLayer.opacity || 0.45) * 0.75,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 max-w-xs">
                    <h4 className="font-bold text-sm text-red-800">{buf.label}</h4>
                    <div className="bg-slate-100 p-2 rounded border border-slate-200">
                      <div className="text-xs text-slate-500">Emisja podczas testów:</div>
                      <div className="text-base font-bold text-red-600">{buf.valueText}</div>
                    </div>
                    <p className="text-xs text-slate-600">{buf.description}</p>
                  </div>
                </Popup>
              </GeoJSON>
            ))}

        {/* 4. WARSTWA: Wpływ na Temperaturę (Mikroklimat) */}
        {thermalLayer?.visible &&
          thermalBuffers
            .slice()
            .reverse()
            .map((buf) => (
              <GeoJSON
                key={`thermal-${buf.distanceMeters}-${thermalLayer.opacity}`}
                data={buf.geoJson}
                style={{
                  color: buf.color,
                  fillColor: buf.fillColor,
                  fillOpacity: (thermalLayer.opacity || 0.4) * 0.75,
                  weight: 1.5
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 max-w-xs">
                    <h4 className="font-bold text-sm text-amber-800">{buf.label}</h4>
                    <div className="bg-slate-100 p-2 rounded border border-slate-200">
                      <div className="text-xs text-slate-500">Wzrost temperatury:</div>
                      <div className="text-base font-bold text-amber-600">{buf.valueText}</div>
                    </div>
                    <p className="text-xs text-slate-600">{buf.description}</p>
                  </div>
                </Popup>
              </GeoJSON>
            ))}

        {/* 5. WARSTWA: Poligon Data Center z Trwałą Etykietą Nazwy */}
        {dcLayer?.visible && (
          <GeoJSON
            key={`dc-poly-${dcLayer.opacity}`}
            data={dataCenterGeoJSON}
            style={{
              color: dcLayer.color,
              fillColor: dcLayer.fillColor,
              fillOpacity: dcLayer.opacity,
              weight: dcLayer.weight || 3
            }}
          >
            {/* Trwała etykieta na poligonie centrum danych */}
            <Tooltip permanent direction="center" className="dc-polygon-label">
              <div>
                <div className="font-bold text-xs uppercase tracking-wide">Planowane Data Center</div>
                <div className="text-[10px] opacity-90">Powierzchnia: 52,6 ha</div>
              </div>
            </Tooltip>

            <Popup>
              <div className="p-1 space-y-2 max-w-sm">
                <div className="border-b border-slate-200 pb-1">
                  <h4 className="font-bold text-base text-sky-800">Hyperscale Data Center Domiechowice</h4>
                  <span className="text-xs text-slate-600">Powierzchnia: 52,6016 ha</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-100 p-2 rounded border border-slate-200">
                    <div className="text-slate-500">Moc:</div>
                    <div className="font-bold text-sky-700">~500 MW</div>
                  </div>
                  <div className="bg-slate-100 p-2 rounded border border-slate-200">
                    <div className="text-slate-500">Agregaty:</div>
                    <div className="font-bold text-rose-700">720 MW (100+ szt.)</div>
                  </div>
                </div>
                <div className="text-xs text-slate-700">
                  Inwestor: <strong>Data Center Bełchatów Sp. z o.o.</strong>
                </div>
              </div>
            </Popup>
          </GeoJSON>
        )}

        {/* 6. WARSTWA: Najbliższe Zabudowania Mieszkaniowe & Linie Odległości */}
        {residentialLayer?.visible &&
          residentialBuildings.map((building) => (
            <React.Fragment key={building.id}>
              {/* Linia łącząca dom z Data Center */}
              <Polyline
                positions={[
                  [building.lat, building.lng],
                  dcCenterCoord
                ]}
                pathOptions={{
                  color: '#6366f1',
                  weight: 1.5,
                  dashArray: '4, 4',
                  opacity: 0.7
                }}
              />

              {/* Marker domu mieszkalnego */}
              <Marker
                position={[building.lat, building.lng]}
                icon={homeDivIcon}
              >
                <Tooltip permanent direction="top" className="residential-building-label">
                  <span>{building.distanceToBoundaryMeters} m do Data Center</span>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-1.5 max-w-xs">
                    <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-1">
                      <Home className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-xs text-indigo-900">{building.name}</h4>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded border border-indigo-100 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Odległość od krawędzi:</span>
                        <span className="font-bold text-indigo-700">{building.distanceToBoundaryMeters} m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Hałas ciągły (wentylatory):</span>
                        <span className="font-semibold text-slate-800">{building.noiseLevelContinuous}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Testy generatorów diesla:</span>
                        <span className="font-semibold text-rose-700">{building.noiseLevelGeneratorTest}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Przewidywany wzrost temp.:</span>
                        <span className="font-semibold text-amber-700">{building.tempRise}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* 7. WARSTWA: Marker Obiektu Archeologicznego (Stonowany, bez migania) */}
        {archeoLayer?.visible && (
          <Marker
            position={[archeoSiteGeoJSON.geometry.coordinates[1], archeoSiteGeoJSON.geometry.coordinates[0]]}
            icon={archeoDivIcon}
          >
            <Tooltip permanent direction="top" className="archeo-label">
              <span className="font-bold text-xs text-amber-900">Obiekt archeologiczny</span>
            </Tooltip>

            <Popup>
              <div className="p-1 space-y-1.5 max-w-xs">
                <h4 className="font-bold text-sm text-amber-900">
                  Obiekt archeologiczny - Osada (AZP 75-50/26)
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Zarejestrowana osada w Krajowej Ewidencji Zabytków. Wymaga nadzoru archeologicznego.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded p-2">
                  <p className="text-xs text-amber-800">
                    <strong>Uwaga:</strong> Lokacja jest przybliżona na podstawie dostępnych danych archeologicznych.
                  </p>
                </div>
                <a
                  href="https://zabytek.pl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-sky-700 hover:underline pt-1 font-medium"
                >
                  Źródło: zabytek.pl ↗
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </ReactMapContainer>
    </div>
  );
};
