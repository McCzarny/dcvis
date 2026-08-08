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
    description: 'Spadek natężenia dźwięku urządzeń chłodzących w porze dziennej i nocnej.',
    visible: true,
    opacity: 0.4,
    color: '#ea580c', // orange-600
    fillColor: '#f97316',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 15,
        label: 'Otoczenie Wentylatorów (15 m)',
        valueText: '70 - 85 dBA',
        color: '#b91c1c',
        fillColor: '#dc2626',
        description: 'Bezpośrednie sąsiedztwo czerpni i wyrzutni powietrza.'
      },
      {
        distanceMeters: 60,
        label: 'Strefa Bliska (60 m / 200 ft)',
        valueText: '60 dBA',
        color: '#c2410c',
        fillColor: '#ea580c',
        description: 'Spadek poziomu dźwięku do ok. 60 dBA.'
      },
      {
        distanceMeters: 240,
        label: 'Przekroczenie Normy Nocnej (240 m)',
        valueText: '50 dBA (+10 dB przekroczenia)',
        color: '#d97706',
        fillColor: '#f59e0b',
        description: 'Przekroczenie dopuszczalnej normy nocnej dla zabudowy jednorodzinnej o 10 dB.'
      },
      {
        distanceMeters: 500,
        label: 'Spadek Natężenia (500 m)',
        valueText: '45 dBA',
        color: '#ca8a04',
        fillColor: '#eab308',
        description: 'Spadek natężenia dźwięku ciągłego do 45 dBA.'
      },
      {
        distanceMeters: 800,
        label: 'Formalna Norma Nocna (800 m / 0,5 mili)',
        valueText: '40 dBA (Limit nocny)',
        color: '#65a30d',
        fillColor: '#84cc16',
        description: 'Granica dopuszczalnego poziomu hałasu w nocy dla zabudowy jednorodzinnej (40 dBA).'
      },
      {
        distanceMeters: 1500,
        label: 'Słyszalność Niskich Częstotliwości (1500 m)',
        valueText: 'Niski Hum w nocy',
        color: '#7e22ce',
        fillColor: '#a855f7',
        description: 'Niskoczęstotliwościowy szum transformatorów słyszalny przy inwersji i wietrze.'
      }
    ],
    sources: ['Analiza akustyczna chłodzenia']
  },
  {
    id: 'noise_generators_buffers',
    name: 'Hałas Testów Generatorów Diesla',
    category: 'akustyka',
    description: 'Zasięg słyszalności miesięcznych testów obciążeniowych ponad 100 agregatów prądotwórczych (720 MW).',
    visible: false,
    opacity: 0.45,
    color: '#dc2626', // red-600
    fillColor: '#ef4444',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 1200,
        label: 'Ogrodzenie Inwestycji (Test Diesla)',
        valueText: '80 - 100 dBA przy ogrodzeniu',
        color: '#991b1b',
        fillColor: '#b91c1c',
        description: 'Emisja z wydechów silników Diesla bez rozbudowanych tłumików rezydeńskich.'
      },
      {
        distanceMeters: 1600,
        label: 'Promień Słyszalności Diesli (1200 - 1600 m)',
        valueText: 'Wyraźnie słyszalny pracę silników',
        color: '#dc2626',
        fillColor: '#ef4444',
        description: 'Wydech silnikowy zachowuje słyszalność w otwartym terenie w promieniu do 1,6 km.'
      }
    ],
    sources: ['Dane KIP / testy obciążeniowe generatorów']
  },
  {
    id: 'thermal_impact_buffers',
    name: 'Wpływ na Temperaturę Otoczenia (Mikroklimat)',
    category: 'termika',
    description: 'Poziome rozchodzenie się ciepłego powietrza z chillers i opadanie pętli cieplnej.',
    visible: false,
    opacity: 0.4,
    color: '#d97706', // amber-600
    fillColor: '#f59e0b',
    type: 'buffer_ring',
    buffers: [
      {
        distanceMeters: 300,
        label: 'Płaskowyż Termiczny (0 - 300 m)',
        valueText: '+1,5°C ÷ +2,5°C',
        color: '#b91c1c',
        fillColor: '#dc2626',
        description: 'Strumienie gorącego powietrza rozchodzą się poziomo, podtrzymując podwyższoną temperaturę.'
      },
      {
        distanceMeters: 1000,
        label: 'Szczytowe Opadanie Pętli Ciepła (500 m - 1 km)',
        valueText: '+0,80°C',
        color: '#c2410c',
        fillColor: '#ea580c',
        description: 'Mieszanie i opadanie pętli ciepłego powietrza na przyległe tereny.'
      },
      {
        distanceMeters: 2000,
        label: 'Zauważalny Zasięg Mikroklimatu (1 km - 2 km)',
        valueText: '+0,58°C (>0,5°C do 1,5-2 km)',
        color: '#d97706',
        fillColor: '#f59e0b',
        description: 'Zasięg morfologiczny zauważalnej modyfikacji mikroklimatu lokalnego.'
      },
      {
        distanceMeters: 5000,
        label: 'Śladowe Oddziaływanie Tła (2 km - 5 km)',
        valueText: '+0,24°C (na 5 km)',
        color: '#ca8a04',
        fillColor: '#eab308',
        description: 'Graniczny sygnał termiczny miesza się z naturalnymi wahaniami tła klimatycznego.'
      }
    ],
    sources: ['Badania emisji ciepła odpadowego']
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
  { distance: 15, noise: 77.5, label: '15 m', normNight: 40, normDay: 50, note: 'Wentylatory bezpośrednie' },
  { distance: 60, noise: 60, label: '60 m', normNight: 40, normDay: 50, note: 'Spadek odległościowy' },
  { distance: 240, noise: 50, label: '240 m', normNight: 40, normDay: 50, note: 'Przekroczenie normy nocnej +10 dB' },
  { distance: 500, noise: 45, label: '500 m', normNight: 40, normDay: 50, note: 'Początek słyszalności humu' },
  { distance: 800, noise: 40, label: '800 m', normNight: 40, normDay: 50, note: 'Norma nocna jednorodzinna' },
  { distance: 1200, noise: 37, label: '1,2 km', normNight: 40, normDay: 50, note: 'Hum niskich częstotliwości' },
  { distance: 1600, noise: 35, label: '1,6 km', normNight: 40, normDay: 50, note: 'Granica słyszalności testów diesla' },
];

export const THERMAL_ELEVATION_CHART_DATA = [
  { distance: 100, tempRise: 2.0, label: '100 m', threshold: 0.5, note: 'Płaskowyż termiczny' },
  { distance: 300, tempRise: 1.8, label: '300 m', threshold: 0.5, note: 'Koniec strefy bezpośredniej' },
  { distance: 750, tempRise: 0.80, label: '750 m', threshold: 0.5, note: 'Opadanie pętli ciepłego powietrza' },
  { distance: 1500, tempRise: 0.58, label: '1,5 km', threshold: 0.5, note: 'Granica zauważalnej modyfikacji' },
  { distance: 3000, tempRise: 0.35, label: '3 km', threshold: 0.5, note: 'Wygaszanie sygnału' },
  { distance: 5000, tempRise: 0.24, label: '5 km', threshold: 0.5, note: 'Śladowy wpływ w tle' },
];
