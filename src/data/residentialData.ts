import * as turf from '@turf/turf';
import { Feature, Polygon } from 'geojson';
import { DataCenterKey } from '../types/gis';

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

const DOMIECHOWICE_COORDINATES = [
  { lat: 51.372691, lng: 19.327440, name: 'ul. Główna' },
  { lat: 51.379549, lng: 19.327054, name: 'Kolonia Domiechowice' },
  { lat: 51.382522, lng: 19.306712, name: 'Emilin' },
  { lat: 51.351120, lng: 19.315038, name: 'Nowy Świat' },
  { lat: 51.357995, lng: 19.336817, name: 'Smolarnia' },
  { lat: 51.358303, lng: 19.323750, name: 'Bełchatów-Dwór' }
];

const PIASECZNO_COORDINATES = [
  { lat: 52.09104731724168, lng: 21.029725442222354, name: 'Domy jednorodzinne (1)' },
  { lat: 52.090674810689, lng: 21.026979089120235, name: 'Domy jednorodzinne (2)' },
  { lat: 52.09192703935564, lng: 21.032850075799118, name: 'Bloki mieszkalne' },
  { lat: 52.095038797638594, lng: 21.027825720710876, name: 'Przedszkole nr 11' },
  { lat: 52.09789465053971, lng: 21.027363234345415, name: 'Szkoła Podstawowa im. Ferdynanda Magellana' }
];

const TRZEBNICA_COORDINATES = [
  { lat: 51.31606738932739, lng: 17.05283850960422, name: 'Domy jednorodzinne' },
  { lat: 51.31971964376446, lng: 17.058307032967267, name: 'Szpital im. Św. Jadwigi Śląskiej' },
  { lat: 51.31350737146152, lng: 17.056984085783036, name: 'Szkoła Podstawowa nr 3' }
];

function domiechowiceNoise(distBoundaryMeters: number): { cont: string; gen: string; temp: string } {
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

  return { cont: noiseCont, gen: noiseGen, temp: tempRise };
}

function piasecznoNoise(distBoundaryMeters: number): { cont: string; gen: string; temp: string } {
  // Poziomy szacowane dla Piaseczna (wentylatory / testy generatorów)
  let noiseCont = '< 51,9 dBA (Poniżej zasięgu 2 km)';
  if (distBoundaryMeters <= 100) noiseCont = '71,4 dBA (Strefa 100 m – hałas wentylatorów)';
  else if (distBoundaryMeters <= 250) noiseCont = '65,5 dBA (Strefa 250 m – hałas wentylatorów)';
  else if (distBoundaryMeters <= 500) noiseCont = '60,9 dBA (Strefa 500 m – hałas wentylatorów)';
  else if (distBoundaryMeters <= 1000) noiseCont = '56,4 dBA (Strefa 1 km – hałas wentylatorów)';
  else if (distBoundaryMeters <= 2000) noiseCont = '51,9 dBA (Strefa 2 km – hałas wentylatorów)';

  let noiseGen = '< 54,5 dBA (Poniżej zasięgu 2 km)';
  if (distBoundaryMeters <= 100) noiseGen = '74,0 dBA (Strefa 100 m – testy generatorów)';
  else if (distBoundaryMeters <= 250) noiseGen = '68,0 dBA (Strefa 250 m – testy generatorów)';
  else if (distBoundaryMeters <= 500) noiseGen = '63,5 dBA (Strefa 500 m – testy generatorów)';
  else if (distBoundaryMeters <= 1000) noiseGen = '59,0 dBA (Strefa 1 km – testy generatorów)';
  else if (distBoundaryMeters <= 2000) noiseGen = '54,5 dBA (Strefa 2 km – testy generatorów)';

  // Brak analizy termicznej dla Piaseczna
  const tempRise = '— (brak analizy termicznej dla tej lokalizacji)';

  return { cont: noiseCont, gen: noiseGen, temp: tempRise };
}

function trzebnicaNoise(): { cont: string; gen: string; temp: string } {
  // Brak analiz hałasu i termiki dla Trzebnicy – tylko odległości.
  return {
    cont: '— (brak danych – analiza hałasu niedostępna dla tej lokalizacji)',
    gen: '— (brak danych – analiza hałasu niedostępna dla tej lokalizacji)',
    temp: '— (brak analizy termicznej dla tej lokalizacji)'
  };
}

export function getResidentialBuildings(
  dcPolygon: Feature<Polygon>,
  dcId?: DataCenterKey
): ResidentialBuilding[] {
  const dcCenter = turf.centerOfMass(dcPolygon);
  const coords =
    dcId === 'piaseczno'
      ? PIASECZNO_COORDINATES
      : dcId === 'trzebnica'
        ? TRZEBNICA_COORDINATES
        : DOMIECHOWICE_COORDINATES;

  return coords.map((item, index) => {
    const point = turf.point([item.lng, item.lat]);

    // Odległość do środka ciężkości Data Center
    const distCenterMeters = Math.round(turf.distance(point, dcCenter, { units: 'meters' }));

    // Odległość do najbliższego punktu granicy poligonu Data Center
    // Konwertujemy poligon na linie i szukamy nearestPointOnLine
    const polygonLine = turf.polygonToLine(dcPolygon);
    const nearestPoint = turf.nearestPointOnLine(polygonLine as any, point);
    const distBoundaryMeters = Math.round(turf.distance(point, nearestPoint, { units: 'meters' }));

    const { cont, gen, temp } =
      dcId === 'piaseczno'
        ? piasecznoNoise(distBoundaryMeters)
        : dcId === 'trzebnica'
          ? trzebnicaNoise()
          : domiechowiceNoise(distBoundaryMeters);

    return {
      id: `res_building_${index + 1}`,
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      distanceToCenterMeters: distCenterMeters,
      distanceToBoundaryMeters: distBoundaryMeters,
      noiseLevelContinuous: cont,
      noiseLevelGeneratorTest: gen,
      tempRise: temp,
      notes: `Odległość od krawędzi działek Data Center: ${distBoundaryMeters} m (${(distBoundaryMeters / 1000).toFixed(2)} km)`
    };
  });
}
