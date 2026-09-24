export type LayerCategory = 'inwestycja' | 'srodowisko' | 'akustyka' | 'termika' | 'zabudowa' | 'planowanie' | 'woda' | 'energia';

export type MapTileProvider = 'osm' | 'satellite';

/** Klucze centrów danych dostępnych w geoportalu. */
export type DataCenterKey = 'domiechowice' | 'piaseczno';

/** Presety widoczności warstw (radio-buttony w panelu warstw). */
export type PresetKey =
  | 'continuous_noise'
  | 'generator_noise'
  | 'thermal'
  | 'protected_areas'
  | 'residential_distances'
  | 'water'
  | 'energy';

export interface GISLayer {
  id: string;
  name: string;
  category: LayerCategory;
  description: string;
  visible: boolean;
  opacity: number;
  color: string;
  fillColor: string;
  dashArray?: string;
  weight?: number;
  type: 'geojson' | 'buffer_ring' | 'marker' | 'residential_markers' | 'water_consumption' | 'energy_consumption';
  geoJsonData?: any;
  buffers?: {
    distanceMeters: number;
    label: string;
    valueText: string;
    color: string;
    fillColor: string;
    description: string;
  }[];
  detailsHtml?: string;
  sources?: string[];
}

/**
 * Parametry centrum danych. Pola opcjonalne to dane, które będziemy
 * uzupełniać z czasem dla kolejnych lokalizacji.
 */
export interface DataCenterSpecs {
  name: string;
  shortName: string;
  location: string;
  district: string;
  areaHa: number;
  plotsCount?: number;
  /** Moc poboru / moc IT centrum danych (odpowiednik 500 MW dla Domiechowic). */
  itPowerMW: number;
  generatorPowerMW: number;
  generatorsCount: number;
  /** Etykieta do wyświetlania, np. "100+" lub "49". */
  generatorsCountLabel: string;
  /** Liczba drycoolerów na dachach (Piaseczno: 112). */
  dryCoolersCount?: number;
  thermalPowerMWt?: number;
  fuelStorageM3?: string;
  /** Deklarowane bezpośrednie zużycie wody, m³/dobę. */
  waterPerDayM3?: number;
  status?: string;
  statusDate?: string;
  investor?: string;
  buildingCoverage?: string;
  biologicallyActiveArea?: string;
}
