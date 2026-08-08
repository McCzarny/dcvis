import fs from 'fs';
import proj4 from 'proj4';

proj4.defs('EPSG:2180', '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9992 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs');

const inputPath = './data/dolina-winiawki.json';
const rawData = fs.readFileSync(inputPath, 'utf-8');
const geojson = JSON.parse(rawData);

function convertCoords(coords) {
  if (typeof coords[0] === 'number') {
    // Sprawdzamy czy [x, y] to [Easting, Northing] czy [Northing, Easting]
    // Dla terenu Polski X jest rzędu 150000-850000, Y jest rzędu 150000-900000
    // proj4 dla EPSG:2180 przyjmuje [x (Easting), y (Northing)]
    // W pliku: 394271 (Y/Northing) i 498271 (X/Easting)
    let easting = coords[0];
    let northing = coords[1];
    if (coords[0] < 450000 && coords[1] > 450000) {
      easting = coords[1];
      northing = coords[0];
    }
    const res = proj4('EPSG:2180', 'WGS84', [easting, northing]);
    return [Number(res[0].toFixed(6)), Number(res[1].toFixed(6))];
  }
  return coords.map(convertCoords);
}

const convertedFeatures = geojson.features.map(f => ({
  ...f,
  geometry: {
    ...f.geometry,
    coordinates: convertCoords(f.geometry.coordinates)
  }
}));

const convertedGeoJSON = {
  type: "FeatureCollection",
  features: convertedFeatures
};

console.log('Converted sample coords:', convertedGeoJSON.features[0].geometry.coordinates[0][0][0]);
fs.writeFileSync('./src/data/geojson/dolinaWidawki.json', JSON.stringify(convertedGeoJSON, null, 2));
console.log('Saved converted GeoJSON to ./src/data/geojson/dolinaWidawki.json');
