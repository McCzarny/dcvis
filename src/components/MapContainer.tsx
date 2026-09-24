import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer as ReactMapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GISLayer, MapTileProvider } from '../types/gis';
import { generateFeatureBuffers } from '../utils/geoUtils';
import { archeoSiteGeoJSON } from '../data/geojson/archeoSite';
import dolinaWidawkiFullGeoJSON from '../data/geojson/dolinaWidawki.json';
import { getResidentialBuildings } from '../data/residentialData';
import { DataCenterProfile, formatNum } from '../data/dataCenters';
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
  dataCenter: DataCenterProfile;
  layers: GISLayer[];
  tileProvider: MapTileProvider;
  onSelectTileProvider: (provider: MapTileProvider) => void;
}

/** Zapas na etykiety znaczników (m) – etykieta DC rysuje się pod kołem. */
const MARKER_LABEL_MARGIN_M = 100;
const M_PER_DEG_LAT = 111132;
const M_PER_DEG_LNG = 111319.49;

type BoundsTuple = [[number, number], [number, number]];

/**
 * Granice widoku obejmujące wszystkie znaczniki DC i miasta – razem z kołami
 * proporcjonalnymi (największe koło DC z wody/energii/wód podziemnych oraz
 * koła miasta z obu porównań). Zwraca null, gdy DC nie ma danych o mieście.
 */
function allMarkersBounds(dataCenter: DataCenterProfile): BoundsTuple | null {
  const water = dataCenter.water;
  const energy = dataCenter.energy;

  const cities: Array<{ coord: [number, number]; radius: number }> = [];
  if (water.comparison) {
    cities.push({
      coord: water.comparison.city.centerCoords,
      radius: water.mapCircles.cityRadiusMeters ?? 0
    });
  }
  if (energy.comparison) {
    cities.push({
      coord: energy.comparison.city.centerCoords,
      radius: energy.mapCircles.cityRadiusMeters ?? 0
    });
  }
  if (cities.length === 0) return null;

  const markers = [
    {
      coord: dataCenter.mapCenter,
      radius: Math.max(
        water.mapCircles.dcRadiusMeters,
        water.mapCircles.dcDirectRadiusMeters,
        water.mapCircles.dcGroundwaterRadiusMeters ?? 0,
        energy.mapCircles.dcRadiusMeters
      )
    },
    ...cities
  ];

  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;
  for (const { coord, radius } of markers) {
    const r = radius + MARKER_LABEL_MARGIN_M;
    const latSpan = r / M_PER_DEG_LAT;
    const lngSpan = r / (M_PER_DEG_LNG * Math.cos((coord[0] * Math.PI) / 180));
    minLat = Math.min(minLat, coord[0] - latSpan);
    maxLat = Math.max(maxLat, coord[0] + latSpan);
    minLng = Math.min(minLng, coord[1] - lngSpan);
    maxLng = Math.max(maxLng, coord[1] + lngSpan);
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}

/**
 * Ustawia widok tak, by na ekranie mieściły się wszystkie znaczniki
 * (centrum danych + pobliskie miasto) wraz z kołami, z uwzględnieniem
 * paneli UI nachodzących na mapę (warstwy z lewej, legenda z prawej).
 */
function fitAllMarkers(map: L.Map, dataCenter: DataCenterProfile, animate: boolean): void {
  const bounds = allMarkersBounds(dataCenter);
  if (!bounds) {
    if (animate) map.flyTo(dataCenter.mapCenter, dataCenter.mapZoom, { duration: 1.0 });
    else map.setView(dataCenter.mapCenter, dataCenter.mapZoom);
    return;
  }
  // Odsunięcie od krawędzi: panele mają do ~384 px szerokości (Point = [x, y]).
  const sideInset = Math.min(384, Math.round(window.innerWidth * 0.45));
  const options: L.FitBoundsOptions = {
    paddingTopLeft: [sideInset, 16],
    paddingBottomRight: [sideInset, 16]
  };
  if (animate) map.flyToBounds(bounds, { ...options, duration: 1.0 });
  else map.fitBounds(bounds, options);
}

/** Ustawienie widoku na wszystkie znaczniki po zmianie DC (bez animacji przy pierwszym renderze). */
const DataViewSync: React.FC<{ dataCenter: DataCenterProfile }> = ({ dataCenter }) => {
  const map = useMap();
  const previousIdRef = useRef(dataCenter.id);

  useEffect(() => {
    const switched = previousIdRef.current !== dataCenter.id;
    previousIdRef.current = dataCenter.id;
    fitAllMarkers(map, dataCenter, switched);
  }, [map, dataCenter]);

  return null;
};

const MapControls: React.FC<{
  dataCenter: DataCenterProfile;
  tileProvider: MapTileProvider;
  onSelectTileProvider: (p: MapTileProvider) => void;
}> = ({ dataCenter, tileProvider, onSelectTileProvider }) => {
  const map = useMap();

  const handleResetView = () => {
    fitAllMarkers(map, dataCenter, true);
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
        title="Pokaż centrum danych i miasto"
      >
        <Crosshair className="w-4 h-4 text-sky-600" />
        <span className="hidden sm:inline">Pokaż DC i miasto</span>
      </button>
    </div>
  );
};

export const MapContainerComponent: React.FC<MapContainerProps> = ({
  dataCenter,
  layers,
  tileProvider,
  onSelectTileProvider
}) => {
  const center: [number, number] = dataCenter.mapCenter;
  const specs = dataCenter.specs;
  const dcGeoJson = dataCenter.geoJson;

  const tileUrls = {
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const tileAttributions = {
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  };

  // Pobranie warstw (dostępnych tylko tych, które obsługuje dane DC)
  const dcLayer = layers.find((l) => l.id === 'data_center_polygon');
  const archeoLayer = layers.find((l) => l.id === 'archeo_site_marker');
  const widawkaLayer = layers.find((l) => l.id === 'dolina_widawki_polygon');
  const residentialLayer = layers.find((l) => l.id === 'residential_buildings_layer');
  const waterLayer = layers.find((l) => l.id === 'water_consumption_layer');
  const energyLayer = layers.find((l) => l.id === 'energy_consumption_layer');
  const noiseContLayer = layers.find((l) => l.id === 'noise_continuous_buffers');
  const noiseGenLayer = layers.find((l) => l.id === 'noise_generators_buffers');
  const thermalLayer = layers.find((l) => l.id === 'thermal_impact_buffers');

  // Dane zabudowań mieszkalnych (jeśli warstwa jest dostępna w tym DC)
  const residentialBuildings = useMemo(
    () => (residentialLayer ? getResidentialBuildings(dcGeoJson) : []),
    [residentialLayer, dcGeoJson]
  );

  const dcCenterCoord: [number, number] = [center[0], center[1]];

  // Bufory hałasu ciągłego
  const noiseContBuffers = useMemo(() => {
    if (!noiseContLayer || !noiseContLayer.visible || !noiseContLayer.buffers) return [];
    return generateFeatureBuffers(dcGeoJson, noiseContLayer.buffers);
  }, [noiseContLayer, dcGeoJson]);

  // Bufory hałasu generatorów diesla
  const noiseGenBuffers = useMemo(() => {
    if (!noiseGenLayer || !noiseGenLayer.visible || !noiseGenLayer.buffers) return [];
    return generateFeatureBuffers(dcGeoJson, noiseGenLayer.buffers);
  }, [noiseGenLayer, dcGeoJson]);

  // Bufory termiczne
  const thermalBuffers = useMemo(() => {
    if (!thermalLayer || !thermalLayer.visible || !thermalLayer.buffers) return [];
    return generateFeatureBuffers(dcGeoJson, thermalLayer.buffers);
  }, [thermalLayer, dcGeoJson]);

  const water = dataCenter.water;
  const waterComparison = water.comparison;
  const energy = dataCenter.energy;
  const energyComparison = energy.comparison;

  const popupSpecs: { label: string; value: string; className: string }[] = [
    { label: 'Moc:', value: `~${specs.itPowerMW} MW`, className: 'text-sky-700' },
    {
      label: 'Agregaty:',
      value: `${specs.generatorPowerMW} MW (${specs.generatorsCountLabel} szt.)`,
      className: 'text-rose-700'
    },
    ...(specs.waterPerDayM3 !== undefined
      ? [
          {
            label: 'Woda:',
            value: `${formatNum(specs.waterPerDayM3)} m³/dobę`,
            className: 'text-cyan-700'
          }
        ]
      : [])
  ];

  return (
    <div className="w-full h-full relative">
      <ReactMapContainer
        center={center}
        zoom={dataCenter.mapZoom}
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

        <DataViewSync dataCenter={dataCenter} />
        <MapControls
          dataCenter={dataCenter}
          tileProvider={tileProvider}
          onSelectTileProvider={onSelectTileProvider}
        />

        {/* 1. WARSTWA: Obszar Chronionego Krajobrazu Doliny Widawki (jeśli dostępne dla tego DC) */}
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

        {/* 4b. WARSTWA: Zużycie Wody (koła proporcjonalne do zużycia) */}
        {waterLayer?.visible && (
          <React.Fragment>
            {/* Koło: miasto referencyjne (jeśli dane dostępne) */}
            {waterComparison && (
              <Circle
                center={waterComparison.city.centerCoords}
                radius={water.mapCircles.cityRadiusMeters ?? 1000}
                pathOptions={{
                  color: '#4f46e5',
                  weight: 2,
                  fillColor: '#818cf8',
                  fillOpacity: (waterLayer.opacity || 1) * 0.3
                }}
              >
                <Tooltip permanent direction="center" className="consumption-circle-label consumption-circle-label-indigo">
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wide">{waterComparison.city.name}</div>
                    <div className="text-[10px] opacity-90">
                      {waterComparison.city.population.toLocaleString('pl-PL')} mieszk. &middot; {waterComparison.city.annualLabel}/rok
                    </div>
                  </div>
                </Tooltip>
              </Circle>
            )}

            {/* Koło: Data Center – zużycie łączne */}
            <Circle
              center={dcCenterCoord}
              radius={water.mapCircles.dcRadiusMeters}
              pathOptions={{
                color: '#0891b2',
                weight: 2,
                fillColor: '#22d3ee',
                fillOpacity: (waterLayer.opacity || 1) * 0.3
              }}
            >
              <Tooltip permanent direction="bottom" offset={[0, 26]} className="consumption-circle-label consumption-circle-label-cyan">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wide">Data Center {water.powerMW} MW</div>
                  <div className="text-[10px] opacity-90">Bezpośrednio {water.direct.annualLabel}/rok</div>
                  <div className="text-[10px] opacity-90">W sumie {water.total.annualLabel}/rok</div>
                </div>
              </Tooltip>
            </Circle>

            {/* Koło wewnętrzne: Zużycie bezpośrednie Data Center (chłodzenie), na tle zużycia łącznego */}
            <Circle
              center={dcCenterCoord}
              radius={water.mapCircles.dcDirectRadiusMeters}
              pathOptions={{
                color: '#0e7490',
                weight: 2,
                fillColor: '#22d3ee',
                fillOpacity: (waterLayer.opacity || 1) * 0.6
              }}
            >
            </Circle>

            {/* Koło przerywane: Roczna wydajność wód podziemnych (jeśli dane dostępne) */}
            {waterComparison &&
              water.mapCircles.dcGroundwaterRadiusMeters !== undefined &&
              waterComparison.groundwater && (
                <Circle
                  center={dcCenterCoord}
                  radius={water.mapCircles.dcGroundwaterRadiusMeters}
                  pathOptions={{
                    color: '#6d28d9',
                    weight: 2,
                    dashArray: '8 6',
                    fillColor: '#a78bfa',
                    fillOpacity: (waterLayer.opacity || 1) * 0.15
                  }}
                >
                  <Tooltip permanent direction="top" offset={[0, -30]} className="consumption-circle-label consumption-circle-label-purple">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wide">Wydajność wód podziemnych (typowe ujęcie)</div>
                      <div className="text-[10px] opacity-90">{waterComparison.groundwater.annualTypicalLabel}/rok</div>
                    </div>
                  </Tooltip>
                </Circle>
              )}
          </React.Fragment>
        )}

        {/* 4c. WARSTWA: Zużycie Prądu (koła proporcjonalne do zużycia) */}
        {energyLayer?.visible && (
          <React.Fragment>
            {/* Koło: miasto referencyjne (jeśli dane dostępne) */}
            {energyComparison && (
              <Circle
                center={energyComparison.city.centerCoords}
                radius={energy.mapCircles.cityRadiusMeters ?? 200}
                pathOptions={{
                  color: '#4f46e5',
                  weight: 2,
                  fillColor: '#818cf8',
                  fillOpacity: (energyLayer.opacity || 1) * 0.3
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -6]} className="consumption-circle-label consumption-circle-label-indigo">
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wide">{energyComparison.city.name}</div>
                    <div className="text-[10px] opacity-90">
                      {energyComparison.city.population.toLocaleString('pl-PL')} mieszk. &middot; {energyComparison.city.annualLabel}/rok
                    </div>
                  </div>
                </Tooltip>
              </Circle>
            )}

            {/* Koło: Data Center */}
            <Circle
              center={dcCenterCoord}
              radius={energy.mapCircles.dcRadiusMeters}
              pathOptions={{
                color: '#ca8a04',
                weight: 2,
                fillColor: '#facc15',
                fillOpacity: (energyLayer.opacity || 1) * 0.3
              }}
            >
              <Tooltip permanent direction="bottom" offset={[0, 26]} className="consumption-circle-label consumption-circle-label-yellow">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wide">Data Center {energy.powerMW} MW</div>
                  <div className="text-[10px] opacity-90">{energy.dc.annualLabel} prądu/rok</div>
                </div>
              </Tooltip>
            </Circle>
          </React.Fragment>
        )}

        {/* 5. WARSTWA: Poligon Centrum Danych z Trwałą Etykietą Nazwy */}
        {dcLayer?.visible && (
          <GeoJSON
            key={`dc-poly-${dcLayer.opacity}-${dataCenter.id}`}
            data={dcGeoJson}
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
                <div className="font-bold text-xs uppercase tracking-wide">{dataCenter.texts.polygon.shortLabel}</div>
                <div className="text-[10px] opacity-90">Powierzchnia: {formatNum(specs.areaHa, 1)} ha</div>
              </div>
            </Tooltip>

            <Popup>
              <div className="p-1 space-y-2 max-w-sm">
                <div className="border-b border-slate-200 pb-1">
                  <h4 className="font-bold text-base text-sky-800">{specs.name}</h4>
                  <span className="text-xs text-slate-600">
                    Powierzchnia: {formatNum(specs.areaHa, 4)} ha
                  </span>
                  <div className="text-xs text-slate-500">{specs.location}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {popupSpecs.map((item) => (
                    <div key={item.label} className="bg-slate-100 p-2 rounded border border-slate-200">
                      <div className="text-slate-500">{item.label}</div>
                      <div className={`font-bold ${item.className}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {specs.investor && (
                  <div className="text-xs text-slate-700">
                    Inwestor: <strong>{specs.investor}</strong>
                  </div>
                )}
                {specs.status && (
                  <div className="text-xs text-slate-700">
                    Status: <strong>{specs.status}</strong>
                    {specs.statusDate ? ` (stan na ${specs.statusDate})` : ''}
                  </div>
                )}
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
