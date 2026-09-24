import { DataCenterKey, GISLayer, PresetKey } from '../types/gis';
import {
  DataCenterProfile,
  formatFixed,
  formatGWh,
  formatInt,
  formatMlnM3
} from './dataCenters';
import { archeoSiteGeoJSON } from './geojson/archeoSite';
import dolinaWidawkiFullGeoJSON from './geojson/dolinaWidawki.json';
import {
  Droplets,
  MapPin,
  ShieldAlert,
  ShieldCheckIcon,
  Thermometer,
  Volume2,
  Zap,
  type LucideIcon
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Szablony warstw – każda deklaruje, dla których centrów danych jest dostępna.
// ---------------------------------------------------------------------------
interface LayerTemplate {
  id: string;
  name?: string;
  nameFor?: (dc: DataCenterProfile) => string;
  category: GISLayer['category'];
  description?: string;
  describe?: (dc: DataCenterProfile) => string;
  visible: boolean;
  opacity: number;
  color: string;
  fillColor: string;
  dashArray?: string;
  weight?: number;
  type: GISLayer['type'];
  buffers?: GISLayer['buffers'];
  geoJsonData?: any;
  dataFor?: (dc: DataCenterProfile) => any;
  sources?: string[];
  sourcesFor?: (dc: DataCenterProfile) => string[];
  availableFor: DataCenterKey[];
}

const waterLayerDescription = (dc: DataCenterProfile): string => {
  const w = dc.water;
  const dcPart =
    `~${formatMlnM3(w.total.annualM3)} mln m³/rok, zużycie bezpośrednie ${w.direct.factorLabel} ` +
    `+ produkcja energii ~${formatFixed(w.indirect.factorLKwh, 1)} l/kWh`;

  if (w.comparison) {
    const c = w.comparison.city;
    return (
      'Dwa koła o powierzchni proporcjonalnej do rocznego zużycia wody: ' +
      `Data Center ${w.powerMW} MW (${dcPart}) oraz ${c.name} (~${formatMlnM3(c.annualM3)} mln m³/rok, ` +
      `${formatInt(c.population)} mieszk. × ${c.perCapitaLabel}). ` +
      'Szczegółowe porównanie znajduje się w panelu legendy.'
    );
  }

  return (
    `Koło o powierzchni proporcjonalnym do rocznego zużycia wody: Data Center ${w.powerMW} MW (${dcPart}). ` +
    'Porównanie z miastem – dane w przygotowaniu.'
  );
};

const energyLayerDescription = (dc: DataCenterProfile): string => {
  const e = dc.energy;
  const dcPart = `~${formatGWh(e.dc.annualGWh)}/rok, praca 24/7`;

  if (e.comparison) {
    const c = e.comparison.city;
    return (
      'Dwa koła o powierzchni proporcjonalnej do rocznego zużycia energii elektrycznej: ' +
      `Data Center ${e.powerMW} MW (${dcPart}) oraz ${c.name} (~${formatGWh(c.annualGWh)}/rok, ` +
      `${formatInt(c.population)} mieszk. × ${c.perCapitaLabel} – GUS 2024). ` +
      'Szczegółowe porównanie w panelu legendy.'
    );
  }

  return (
    `Koło o powierzchni proporcjonalnym do rocznego zużycia energii elektrycznej: ` +
    `Data Center ${e.powerMW} MW (${dcPart}). Porównanie z miastem – dane w przygotowaniu.`
  );
};

const generatorNoiseDescription = (dc: DataCenterProfile): string =>
  `Model 1/r^1.5. Źródło: 95 dBA w odległości 7 m od wydechu silnika diesla. ` +
  `Zasięg słyszalności miesięcznych testów obciążeniowych ${dc.specs.generatorsCountLabel} ` +
  `agregatów (${dc.specs.generatorPowerMW} MW).`;

const LAYER_TEMPLATES: LayerTemplate[] = [
  {
    id: 'data_center_polygon',
    name: 'Obszar Inwestycji Data Center',
    category: 'inwestycja',
    describe: (dc) => dc.texts.polygon.description,
    visible: true,
    opacity: 0.8,
    color: '#0284c7', // sky-600
    fillColor: '#38bdf8',
    weight: 3,
    type: 'geojson',
    dataFor: (dc) => dc.geoJson,
    sourcesFor: (dc) => dc.texts.polygon.sources,
    availableFor: ['domiechowice', 'piaseczno']
  },
  {
    id: 'residential_buildings_layer',
    name: 'Najbliższe Zabudowania Mieszkaniowe & Odległości',
    category: 'zabudowa',
    description:
      'Punktowe lokalizacje najbliższych domów jednorodzinnych z wyliczoną odległością od krawędzi działek Data Center.',
    visible: true,
    opacity: 1,
    color: '#6366f1', // indigo-500
    fillColor: '#818cf8',
    weight: 2,
    type: 'residential_markers',
    sources: ['Pomiary odległościowe GIS', 'Wydział Geodezji'],
    availableFor: ['domiechowice']
  },
  {
    id: 'noise_continuous_buffers',
    name: 'Hałas Ciągły Wentylatorów (Chillers)',
    category: 'akustyka',
    description:
      'Model 1/r^1.5 z odbiciami gruntowymi i atmosferycznymi. Źródło: 65 dBA w odległości 152,4 m (500 stóp). Spadek ~4,5 dB przy każdym podwojeniu odległości.',
    visible: true,
    opacity: 0.4,
    color: '#ea580c', // orange-600
    fillColor: '#f97316',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 150,
        label: 'Źródło Hałasu (150 m / 500 stóp)',
        valueText: '~65 dBA',
        color: '#b91c1c',
        fillColor: '#dc2626',
        description: 'Poziom źródłowy hałasu wentylatorów w odległości 500 stóp (152,4 m).'
      },
      {
        distanceMeters: 250,
        label: 'Strefa Wysokiego Hałasu (250 m)',
        valueText: '61,8 dBA',
        color: '#c2410c',
        fillColor: '#ea580c',
        description: 'Typowa praca centrum danych. Przekroczenie normy nocnej o 21,8 dB, dziennej o 11,8 dB.'
      },
      {
        distanceMeters: 500,
        label: 'Strefa Podwyższonego Hałasu (500 m)',
        valueText: '57,3 dBA',
        color: '#d97706',
        fillColor: '#f59e0b',
        description: 'Przekroczenie normy nocnej (40 dBA) o 17,3 dB. Przekroczenie normy dziennej (50 dBA) o 7,3 dB.'
      },
      {
        distanceMeters: 1000,
        label: 'Strefa Umiarkowanego Hałasu (1000 m)',
        valueText: '52,7 dBA',
        color: '#ca8a04',
        fillColor: '#eab308',
        description: 'Przekroczenie normy nocnej o 12,7 dB. Nieznacznie powyżej normy dziennej.'
      },
      {
        distanceMeters: 2000,
        label: 'Strefa Obniżonego Hałasu (2000 m)',
        valueText: '48,2 dBA',
        color: '#65a30d',
        fillColor: '#84cc16',
        description: 'Poniżej normy dziennej (50 dBA). Wciąż przekracza normę nocną (40 dBA) o 8,2 dB.'
      },
      {
        distanceMeters: 3200,
        label: 'Zasięg Niskich Częstotliwości (3,2–4 km)',
        valueText: '~45 dBA',
        color: '#7e22ce',
        fillColor: '#a855f7',
        description:
          'Niskie częstotliwości (<200 Hz) z HVAC nie są pochłaniane przez powietrze, drzewa ani ekrany akustyczne – pozostają słyszalne nawet do 4 km.'
      }
    ],
    sources: [
      'Lyver Data Center Noise Study (2022) – protectpwc.org',
      'https://protectpwc.org/wp-content/uploads/2023/02/Lyver-Data-Center-Noise-Study-123122.pdf',
      'Model 1/r^1.5 z odbiciami gruntowymi i inwersjami atmosferycznymi'
    ],
    availableFor: ['domiechowice']
  },
  {
    id: 'noise_generators_buffers',
    name: 'Hałas Testów Generatorów Diesla',
    category: 'akustyka',
    describe: generatorNoiseDescription,
    visible: false,
    opacity: 0.45,
    color: '#dc2626', // red-600
    fillColor: '#ef4444',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 250,
        label: 'Strefa Testów Diesla (250 m)',
        valueText: '61,7 dBA',
        color: '#991b1b',
        fillColor: '#b91c1c',
        description: 'Hałas testów agregatów diesla. Porównywalny z ciągłą pracą wentylatorów na tym dystansie.'
      },
      {
        distanceMeters: 500,
        label: 'Testy Diesla (500 m)',
        valueText: '57,2 dBA',
        color: '#dc2626',
        fillColor: '#ef4444',
        description: 'Przekroczenie normy nocnej o 17,2 dB. Hałas testów okresowych – tymczasowy, lecz bardzo intensywny.'
      },
      {
        distanceMeters: 1000,
        label: 'Testy Diesla (1000 m)',
        valueText: '52,7 dBA',
        color: '#b91c1c',
        fillColor: '#dc2626',
        description: 'Poziom hałasu zrównuje się z ciągłą pracą wentylatorów. Przekracza normę dzienną.'
      },
      {
        distanceMeters: 2000,
        label: 'Testy Diesla (2000 m)',
        valueText: '48,2 dBA',
        color: '#991b1b',
        fillColor: '#b91c1c',
        description: 'Poniżej normy dziennej, wciąż powyżej nocnej. Niskie częstotliwości słyszalne z dużej odległości.'
      }
    ],
    sources: [
      'Decibel International – Kompleksowy przewodnik po dźwiękoszczelności centrów danych',
      'https://www.decibelinternational.pl/blog/kompleksowy-przewodnik-po-d-wi-koszczelno-ci-i-optymalizacji-akustycznej-dla-centr-w-danych-6/'
    ],
    availableFor: ['domiechowice']
  },
  {
    id: 'thermal_impact_buffers',
    name: 'Wpływ na Temperaturę Otoczenia (Mikroklimat)',
    category: 'termika',
    description:
      'Model wielomianowy drugiego stopnia (quadratic fit) – efekt wyspy ciepła centrów danych. ΔT(d) = 0,0158·d² – 0,3585·d + 2,0482 (d w km).',
    visible: false,
    opacity: 0.4,
    color: '#d97706', // amber-600
    fillColor: '#f59e0b',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 300,
        label: 'Strefa Bezpośrednia (0 – 0,3 km)',
        valueText: '+1,94°C',
        color: '#b91c1c',
        fillColor: '#dc2626',
        description: 'Początek pomiarów od krawędzi centrum danych. Średni wzrost temperatury w bezpośrednim sąsiedztwie.'
      },
      {
        distanceMeters: 1000,
        label: 'Strefa Wysokiego Wpływu (1 km)',
        valueText: '+1,71°C',
        color: '#c2410c',
        fillColor: '#ea580c',
        description: 'Znaczący wzrost temperatury na dystansie 1 km. Wyraźnie odczuwalna modyfikacja mikroklimatu.'
      },
      {
        distanceMeters: 2000,
        label: 'Strefa Umiarkowanego Wpływu (2 km)',
        valueText: '+1,39°C',
        color: '#d97706',
        fillColor: '#f59e0b',
        description: 'Nadal zauważalny wzrost temperatury. Wpływ termiczny rozciąga się na przyległe tereny.'
      },
      {
        distanceMeters: 5000,
        label: 'Strefa Oddziaływania Tła (5 km)',
        valueText: '+0,65°C',
        color: '#ca8a04',
        fillColor: '#eab308',
        description: 'Stopniowe wygaszanie sygnału termicznego. Mierzalny, ale już słabszy wpływ na temperaturę otoczenia.'
      },
      {
        distanceMeters: 10000,
        label: 'Granica Oddziaływania (10 km)',
        valueText: '+0,04°C',
        color: '#65a30d',
        fillColor: '#84cc16',
        description: 'Śladowy wpływ. Sygnał termiczny zanika w naturalnych wahaniach tła klimatycznego.'
      }
    ],
    sources: [
      'ResearchGate – The data heat island effect: quantifying the impact of AI data centers in a warming world',
      'https://www.researchgate.net/publication/403073048_The_data_heat_island_effect_quantifying_the_impact_of_AI_data_centers_in_a_warming_world'
    ],
    availableFor: ['domiechowice']
  },
  {
    id: 'water_consumption_layer',
    name: 'Zużycie Wody – Data Center',
    nameFor: (dc) =>
      dc.water.comparison
        ? `Zużycie Wody – Data Center vs ${dc.water.comparison.city.name}`
        : `Zużycie Wody – Data Center ${dc.specs.shortName}`,
    category: 'woda',
    describe: waterLayerDescription,
    visible: false,
    opacity: 1,
    color: '#0891b2', // cyan-600
    fillColor: '#22d3ee',
    weight: 2,
    type: 'water_consumption',
    sourcesFor: (dc) => dc.texts.water.sources,
    availableFor: ['domiechowice', 'piaseczno']
  },
  {
    id: 'energy_consumption_layer',
    name: 'Zużycie Prądu – Data Center',
    nameFor: (dc) =>
      dc.energy.comparison
        ? `Zużycie Prądu – Data Center vs ${dc.energy.comparison.city.name}`
        : `Zużycie Prądu – Data Center ${dc.specs.shortName}`,
    category: 'energia',
    describe: energyLayerDescription,
    visible: false,
    opacity: 1,
    color: '#ca8a04', // yellow-600
    fillColor: '#facc15',
    weight: 2,
    type: 'energy_consumption',
    sourcesFor: (dc) => dc.texts.energy.sources,
    availableFor: ['domiechowice', 'piaseczno']
  },
  {
    id: 'dolina_widawki_polygon',
    name: 'Obszar Chronionego Krajobrazu Doliny Widawki',
    category: 'srodowisko',
    description:
      'Prawnie chroniony obszar krajobrazowy na podstawie oficjalnych danych przestrzennych (PL.ZIPOP.1393.OCHK.272).',
    visible: true,
    opacity: 0.35,
    color: '#059669', // emerald-600
    fillColor: '#10b981',
    weight: 2,
    type: 'geojson',
    geoJsonData: dolinaWidawkiFullGeoJSON,
    sources: ['GDOŚ / Generalna Dyrekcja Ochrony Środowiska', 'data/dolina-winiawki.json'],
    availableFor: ['domiechowice']
  },
  {
    id: 'archeo_site_marker',
    name: 'Obiekt archeologiczny - Osada (AZP 75-50/26)',
    category: 'srodowisko',
    description: 'Zarejestrowana osada archeologiczna na terenie planowanej inwestycji.',
    visible: true,
    opacity: 1,
    color: '#d97706', // amber-600
    fillColor: '#f59e0b',
    weight: 2,
    type: 'marker',
    geoJsonData: archeoSiteGeoJSON,
    sources: ['zabytek.pl', 'AZP 75-50/26'],
    availableFor: ['domiechowice']
  }
];

/** Buduje listę warstw dostępnych dla wybranego centrum danych. */
export function buildInitialLayers(dc: DataCenterProfile): GISLayer[] {
  return LAYER_TEMPLATES.filter((t) => t.availableFor.includes(dc.id)).map((t) => ({
    id: t.id,
    name: t.nameFor ? t.nameFor(dc) : (t.name ?? ''),
    category: t.category,
    description: t.describe ? t.describe(dc) : (t.description ?? ''),
    visible: t.visible,
    opacity: t.opacity,
    color: t.color,
    fillColor: t.fillColor,
    dashArray: t.dashArray,
    weight: t.weight,
    type: t.type,
    buffers: t.buffers,
    detailsHtml: undefined,
    sources: t.sourcesFor ? t.sourcesFor(dc) : t.sources,
    geoJsonData: t.dataFor ? t.dataFor(dc) : t.geoJsonData
  }));
}

// ---------------------------------------------------------------------------
// Presety widoczności warstw
// ---------------------------------------------------------------------------
export interface PresetDefinition {
  id: PresetKey;
  label: (dc: DataCenterProfile) => string;
  color: string;
  icon: LucideIcon;
  iconClassName: string;
  targetLayerIds: string[];
}

export const PRESETS: PresetDefinition[] = [
  {
    id: 'continuous_noise',
    label: () => 'Hałas wentylatorów',
    color: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100',
    icon: Volume2,
    iconClassName: 'w-3.5 h-3.5 text-orange-600',
    targetLayerIds: ['noise_continuous_buffers', 'residential_buildings_layer']
  },
  {
    id: 'generator_noise',
    label: () => 'Testy generatorów',
    color: 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100',
    icon: ShieldAlert,
    iconClassName: 'w-3.5 h-3.5 text-red-600',
    targetLayerIds: ['noise_generators_buffers', 'residential_buildings_layer']
  },
  {
    id: 'thermal',
    label: () => 'Wpływ na temperaturę',
    color: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100',
    icon: Thermometer,
    iconClassName: 'w-3.5 h-3.5 text-amber-600',
    targetLayerIds: ['thermal_impact_buffers', 'residential_buildings_layer']
  },
  {
    id: 'protected_areas',
    label: () => 'Obszary chronione',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100',
    icon: ShieldCheckIcon,
    iconClassName: 'w-3.5 h-3.5 text-emerald-600',
    targetLayerIds: ['dolina_widawki_polygon', 'archeo_site_marker']
  },
  {
    id: 'residential_distances',
    label: () => 'Odległości do zabudowań',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100',
    icon: MapPin,
    iconClassName: 'w-3.5 h-3.5 text-indigo-600',
    targetLayerIds: ['residential_buildings_layer']
  },
  {
    id: 'water',
    label: (dc) =>
      dc.water.comparison
        ? `Zużycie wody (DC vs ${dc.water.comparison.city.name})`
        : 'Zużycie wody (DC)',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-900 hover:bg-cyan-100',
    icon: Droplets,
    iconClassName: 'w-3.5 h-3.5 text-cyan-600',
    targetLayerIds: ['water_consumption_layer']
  },
  {
    id: 'energy',
    label: (dc) =>
      dc.energy.comparison
        ? `Zużycie prądu (DC vs ${dc.energy.comparison.city.name})`
        : 'Zużycie prądu (DC)',
    color: 'bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100',
    icon: Zap,
    iconClassName: 'w-3.5 h-3.5 text-yellow-600',
    targetLayerIds: ['energy_consumption_layer']
  }
];

/** Presety, dla których jakakolwiek warstwa jest dostępna w danym DC. */
export function getAvailablePresets(layers: GISLayer[]): PresetDefinition[] {
  const ids = new Set(layers.map((l) => l.id));
  return PRESETS.filter((p) => p.targetLayerIds.some((id) => ids.has(id)));
}

/** Ustawia widoczność warstw zgodnie z wybranym presetem (warstwa DC zawsze widoczna). */
export function applyPresetToLayers(layers: GISLayer[], preset: PresetKey | null): GISLayer[] {
  const targetIds = new Set(
    preset ? PRESETS.find((p) => p.id === preset)?.targetLayerIds ?? [] : []
  );

  return layers.map((layer) =>
    layer.id === 'data_center_polygon'
      ? { ...layer, visible: true }
      : { ...layer, visible: targetIds.has(layer.id) }
  );
}

// ---------------------------------------------------------------------------
// Dane chartów (hałas, termika)
// ---------------------------------------------------------------------------
export const NOISE_DECAY_CHART_DATA = [
  { distance: 150, noiseContinuous: 65, noiseGenerator: 95, label: '150 m', normNight: 40, normDay: 50, note: 'Źródło wentylatorów (500 stóp / 152,4 m)' },
  { distance: 250, noiseContinuous: 61.8, noiseGenerator: 61.7, label: '250 m', normNight: 40, normDay: 50, note: 'Typowa praca centrum danych' },
  { distance: 500, noiseContinuous: 57.3, noiseGenerator: 57.2, label: '500 m', normNight: 40, normDay: 50, note: 'Znaczne przekroczenie normy nocnej' },
  { distance: 1000, noiseContinuous: 52.7, noiseGenerator: 52.7, label: '1 km', normNight: 40, normDay: 50, note: 'Przekroczenie normy dziennej' },
  { distance: 2000, noiseContinuous: 48.2, noiseGenerator: 48.2, label: '2 km', normNight: 40, normDay: 50, note: 'Poniżej normy dziennej, powyżej nocnej' },
  { distance: 3200, noiseContinuous: 45.1, noiseGenerator: 45.1, label: '3,2 km', normNight: 40, normDay: 50, note: 'Niskie częstotliwości wciąż wyraźnie słyszalne' },
  { distance: 4000, noiseContinuous: 43.8, noiseGenerator: 43.8, label: '4 km', normNight: 40, normDay: 50, note: 'Granica wyraźnej słyszalności niskich częstotliwości' },
];

export const THERMAL_ELEVATION_CHART_DATA = [
  { distance: 0, tempRise: 2.07, label: '0 km', threshold: 0.5, note: 'Krawędź centrum danych' },
  { distance: 1000, tempRise: 1.71, label: '1 km', threshold: 0.5, note: 'Wysoki wpływ termiczny' },
  { distance: 2000, tempRise: 1.39, label: '2 km', threshold: 0.5, note: 'Umiarkowany wpływ' },
  { distance: 3000, tempRise: 1.11, label: '3 km', threshold: 0.5, note: 'Stopniowe wygaszanie' },
  { distance: 5000, tempRise: 0.65, label: '5 km', threshold: 0.5, note: 'Oddziaływanie tła' },
  { distance: 10000, tempRise: 0.04, label: '10 km', threshold: 0.5, note: 'Granica oddziaływania' },
];

// ---------------------------------------------------------------------------
// Skala mocy: Elektrownia Bełchatów (porównanie dostępne tylko dla Domiechowic)
// ---------------------------------------------------------------------------
export const BELCHATOW_PLANT_INFO = {
  name: 'Elektrownia Bełchatów',
  totalMaxMW: 5298,
  sourceLabel: 'Wikipedia – Elektrownia Bełchatów (moc maksymalna 5298 MW; bloki 2–12 po 370–390 MW, blok nr 14 – 858 MW)'
} as const;

export const PLANT_STANDARD_BLOCK_MW = 380;
export const PLANT_LARGE_BLOCK_MW = 858;

export interface PowerPlantBlockInfo {
  number: number;
  capacityMW: number;
}

export const POWER_PLANT_BLOCKS: PowerPlantBlockInfo[] = [
  ...Array.from({ length: 11 }, (_, i) => ({
    number: i + 2,
    capacityMW: PLANT_STANDARD_BLOCK_MW
  })),
  { number: 14, capacityMW: PLANT_LARGE_BLOCK_MW }
];

export type DcScenarioKey = 'dc500' | 'dc1000';

export interface DcScenario {
  key: DcScenarioKey;
  powerMW: number;
  label: string;
  sublabel: string;
}

export const DC_SCENARIOS: Record<DcScenarioKey, DcScenario> = {
  dc500: { key: 'dc500', powerMW: 500, label: '500 MW', sublabel: 'Obecny projekt (KIP)' },
  dc1000: { key: 'dc1000', powerMW: 1000, label: '1000 MW', sublabel: 'Moc docelowa (wnioskowana)' }
};

export interface PowerPlantBlockFillState extends PowerPlantBlockInfo {
  filledMW: number;
  fillFraction: number;
}

// Kolejność wypełniania: od bloków 2–12 (rosnąco po numerach), na końcu blok nr 14.
export function getBlockFillStates(dcPowerMW: number): PowerPlantBlockFillState[] {
  let remaining = dcPowerMW;
  return POWER_PLANT_BLOCKS.map((block) => {
    const filledMW = Math.max(0, Math.min(remaining, block.capacityMW));
    remaining -= filledMW;
    return { ...block, filledMW, fillFraction: filledMW / block.capacityMW };
  });
}

// Roczna produkcja przeciętnego bloku przy pracy 24/7: 380 MW × 8760 h ≈ 3,33 TWh
export const STANDARD_BLOCK_ANNUAL_TWH = (PLANT_STANDARD_BLOCK_MW * 8760) / 1_000_000;
