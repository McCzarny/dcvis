import { Feature, Point } from 'geojson';

export const archeoSiteGeoJSON: Feature<Point> = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [19.317806, 51.365853]
  },
  properties: {
    name: "Obiekt archeologiczny - Osada",
    code: "AZP 75-50/26",
    source: "https://zabytek.pl/",
    description: "Zarejestrowana osada archeologiczna wpisana do Krajowej Ewidencji Zabytków (AZP 75-50/26). Znajduje się we wschodniej części terenu planowanej inwestycji."
  }
};
