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
    // Model 1/r^1.5 z odbiciami gruntowymi – źródło 65 dBA w odl. 152,4 m (500 stóp)
    let noiseCont = '~44 dBA (Poniżej normy dziennej, wciąż powyżej nocnej)';
    if (distBoundaryMeters <= 150) noiseCont = '~65 dBA (Źródło hałasu wentylatorów)';
    else if (distBoundaryMeters <= 250) noiseCont = '61,8 dBA (Przekroczenie normy nocnej o 21,8 dB)';
    else if (distBoundaryMeters <= 500) noiseCont = '57,3 dBA (Przekroczenie normy nocnej o 17,3 dB)';
    else if (distBoundaryMeters <= 1000) noiseCont = '52,7 dBA (Przekroczenie normy dziennej)';
    else if (distBoundaryMeters <= 2000) noiseCont = '48,2 dBA (Poniżej normy dziennej, powyżej nocnej)';
    else if (distBoundaryMeters <= 4000) noiseCont = '43,8 dBA (Niskie częstotliwości wciąż słyszalne)';

    // Generatory diesla – źródło 95 dBA w odl. 7 m, model 1/r^1.5
    let noiseGen = '< 45 dBA (Słabe tło)';
    if (distBoundaryMeters <= 250) noiseGen = '61,7 dBA (Intensywne testy diesla)';
    else if (distBoundaryMeters <= 500) noiseGen = '57,2 dBA (Głośne testy diesla)';
    else if (distBoundaryMeters <= 1000) noiseGen = '52,7 dBA (Wyraźnie słyszalny wydech silników)';
    else if (distBoundaryMeters <= 2000) noiseGen = '48,2 dBA (Słyszalny hałas testów)';

    let tempRise = '+<0,65°C (Oddziaływanie tła)';
    if (distBoundaryMeters <= 300) tempRise = '+1,94°C (Strefa bezpośrednia)';
    else if (distBoundaryMeters <= 1000) tempRise = '+1,71°C (Wysoki wpływ termiczny)';
    else if (distBoundaryMeters <= 2000) tempRise = '+1,39°C (Umiarkowany wpływ)';
    else if (distBoundaryMeters <= 5000) tempRise = '+0,65°C (Oddziaływanie tła)';

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
