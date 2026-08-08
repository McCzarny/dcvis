import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';

export interface BufferZone {
  distanceMeters: number;
  label: string;
  valueText: string;
  color: string;
  fillColor: string;
  description: string;
  geoJson: Feature<Polygon | MultiPolygon>;
}

/**
 * Tworzy pierścienie buforowe otaczające poligon inwestycji Data Center
 */
export function generateFeatureBuffers(
  sourceFeature: Feature<Polygon | MultiPolygon>,
  configs: Array<{
    distanceMeters: number;
    label: string;
    valueText: string;
    color: string;
    fillColor: string;
    description: string;
  }>
): BufferZone[] {
  // Sortowanie od najmniejszego do największego dystansu
  const sorted = [...configs].sort((a, b) => a.distanceMeters - b.distanceMeters);

  return sorted.map((cfg) => {
    // Turf buffer przyjmuje dystans w kilometrach, metrach itp.
    const buffered = turf.buffer(sourceFeature, cfg.distanceMeters, { units: 'meters' });
    return {
      ...cfg,
      geoJson: buffered as Feature<Polygon | MultiPolygon>
    };
  });
}

/**
 * Oblicza odległość w metrach od środka Data Center do podanych punktów
 */
export function getCenterCoordinates(feature: Feature): [number, number] {
  const center = turf.centerOfMass(feature);
  return [center.geometry.coordinates[1], center.geometry.coordinates[0]]; // [lat, lng] dla Leaflet
}

/**
 * Formatowanie powierszchni
 */
export function formatArea(areaHa: number): string {
  return `${areaHa.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha`;
}
