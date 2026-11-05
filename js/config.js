/**
 * KeSana map configuration — dark vector maps, no API key required by default.
 *
 * OpenFreeMap (default): free hosted map with attribution.
 * MapTiler (optional): sign up for a free API key and restrict it to your site
 * at cloud.maptiler.com; see README.md for setup.
 */
export const CONFIG = Object.freeze({
  map: {
    center: [3.139, 101.6869], // Kuala Lumpur, [latitude, longitude]
    zoom: 12.2,
    minZoom: 5,
    maxZoom: 19,
    pitch: 28,
    maxPitch: 65,
    enable3DBuildings: true,
    provider: 'openfreemap', // 'openfreemap' or 'maptiler'
    openFreeMapStyle: 'https://tiles.openfreemap.org/styles/dark',
    mapTilerStyle: 'streets-v4-dark',
    mapTilerApiKey: '' // Leave blank unless using MapTiler.
  },
  search: {
    endpoint: 'https://photon.komoot.io/api/',
    limit: 5,
    countryCode: 'MY',
    minIntervalMs: 1200
  },
  places: {
    'kuala-lumpur': { name: 'Kuala Lumpur', secondary: 'Wilayah Persekutuan', lat: 3.139, lon: 101.6869 },
    'george-town': { name: 'George Town', secondary: 'Pulau Pinang', lat: 5.4141, lon: 100.3288 },
    'kota-kinabalu': { name: 'Kota Kinabalu', secondary: 'Sabah', lat: 5.9804, lon: 116.0735 }
  }
});
