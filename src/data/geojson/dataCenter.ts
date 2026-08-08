import { Feature, Polygon } from 'geojson';

export const dataCenterGeoJSON: Feature<Polygon> = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [19.316669, 51.364412],
      [19.318213, 51.367038],
      [19.32066, 51.36945],
      [19.306927, 51.370602],
      [19.30727, 51.364359],
      [19.316669, 51.364412]
    ]]
  },
  properties: {
    name: "Hyperscale Data Center Domiechowice",
    investor: "Data Center Bełchatów Sp. z o.o. / Next DC Sp. z o.o.",
    areaHa: 52.6016,
    plotsCount: 71,
    itPowerMW: 500,
    generatorPowerMW: 720,
    generatorsCount: 100,
    thermalPowerMWt: 300,
    fuelStorage: "7 500 m³ - 13 000 m³",
    status: "Zawieszony (Wymagany Raport OOŚ)",
    statusDate: "27 maja 2026 r."
  }
};
