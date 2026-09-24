import { Feature, Polygon } from 'geojson';

/**
 * Obrys Centrum Danych Piaseczno (WGS84).
 * Wejściowa lista współrzędnych (lat, lng) była zamknięta pierścieniem
 * zgodnym z ruchem wskazówek zegara – odwrócono ją do kierunku przeciwnego
 * do ruchu wskazówek zegara, zgodnie z RFC 7946.
 */
export const piasecznoGeoJSON: Feature<Polygon> = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [21.03108703945045, 52.090755197441524],
      [21.02725080378635, 52.089835631587086],
      [21.027440844701765, 52.089521786332206],
      [21.027280322877186, 52.08947216424001],
      [21.027939394484257, 52.08841118802667],
      [21.032013105561287, 52.08954706241037],
      [21.03108703945045, 52.090755197441524]
    ]]
  },
  properties: {
    name: 'Data Center Piaseczno',
    note: 'Obrys podany przez inwestora – dokumentacja w przygotowaniu'
  }
};
