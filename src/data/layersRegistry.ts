import { GISLayer, DataCenterSpecs } from '../types/gis';
import { dataCenterGeoJSON } from './geojson/dataCenter';
import { archeoSiteGeoJSON } from './geojson/archeoSite';
import dolinaWidawkiFullGeoJSON from './geojson/dolinaWidawki.json';

export const DATA_CENTER_SPECS: DataCenterSpecs = {
  name: "Hyperscale Data Center Domiechowice",
  location: "Domiechowice, Gmina Bełchatów, Powiat Bełchatowski",
  district: "Łódzkie, Polska",
  areaHa: 52.6016,
  plotsCount: 71,
  itPowerMW: 500,
  generatorPowerMW: 720,
  generatorsCount: 100,
  thermalPowerMWt: 300,
  fuelStorageM3: "7 500 m³ - 13 000 m³ (Diesel / HVO)",
  status: "Zawieszona decyzja środowiskowa (Postanowienie z 27 maja 2026 r.)",
  statusDate: "27.05.2026",
  investor: "Data Center Bełchatów Sp. z o.o. (Next DC Sp. z o.o.)",
  buildingCoverage: "ok. 80% powierzchni zabudowanej lub utwardzonej",
  biologicallyActiveArea: "min. 20% powierzchni biologicznie czynnej"
};

export const INITIAL_LAYERS: GISLayer[] = [
  {
    id: 'data_center_polygon',
    name: 'Obszar Inwestycji Data Center',
    category: 'inwestycja',
    description: 'Poligon obejmujący 71 działek ewidencyjnych o łącznej powierzchni 52,6 ha w Domiechowicach.',
    visible: true,
    opacity: 0.8,
    color: '#0284c7', // sky-600
    fillColor: '#38bdf8',
    weight: 3,
    type: 'geojson',
    geoJsonData: dataCenterGeoJSON,
    sources: ['Karta Informacyjna Przedsięwzięcia (KIP)', 'Gmina Bełchatów']
  },
  {
    id: 'residential_buildings_layer',
    name: 'Najbliższe Zabudowania Mieszkaniowe & Odległości',
    category: 'zabudowa',
    description: 'Punktowe lokalizacje najbliższych domów jednorodzinnych z wyliczoną odległością od krawędzi działek Data Center.',
    visible: true,
    opacity: 1,
    color: '#6366f1', // indigo-500
    fillColor: '#818cf8',
    weight: 2,
    type: 'residential_markers',
    sources: ['Pomiary odległościowe GIS', 'Wydział Geodezji']
  },
  {
    id: 'noise_continuous_buffers',
    name: 'Hałas Ciągły Wentylatorów (Chillers)',
    category: 'akustyka',
    description: 'Model 1/r^1.5 z odbiciami gruntowymi i atmosferycznymi. Źródło: 65 dBA w odległości 152,4 m (500 stóp). Spadek ~4,5 dB przy każdym podwojeniu odległości.',
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
        description: 'Niskie częstotliwości (<200 Hz) z HVAC nie są pochłaniane przez powietrze, drzewa ani ekrany akustyczne – pozostają słyszalne nawet do 4 km.'
      }
    ],
    sources: [
      'Lyver Data Center Noise Study (2022) – protectpwc.org',
      'https://protectpwc.org/wp-content/uploads/2023/02/Lyver-Data-Center-Noise-Study-123122.pdf',
      'Model 1/r^1.5 z odbiciami gruntowymi i inwersjami atmosferycznymi'
    ]
  },
  {
    id: 'noise_generators_buffers',
    name: 'Hałas Testów Generatorów Diesla',
    category: 'akustyka',
    description: 'Model 1/r^1.5. Źródło: 95 dBA w odległości 7 m od wydechu silnika diesla. Zasięg słyszalności miesięcznych testów obciążeniowych ponad 100 agregatów (720 MW).',
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
        description: 'Poniżej normy dziennej, wciąż powyżej normy nocnej. Niskie częstotliwości słyszalne z dużej odległości.'
      }
    ],
    sources: [
      'Decibel International – Kompleksowy przewodnik po dźwiękoszczelności centrów danych',
      'https://www.decibelinternational.pl/blog/kompleksowy-przewodnik-po-d-wi-koszczelno-ci-i-optymalizacji-akustycznej-dla-centr-w-danych-6/'
    ]
  },
  {
    id: 'thermal_impact_buffers',
    name: 'Wpływ na Temperaturę Otoczenia (Mikroklimat)',
    category: 'termika',
    description: 'Model wielomianowy drugiego stopnia (quadratic fit) – efekt wyspy ciepła centrów danych. ΔT(d) = 0,0158·d² – 0,3585·d + 2,0482 (d w km).',
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
    ]
  },
  {
    id: 'water_consumption_layer',
    name: 'Zużycie Wody – Data Center vs Bełchatów',
    category: 'woda',
    description: 'Dwa koła o powierzchni proporcjonalnej do rocznego zużycia wody: Data Center 500 MW (~11,87 mln m³/rok, chłodzenie WUE 0,21 l/kWh + produkcja energii ~2,5 l/kWh) oraz Bełchatów (~2,87 mln m³/rok, 52 331 mieszk. × 150 l/dobę). Szczegółowe porównanie znajduje się w panelu legendy.',
    visible: false,
    opacity: 1,
    color: '#0891b2', // cyan-600
    fillColor: '#22d3ee',
    weight: 2,
    type: 'water_consumption',
    sources: [
      'EcoEkonomia – Europa pokazuje, jak odpowiedzialnie chłodzić centra danych (WUE w PL ~0,21 l/kWh)',
      'https://ecoekonomia.pl/europa-pokazuje-jak-odpowiedzialnie-chlodzic-centra-danych/',
      'GlobEnergia – Ile wody potrzebuje elektrownia węglowa (1,5–4 l/kWh)',
      'https://globenergia.pl/ile-wody-potrzebuje-elektrownia-weglowa-to-nawet-190-l-kwh/',
      'Mojawoda.com – średnie zużycie wody na osobę w Polsce (~150 l/dobę)',
      'https://mojawoda.com/pl/blog/poradniki/srednie-zuzycie-wody-na-osobe-w-m3-i-litrach-kalkulator-zuzycia-wody-2026',
      'Wikipedia – Bełchatów (liczba mieszkańców: 52 331)',
      'https://pl.wikipedia.org/wiki/Be%C5%82chat%C3%B3w'
    ]
  },
  {
    id: 'dolina_widawki_polygon',
    name: 'Obszar Chronionego Krajobrazu Doliny Widawki',
    category: 'srodowisko',
    description: 'Prawnie chroniony obszar krajobrazowy na podstawie oficjalnych danych przestrzennych (PL.ZIPOP.1393.OCHK.272).',
    visible: true,
    opacity: 0.35,
    color: '#059669', // emerald-600
    fillColor: '#10b981',
    weight: 2,
    type: 'geojson',
    geoJsonData: dolinaWidawkiFullGeoJSON,
    sources: ['GDOŚ / Generalna Dyrekcja Ochrony Środowiska', 'data/dolina-winiawki.json']
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
    sources: ['zabytek.pl', 'AZP 75-50/26']
  }
];

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

// --- Bilans wodny: Data Center 500 MW vs mieszkańcy Bełchatowa ---
export const WATER_ANALYSIS = {
  powerMW: 500,
  annualEnergyKWh: 4_380_000_000, // 500 MW × 24 h × 365 dni = 4,38 TWh
  annualEnergyLabel: '4 380 000 000 kWh (4,38 TWh)',
  direct: {
    label: 'Bezpośrednie (chłodzenie – średnie WUE w PL)',
    factorLKwh: 0.21,
    factorLabel: '0,21 l/kWh',
    annualM3: 919_800,
    annualLabel: '~919 800 m³'
  },
  indirect: {
    label: 'Pośrednie (produkcja energii elektrycznej – średnia dla miksu PL)',
    factorLKwh: 2.5,
    factorLabel: '~2,50 l/kWh',
    annualM3: 10_950_000,
    annualLabel: '~10 950 000 m³'
  },
  total: {
    factorLKwh: 2.71,
    factorLabel: '~2,71 l/kWh',
    annualM3: 11_869_800,
    annualLabel: '~11 869 800 m³',
    annualLitersLabel: '~11,9 mld litrów'
  },
  belchatow: {
    population: 52_331,
    litersPerPersonDay: 150,
    annualM3: 2_865_122,
    annualLabel: '~2 865 000 m³',
    centerCoords: [51.36239, 19.36522] as [number, number] // 51°21'44.6"N 19°21'54.8"E
  },
  mapCircles: {
    dcRadiusMeters: 2328.6,
    cityRadiusMeters: 1150,
    scaleNote: 'Pola powierzchni kół proporcjonalne do rocznego zużycia wody'
  },
  ratioVsCity: 4.1,
  cityWaterForDcMonths: 2.9
};

export const WATER_COMPARISON_CHART_DATA = [
  {
    podmiot: 'Data Center 500 MW',
    bezposrednie: WATER_ANALYSIS.direct.annualM3,
    posrednie: WATER_ANALYSIS.indirect.annualM3,
    note: 'Chłodzenie (WUE 0,21 l/kWh) + produkcja energii (~2,5 l/kWh)'
  },
  {
    podmiot: 'Bełchatów (52 331 mieszk.)',
    bezposrednie: WATER_ANALYSIS.belchatow.annualM3,
    posrednie: 0,
    note: '52 331 mieszkańców × 150 l/dobę × 365 dni'
  }
];
