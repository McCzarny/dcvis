import * as turf from '@turf/turf';
import { Feature, Polygon } from 'geojson';
import { DataCenterKey, DataCenterSpecs } from '../types/gis';
import { domiechowiceGeoJSON } from './geojson/dataCenter';
import { piasecznoGeoJSON } from './geojson/piaseczno';

/** Średnie bezpowrotne zużycie wody przy produkcji energii elektrycznej (miks PL). */
export const WATER_FACTOR_L_PER_KWH = 2.5;

// ---------------------------------------------------------------------------
// Formatowanie (locale pl-PL)
// ---------------------------------------------------------------------------
export const formatInt = (value: number): string =>
  Math.round(value).toLocaleString('pl-PL', { maximumFractionDigits: 0 });

export const formatNum = (value: number, maxFrac = 2): string =>
  value.toLocaleString('pl-PL', { maximumFractionDigits: maxFrac });

export const formatFixed = (value: number, digits: number): string =>
  value.toLocaleString('pl-PL', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatM3 = (value: number): string => `~${formatInt(value)} m³`;

export const formatMlnM3 = (value: number): string =>
  (value / 1_000_000).toLocaleString('pl-PL', { maximumFractionDigits: 2 });

export const formatGWh = (gwh: number): string =>
  gwh >= 1000
    ? `${(gwh / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} TWh`
    : `${gwh.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} GWh`;

export const formatAnnualEnergy = (kwh: number): string =>
  `${formatInt(kwh)} kWh (${(kwh / 1_000_000_000).toLocaleString('pl-PL', { maximumFractionDigits: 2 })} TWh)`;

/**
 * Poprawna fraza porównawcza zużycia:
 * ratio ≥ 1 → "3,8 raza więcej wody niż", ratio < 1 → "0,55 raza tyle wody co".
 */
export const ratioClause = (ratio: number, noun: string): string =>
  ratio >= 1
    ? `${formatNum(ratio, 2)} raza więcej ${noun} niż`
    : `${formatNum(ratio, 2)} raza tyle ${noun} co`;

const round2 = (value: number): number => Math.round(value * 100) / 100;

// ---------------------------------------------------------------------------
// Typy analiz
// ---------------------------------------------------------------------------
export interface DocSource {
  label: string;
  url?: string;
  note: string;
}

export interface CityWaterInfo {
  name: string;
  /** forma dopełniacza, np. "Bełchatowa" – używana w zdaniach porównawczych */
  genitive: string;
  population: number;
  /** Wyświetlana kwota na mieszkańca, np. "150 l/dobę" lub "57,4 m³/rok". */
  perCapitaLabel: string;
  annualM3: number;
  annualLabel: string;
  centerCoords: [number, number];
}

export interface GroundwaterInfo {
  aquiferDepthNote: string;
  waterTableNote: string;
  yieldNote: string;
  source: string;
  maxFlowM3h: number;
  typicalFlowM3h: number;
  annualMaxM3: number;
  annualMaxLabel: string;
  annualTypicalM3: number;
  annualTypicalLabel: string;
}

export interface WaterComparison {
  city: CityWaterInfo;
  /** Dane o wodach podziemnych – dostępne np. tylko dla Domiechowic. */
  groundwater?: GroundwaterInfo;
  ratioVsCity: number;
  cityWaterForDcMonths: number;
}

export interface WaterAnalysis {
  powerMW: number;
  annualEnergyKWh: number;
  annualEnergyLabel: string;
  direct: { label: string; factorLabel: string; annualM3: number; annualLabel: string };
  indirect: { label: string; factorLKwh: number; factorLabel: string; annualM3: number; annualLabel: string };
  total: { factorLKwh: number; factorLabel: string; annualM3: number; annualLabel: string; annualLitersLabel: string };
  /** Porównanie z miastem – uzupełniane, gdy są dane o mieście. */
  comparison?: WaterComparison;
  mapCircles: {
    dcRadiusMeters: number;
    dcDirectRadiusMeters: number;
    dcGroundwaterRadiusMeters?: number;
    cityRadiusMeters?: number;
    scaleNote: string;
  };
}

export interface EnergyComparison {
  city: {
    name: string;
    /** forma dopełniacza, np. "Bełchatowa" – używana w zdaniach porównawczych */
    genitive: string;
    population: number;
    perCapitaKWh: number;
    perCapitaLabel: string;
    annualKWh: number;
    annualLabel: string;
    annualGWh: number;
    centerCoords: [number, number];
  };
  ratioVsCity: number;
  cityEnergyForDcDays: number;
}

export interface EnergyAnalysis {
  powerMW: number;
  annualEnergyKWh: number;
  annualEnergyLabel: string;
  dc: { label: string; annualKWh: number; annualLabel: string; annualGWh: number };
  comparison?: EnergyComparison;
  mapCircles: {
    dcRadiusMeters: number;
    cityRadiusMeters?: number;
    scaleNote: string;
  };
}

/** Teksty i źródła specyficzne dla danego centrum danych. */
export interface DataCenterTexts {
  headerSubtitle: string;
  polygon: {
    /** Krótka etykieta na poligonie, np. "Planowane Data Center". */
    shortLabel: string;
    description: string;
    sources: string[];
  };
  water: { sources: string[]; docsSources: DocSource[] };
  energy: { sources: string[]; docsSources: DocSource[] };
}

export interface DataCenterProfile {
  id: DataCenterKey;
  specs: DataCenterSpecs;
  geoJson: Feature<Polygon>;
  mapCenter: [number, number];
  mapZoom: number;
  water: WaterAnalysis;
  energy: EnergyAnalysis;
  /** Czy dostępne jest porównanie skali mocy z Elektrownią Bełchatów. */
  hasPowerPlantComparison: boolean;
  /** Czy dostępna jest analiza akustyczna (warstwy i wykresy hałasu). */
  hasNoiseAnalysis: boolean;
  /** Czy dostępna jest analiza termiczna (wpływ na temperaturę otoczenia). */
  hasThermalAnalysis: boolean;
  texts: DataCenterTexts;
}

// ---------------------------------------------------------------------------
// Budowniczy analiz
// ---------------------------------------------------------------------------
interface WaterParams {
  powerMW: number;
  directPerDayM3: number;
  directLabel: string;
  indirectLabel: string;
  /** Niestandardowe promienie kół – uzupełniają wartości domyślne (liczone proporcjonalnie). */
  mapCircles?: Partial<WaterAnalysis['mapCircles']>;
  /**
   * Skala kół proporcjonalnych: promień = √(roczna wartość) × K.
   * Domyślnie stała dobrana pod Domiechowice (WATER_RADIUS_K).
   */
  radiusK?: number;
  comparison?: WaterComparison;
}

function makeWaterAnalysis(p: WaterParams): WaterAnalysis {
  const annualEnergyKWh = p.powerMW * 8760 * 1000;
  const directM3 = p.directPerDayM3 * 365;
  const indirectM3 = (annualEnergyKWh * WATER_FACTOR_L_PER_KWH) / 1000;
  const totalM3 = directM3 + indirectM3;
  const k = p.radiusK ?? WATER_RADIUS_K;
  const cityRadiusMeters = p.comparison
    ? radiusFor(p.comparison.city.annualM3, k)
    : undefined;

  return {
    powerMW: p.powerMW,
    annualEnergyKWh,
    annualEnergyLabel: formatAnnualEnergy(annualEnergyKWh),
    direct: {
      label: p.directLabel,
      factorLabel: `${formatNum(p.directPerDayM3)} m³/dobę`,
      annualM3: Math.round(directM3),
      annualLabel: formatM3(directM3)
    },
    indirect: {
      label: p.indirectLabel,
      factorLKwh: WATER_FACTOR_L_PER_KWH,
      factorLabel: `~${formatFixed(WATER_FACTOR_L_PER_KWH, 2)} l/kWh`,
      annualM3: Math.round(indirectM3),
      annualLabel: formatM3(indirectM3)
    },
    total: {
      factorLKwh: WATER_FACTOR_L_PER_KWH,
      factorLabel: `~${formatFixed(WATER_FACTOR_L_PER_KWH, 2)} l/kWh`,
      annualM3: Math.round(totalM3),
      annualLabel: formatM3(totalM3),
      annualLitersLabel: `~${formatFixed(totalM3 / 1_000_000, 1)} mld litrów`
    },
    comparison: p.comparison,
    mapCircles: {
      dcRadiusMeters: radiusFor(totalM3, k),
      dcDirectRadiusMeters: radiusFor(directM3, k),
      ...(cityRadiusMeters !== undefined ? { cityRadiusMeters } : {}),
      scaleNote,
      ...p.mapCircles
    }
  };
}

interface EnergyParams {
  powerMW: number;
  /** Niestandardowe promienie kół – uzupełniają wartości domyślne (liczone proporcjonalnie). */
  mapCircles?: Partial<EnergyAnalysis['mapCircles']>;
  /**
   * Skala kół proporcjonalnych: promień = √(roczna wartość) × K.
   * Domyślnie stała dobrana pod Domiechowice (ENERGY_RADIUS_K).
   */
  radiusK?: number;
  comparison?: EnergyComparison;
}

function makeEnergyAnalysis(p: EnergyParams): EnergyAnalysis {
  const annualKWh = p.powerMW * 8760 * 1000;
  const annualGWh = annualKWh / 1_000_000;
  const k = p.radiusK ?? ENERGY_RADIUS_K;
  const cityRadiusMeters = p.comparison
    ? radiusFor(p.comparison.city.annualKWh, k)
    : undefined;

  return {
    powerMW: p.powerMW,
    annualEnergyKWh: annualKWh,
    annualEnergyLabel: formatAnnualEnergy(annualKWh),
    dc: {
      label: 'Pobór Data Center (praca 24/7)',
      annualKWh,
      annualLabel: `~${formatAnnualEnergy(annualKWh)}`,
      annualGWh
    },
    comparison: p.comparison,
    mapCircles: {
      dcRadiusMeters: radiusFor(annualKWh, k),
      ...(cityRadiusMeters !== undefined ? { cityRadiusMeters } : {}),
      scaleNote,
      ...p.mapCircles
    }
  };
}

/**
 * Promień koła proporcjonalnego do pierwiastka z rocznej wartości
 * (pole koła ∝ zużycie). Stałe dobrane tak, aby dla Domiechowic promień
 * wynosił 2328,6 m – tak jak w pierwotnej wersji aplikacji.
 */
const WATER_RADIUS_K = 2328.6 / Math.sqrt(10_968_250);
const ENERGY_RADIUS_K = 2328.6 / Math.sqrt(4_380_000_000);
const radiusFor = (value: number, k: number): number => Math.round(Math.sqrt(value) * k * 10) / 10;

const scaleNote = 'Pola powierzchni kół proporcjonalne do rocznego zużycia';

// ---------------------------------------------------------------------------
// Centrum danych 1: Domiechowice
// ---------------------------------------------------------------------------
const DOMIECHOWICE_WATER_COMPARISON: WaterComparison = {
  city: {
    name: 'Bełchatów',
    genitive: 'Bełchatowa',
    population: 52_331,
    perCapitaLabel: '150 l/dobę',
    annualM3: 2_865_122,
    annualLabel: '~2 865 000 m³',
    centerCoords: [51.36239, 19.36522] // 51°21'44.6"N 19°21'54.8"E
  },
  groundwater: {
    aquiferDepthNote: 'Miąższość wodonośnych osadów czwartorzędu rzadko przekracza 30 m, najczęściej mieści się w przedziale 10–20 m.',
    waterTableNote: 'Lustro wody stabilizuje się na głębokości od 1 do 20 m, przeważnie w przedziale 2–10 m.',
    yieldNote: 'Wydajności pojedynczych ujęć do 80 m³/h, przeważnie jednak wynoszą około 10–40 m³/h.',
    source: 'Prognoza Oddziaływania na Środowisko',
    maxFlowM3h: 80,
    typicalFlowM3h: 40,
    annualMaxM3: 700_800, // 80 m³/h × 24 h × 365 dni
    annualMaxLabel: '~700 800 m³',
    annualTypicalM3: 350_400, // 40 m³/h × 24 h × 365 dni
    annualTypicalLabel: '~350 400 m³'
  },
  ratioVsCity: 3.8,
  cityWaterForDcMonths: 3.1
};

const DOMIECHOWICE_WATER = makeWaterAnalysis({
  powerMW: 500,
  directPerDayM3: 50,
  directLabel: 'Bezpośrednie (chłodzenie – deklaracja wójta)',
  indirectLabel: 'Pośrednie (produkcja energii elektrycznej – średnia dla miksu PL)',
  comparison: DOMIECHOWICE_WATER_COMPARISON,
  mapCircles: {
    dcRadiusMeters: 2328.6,
    dcDirectRadiusMeters: 91.3, // sqrt(18 250 / 10 968 250) × 2328.6 – powierzchnia proporcjonalna do zużycia bezpośredniego
    dcGroundwaterRadiusMeters: 608.6, // roczna wydajność typowego ujęcia (40 m³/h)
    cityRadiusMeters: 1150,
    scaleNote
  }
});

const DOMIECHOWICE_ENERGY = makeEnergyAnalysis({
  powerMW: 500,
  comparison: {
    city: {
      name: 'Bełchatów',
      genitive: 'Bełchatowa',
      population: 52_331,
      perCapitaKWh: 662.7,
      perCapitaLabel: '662,7 kWh',
      annualKWh: 34_679_753.7,
      annualLabel: '~34 680 000 kWh (~34,7 GWh)',
      annualGWh: 34.68,
      centerCoords: [51.36239, 19.36522]
    },
    ratioVsCity: 126.3,
    cityEnergyForDcDays: 2.9
  },
  mapCircles: {
    dcRadiusMeters: 2328.6,
    cityRadiusMeters: 207,
    scaleNote
  }
});

const domiechowice: DataCenterProfile = {
  id: 'domiechowice',
  specs: {
    name: 'DC Domiechowice',
    shortName: 'Domiechowice',
    location: 'Domiechowice, Gmina Bełchatów, Powiat Bełchatowski',
    district: 'Łódzkie, Polska',
    areaHa: 52.6016,
    plotsCount: 71,
    itPowerMW: 500,
    generatorPowerMW: 720,
    generatorsCount: 100,
    generatorsCountLabel: '100+',
    thermalPowerMWt: 300,
    fuelStorageM3: '7 500 m³ - 13 000 m³ (Diesel / HVO)',
    waterPerDayM3: 50,
    status: 'Zawieszona decyzja środowiskowa (Postanowienie z 27 maja 2026 r.)',
    statusDate: '27.05.2026',
    investor: 'Data Center Bełchatów Sp. z o.o. (Next DC Sp. z o.o.)',
    buildingCoverage: 'ok. 80% powierzchni zabudowanej lub utwardzonej',
    biologicallyActiveArea: 'min. 20% powierzchni biologicznie czynnej'
  },
  geoJson: domiechowiceGeoJSON,
  mapCenter: [51.367, 19.314],
  mapZoom: 14,
  water: DOMIECHOWICE_WATER,
  energy: DOMIECHOWICE_ENERGY,
  hasPowerPlantComparison: true,
  hasNoiseAnalysis: true,
  hasThermalAnalysis: true,
  texts: {
    headerSubtitle: 'Geoportal GIS i Analiza Oddziaływania Środowiskowego (Gmina Bełchatów)',
    polygon: {
      shortLabel: 'Planowane Data Center',
      description: 'Poligon obejmujący 71 działek ewidencyjnych o łącznej powierzchni 52,6 ha w Domiechowicach.',
      sources: ['Karta Informacyjna Przedsięwzięcia (KIP)', 'Gmina Bełchatów']
    },
    water: {
      sources: [
        'Deklaracja wójta podczas konsultacji – bezpośrednie zużycie wody centrum danych: 50 m³/dobę',
        'https://www.youtube.com/watch?v=yKuA8bCMzoA',
        'GlobEnergia – Ile wody potrzebuje elektrownia węglowa (1,5–4 l/kWh)',
        'https://globenergia.pl/ile-wody-potrzebuje-elektrownia-weglowa-to-nawet-190-l-kwh/',
        'Mojawoda.com – średnie zużycie wody na osobę w Polsce (~150 l/dobę)',
        'https://mojawoda.com/pl/blog/poradniki/srednie-zuzycie-wody-na-osobe-w-m3-i-litrach-kalkulator-zuzycie-wody-2026',
        'Wikipedia – Bełchatów (liczba mieszkańców: 52 331)',
        'https://pl.wikipedia.org/wiki/Be%C5%82chat%C3%B3w'
      ],
      docsSources: [
        {
          label: 'Deklaracja wójta podczas konsultacji (YouTube)',
          url: 'https://www.youtube.com/watch?v=yKuA8bCMzoA',
          note: 'Bezpośrednie zużycie wody centrum danych: 50 m³/dobę.',
        },
        {
          label: 'GlobEnergia – Ile wody potrzebuje elektrownia węglowa?',
          url: 'https://globenergia.pl/ile-wody-potrzebuje-elektrownia-weglowa-to-nawet-190-l-kwh/',
          note: 'Średnie zużycie wody przy produkcji energii: 1,5–4 l/kWh; elektrownie węglowe z chłodzeniem wieżowym – bezpowrotne straty ok. 2,0–3,5 l/kWh. Do obliczeń przyjęto średnio 2,5 l/kWh.',
        },
        {
          label: 'Mojawoda.com – Średnie zużycie wody na osobę',
          url: 'https://mojawoda.com/pl/blog/poradniki/srednie-zuzycie-wody-na-osobe-w-m3-i-litrach-kalkulator-zuzycie-wody-2026',
          note: 'Przeciętny Polak zużywa ok. 150 litrów wody dziennie.',
        },
        {
          label: 'Wikipedia – Bełchatów',
          url: 'https://pl.wikipedia.org/wiki/Be%C5%82chat%C3%B3w',
          note: 'Liczba mieszkańców Bełchatowa: 52 331.',
        },
      ]
    },
    energy: {
      sources: [
        'GUS – Bank Danych Lokalnych (BDL), zużycie energii elektrycznej (2024 r.): 662,7 kWh na mieszkańca',
        'https://bdl.stat.gov.pl/',
        'Karta Informacyjna Przedsięwzięcia (KIP) – moc centrum danych: 500 MW'
      ],
      docsSources: [
        {
          label: 'GUS – Bank Danych Lokalnych (BDL)',
          url: 'https://bdl.stat.gov.pl/',
          note: 'Zużycie energii elektrycznej na mieszkańca Bełchatowa w 2024 r.: 662,7 kWh.',
        },
        {
          label: 'Karta Informacyjna Przedsięwzięcia (KIP)',
          note: 'Moc centrum danych: 500 MW (IT) – założenie pracy ciągłej 24/7 przez cały rok.',
        },
      ]
    }
  }
};

// ---------------------------------------------------------------------------
// Centrum danych 2: Piaseczno (dane w przygotowaniu – uzupełniamy z czasem)
// ---------------------------------------------------------------------------
const PIASECZNO_AREA_HA = round2(turf.area(piasecznoGeoJSON) / 10_000);

/** Centrum miasta Piaseczna (podane przez użytkownika). */
const PIASECZNO_CITY_COORDS: [number, number] = [52.08129277262238, 21.023834001648638];

const PIASECZNO_WATER_COMPARISON: WaterComparison = {
  city: {
    name: 'Piaseczno',
    genitive: 'Piaseczna',
    population: 51_971,
    perCapitaLabel: '57,4 m³/rok',
    annualM3: 2_983_135, // 57,4 m³/rok × 51 971 mieszk.
    annualLabel: '~2 983 000 m³',
    centerCoords: PIASECZNO_CITY_COORDS
  },
  ratioVsCity: 0.52, // 1 553 075 m³ (DC) / 2 983 135 m³ (miasto)
  cityWaterForDcMonths: 23 // (2 983 135 / 1 553 075) × 12
  // groundwater: brak danych – uzupełnimy w kolejnych iteracjach
};

const PIASECZNO_ENERGY_COMPARISON: EnergyComparison = {
  city: {
    name: 'Piaseczno',
    genitive: 'Piaseczna',
    population: 51_971,
    perCapitaKWh: 1044.83,
    perCapitaLabel: '1 044,83 kWh',
    annualKWh: 54_300_860, // 1 044,83 kWh × 51 971 mieszk.
    annualLabel: '~54 300 000 kWh (~54,3 GWh)',
    annualGWh: 54.3,
    centerCoords: PIASECZNO_CITY_COORDS
  },
  ratioVsCity: 11.3, // 613 200 000 kWh (DC) / 54 300 860 kWh (miasto)
  cityEnergyForDcDays: 32.3 // 54 300 860 / (613 200 000 / 365)
};

// ---------------------------------------------------------------------------
// Skala kół proporcjonalnych dla Piaseczna (promień = √(roczna wartość) × K)
//
// Środki kół DC (52,08961 N, 21,02952 E) i miasta (52,08129 N, 21,02383 E)
// leżą ~1003 m od siebie. Stałe K dobrano tak, by suma promieni wynosiła
// ~923 m – zapas ~80 m, więc koła DC i miasta się nie pokrywają,
// a pozostaje proporcjonalność pól (√ zużycia).
//
// Efekt: woda – DC 386,8 m / bezpośrednie 44,0 m / miasto 536,1 m;
//        energia – DC 710,7 m / miasto 211,5 m.
// Dla Domiechowic skala pozostaje historyczna (2328,6 m) – patrz *RADIUS_K.
// ---------------------------------------------------------------------------
const PIASECZNO_WATER_RADIUS_K = 0.3104;
const PIASECZNO_ENERGY_RADIUS_K = 0.0287;

const piasecznoWater = makeWaterAnalysis({
  powerMW: 70,
  directPerDayM3: 55,
  directLabel: 'Bezpośrednie (chłodzenie – zużycie deklarowane)',
  indirectLabel: 'Pośrednie (produkcja energii elektrycznej – szacunek dla miksu PL)',
  comparison: PIASECZNO_WATER_COMPARISON,
  radiusK: PIASECZNO_WATER_RADIUS_K
});

const piasecznoEnergy = makeEnergyAnalysis({
  powerMW: 70,
  comparison: PIASECZNO_ENERGY_COMPARISON,
  radiusK: PIASECZNO_ENERGY_RADIUS_K
});

const piaseczno: DataCenterProfile = {
  id: 'piaseczno',
  specs: {
    name: 'DC Piaseczno',
    shortName: 'Piaseczno',
    location: 'Piaseczno, powiat piaseczyński',
    district: 'Mazowieckie, Polska',
    areaHa: PIASECZNO_AREA_HA,
    itPowerMW: 70,
    generatorPowerMW: 118.6,
    generatorsCount: 49,
    generatorsCountLabel: '49',
    dryCoolersCount: 112,
    waterPerDayM3: 55,
    status: 'Dane w przygotowaniu'
  },
  geoJson: piasecznoGeoJSON,
  mapCenter: [52.08961, 21.02952],
  mapZoom: 16,
  water: piasecznoWater,
  energy: piasecznoEnergy,
  hasPowerPlantComparison: false,
  hasNoiseAnalysis: false,
  hasThermalAnalysis: false,
  texts: {
    headerSubtitle: 'Geoportal GIS i Analiza Oddziaływania Środowiskowego (Piaseczno, powiat piaseczyński)',
    polygon: {
      shortLabel: 'Centrum Danych',
      description:
        'Obrys centrum danych w Piasecznie wyliczony z podanych współrzędnych (WGS84). ' +
        'Powierzchnia: 112 drycoolerów na dachach, 49 agregatów diesla (118,6 MW), moc ok. 70 MW, ' +
        'zużycie wody 55 m³/dobę. Inwestor, status i dokumentacja – w przygotowaniu.',
      sources: ['Współrzędne obrysu – dane własne', 'Obliczenie powierzchni: turf.js']
    },
    water: {
      sources: [
        'Dane własne – deklarowane zużycie wody: 55 m³/dobę',
        'GUS (stat.gov.pl) – zużycie wody na mieszkańca: 57,4 m³/rok',
        'Wikipedia – Piaseczno (liczba mieszkańców: 51 971)',
        'Założenie: miks energetyczny PL – 2,5 l/kWh'
      ],
      docsSources: [
        { label: 'Dane własne inwestora', note: 'Bezpośrednie zużycie wody centrum danych: 55 m³/dobę.' },
        { label: 'GUS (stat.gov.pl)', note: 'Zużycie wody na 1 mieszkańca w Piasecznie: 57,4 m³/rok.' },
        { label: 'Wikipedia – Piaseczno', url: 'https://pl.wikipedia.org/wiki/Piaseczno', note: 'Liczba mieszkańców Piaseczna: 51 971 (dane GUS, 01.01.2024).' },
        { label: 'Założenie metodologiczne', note: 'Zużycie pośrednie wyliczone dla mocy 70 MW przy pracy 24/7 i średnim zużyciu 2,5 l/kWh (miks energetyczny PL).' },
        { label: 'Dane w przygotowaniu', note: 'Wody podziemne i szczegółowe otoczenie hydrologiczne – uzupełnimy w kolejnych iteracjach.' }
      ]
    },
    energy: {
      sources: [
        'Dane własne – moc centrum danych: ~70 MW',
        'GUS (stat.gov.pl) – zużycie energii na mieszkańca: 1 044,83 kWh',
        'Wikipedia – Piaseczno (liczba mieszkańców: 51 971)',
        'Założenie: praca ciągła 24/7 przez 365 dni'
      ],
      docsSources: [
        { label: 'Dane własne inwestora', note: 'Łączna moc centrum danych: około 70 MW.' },
        { label: 'GUS (stat.gov.pl)', note: 'Zużycie energii elektrycznej na 1 mieszkańca w Piasecznie: 1 044,83 kWh.' },
        { label: 'Wikipedia – Piaseczno', url: 'https://pl.wikipedia.org/wiki/Piaseczno', note: 'Liczba mieszkańców Piaseczna: 51 971 (dane GUS, 01.01.2024).' },
        { label: 'Założenie metodologiczne', note: 'Praca ciągła 24/7 przez 365 dni w roku.' }
      ]
    }
  }
};

// ---------------------------------------------------------------------------
// Rejestr
// ---------------------------------------------------------------------------
export const DATA_CENTERS: DataCenterProfile[] = [domiechowice, piaseczno];

export const DEFAULT_DATA_CENTER_ID: DataCenterKey = 'domiechowice';

export const getDataCenter = (id: DataCenterKey): DataCenterProfile =>
  DATA_CENTERS.find((dc) => dc.id === id) ?? domiechowice;

// ---------------------------------------------------------------------------
// Dane do wykresów porównawczych
// ---------------------------------------------------------------------------
export interface WaterChartRow {
  podmiot: string;
  bezposrednie: number;
  posrednie: number;
  note: string;
}

export function buildWaterChartRows(dc: DataCenterProfile): WaterChartRow[] {
  const w = dc.water;
  const rows: WaterChartRow[] = [
    {
      podmiot: `Data Center ${w.powerMW} MW`,
      bezposrednie: w.direct.annualM3,
      posrednie: w.indirect.annualM3,
      note: `Zużycie bezpośrednie (${w.direct.factorLabel}) + produkcja energii (${w.indirect.factorLabel})`
    }
  ];

  if (w.comparison) {
    const c = w.comparison.city;
    rows.push({
      podmiot: `${c.name} (${formatInt(c.population)} mieszk.)`,
      bezposrednie: c.annualM3,
      posrednie: 0,
      note: `${formatInt(c.population)} mieszkańców × ${c.perCapitaLabel}${
        c.perCapitaLabel.includes('dobę') ? ' × 365 dni' : ''
      }`
    });
  }

  return rows;
}

export interface EnergyChartRow {
  podmiot: string;
  gwh: number;
  note: string;
}

export function buildEnergyChartRows(dc: DataCenterProfile): EnergyChartRow[] {
  const e = dc.energy;
  const rows: EnergyChartRow[] = [
    {
      podmiot: `Data Center ${e.powerMW} MW`,
      gwh: e.dc.annualGWh,
      note: `${e.powerMW} MW × 24 h × 365 dni`
    }
  ];

  if (e.comparison) {
    const c = e.comparison.city;
    rows.push({
      podmiot: `${c.name} (${formatInt(c.population)} mieszk.)`,
      gwh: c.annualGWh,
      note: `${c.perCapitaLabel}/mieszkańca (GUS 2024) × ${formatInt(c.population)}`
    });
  }

  return rows;
}
