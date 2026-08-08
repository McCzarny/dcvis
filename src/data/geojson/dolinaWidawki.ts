import { Feature, Polygon } from 'geojson';

export const dolinaWidawkiGeoJSON: Feature<Polygon> = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [19.303665, 51.37943467385444],
      [19.311175, 51.378979673854445],
      [19.322505, 51.37145267385444],
      [19.327269, 51.371935673854445],
      [19.326754, 51.37072967385444],
      [19.319662, 51.364393673854444],
      [19.306841, 51.36545267385444],
      [19.307313, 51.359155673854445],
      [19.306455, 51.35151867385444],
      [19.310832, 51.34918667385445],
      [19.305596, 51.34725767385444],
      [19.299331, 51.346587673854444],
      [19.297571, 51.351464673854444],
      [19.298, 51.36850667385444],
      [19.303665, 51.37943467385444]
    ]]
  },
  properties: {
    name: "Obszar Chronionego Krajobrazu Doliny Widawki",
    category: "Ochrona Przyrody",
    textPathColor: "LightCyan",
    description: "Forma ochrony przyrody powołana w celu zachowania wyróżniających się krajobrazowo terenów o zróżnicowanych ekosystemach. W bezpośrednim sąsiedztwie inwestycji."
  }
};
