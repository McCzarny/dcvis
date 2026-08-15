export type LayerCategory = 'inwestycja' | 'srodowisko' | 'akustyka' | 'termika' | 'zabudowa' | 'planowanie' | 'woda';

export type MapTileProvider = 'osm' | 'satellite';

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
  type: 'geojson' | 'buffer_ring' | 'marker' | 'residential_markers' | 'water_consumption';
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

export interface DataCenterSpecs {
  name: string;
  location: string;
  district: string;
  areaHa: number;
  plotsCount: number;
  itPowerMW: number;
  generatorPowerMW: number;
  generatorsCount: number;
  thermalPowerMWt: number;
  fuelStorageM3: string;
  status: string;
  statusDate: string;
  investor: string;
  buildingCoverage: string;
  biologicallyActiveArea: string;
}
