import { Feature, Polygon } from 'geojson';

/**
 * Obrys Centrum Danych Trzebnica (WGS84).
 * Pierścień podany w kolejności przeciwnej do ruchu wskazówek zegara,
 * zgodnie z RFC 7946. Powierzchnia ~55,3 ha (turf.js).
 */
export const trzebnicaGeoJSON: Feature<Polygon> = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [17.044494810543874, 51.312515460926335],
      [17.04798329414639, 51.314117876460784],
      [17.05163744776211, 51.317539587497],
      [17.05317665215265, 51.31923287600177],
      [17.046029375332, 51.31930669397998],
      [17.045888641635106, 51.32019562330239],
      [17.038308179855996, 51.32022828378149],
      [17.03834638435971, 51.318541206301624],
      [17.038761986204474, 51.31677821001223],
      [17.040902596083253, 51.31445897456201],
      [17.042798573618516, 51.313238849079724],
      [17.044494810543874, 51.312515460926335]
    ]]
  },
  properties: {
    name: 'Data Center Trzebnica',
    note: 'Obrys podany przez inwestora – dokumentacja w przygotowaniu'
  }
};
