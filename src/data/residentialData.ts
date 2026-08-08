import * as turf from '@turf/turf';
import { dataCenterGeoJSON } from './geojson/dataCenter';

export interface ResidentialBuilding {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceToCenterMeters: number;
  distanceToBoundaryMeters: number;
  noiseLevelContinuous: string;
  noiseLevelGeneratorTest: string;
  tempRise: string;
  notes: string;
}

const RESIDENTIAL_COORDINATES = [
  { lat: 51.372691, lng: 19.327440, name: "Zabudowania Północno-Wschodnie (ul. Główna)" },
  { lat: 51.379549, lng: 19.327054, name: "Zabudowania Północne (Kolonia Domiechowice)" },
  { lat: 51.382522, lng: 19.306712, name: "Zabudowania Północno-Zachodnie" },
  { lat: 51.351120, lng: 19.315038, name: "Zabudowania Południowe" },
  { lat: 51.357995, lng: 19.336817, name: "Zabudowania Wschodnie" },
  { lat: 51.358303, lng: 19.323750, name: "Zabudowania Południowo-Wschodnie" }
];

export function getResidentialBuildings(): ResidentialBuilding[] {
  const dcCenter = turf.centerOfMass(dataCenterGeoJSON);

  return RESIDENTIAL_COORDINATES.map((item, index) => {
    const point = turf.point([item.lng, item.lat]);

    // Odległość do środka ciężkości Data Center
    const distCenterMeters = Math.round(turf.distance(point, dcCenter, { units: 'meters' }));

    // Odległość do najbliższego punktu granicy poligonu Data Center
    // Konwertujemy poligon na linie i szukamy nearestPointOnLine
    const polygonLine = turf.polygonToLine(dataCenterGeoJSON);
    const nearestPoint = turf.nearestPointOnLine(polygonLine as any, point);
    const distBoundaryMeters = Math.round(turf.distance(point, nearestPoint, { units: 'meters' }));

    // Ocena hałasu i temperatury w punkcie na podstawie odległości od granicy
    let noiseCont = '< 40 dBA (Norma zachowana)';
    if (distBoundaryMeters <= 60) noiseCont = '~60 dBA (Wysoki hałas)';
    else if (distBoundaryMeters <= 240) noiseCont = '50-60 dBA (Przekroczenie normy nocnej o 10-20 dB)';
    else if (distBoundaryMeters <= 500) noiseCont = '45-50 dBA (Przekroczenie normy nocnej)';
    else if (distBoundaryMeters <= 800) noiseCont = '40-45 dBA (W pobliżu normy nocnej)';
    else if (distBoundaryMeters <= 1500) noiseCont = '< 40 dBA (Słyszalny szum niskoczęstotliwościowy)';

    let noiseGen = 'Odczuwalne ryczenie diesli';
    if (distBoundaryMeters <= 1200) noiseGen = '60-80 dBA (Bardzo głośne testy silników)';
    else if (distBoundaryMeters <= 1600) noiseGen = '45-60 dBA (Wyraźnie słyszalny wydech silników)';
    else noiseGen = '< 45 dBA (Słabe tło)';

    let tempRise = '+0,24 K (Śladowe)';
    if (distBoundaryMeters <= 300) tempRise = '+1,5°C ÷ +2,5°C (Płaskowyż termiczny)';
    else if (distBoundaryMeters <= 1000) tempRise = '+0,80 K (Odczuwalna wyspa ciepła)';
    else if (distBoundaryMeters <= 2000) tempRise = '+0,58 K (Modyfikacja mikroklimatu)';

    return {
      id: `res_building_${index + 1}`,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      distanceToCenterMeters: distCenterMeters,
      distanceToBoundaryMeters: distBoundaryMeters,
      noiseLevelContinuous: noiseCont,
      noiseLevelGeneratorTest: noiseGen,
      tempRise,
      notes: `Odległość od krawędzi działek Data Center: ${distBoundaryMeters} m (${(distBoundaryMeters / 1000).toFixed(2)} km)`
    };
  });
}
